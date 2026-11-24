# Test di Dispensa Smart

Test automatici con Playwright (aprono l'app in un browser vero e la usano).

    cd tests
    npm install
    npx playwright install chromium
    bash run-all.sh            # tutti i test
    node t106.js               # un test solo

`versione.test.js` controlla che versione, cache e novità siano coerenti prima di pubblicare.
Le immagini `.png` create dai test sono solo schermate di controllo (ignorate da git).
