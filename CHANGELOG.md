# Changelog

Tutte le modifiche importanti a **Dispensa Smart** sono annotate qui.
Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/) e il numero di versione, mostrato in basso nelle Impostazioni (⚙️), segue il [versionamento semantico](https://semver.org/lang/it/).

## [2.3.0] – 2026-10-28

### Aggiunto
- **Volantini personali e privati**: ogni account vede solo i volantini dei propri supermercati. Le immagini stanno in un archivio privato di Supabase (non più nel repository pubblico) e sono salvate una sola volta, condivise solo con chi ha quel supermercato nel proprio elenco.
- Pulsante "Togli dai miei volantini" per ogni supermercato.
- Richiede di eseguire di nuovo `supabase-setup.sql` (nuove tabelle `miei_volantini` e `volantini_catalogo` e archivio `volantini`).

### Modificato
- Lo scaricatore cerca solo i volantini richiesti e non ancora presenti, elimina le richieste evase e cancella i volantini scaduti (con le immagini) e quelli che nessuno ha più nel proprio elenco.
- I volantini richiedono l'accesso all'account.

## [2.2.1] – 2026-10-27

### Modificato
- **Schermata dei volantini ridisegnata**: elenco "Volantini disponibili" sempre visibile, scelta del supermercato con pulsanti, copertine in griglia a due colonne con numero di pagine, nome e validità; se una copertina non si carica compare un segnaposto. La ricerca per regione e città è in un riquadro separato sotto.
- Lo scaricatore recupera le pagine mancanti di un volantino (di solito le prime).
- Dopo una ricerca, l'app aspetta che il sito pubblichi i volantini prima di dire che non ci sono.

## [2.2.0] – 2026-10-27

### Novità
- **Ricerca immediata dei volantini**: se il supermercato cercato non è ancora disponibile, l'app avvia subito lo scaricatore tramite il Worker di Cloudflare e mostra "Sto cercando i volantini… circa 5 minuti"; appena è pronto il volantino compare da solo. Il token GitHub resta nascosto nel Worker.
- Messaggi più chiari se il salvataggio della richiesta viene rifiutato da Supabase.

## [2.1.0] – 2026-10-27

### Novità
- **Sfoglia i volantini**: nella sezione Negozi compare l'elenco dei volantini scaricati automaticamente (copertine per supermercato). Si sfoglia pagina per pagina a schermo intero, con frecce, tastiera e scorrimento con il dito.
- **Cerca i volantini nella tua zona!**: schermata con Regione, Supermercato e Città (facoltativa). Se i volantini ci sono già si aprono subito; altrimenti la richiesta viene registrata e lo scaricatore (ogni 3 ore) li aggiunge.
- **Le offerte si salvano con il nome del volantino** (e la regione) e, rileggendo lo stesso volantino, sostituiscono la copia precedente invece di duplicarla.
- **Leggi le offerte con l'AI** direttamente da un volantino sfogliato, senza caricare nulla a mano (prime 24 pagine).
- **Scaricatore automatico** (GitHub Actions + browser) che ogni 3 ore salva le pagine dei volantini di Conad e Lidl dalla pagina della città in `volantini/`: vedi `LEGGIMI-volantini.txt`.

## [2.0.3] – 2026-10-26

### Novità
- **AI senza chiavi sui dispositivi**: se in `config.js` si aggiunge la riga `window.AI_PROXY` con l'indirizzo e il codice del Worker, tutti i dispositivi usano l'AI automaticamente, senza vedere né inserire alcuna chiave (la chiave Groq resta segreta nel Worker).

### Modificato
- I pulsanti "Chiave AI" e "Modello" sono nascosti a tutti: restano attivi (la chiave o il link già salvati continuano a funzionare) e si mostrano toccando 5 volte di seguito il titolo "Dispensa Smart".
- Il riquadro "Sincronizzazione automatica con GitHub" compare solo a chi l'aveva già collegata (per poterla scollegare): la sincronizzazione ora passa dall'account.

## [2.0.2] – 2026-10-26

### Novità
- **Messaggi chiari quando il servizio online non risponde**: se sei offline lo dice; se il progetto Supabase gratuito è in pausa (dopo circa una settimana senza uso) spiega come riattivarlo ("Restore project") e ricorda che i dati restano sul dispositivo.

## [2.0.1] – 2026-10-26

### Novità
- **Avviso di nuova versione**: quando sul sito c'è un aggiornamento, l'app mostra "C'è una nuova versione" con il pulsante **Aggiorna**, che scarica i file nuovi senza toccare i dati. Evita di dover cancellare a mano la memoria del browser.

### Note per chi installa
- Dopo ogni aggiornamento carica tutti i file insieme (compreso il nuovo `versione.json`), ma **non** sovrascrivere `config.js` con quello vuoto dello zip.

## [2.0.0] – 2026-10-26

### Novità
- **Famiglia**: dispensa, lista della spesa e piano settimanale si possono condividere con altre persone tramite un codice invito. Le modifiche fatte da più persone si uniscono senza sovrascriversi, anche le cancellazioni.
- **Correggi un'offerta**: ogni offerta dei volantini ha il pulsante ✏️ per cambiare nome, prezzo, scadenza e dettagli, oppure per eliminarla (con "Annulla").
- **Prezzi da controllare**: le offerte con prezzo mancante, illeggibile, a zero, troppo basso o troppo alto sono segnalate con ⚠️, con il conteggio sulla scheda del volantino.
- **Riprova solo le pagine non lette**: se la lettura di un volantino salta qualche pagina, si possono rileggere solo quelle, senza rifare tutto.
- **Modalità cucina**: testo e pulsanti grandi e schermo sempre acceso mentre si segue una ricetta.
- **Scadenze in evidenza**: nella schermata Oggi un riquadro raggruppa i prodotti scaduti, in scadenza oggi, domani e nei prossimi 3 giorni, con scorciatoie verso ricette e dispensa; la barra in basso mostra un avviso.
- Il numero di versione compare nelle Impostazioni.

### Modificato
- Il codice è stato diviso in più file (`core.js`, `dispensa.js`, `ricette.js`, `piano.js`, `negozi.js`, `account.js`, `dati.js`): l'app si carica più in fretta e si modifica con meno rischi.
- Il messaggio di avanzamento della lettura dei volantini indica le pagine che sta leggendo.

### Rimosso
- Codice non più usato: vecchia ricerca offerte da testo incollato, vecchio calcolo di disponibilità degli ingredienti e caricamento automatico di `volantini-auto.json`.

### Note per chi installa
- Per la famiglia bisogna rieseguire `supabase-setup.sql` in Supabase > SQL Editor (si può ripetere senza danni).
- I progetti Supabase gratuiti vanno in pausa dopo circa 7 giorni di inattività: vedi `LEGGIMI-accesso.txt`.

## [1.5.0] – Accesso con account

### Novità
- **Accesso e registrazione** con email e password (Supabase): ognuno ritrova la propria dispensa su ogni dispositivo.
- Recupero e cambio password, accesso come ospite, cambio utente sullo stesso dispositivo senza mescolare i dati.
- Sincronizzazione automatica con gestione dei conflitti tra dispositivi.
- Copie di sicurezza giornaliere online (le ultime 14), ripristinabili dalle Impostazioni.
- La schermata di accesso compare solo se `config.js` è compilato.

## [1.4.0] – Sito in più file

### Modificato
- L'app, prima in un unico file molto pesante, è divisa in più file con cache offline (service worker) che si aggiorna da sola a ogni nuova versione.

## [1.3.0] – Strumenti per spesa e piano

### Novità
- **Ricerca** nelle sezioni principali (dispensa, ricette, spesa, volantini).
- **Confronta i prezzi** tra negozi nei volantini, con prezzo per unità e ordinamento (prezzo crescente o decrescente, ecc.).
- **Piano settimanale**: scelta tra settimana lavorativa (lunedì–venerdì) e settimana intera (lunedì–domenica).
- **Rotella delle impostazioni** in ogni sezione per cambiare i colori in qualsiasi momento.

## [1.2.0] – Più facile da usare

### Novità
- Piccola spiegazione in ogni sezione, per chi usa l'app la prima volta.
- Pagina di benvenuto e guida di primo avvio dentro l'app.
- Lettura dei volantini con intelligenza artificiale (PDF o foto) come metodo predefinito, con avanzamento chiaro e tempo stimato.
- Schermate della spesa e delle offerte ridisegnate: offerte raggruppate per negozio, prezzo, scadenza e pulsante per aggiungerle alla lista.

## [1.1.0] – Dati al sicuro

### Novità
- Salvataggio automatico dei dati su un repository GitHub privato dell'utente.
- Copie di sicurezza giornaliere, ripristino e pulsante **Annulla** dopo una cancellazione.
- Raccolte di ricette, scelta delle porzioni, unità "cucchiaio" e "cucchiaino".

## [1.0.0] – Prima versione

### Novità
- **Dispensa** con quantità e scadenze, **ricette** proposte in base a ciò che si ha, **lista della spesa** con totale, **piano settimanale**, lettura di **scontrini** e **volantini**.
- Installabile sul telefono come app (aggiungi a schermata Home).

[2.0.0]: https://github.com/xdiobobo-lab/dispensa-smart/releases/tag/v2.0.0
