# Changelog

Tutte le modifiche importanti a **Dispensa Smart** sono annotate qui.
Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/) e il numero di versione, mostrato in basso nelle Impostazioni (⚙️), segue il [versionamento semantico](https://semver.org/lang/it/).

## [2.13.0] – 2026-11-24

### Cambiato
- **Ricette a riquadri**: scegli la portata (Primo, Secondo, Contorno, Antipasto, Dolce o Qualsiasi) da una griglia; si apre una schermata con solo le ricette di quella portata e «← Portate» per tornare indietro. Se non ci sono ancora ricette, l'app le cerca da sola.
- **Piano pasti a riquadri**: la settimana è una griglia di giorni con i pasti, il segno ✅ quando sono completati e ⚠️ se mancano ingredienti. Tocchi un giorno per vedere e segnare i suoi pasti; «⚙️ Genera o ricalcola il piano» apre le opzioni di generazione.

## [2.12.0] – 2026-11-24

### Aggiunto
- **Novità a ogni aggiornamento**: quando l'app si aggiorna, all'apertura compare una finestra che spiega cosa è cambiato. Puoi rileggerla quando vuoi da ⚙️ Impostazioni → Novità.
- **Avvisi sulle scadenze** (⚙️ Impostazioni → Avvisi): una notifica quando qualcosa scade oggi o domani. Compare quando apri l'app e, su Android con l'app installata sulla schermata Home, anche da sola una volta al giorno.
- **Prova con dati di esempio**: al primo avvio (o a dispensa vuota) puoi caricare 14 prodotti di esempio per vedere come funziona l'app, e toglierli con un tocco.
- **Ricompra**: quando elimini un prodotto dalla dispensa puoi metterlo subito nella lista della spesa.
- **Preferenze alimentari** (⚙️ Impostazioni): vegetariano, senza lattosio, senza glutine, senza maiale. I suggerimenti e le ricette dell'AI evitano gli ingredienti non adatti.
- **👎 Non mi piace** sulle ricette suggerite: non ti verrà più riproposta (si può annullare e ripristinare dalle impostazioni).
- Altri 15 piatti nel catalogo delle ricette classiche (ora 251).

### Cambiato
- **Menu in basso più semplice**: Oggi, Dispensa, Ricette, Spesa e Altro. Piano pasti e Offerte sono ora in «Altro», insieme a Novità, Guida, Impostazioni e Cronologia.
- Nella lista della spesa i prodotti «Già comprati» restano ripiegati finché non li apri.

### Corretto
- L'avviso «C'è una nuova versione» non può più bloccarsi: ora l'app controlla direttamente la versione del programma.

## [2.11.0] – 2026-11-24

### Migliorato
- **Categorie e emoji dei prodotti molto più ricche**: ora sugo, ragù, pesto, maionese, pelati, passata, spezie e salse vanno in «Condimenti e oli» (prima finivano in «Altro» o tra le verdure); formaggi, salumi, pesce, frutta, verdura, dolci, bevande e liquori sono riconosciuti molto meglio, con circa 300 emoji dedicate (🥫 sugo, 🌿 pesto, 🦐 gamberi, 🍕 pizza…).
- I prodotti già in dispensa finiti in «Altro» vengono ricategorizzati da soli quando il nome è riconoscibile.

## [2.10.1] – 2026-11-24

### Cambiato
- **Opzioni avanzate** (⚙️ Impostazioni): backup e importazione dei dati, copie di sicurezza e sincronizzazione GitHub restano nascosti finché non spunti la casella. Quando è attiva li trovi in fondo alla Dispensa.
- Aprendo una categoria della Dispensa si vede una schermata con **solo i prodotti** (e «← Categorie»), senza guida, avvisi, filtri, ricerca e backup.

## [2.10.0] – 2026-11-24

### Cambiato
- **Dispensa a categorie**: invece di una lunga lista da scorrere, ora vedi una griglia di riquadri (Cereali e derivati, Latticini e uova, Carne e pesce…) con il numero di prodotti e un ⚠️ se qualcosa scade presto. Tocchi una categoria per vedere i prodotti; in alto c'è «← Categorie» e una barra per passare da una categoria all'altra.
- I filtri Dispensa / Frigo / Congelatore valgono anche per i riquadri; la ricerca continua a cercare in tutte le categorie.

## [2.9.0] – 2026-11-24

### Aggiunto
- **Catalogo di 236 piatti classici italiani** (primi, secondi, contorni, antipasti, dolci) con ingredienti che li definiscono, regione e un riassunto del procedimento. «Suggeriscimi ricette» sceglie prima i piatti del catalogo che si fanno con la tua dispensa (o a cui manca un solo ingrediente) e l'AI ne scrive soltanto dosi e passaggi: se dimentica un ingrediente obbligatorio la ricetta viene scartata. Così non si inventano più piatti come il risotto al cacao.
- Se nel catalogo non c'è abbastanza di compatibile, l'AI propone degli **abbinamenti** suoi, segnati come «Abbinamento proposto dall'AI», e l'app lo dice.
- La ricerca per nome parte dal catalogo («carbonara», «torta senza uova»); se il piatto non c'è, risponde l'AI.
- Nella scheda di ogni piatto classico: la regione e i link per confrontare con GialloZafferano e Benedetta Rossi (ricerca su Google, si apre il loro sito).

### Corretto
- Il badge delle ricette cercate ora dice «Proposta dall'AI» (prima diceva «Cercata online con l'AI», ma l'AI non cerca sul web).

## [2.8.1] – 2026-11-24

### Rimosso
- L'archivio delle ricette di Artusi (provato brevemente come 2.8.0) è stato tolto: suggerimenti e ricerca tornano a funzionare come nella 2.7.0, con le regole sui piatti reali.

## [2.7.0] – 2026-11-23

### Migliorato
- **Ricette più vere**: l'AI deve proporre solo piatti realmente esistenti, con il loro nome e la tradizione o regione (mostrata nella ricetta). Non è più obbligata a usare solo la dispensa: può aggiungere 1-3 ingredienti da comprare se la ricetta autentica li richiede, e propone meno ricette invece di inventare abbinamenti.
- **Controllo di coerenza**: le ricette incoerenti vengono scartate prima di mostrarle (per esempio risotto o primi con cacao, dolci con carne o aglio, un «risotto» senza riso, una «carbonara» senza pasta, un primo senza pasta, riso o zuppa).
- Stessa regola nella ricerca di una ricetta e nei piani settimanali/mensili.

## [2.6.0] – 2026-11-23

### Aggiunto
- **Tasto ❄️ Congela** su ogni prodotto della dispensa: lo sposta nel congelatore e allunga la scadenza in base al tipo di alimento (carne 3 mesi, pesce e pane 2 mesi, verdura e frutta 6 mesi, ecc.). Se è già nel congelatore il tasto diventa 🔥 Scongela: va in frigo con 2 giorni di scadenza. Si può annullare.
- Nella revisione dello scontrino la casella **❄️ congela** per ogni prodotto.

### Migliorato
- **Lettura degli scontrini lunghi**: la foto viene divisa in strisce sovrapposte e letta a pezzi più piccoli, così le righe non si confondono; le righe doppie ai bordi vengono tolte.
- L'AI trascrive soltanto ciò che legge: sotto ogni prodotto compare la riga com'è scritta sullo scontrino, e le righe poco chiare sono segnate ⚠️ e deselezionate finché non le controlli.

## [2.5.0] – 2026-11-02

### Aggiunto
- **Tasto "🔄 Aggiorna volantini"** (Spesa → Volantini e negozi): chiede lo scaricamento dei volantini di questo mese per tutti i tuoi supermercati; quelli del mese scorso vengono tolti, immagini comprese. Si può usare ogni 6 ore e lo scaricatore riscarica solo se l'ultimo aggiornamento ha più di 12 ore.

## [2.4.1] – 2026-10-28

### Aggiunto
- **Piano senza dispensa**: nella schermata prima di generare puoi scegliere "Non usare la dispensa: scegli le ricette e compro tutto". L'AI propone ricette varie senza guardare cosa hai in casa e, con la casella 🛒, aggiunge subito tutti gli ingredienti alla lista della spesa (per il piano mensile somma le quantità delle 4 settimane). Funziona anche con il piano dalle offerte dei volantini.

## [2.4.0] – 2026-10-28

### Aggiunto
- **Diete e persone con esigenze particolari** (Piano → 🥗 Diete): carichi la dieta del dietologo (foto, PDF o testo), l'AI la legge e la riassume; puoi correggerla a mano.
- **Piani per una persona o per la famiglia**: prima di generare scegli per chi (famiglia che mangia normale oppure una persona a dieta), la durata (settimana o mese) e, per pranzo e cena, se vuoi solo primi, solo secondi, primo + secondo o misto.
- **Piano mensile** (4 settimane, senza ripetizioni) e **📚 I miei piani**: i piani si salvano nel tuo account e si modificano a mano (cambia il nome del piatto, scegli dal ricettario, nuovo piatto dall'AI, svuota). Dal piano salvato puoi riempire la lista della spesa.
- **Aggiungi prodotto con una foto**: fotografi il prodotto con la data di scadenza e l'AI legge nome, quantità e scadenza; se la data non si legge ti avvisa.
- **Scheda ⭐ Offerte** nel menu in basso, con tutte le offerte dei volantini, i prodotti usati più spesso (con tasto per chiudere l'elenco) e i preferiti.
- **Prodotti preferiti** (cuoricino in dispensa o aggiunta a mano) e **stellina in dispensa** quando il prodotto è in offerta, con le alternative e varianti segnalate come tali (es. burro → burro di soia, margarina).

### Modificato
- "Spesa → Negozi e offerte" diventa "Volantini e negozi": qui si sfogliano i volantini; le offerte lette dall'AI vanno nella scheda ⭐ Offerte.

## [2.3.0] – 2026-10-28

### Aggiunto
- **Volantini personali e privati**: ogni account vede solo i volantini dei propri supermercati. Le immagini stanno in un archivio privato di Supabase (non più nel repository pubblico) e sono salvate una sola volta, condivise solo con chi ha quel supermercato nel proprio elenco.
- Pulsante "Togli dai miei volantini" per ogni supermercato.
- Richiede di eseguire di nuovo `supabase-setup.sql` (nuove tabelle `miei_volantini` e `volantini_catalogo` e archivio `volantini`).

### Modificato
- **"Aggiungi spesa" ora si chiama "Aggiungi prodotto"**.
- Pulsante **Rimuovi** su ogni volantino: lo toglie dal tuo elenco (serve rieseguire `supabase-setup.sql`).
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
