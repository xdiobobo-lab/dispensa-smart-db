# Changelog

Tutte le modifiche importanti a **Dispensa Smart** sono annotate qui.
Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/) e il numero di versione, mostrato in basso nelle Impostazioni (⚙️), segue il [versionamento semantico](https://semver.org/lang/it/).

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
