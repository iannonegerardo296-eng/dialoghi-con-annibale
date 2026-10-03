import type { WebSource } from "@/lib/chatTypes";

export interface HistoricalKnowledgeEntry {
  keywords: string[];
  source: WebSource;
}

const wikipediaArticle = (title: string) =>
  `https://it.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

function entry(title: string, excerpt: string, keywords: string[]): HistoricalKnowledgeEntry {
  return {
    keywords,
    source: {
      title: `${title} · scheda storica`,
      url: wikipediaArticle(title),
      excerpt: `Sintesi redazionale conservata nell'archivio storico locale; non è una citazione letterale. ${excerpt}`,
      language: "Wikipedia (italiano · archivio locale)",
    },
  };
}

export const HISTORICAL_KNOWLEDGE: HistoricalKnowledgeEntry[] = [
  entry(
    "Seconda guerra punica",
    "Il conflitto tra Roma e Cartagine si svolse tradizionalmente dal 218 al 201 a.C. L'assedio di Sagunto precedette la guerra; Annibale condusse la campagna in Italia e vinse alla Trebbia (218 a.C.), al Trasimeno (217 a.C.) e a Canne (216 a.C.). Roma non si arrese dopo queste sconfitte e la guerra proseguì in più teatri, compresi Iberia e Africa. Dopo la campagna romana in Africa, Annibale fu richiamato dall'Italia e sconfitto a Zama (202 a.C.); la pace del 201 a.C. impose condizioni severe a Cartagine. Le ragioni per cui Annibale non marciò su Roma dopo Canne sono discusse e non si riducono a una spiegazione certa tramandata dalle fonti.",
    [
      "seconda guerra punica",
      "guerra punica",
      "guerra",
      "guerra con roma",
      "conflitto con roma",
      "perche non ti arrendesti",
      "perché non ti arrendesti",
      "arrendersi",
      "resa",
      "sconfitta",
      "sconfiggesti",
      "perdesti",
      "vincere",
      "perché persi",
      "dopo canne",
      "marcia su roma",
      "assediare roma",
      "rifornimenti",
      "rinforzi",
      "aiuto da cartagine",
      "perché hai perso",
      "218 a.c.",
      "201 a.c.",
    ],
  ),
  entry(
    "Annibale",
    "Annibale Barca fu un generale e uomo politico cartaginese della famiglia dei Barcidi, figlio di Amilcare Barca. La nascita è collocata convenzionalmente intorno al 247 a.C.; le fonti sulla sua vita, in larga parte tramandate da autori greci e romani, non permettono di ricostruire con certezza i suoi sentimenti privati.",
    ["annibale", "hannibal", "barca", "chi sei", "chi era", "chi fu", "biografia"],
  ),
  entry(
    "Annibale",
    "Durante la campagna in Italia l'esercito di Annibale riunì contingenti provenienti da regioni e comunità diverse. Composizione e numeri cambiarono nel tempo; le cifre tramandate dagli autori antichi non sono sempre concordi.",
    ["esercito", "soldati", "truppe", "alleati", "mercenari", "composizione dell'esercito"],
  ),
  entry(
    "Annibale",
    "La tradizione storica ricorda l'attenzione di Annibale al terreno, alle marce e alla scelta del momento dello scontro. Le battaglie di Trasimeno e Canne sono esempi di sorpresa e manovra; non ogni dettaglio tattico trasmesso dalle fonti può essere verificato indipendentemente.",
    ["strategia", "tattica", "terreno", "logistica", "rifornimenti", "marce", "viveri"],
  ),
  entry(
    "Passaggio delle Alpi di Annibale",
    "Nel 218 a.C. Annibale condusse un esercito dalla penisola iberica verso l'Italia attraversando le Alpi. Il percorso preciso e l'identificazione di alcuni luoghi del passaggio restano discussi dagli studiosi.",
    ["alpi", "attraversamento", "attraversasti", "attraversò", "passaggio alpino", "218 a.c."],
  ),
  entry(
    "Battaglia di Canne",
    "La battaglia di Canne si combatté in Apulia nel 216 a.C. L'esercito cartaginese sconfisse quello romano; la manovra di accerchiamento è ricordata nelle fonti antiche, i cui numeri sulle forze e sulle perdite vanno trattati con cautela. La scelta di non marciare subito su Roma dopo la vittoria è discussa dagli storici: le fonti non permettono di ridurla a una sola causa certa.",
    ["canne", "cannae", "accerchiamento", "manovra a tenaglia", "216 a.c.", "dopo canne", "marcia su roma", "assediare roma", "perché non prendesti roma"],
  ),
  entry(
    "Elefante da guerra",
    "Le fonti antiche ricordano elefanti impiegati dagli eserciti cartaginesi. Le condizioni concrete della traversata alpina degli elefanti e il numero degli animali descritti nelle narrazioni non sono ricostruibili con certezza in ogni dettaglio.",
    ["elefanti", "elefante", "animali", "attraversamento delle alpi con elefanti"],
  ),
  entry(
    "Battaglia della Trebbia",
    "Lo scontro presso il fiume Trebbia ebbe luogo nel 218 a.C., durante la campagna di Annibale in Italia. L'esercito cartaginese sconfisse le forze romane guidate dal console Tiberio Sempronio Longo.",
    ["trebbia", "tiberio sempronio", "prima vittoria in italia", "218 a.c."],
  ),
  entry(
    "Battaglia del lago Trasimeno",
    "Nel 217 a.C., presso il lago Trasimeno, l'esercito di Annibale tese un'imboscata alle forze romane del console Gaio Flaminio. Il terreno e la sorpresa furono importanti nella sconfitta romana.",
    ["trasimeno", "flaminio", "imboscata", "lago", "217 a.c."],
  ),
  entry(
    "Assedio di Sagunto",
    "L'assedio cartaginese di Sagunto, città iberica legata a Roma, precedette l'inizio della seconda guerra punica. Le responsabilità diplomatiche e il ruolo dell'assedio nelle cause della guerra sono descritti da fonti antiche di parte e restano oggetto di interpretazione.",
    ["sagunto", "saguntum", "assedio"],
  ),
  entry(
    "Zama",
    "La battaglia di Zama, combattuta in Africa nel 202 a.C., oppose l'esercito cartaginese a quello romano guidato da Publio Cornelio Scipione. La sconfitta di Cartagine portò alla pace del 201 a.C. e alla fine della seconda guerra punica.",
    ["zama", "scipione", "scipio", "pace del 201", "sconfitta finale", "202 a.c."],
  ),
  entry(
    "Publio Cornelio Scipione",
    "Publio Cornelio Scipione, poi detto l'Africano, fu il comandante romano che guidò la campagna in Africa e vinse a Zama nel 202 a.C. Le narrazioni antiche del suo rapporto con Annibale non costituiscono una trascrizione certa dei loro colloqui.",
    ["scipione", "scipio", "africano", "avversario romano"],
  ),
  entry(
    "Cartagine",
    "Cartagine era una potenza del Mediterraneo occidentale con istituzioni, interessi commerciali e territori nordafricani e iberici. I rapporti tra Cartagine e Roma cambiarono nel tempo; è fuorviante descrivere ciascuna città come un blocco umano uniforme.",
    ["cartagine", "cartaginese", "punica", "cultura cartaginese"],
  ),
  entry(
    "Amilcare Barca",
    "Amilcare Barca fu un comandante cartaginese attivo nella prima guerra punica e successivamente in Iberia. Le fonti lo ricordano come padre di Annibale e come figura centrale della famiglia dei Barcidi.",
    ["amilcare", "padre", "famiglia", "barcidi", "famiglia barca"],
  ),
  entry(
    "Asdrubale Barca",
    "I fratelli di Annibale citati dalle fonti comprendono Asdrubale e Magone Barca, entrambi coinvolti nelle vicende militari cartaginesi. I dettagli sulla vita familiare privata sono limitati e non consentono di ricostruire con certezza i loro sentimenti o conversazioni.",
    ["asdrubale", "magone", "fratelli", "fratello"],
  ),
  entry(
    "Annibale",
    "Dopo la sconfitta cartaginese a Zama nel 202 a.C., Annibale rimase a Cartagine e ricoprì un incarico politico. Lasciò la città nel 195 a.C. e visse poi presso corti orientali; le testimonianze antiche divergono su alcuni dettagli dei suoi ultimi anni.",
    ["esilio", "ultimi anni", "bithynia", "bitinia", "dopo zama", "195 a.c."],
  ),
  entry(
    "Repubblica romana",
    "Durante la vita di Annibale, Roma era una repubblica in espansione nella penisola italica. La sua società comprendeva cittadini romani e comunità alleate con status e interessi diversi; le sue istituzioni non vanno confuse con il successivo Impero romano.",
    ["roma", "romano", "romani", "repubblica", "avversario", "rapporti con roma"],
  ),
];
