# Dialoghi con Annibale

Applicazione web in italiano per una conversazione storica con una ricostruzione AI di Annibale Barca. Il progetto privilegia la distinzione tra testimonianze, interpretazioni e incertezze; l'avatar è un'illustrazione originale, non un ritratto documentario.

## Architettura e dipendenze

Next.js 15 con App Router e TypeScript strict serve l'interfaccia React, la route `POST /api/chat` e le route `GET/PUT/DELETE /api/conversations`. La chiamata al modello avviene esclusivamente sul server. L'interfaccia usa CSS globale senza Tailwind, GSAP per animazioni progressive e Lucide React per le icone. Le conversazioni sono salvate in PostgreSQL tramite Neon e separate usando un HMAC dell'indirizzo IP; l'IP in chiaro non viene scritto nel database.

## Requisiti

- Node.js 20.9 o successivo
- npm
- Una chiave API per un provider compatibile con l'endpoint OpenAI Chat Completions
- Un database Neon PostgreSQL (necessario per la cronologia delle conversazioni)

## Installazione e avvio

Dalla cartella del progetto:

```bash
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000). Per una build di produzione:

```bash
npm run build
npm start
```

## Configurazione del provider LLM

Copia `.env.local.example` in `.env.local`, inserisci le credenziali del provider, l'URL di connessione pooled Neon (`DATABASE_URL`) e imposta `CHAT_STORAGE_SECRET` con una stringa casuale segreta di almeno 32 caratteri. Per generarla in PowerShell:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Non cambiare la chiave dopo avere creato l'archivio: i dati IP precedenti non saranno più associabili ai rispettivi indirizzi hashati.

### Opzione consigliata: GroqCloud

Il modello viene eseguito da Groq, non sul tuo PC. Crea un account su [GroqCloud](https://console.groq.com/) e genera una chiave da [console.groq.com/keys](https://console.groq.com/keys). Il piano gratuito ha quote e rate limit; controlla i limiti correnti nel pannello del tuo account.

```dotenv
LLM_API_KEY=la-tua-chiave-groq
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=openai/gpt-oss-20b
```

La chiave resta nel solo `.env.local` lato server: non inserirla nel codice frontend e non pubblicarla. `openai/gpt-oss-20b` è il modello più leggero consigliato per risposte rapide; per risposte più articolate, verifica nel catalogo Groq se è disponibile `openai/gpt-oss-120b`, che può richiedere più tempo.

### Altri provider remoti

```dotenv
LLM_API_KEY=la-tua-chiave-del-provider
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=ID_DEL_MODELLO_DISPONIBILE
```

`LLM_BASE_URL` è la base dell'API compatibile, senza `/chat/completions`. La route funziona con provider remoti che implementano il formato OpenAI Chat Completions; endpoint diversi richiedono l'adattamento di `src/app/api/chat/route.ts`.

### Ricerca web prima della risposta

Prima di chiamare il modello, il server usa la domanda attuale e, per i messaggi di seguito, le domande precedenti recenti per conservare il contesto. Semplifica la query, riconosce alcuni temi storici ricorrenti e lancia ricerche mirate nelle API MediaWiki di Wikipedia in italiano e in inglese. Ordina i risultati in base alla loro pertinenza, esclude pagine fuori tema (per esempio la battaglia medievale del 1018 quando si chiede di Canne nel 216 a.C.), recupera estratti e li passa al modello come riferimenti; se le fonti principali sono poche, prova anche l'API REST di Wikipedia. Cerca di ottenere più pagine pertinenti; se riesce a reperirne una sola, indica che il riscontro è limitato invece di bloccare la risposta. Le edizioni linguistiche possono derivare dalla stessa voce e non sono considerate conferme indipendenti. Le ricerche riuscite vengono memorizzate in memoria per dieci minuti per contenere richieste ripetute. Le fonti possono avere titoli o estratti inglesi, ma Annibale risponde sempre e soltanto in italiano. Ogni affermazione storica verificabile deve avere nel testo un richiamo `[1]`, `[2]` e così via, associato solo a una fonte che la sostiene. Il server controlla che le citazioni siano numeri validi e presenti; se una frase fattuale resta senza fonte, chiede una correzione una volta e non mostra la risposta se il problema persiste. Sotto la risposta, ogni collegamento può essere espanso per controllare l'estratto effettivamente consultato. Se non sono disponibili fonti pertinenti, la route comunica l'errore invece di produrre una risposta presentata come verificata. La ricerca invia la domanda e un breve contesto delle domande precedenti ai server Wikimedia; non inserire informazioni personali o riservate. Wikipedia è una fonte secondaria collaborativa: per lavori accademici controlla anche le fonti primarie e i riferimenti bibliografici delle voci.

## Pubblicazione su GitHub e Vercel

La repository pubblica è [iannonegerardo296-eng/dialoghi-con-annibale](https://github.com/iannonegerardo296-eng/dialoghi-con-annibale). Importala in Vercel come progetto Next.js e abilita i deploy automatici dalla branch `main`.

Nel Marketplace Vercel collega una risorsa Neon PostgreSQL al progetto. Configura `DATABASE_URL` (preferisci la connessione pooled), `CHAT_STORAGE_SECRET`, `LLM_API_KEY`, `LLM_BASE_URL` e `LLM_MODEL` in **Project Settings → Environment Variables**, almeno per Production e Preview, poi ridistribuisci. Le route di chat e archivio richiedono runtime Node.js. Il database deve essere persistente; non salvare SQLite nel filesystem delle funzioni serverless.

Genera `CHAT_STORAGE_SECRET` con il comando PowerShell qui sopra e aggiungilo solo come variabile segreta in Vercel. Non caricare mai `.env.local` o token nel repository. Vercel inoltra l'IP client tramite `x-forwarded-for`; davanti all'app non collocare proxy che lascino manipolare tale intestazione.

La chat è condivisa tra utenti con lo stesso IP; informali di questa modalità e dei 90 giorni di conservazione prima della pubblicazione.

Il browser invia messaggi alla route Next.js `/api/chat`. La route aggiunge il prompt storico e inoltra la richiesta al provider. Non chiamare il provider direttamente dal browser: il codice client è ispezionabile e una chiave inserita lì può essere sottratta. Le variabili `LLM_API_KEY`, `LLM_BASE_URL` e `LLM_MODEL` non hanno prefisso `NEXT_PUBLIC_` e sono lette solo nel server. Riavvia `npm run dev` dopo aver modificato `.env.local`.

La cronologia inviata al modello è limitata agli ultimi 18 messaggi. L'archivio PostgreSQL conserva fino a 40 conversazioni per IP, con un massimo di 100 messaggi per conversazione. Gli archivi inattivi da oltre 90 giorni vengono eliminati automaticamente; “Elimina archivio condiviso” rimuove subito tutte le chat associate all'IP e richiede conferma. Tutti i visitatori con lo stesso IP condividono il medesimo archivio: reti aziendali, universitarie, VPN e operatori mobili possono mettere persone diverse dietro un unico IP. L'IP può inoltre cambiare quando si cambia rete. Questo sistema non è un'identità né un controllo di accesso.

Il server ricava l'indirizzo da `x-real-ip` o dal primo valore di `x-forwarded-for`; in sviluppo locale usa loopback. In produzione il reverse proxy deve sovrascrivere/sanificare tali header e inoltrare l'IP reale: non esporre direttamente l'applicazione con header client non attendibili. Neon fornisce lo storage PostgreSQL persistente necessario sia al server locale sia agli ambienti serverless e multiistanza.

L'indirizzo IP può essere dato personale: informa gli utenti dell'archivio condiviso e adatta informativa e trattamento dei dati alle norme applicabili prima della pubblicazione. Evita di inserire informazioni personali o riservate nella chat. Il limite in memoria è di 10 richieste al minuto per IP: non coordina processi o repliche serverless. In produzione sostituisci `src/lib/rateLimit.ts` con un rate limiter condiviso, per esempio Redis/Upstash, e applica limiti e monitoraggio al gateway del provider.

## Personalizzazione

- **Landing page:** `src/components/LandingHero.tsx` contiene hero e date in evidenza; la mappa è stata rimossa dalla schermata iniziale. Impaginazione e breakpoint sono in `src/app/globals.css`.
- **Mappa:** `public/mediterranean-map.svg` usa geometrie costiere Natural Earth (scala 1:50m; dati geografici di pubblico dominio, [naturalearthdata.com](https://www.naturalearthdata.com/)) con itinerario schematico originale. I valichi alpini e la localizzazione esatta di Zama sono controversi e sono indicati come approssimativi.
- **Personalità e cautela storica:** modifica `src/lib/annibalPrompt.ts`; il testo è inviato solo dal server.
- **Lunghezza delle risposte:** il selettore in chat offre modalità breve, normale e approfondita; le relative istruzioni sono applicate lato server in `src/app/api/chat/route.ts`.
- **Ritratto:** sostituisci `public/avatar-placeholder.svg` con un'illustrazione originale mantenendo il percorso o aggiornando `src/components/AnnibalAvatar.tsx`. La grafica attuale è una rappresentazione artistica, non una ricostruzione fedele del volto.
- **Stile:** palette, layout e breakpoint si trovano in `src/app/globals.css`.
- **Domande iniziali:** modifica `SUGGESTED_QUESTIONS` in `src/lib/constants.ts`.
- **Provider/modello:** cambia le variabili d'ambiente; scegli dal catalogo del provider un modello attivo e, se è gratuito, verifica le sue quote e disponibilità correnti.

## Accessibilità e movimento

I controlli sono navigabili da tastiera, hanno etichette accessibili e stati di focus visibili; `Shift+Invio` inserisce una nuova riga. Prima di inviare una domanda si può scegliere la lunghezza della risposta: breve, normale (predefinita) o approfondita. Le nuove risposte compaiono progressivamente, circa 55 caratteri al secondo; rispettano `prefers-reduced-motion` mostrandosi subito per chi riduce le animazioni. Il movimento dell'avatar e le animazioni GSAP rispettano la stessa preferenza; sono inoltre presenti fallback CSS. Su dispositivi mobili il ritratto diventa compatto e la timeline può essere aperta o chiusa.

## Note storiche ed etiche

Il personaggio è una ricostruzione conversazionale, non una fonte. La voce esprime emozioni e giudizi plausibili in prima persona, ma non li presenta come sentimenti privati attestati: le fonti antiche sono frammentarie e spesso tramandate da autori greci e romani. Date, motivazioni e dettagli possono essere discussi. Il prompt invita il modello a dichiarare l'incertezza, a non inventare citazioni e a non presentare conoscenze posteriori come proprie. La generazione AI può comunque sbagliare: verifica le informazioni importanti su fonti storiche affidabili. Le richieste pericolose o di odio vengono reindirizzate verso un contesto educativo e non operativo.

## Risoluzione dei problemi

- **Servizio non configurato:** controlla che `.env.local` sia nella radice, contenga le variabili del provider e `CHAT_STORAGE_SECRET`, quindi riavvia il server.
- **Errore 502:** verifica URL base, modello, chiave e disponibilità del provider. La route restituisce messaggi generici al browser; i dettagli non vengono esposti al client.
- **Errore 429:** la protezione locale ha raggiunto 10 richieste nel minuto corrente; attendi il reset.
- **Archivio non caricato/salvato:** controlla che `DATABASE_URL` e `CHAT_STORAGE_SECRET` siano configurate e che il proxy inoltri l'IP reale negli header attesi.
- **Movimento ridotto:** abilita la preferenza di sistema “Riduci movimento”; l'avatar resta statico e i contenuti restano disponibili.

## Checklist di test manuale

- [ ] Avvio locale con `npm install`, configurazione `.env.local` e `npm run dev`.
- [ ] Invio con il pulsante e con Invio; `Shift+Invio` aggiunge una riga.
- [ ] Stato di ricerca fonti e riflessione durante la richiesta.
- [ ] Errore API visibile e dismissibile (chiave assente, provider irraggiungibile o rate limit).
- [ ] La route cerca fonti in italiano e inglese prima di chiedere la risposta al modello.
- [ ] I riferimenti nel testo corrispondono ai collegamenti di fonte mostrati sotto la risposta.
- [ ] Avatar animato in stato idle e in stato di riflessione.
- [ ] Layout responsive su smartphone e tablet; timeline richiudibile.
- [ ] Preferenza `prefers-reduced-motion` disattiva/riduce il movimento.
- [ ] La landing page è la schermata iniziale e apre la chat su `/chat`.
- [ ] Le chat vengono caricate e salvate in PostgreSQL per IP; utenti con lo stesso IP condividono l'archivio.
- [ ] “Nuova conversazione” svuota chat, input e stato di errore.
