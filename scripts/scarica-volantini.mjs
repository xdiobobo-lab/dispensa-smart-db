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

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = await import("playwright");
const br = await chromium.launch();
const ctx = await br.newContext({ userAgent: UA, locale: "it-IT", timezoneId: "Europe/Rome", viewport: { width: 1280, height: 1800 } });
const index = { aggiornato: new Date().toISOString(), negozi: [] };

async function consenso(page) {
  for (const t of [/accetta/i, /accetto/i, /consenti/i, /^ok$/i, /agree/i]) {
    try { const b = page.getByRole("button", { name: t }).first(); if (await b.count()) { await b.click({ timeout: 1500 }); L("  consenso cliccato", t); await sleep(500); return } } catch {}
  }
}
const isFlyerImg = (url, ct) => /^image\//.test(ct || "") && /shopfully|images\/volantini|\/flyer/i.test(url) && !/logo|icon|avatar|sprite|placeholder|favicon/i.test(url);

for (const n of CFG.negozi || []) {
  if (!n.attivo) continue;
  const rec = { nome: n.nome, url: n.url, volantini: [] };
  index.negozi.push(rec);
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
        const pagine = []; let k = 0;
        for (const [u, v] of [...imgs]) {
          try { const rr = await ctx.request.get(u, { headers: { referer: base }, timeout: 30000 }); v.b = rr.ok() ? await rr.body() : null } catch { v.b = null }
          if (!v.b || v.b.length < MINB) imgs.delete(u);
        }
        for (const [u, v] of imgs) { k++; const ext = /png/.test(v.ct) ? "png" : /webp/.test(v.ct) ? "webp" : "jpg"; const fn = "p" + String(k).padStart(2, "0") + "." + ext; fs.writeFileSync(path.join(dir, fn), v.b); pagine.push(slug(n.nome) + "/" + f.id + "/" + fn); if (k <= 3) L("    img", u.slice(0, 140), v.b.length + "B") }
        if (imgs.size < 2) L("  ATTENZIONE: poche immagini catturate (" + imgs.size + "): serve guardare la pagina del volantino");
        const val = (f.testo.match(/(valid[oi]|scad[ea]|dal|fino)[^|]{0,40}/i) || [""])[0];
        rec.volantini.push({ id: f.id, nome: f.testo.slice(0, 80) || ("Volantino " + f.id), url: f.href, validita: val, pagine });
      } catch (e) { L("  errore volantino", f.id, String(e.message).slice(0, 200)) }
      await page.close();
    }
  } catch (e) { L("  errore negozio", n.nome, String(e.message).slice(0, 200)) }
}
await br.close();
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index, null, 1));
fs.writeFileSync(path.join(OUT, "_debug.txt"), log.join("\n") + "\n");
console.log("Fatto: " + index.negozi.map(n => n.nome + " " + n.volantini.reduce((a, v) => a + v.pagine.length, 0) + " pagine").join(" | "));
