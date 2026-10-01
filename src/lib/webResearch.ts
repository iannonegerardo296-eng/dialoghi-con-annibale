import type { WebSource } from "@/lib/chatTypes";

interface MediaWikiSearchPage {
  pageid: number;
  title: string;
  snippet?: string;
}

interface MediaWikiSearchResponse {
  query?: {
    search?: MediaWikiSearchPage[];
  };
}

interface MediaWikiExtractPage {
  title: string;
  fullurl?: string;
  extract?: string;
}

interface MediaWikiExtractResponse {
  query?: {
    pages?: MediaWikiExtractPage[];
  };
}

interface RestSearchPage {
  title: string;
  key: string;
  description?: string;
}

interface RestSearchResponse {
  pages?: RestSearchPage[];
}

interface RestSummaryResponse {
  title?: string;
  extract?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
}

const WIKIS = [
  { language: "it", name: "Wikipedia (italiano)", origin: "https://it.wikipedia.org" },
  { language: "en", name: "Wikipedia (inglese)", origin: "https://en.wikipedia.org" },
] as const;

const USER_AGENT = "DialoghiConAnnibale/1.0 (historical education; server-side research)";
const MAX_EXCERPT_LENGTH = 3200;
const CACHE_TTL_MS = 10 * 60 * 1000;
const researchCache = new Map<string, { expiresAt: number; sources: WebSource[] }>();

interface HistoricalTopic {
  query: string;
  englishQuery: string;
  matches: RegExp;
  relevantSource: RegExp;
  relevantTitle?: RegExp;
}

const HISTORICAL_TOPICS: HistoricalTopic[] = [
  {
    query: "battaglia di Canne",
    englishQuery: "Battle of Cannae",
    matches: /battaglia\s+di\s+canne|battle\s+of\s+cannae|\bcannae\b/i,
    relevantSource: /216\s*(?:a\.?\s*c\.?|bc)|seconda\s+guerra\s+punica|second\s+punic\s+war|battaglia\s+di\s+canne|battle\s+of\s+cannae/i,
    relevantTitle: /^(battaglia di canne|battle of cannae|luogo della battaglia di canne|hannibal)$/i,
  },
  {
    query: "attraversamento delle Alpi di Annibale",
    englishQuery: "Hannibal's crossing of the Alps",
    matches: /attravers\w*\s+(?:le\s+)?alpi|cross\w*\s+the\s+alps|\balps\b/i,
    relevantSource: /hannibal|annibale|218\s*(?:a\.?\s*c\.?|bc)|seconda\s+guerra\s+punica|second\s+punic\s+war/i,
  },
  {
    query: "seconda guerra punica",
    englishQuery: "Second Punic War",
    matches: /seconda\s+guerra\s+punica|second\s+punic\s+war/i,
    relevantSource: /seconda\s+guerra\s+punica|second\s+punic\s+war|annibale|hannibal/i,
  },
  {
    query: "battaglia del lago Trasimeno",
    englishQuery: "Battle of Lake Trasimene",
    matches: /trasimeno|trasimene/i,
    relevantSource: /trasimeno|trasimene|217\s*(?:a\.?\s*c\.?|bc)|seconda\s+guerra\s+punica|second\s+punic\s+war/i,
  },
  {
    query: "battaglia della Trebbia",
    englishQuery: "Battle of the Trebia",
    matches: /battaglia\s+della\s+trebbia|battle\s+of\s+the\s+trebia|\btrebbia\b/i,
    relevantSource: /trebbia|trebia|218\s*(?:a\.?\s*c\.?|bc)|seconda\s+guerra\s+punica|second\s+punic\s+war/i,
  },
  {
    query: "battaglia di Zama",
    englishQuery: "Battle of Zama",
    matches: /battaglia\s+di\s+zama|battle\s+of\s+zama|\bzama\b/i,
    relevantSource: /zama|202\s*(?:a\.?\s*c\.?|bc)|scipione|scipio|seconda\s+guerra\s+punica|second\s+punic\s+war/i,
  },
  {
    query: "assedio di Sagunto",
    englishQuery: "Siege of Saguntum",
    matches: /sagunto|saguntum/i,
    relevantSource: /sagunto|saguntum|seconda\s+guerra\s+punica|second\s+punic\s+war|hannibal|annibale/i,
  },
  {
    query: "Cartagine",
    englishQuery: "Carthage",
    matches: /cartagine|carthage/i,
    relevantSource: /cartagine|carthage|punic|fenici/i,
  },
  {
    query: "Scipione l'Africano",
    englishQuery: "Scipio Africanus",
    matches: /scipione|scipio/i,
    relevantSource: /scipione|scipio|zama|hannibal|annibale/i,
  },
  {
    query: "Annibale Barca",
    englishQuery: "Hannibal Barca",
    matches: /annibale|hannibal/i,
    relevantSource: /annibale|hannibal|barca|cartagine|carthage/i,
  },
];

function translateHistoricalTerms(query: string): string {
  const translations: Array<[RegExp, string]> = [
    [/battaglia\s+di\s+canne/gi, "Battle of Cannae"],
    [/attravers\w*\s+(?:le\s+)?alpi/gi, "Hannibal crossing the Alps"],
    [/seconda\s+guerra\s+punica/gi, "Second Punic War"],
    [/battaglia\s+della\s+trebbia/gi, "Battle of the Trebia"],
    [/battaglia\s+di\s+zama/gi, "Battle of Zama"],
    [/lago\s+trasimeno/gi, "Lake Trasimene"],
    [/\bannibale\b/gi, "Hannibal"],
    [/\bcanne\b/gi, "Cannae"],
    [/\bcartagine\b/gi, "Carthage"],
    [/\bscipione\b/gi, "Scipio"],
    [/\btrasimeno\b/gi, "Trasimene"],
    [/\balpi\b/gi, "Alps"],
    [/\broma\b/gi, "Rome"],
    [/\bzama\b/gi, "Zama"],
  ];

  return translations.reduce(
    (translated, [pattern, replacement]) => translated.replace(pattern, replacement),
    query,
  );
}

function simplifySearchQuery(query: string): string {
  return query
    .replace(
      /\b(?:raccontami|spiegami|parlami|descrivi|quale|cosa|chi|quando|dove|come|sentivi|senti|provavi|durante|fu|è|era|avvenne|accadde|si|svolse|la|il|lo|le|gli|i|un|una|del|della|delle|degli|dei|di|nel|nella|in|su|sul|sulla|the|what|who|when|where|was|were|tell|me|about|did|how|feel|felt|during|a|an|of|in|on|at|to)\b/gi,
      " ",
    )
    .replace(/[?!.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchQueries(query: string, language: "it" | "en"): string[] {
  const localizedQuery = language === "en" ? translateHistoricalTerms(query) : query;
  const simpleQuery = simplifySearchQuery(localizedQuery);
  const queries = [simpleQuery || localizedQuery];
  const topic = HISTORICAL_TOPICS.find((item) => item.matches.test(query));
  if (topic) {
    queries.unshift(language === "en" ? topic.englishQuery : topic.query);
  } else {
    queries.push(
      `${language === "en" ? "Hannibal Barca" : "Annibale Barca"} ${queries[0]}`,
    );
  }

  return [...new Set(queries.filter(Boolean))].slice(0, 2);
}

function filterTopicSources(sources: WebSource[], query: string): WebSource[] {
  const topic = HISTORICAL_TOPICS.find((item) => item.matches.test(query));
  if (!topic) return sources;

  return sources.filter((source) => {
    const title = source.title.toLocaleLowerCase("it-IT");
    const evidence = `${source.title}\n${source.excerpt}`;

    if (/canne\s*\(1018\)|battle of cannae\s*\(1018\)|snow storm|turner/i.test(title)) {
      return false;
    }

    return (
      topic.relevantSource.test(evidence) &&
      (!topic.relevantTitle || topic.relevantTitle.test(title))
    );
  });
}

function queryTerms(query: string): string[] {
  return [...new Set(
    [query, translateHistoricalTerms(query)]
      .flatMap((text) =>
        simplifySearchQuery(text)
          .toLocaleLowerCase("it-IT")
          .split(/\s+/)
          .filter((term) => term.length > 2),
      ),
  )];
}

function relevanceScore(text: string, terms: string[]): number {
  const normalized = text.toLocaleLowerCase("it-IT");
  return terms.reduce((score, term) => {
    if (!normalized.includes(term)) return score;
    return score + (normalized.startsWith(term) ? 4 : 1);
  }, 0);
}

async function wikipediaJson<T>(url: URL): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });

      if (response.ok) return (await response.json()) as T;

      const error = new Error(`Wikipedia API returned HTTP ${response.status}`);
      if (response.status !== 429 && response.status < 500) throw error;
      lastError = error;
    } catch (error) {
      lastError = error;
      if (
        error instanceof Error &&
        /^Wikipedia API returned HTTP (?!429)[45]\d{2}$/.test(error.message)
      ) {
        throw error;
      }
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Historical web research services are unavailable");
}

async function searchWiki(
  wiki: (typeof WIKIS)[number],
  query: string,
): Promise<WebSource[]> {
  const queries = buildSearchQueries(query, wiki.language);
  const pages: MediaWikiSearchPage[] = [];
  let lastSearchError: unknown;

  for (const searchQuery of queries) {
    try {
      const url = new URL(`${wiki.origin}/w/api.php`);
      url.search = new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: searchQuery,
        srnamespace: "0",
        srlimit: "4",
        format: "json",
        formatversion: "2",
      }).toString();
      const result = await wikipediaJson<MediaWikiSearchResponse>(url);
      for (const page of result.query?.search ?? []) {
        if (!pages.some((item) => item.pageid === page.pageid)) pages.push(page);
      }
      lastSearchError = undefined;
      if (pages.length >= 3) break;
    } catch (error) {
      lastSearchError = error;
    }
  }
  if (pages.length === 0 && lastSearchError) throw lastSearchError;

  const terms = queryTerms(query);
  const rankedPages = pages
    .sort((left, right) =>
      relevanceScore(`${right.title} ${right.snippet ?? ""}`, terms) -
      relevanceScore(`${left.title} ${left.snippet ?? ""}`, terms),
    )
    .slice(0, 4);
  if (rankedPages.length === 0) return [];

  const detailsUrl = new URL(`${wiki.origin}/w/api.php`);
  detailsUrl.search = new URLSearchParams({
    action: "query",
    prop: "extracts|info",
    pageids: rankedPages.map((page) => page.pageid).join("|"),
    explaintext: "1",
    exchars: String(MAX_EXCERPT_LENGTH),
    inprop: "url",
    format: "json",
    formatversion: "2",
  }).toString();

  const details = await wikipediaJson<MediaWikiExtractResponse>(detailsUrl);

  return (details.query?.pages ?? [])
    .map((page) => ({ page, score: relevanceScore(`${page.title} ${page.extract ?? ""}`, terms) }))
    .sort((left, right) => right.score - left.score)
    .flatMap(({ page }) => {
    if (typeof page.extract !== "string" || page.extract.trim().length <= 120) {
      return [];
    }

    return [{
      title: page.title,
      url: page.fullurl ?? `${wiki.origin}/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
      excerpt: page.extract.slice(0, MAX_EXCERPT_LENGTH),
      language: wiki.name,
    }];
    });
}

async function searchRestWiki(
  wiki: (typeof WIKIS)[number],
  query: string,
): Promise<WebSource[]> {
  const queries = buildSearchQueries(query, wiki.language);
  const pages: RestSearchPage[] = [];
  let lastSearchError: unknown;

  for (const searchQuery of queries) {
    try {
      const searchUrl = new URL(`${wiki.origin}/w/rest.php/v1/search/page`);
      searchUrl.search = new URLSearchParams({ q: searchQuery, limit: "4" }).toString();
      const search = await wikipediaJson<RestSearchResponse>(searchUrl);
      for (const page of search.pages ?? []) {
        if (!pages.some((item) => item.key === page.key)) pages.push(page);
      }
      lastSearchError = undefined;
      if (pages.length >= 2) break;
    } catch (error) {
      lastSearchError = error;
    }
  }
  if (pages.length === 0 && lastSearchError) throw lastSearchError;

  const terms = queryTerms(query);
  const rankedPages = pages
    .sort((left, right) =>
      relevanceScore(`${right.title} ${right.description ?? ""}`, terms) -
      relevanceScore(`${left.title} ${left.description ?? ""}`, terms),
    )
    .slice(0, 2);

  const summaries: WebSource[] = [];
  for (const page of rankedPages) {
    try {
      const summaryUrl = new URL(
        `${wiki.origin}/api/rest_v1/page/summary/${encodeURIComponent(page.key)}`,
      );
      const summary = await wikipediaJson<RestSummaryResponse>(summaryUrl);
      if (typeof summary.extract !== "string" || summary.extract.trim().length <= 80) {
        continue;
      }

      summaries.push({
        title: summary.title ?? page.title,
        url:
          summary.content_urls?.desktop?.page ??
          `${wiki.origin}/wiki/${encodeURIComponent(page.key)}`,
        excerpt: summary.extract.slice(0, MAX_EXCERPT_LENGTH),
        language: wiki.name,
      });
    } catch {
      continue;
    }
  }

  return summaries
    .sort((left, right) =>
      relevanceScore(`${right.title} ${right.excerpt}`, terms) -
      relevanceScore(`${left.title} ${left.excerpt}`, terms),
    );
}

async function findHistoricalSources(query: string): Promise<WebSource[]> {
  const primaryResults = await Promise.allSettled(
    WIKIS.map((wiki) => searchWiki(wiki, query)),
  );
  let sources = primaryResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  let restResults: PromiseSettledResult<WebSource[]>[] = [];
  if (sources.length < 3) {
    restResults = await Promise.allSettled(
      WIKIS.map((wiki) => searchRestWiki(wiki, query)),
    );
    sources = [...sources, ...restResults.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    )];

    if (sources.length === 0) {
      const failures = [...primaryResults, ...restResults].filter(
        (result) => result.status === "rejected",
      );
      throw new Error(
        failures.length === primaryResults.length + restResults.length
          ? "Historical web research services are unavailable"
          : "No suitable historical pages were found",
      );
    }
  }

  const uniqueSources = filterTopicSources(sources, query).filter(
    (source, index, all) => all.findIndex((item) => item.url === source.url) === index,
  );

  if (uniqueSources.length === 0) {
    const primaryCount = primaryResults.reduce(
      (count, result) => count + (result.status === "fulfilled" ? result.value.length : 0),
      0,
    );
    const restCount = restResults.reduce(
      (count, result) => count + (result.status === "fulfilled" ? result.value.length : 0),
      0,
    );
    throw new Error(`No relevant historical sources were found (primary: ${primaryCount}, REST: ${restCount})`);
  }

  return uniqueSources.slice(0, 6);
}

export async function researchHistoricalQuestion(query: string): Promise<WebSource[]> {
  const normalizedQuery = query.trim().replace(/\s+/g, " ").slice(0, 220);
  if (!normalizedQuery) {
    throw new Error("A non-empty historical search query is required");
  }

  const cacheKey = normalizedQuery.toLocaleLowerCase("it-IT");
  const cached = researchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.sources;

  const sources = await findHistoricalSources(normalizedQuery);
  if (researchCache.size >= 100) {
    const oldestKey = researchCache.keys().next().value;
    if (oldestKey) researchCache.delete(oldestKey);
  }
  researchCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, sources });
  return sources;
}

export function formatResearchForPrompt(sources: WebSource[]): string {
  return sources
    .map(
      (source, index) =>
        `[${index + 1}] ${source.title} (${source.language})\nURL: ${source.url}\nEstratto: ${source.excerpt}`,
    )
    .join("\n\n");
}
