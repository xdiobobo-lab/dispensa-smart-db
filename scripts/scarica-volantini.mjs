// Apre le pagine dei volantini su DoveConviene con un browser vero, sfoglia ogni volantino
// e salva le immagini delle pagine in volantini/<negozio>/<id>/pNN.jpg.
// Scrive anche volantini/index.json (elenco) e volantini/_debug.txt (cosa è successo).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CFG = JSON.parse(fs.readFileSync(path.resolve(ROOT, process.env.VOL_CONFIG || "volantini-config.json"), "utf8"));
const OUT = path.resolve(ROOT, process.env.VOL_OUT || "volantini");
const MAXV = +CFG.max_volantini || 4, MAXP = +CFG.max_pagine || 40;
const MINB = +(process.env.VOL_MINB || 40000);          // sotto questa dimensione l'immagine è un'icona/miniatura
const WAIT = +(process.env.VOL_WAIT || 900);
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = [];
const L = (...a) => { const t = a.join(" "); console.log(t); log.push(t); };

fs.mkdirSync(OUT, { recursive: true });

const { chromium } = await import("playwright");
const br = await chromium.launch();
const ctx = await br.newContext({ userAgent: UA, locale: "it-IT", timezoneId: "Europe/Rome", viewport: { width: 1280, height: 1800 } });
// Richieste fatte dall'app (tabella richieste_volantini): le aggiungo ai negozi del file di configurazione.
const urlSlug = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
async function richieste() {
  const U = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, ""), K = (process.env.SUPABASE_SERVICE_KEY || "").trim();
  if (!U || !K) { L("Richieste dall'app: non collegate (mancano SUPABASE_URL e SUPABASE_SERVICE_KEY nei Secrets)"); return [] }
  try {
    const r = await fetch(U + "/rest/v1/richieste_volantini?select=id,catena,regione,citta&order=creata.asc&limit=" + (+CFG.max_richieste || 12), { headers: K.startsWith("sb_") ? { apikey: K } : { apikey: K, authorization: "Bearer " + K } });
    if (!r.ok) { L("Richieste dall'app: errore HTTP " + r.status + (r.status === 401 || r.status === 403 ? " (la chiave non è accettata: serve la chiave SEGRETA del progetto, non quella pubblica; tipo della chiave usata: " + (K.startsWith("sb_secret_") ? "sb_secret" : K.startsWith("sb_publishable_") ? "PUBBLICA (sbagliata)" : K.startsWith("eyJ") ? "JWT" : "non riconosciuto") + ")" : "")); return [] }
    const a = await r.json(); L("Richieste dall'app:", a.length); return a;
  } catch (e) { L("Richieste dall'app: errore", String(e.message).slice(0, 120)); return [] }
}
const base0 = (process.env.VOL_BASE || "https://www.doveconviene.it").replace(/\/+$/, "");
const reqs = await richieste();
const daCancellare = [];                                   // id delle richieste da togliere dalla coda
const mappa = {};                                          // url -> id richieste
const esistente = (() => { try { return JSON.parse(fs.readFileSync(path.join(OUT, "index.json"), "utf8")) } catch { return { negozi: [] } } })();
const disponibile = url => (esistente.negozi || []).some(n => n.url === url && (n.volantini || []).length);
const tutti = process.env.VOL_TUTTI === "1";               // VOL_TUTTI=1: riscarica anche i negozi già presenti
for (const q of reqs) {
  const citta = urlSlug(q.citta || ""), cat = urlSlug(q.catena || "");
  if (!citta || !cat) { if (q.id != null) daCancellare.push(q.id); continue }
  const url = base0 + "/" + citta + "/volantino/" + cat;
  (mappa[url] = mappa[url] || []).push(q.id);
  if (disponibile(url) && !tutti) { L("Già disponibile, non lo cerco:", q.catena, q.citta); if (q.id != null) daCancellare.push(q.id); continue }
  if ((CFG.negozi || []).some(n => n.url === url)) continue;
  (CFG.negozi = CFG.negozi || []).push({ nome: String(q.catena).trim().slice(0, 40), regione: String(q.regione || "").slice(0, 40), citta: String(q.citta || "").slice(0, 40), url, attivo: true });
}
const index = { aggiornato: new Date().toISOString(), negozi: (esistente.negozi || []).slice() };

async function consenso(page) {
  for (const t of [/accetta/i, /accetto/i, /consenti/i, /^ok$/i, /agree/i]) {
    try { const b = page.getByRole("button", { name: t }).first(); if (await b.count()) { await b.click({ timeout: 1500 }); L("  consenso cliccato", t); await sleep(500); return } } catch {}
  }
}
const isFlyerImg = (url, ct) => /^image\//.test(ct || "") && /shopfully|page_assets|images\/volantini|\/flyer/i.test(url) && !/logo|icon|avatar|sprite|placeholder|favicon/i.test(url);

for (const n of CFG.negozi || []) {
  if (!n.attivo) continue;
  if (disponibile(n.url) && !tutti) { L("== " + n.nome + ": già disponibile, salto"); continue }
  const rec = { nome: n.nome, regione: n.regione || "", citta: n.citta || ((n.url.match(/doveconviene\.it\/([^/]+)\/volantino/) || [])[1] || ""), url: n.url, volantini: [] };
  L("== " + n.nome + " " + n.url);
  try {
    const lp = await ctx.newPage();
    await lp.goto(n.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await consenso(lp); await sleep(1500);
    try { await lp.screenshot({ path: path.join(OUT, "_lista-" + slug(n.nome) + ".png") }) } catch {}
    const links = await lp.$$eval("a[href*='flyerId=']", as => as.map(a => ({ href: a.href, testo: (a.innerText || a.getAttribute("aria-label") || a.title || "").replace(/\s+/g, " ").trim() })));
    await lp.close();
    const seen = new Set(), flyers = [];
    for (const l of links) { const m = l.href.match(/flyerId=(\d+)/); if (m && !seen.has(m[1])) { seen.add(m[1]); flyers.push({ id: m[1], href: l.href, testo: l.testo }) } }
    L("  volantini trovati:", flyers.length, flyers.map(f => f.id).join(","));
    for (const f of flyers.slice(0, MAXV)) {
      const imgs = new Map();
      const page = await ctx.newPage();
      page.on("response", async r => {
        try {
          const u = r.url(), ct = r.headers()["content-type"] || "";
          if (!isFlyerImg(u, ct) || imgs.has(u)) return;
          imgs.set(u, { ct });                              // il contenuto lo scarico dopo (più affidabile)
        } catch {}
      });
      const base = f.href.replace(/([?&])flyerPage=\d+/, "$1flyerPage=1");
      try {
        await page.goto(base, { waitUntil: "domcontentloaded", timeout: 45000 });
        await consenso(page); await sleep(2000);
        let fermi = 0, giri = 0, shots = [];
        while (giri < MAXP && fermi < 3) {
          const prima = imgs.size; giri++;
          if (!imgs.size) { try { shots.push(await page.screenshot({ type: "jpeg", quality: 80 })) } catch {} }
          let mosso = false;
          for (const nome of [/success/i, /avanti/i, /next/i, /pagina success/i]) {
            try { const b = page.getByRole("button", { name: nome }).first(); if (await b.count()) { await b.click({ timeout: 1200 }); mosso = true; break } } catch {}
          }
          if (!mosso) await page.keyboard.press("ArrowRight");
          await sleep(WAIT);
          if (imgs.size === prima) fermi++; else fermi = 0;
        }
        L("  volantino", f.id, "giri:", giri, "immagini:", imgs.size);
        
        
        const dir = path.join(OUT, slug(n.nome), f.id); fs.mkdirSync(dir, { recursive: true });
        // Le pagine arrivano in più risoluzioni (page_N_level_L): per ogni pagina tengo la più grande,
        // e solo del volantino con più pagine (il visualizzatore carica anche altri volantini consigliati).
        const PA = /page_assets\/(\d+)\/(\d+)\/page_\d+_level_(\d+)_/;
        const raggruppa = () => {
          const pubs = new Map(), altre = [];
          for (const u of imgs.keys()) {
            const m = u.match(PA);
            if (!m) { altre.push(u); continue }
            const pub = m[1], pg = +m[2], lv = +m[3];
            if (!pubs.has(pub)) pubs.set(pub, new Map());
            const mp = pubs.get(pub), cur = mp.get(pg);
            if (!cur || lv > cur.lv) mp.set(pg, { u, lv });
          }
          return { pubs, altre };
        };
        let { pubs, altre } = raggruppa();
        // Pagine mancanti (di solito le prime): le riapro una per una con flyerPage=N.
        if (pubs.size) {
          const [bp0] = [...pubs.entries()].sort((x, y) => y[1].size - x[1].size);
          const mx = Math.max(...bp0[1].keys()), mancano = [];
          for (let k = 1; k <= mx; k++) if (!bp0[1].has(k)) mancano.push(k);
          if (mancano.length) {
            L("  pagine mancanti:", mancano.join(","), "- le riapro");
            for (const k of mancano.slice(0, 15)) {
              try { await page.goto(base.replace(/([?&])flyerPage=\d+/, "$1flyerPage=" + k), { waitUntil: "domcontentloaded", timeout: 30000 }); await sleep(1800) } catch {}
            }
            ({ pubs, altre } = raggruppa());
          }
        }
        let scelte = [];
        if (pubs.size) {
          const [best] = [...pubs.entries()].sort((a, b) => b[1].size - a[1].size);
          L("  pubblicazione", best[0], "pagine:", best[1].size, "(altre pubblicazioni viste: " + (pubs.size - 1) + ") numeri: " + [...best[1].keys()].sort((x, y) => x - y).join(","));
          scelte = [...best[1].entries()].sort((a, b) => a[0] - b[0]).map(([pg, o]) => ({ u: o.u, n: pg }));
        } else {
          scelte = altre.map((u, i) => ({ u, n: i + 1 }));
        }
        const final = new Map();
        for (const c of scelte) {
          try { const rr = await ctx.request.get(c.u, { headers: { referer: base }, timeout: 30000 }); const b = rr.ok() ? await rr.body() : null; if (b && b.length >= (pubs.size ? 8000 : MINB)) final.set(c.u, { b, ct: imgs.get(c.u).ct, n: c.n }) } catch {}
        }
        if (final.size < 2 && imgs.size) {
          // secondo tentativo: nessun nome riconosciuto, prendo tutte le immagini grandi nell'ordine in cui sono arrivate
          L("  nessuna pagina riconosciuta: indirizzi visti:");
          for (const u of [...imgs.keys()].slice(0, 8)) L("    ?", u.slice(0, 170));
          let n2 = 0;
          for (const u of imgs.keys()) {
            try { const rr = await ctx.request.get(u, { headers: { referer: base }, timeout: 30000 }); const b = rr.ok() ? await rr.body() : null; if (b && b.length >= 15000) { n2++; final.set(u, { b, ct: imgs.get(u).ct || "image/jpeg", n: n2 }) } } catch {}
          }
          L("  secondo tentativo: ", final.size, "immagini");
        }
        const pagine = [];
        for (const [u, v] of final) { const ext = /png/.test(v.ct) ? "png" : /webp/.test(v.ct) ? "webp" : "jpg"; const fn = "p" + String(v.n).padStart(2, "0") + "." + ext; fs.writeFileSync(path.join(dir, fn), v.b); pagine.push(slug(n.nome) + "/" + f.id + "/" + fn); if (pagine.length <= 2) L("    img", u.slice(0, 140), v.b.length + "B") }
        imgs.clear(); for (const [u, v] of final) imgs.set(u, v);
        if (imgs.size < 2) L("  ATTENZIONE: poche immagini catturate (" + imgs.size + "): serve guardare la pagina del volantino");
        const val = (f.testo.match(/(valid[oi]|scad[ea]|dal|fino)[^|]{0,40}/i) || [""])[0];
        rec.volantini.push({ salvato: new Date().toISOString(), id: f.id, nome: f.testo.slice(0, 80) || ("Volantino " + f.id), url: f.href, validita: val, pagine });
      } catch (e) { L("  errore volantino", f.id, String(e.message).slice(0, 200)) }
      await page.close();
    }
  } catch (e) { L("  errore negozio", n.nome, String(e.message).slice(0, 200)) }
  if (rec.volantini.length) {
    const k = index.negozi.findIndex(x => x.url === rec.url);
    if (k >= 0) index.negozi[k] = rec; else index.negozi.push(rec);
  } else L("  nessun volantino salvato per", n.nome, "- non cambia nulla");
  for (const id of mappa[n.url] || []) daCancellare.push(id);   // richiesta evasa (o tentata): esce dalla coda
}
await br.close();
// Pulizia della coda: le richieste evase vengono cancellate da Supabase.
if (daCancellare.length && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  const U = process.env.SUPABASE_URL.trim().replace(/\/+$/, ""), K = process.env.SUPABASE_SERVICE_KEY.trim();
  try {
    const ids = [...new Set(daCancellare.filter(x => x != null))];
    const r = await fetch(U + "/rest/v1/richieste_volantini?id=in.(" + ids.join(",") + ")", { method: "DELETE", headers: K.startsWith("sb_") ? { apikey: K } : { apikey: K, authorization: "Bearer " + K } });
    L(r.ok ? "Richieste eliminate dalla coda: " + ids.length : "Eliminazione richieste: errore HTTP " + r.status);
  } catch (e) { L("Eliminazione richieste: errore", String(e.message).slice(0, 120)) }
}

// Pulizia dei volantini scaduti: tolgo dall'elenco e cancello le immagini.
// Scadenza = ultima data trovata nella validità (es. "dal 20 ottobre al 2 novembre"); se non c'è una data
// leggibile, il volantino viene tolto dopo "giorni_conservazione" giorni dal salvataggio (predefinito 14).
const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function scadenza(t) {
  const re = /(\d{1,2})\s+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)[a-z]*(?:\s+(\d{4}))?/gi;
  let m, ultima = null; const ora = new Date();
  const anniEspliciti = (String(t || "").match(/\b(20\d{2})\b/g) || []).map(Number);
  const annoFisso = anniEspliciti.length ? Math.max(...anniEspliciti) : 0;   // se c'è un anno scritto, vale per tutte le date
  while ((m = re.exec(String(t || "")))) {
    const mese = MESI.indexOf(m[2].toLowerCase());
    let anno = m[3] ? +m[3] : (annoFisso || ora.getFullYear());
    let d = new Date(anno, mese, +m[1], 23, 59, 59);
    if (!m[3] && !annoFisso && d < new Date(ora.getTime() - 180 * 864e5)) d = new Date(anno + 1, mese, +m[1], 23, 59, 59);
    if (!ultima || d > ultima) ultima = d;
  }
  return ultima;
}
{
  const GG = +CFG.giorni_conservazione || 14, ora = Date.now();
  for (const n of index.negozi) {
    n.volantini = (n.volantini || []).filter(v => {
      if (!v.salvato) v.salvato = new Date().toISOString();       // volantini vecchi senza data: parte ora il conto
      const sc = scadenza(v.validita);
      const scaduto = sc ? sc.getTime() < ora : (ora - Date.parse(v.salvato)) > GG * 864e5;
      if (scaduto) {
        L("Volantino scaduto, lo elimino:", n.nome, v.id, v.validita || "(senza data, salvato " + v.salvato.slice(0, 10) + ")");
        try { fs.rmSync(path.join(OUT, slug(n.nome), String(v.id)), { recursive: true, force: true }) } catch {}
      }
      return !scaduto;
    });
  }
  for (const n of index.negozi.filter(x => !x.volantini.length)) try { fs.rmdirSync(path.join(OUT, slug(n.nome))) } catch {}   // solo se vuota (può servire ad altre città)
  index.negozi = index.negozi.filter(x => x.volantini.length);
}
index.aggiornato = new Date().toISOString();
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index, null, 1));
fs.writeFileSync(path.join(OUT, "_debug.txt"), log.join("\n") + "\n");
console.log("Fatto: " + index.negozi.map(n => n.nome + " " + n.volantini.reduce((a, v) => a + v.pagine.length, 0) + " pagine").join(" | "));
