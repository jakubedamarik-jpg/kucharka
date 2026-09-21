#!/usr/bin/env node
// Kontrola recepty.js. Bez závislostí. Spusť: node validate.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./recepty.js", import.meta.url), "utf8");
const json = src.slice(src.indexOf("["), src.lastIndexOf("]") + 1);
const recepty = JSON.parse(json);

const VAGUE = [
  "podle chuti", "dle chuti", "dozlatova", "dorůžova", "chvíli", "chvilku",
  "dle potřeby", "podle potřeby", "až bude hotovo", "přiměřeně", "dostatečně",
];
const SEKCE = [
  "Ovoce a zelenina", "Pult s masem", "Pult s uzeninami", "Chlazené",
  "Pečivo", "Pečivo a regál", "Konzervy a trvanlivé", "Mražené",
];

let chyby = 0;
const chyba = (id, msg) => { console.error(`  ✗ ${id}: ${msg}`); chyby++; };
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

const videnaId = new Set();

for (const r of recepty) {
  const id = r.id || "(bez id)";

  for (const k of ["id", "nazev", "kuchyne", "cas_min", "porce", "nakup", "priprava", "postup", "zbytky", "pozor"]) {
    if (!has(r, k)) chyba(id, `chybí pole "${k}"`);
  }

  if (!/^[a-z0-9-]+$/.test(r.id || "")) chyba(id, "id musí být ASCII slug bez diakritiky");
  if (videnaId.has(r.id)) chyba(id, "duplicitní id");
  videnaId.add(r.id);

  if (r.datum && !/^\d{4}-\d{2}-\d{2}$/.test(r.datum)) chyba(id, `datum "${r.datum}" není ISO`);
  if (typeof r.cas_min !== "number" || r.cas_min < 5) chyba(id, "cas_min musí být číslo >= 5");

  // sekce nákupu
  for (const sek of r.nakup || []) {
    if (!SEKCE.includes(sek.sekce)) chyba(id, `neznámá sekce prodejny "${sek.sekce}"`);
    for (const p of sek.polozky || []) {
      if (!p.co || !p.kolik) chyba(id, `položka bez "co" nebo "kolik" v sekci ${sek.sekce}`);
    }
  }

  // postup
  const kroku = (r.postup || []).length;
  if (kroku < 5) chyba(id, `jen ${kroku} kroků v postupu, minimum 5`);
  (r.postup || []).forEach((k, i) => {
    if (!k.kontrola) chyba(id, `krok ${i + 1} nemá "kontrola"`);
    if (k.cas && !/^\d+:\d{2}$/.test(k.cas)) chyba(id, `krok ${i + 1}: čas "${k.cas}" není ve tvaru 0:00`);
    if (!/\d/.test(k.text || "")) chyba(id, `krok ${i + 1} neobsahuje žádné číslo`);
  });

  if ((r.priprava || []).length < 3) chyba(id, "příprava má méně než 3 kroky");
  if ((r.pozor || []).length < 2) chyba(id, "pozor má méně než 2 body");
  if ((r.zbytky || []).length < 1) chyba(id, "chybí sekce zbytky");

  // mlhavé formulace kdekoliv v textu
  const text = JSON.stringify(r).toLowerCase();
  for (const v of VAGUE) {
    if (text.includes(v)) chyba(id, `zakázaná formulace "${v}"`);
  }

  // gramáž k vážení: "naváž 150 g", "150 g mouky" mimo kontext balení
  for (const sek of r.nakup || []) {
    for (const p of sek.polozky || []) {
      const kolik = String(p.kolik);
      const jeBaleni = /(balení|konzerva|sklenice|kelímek|vanička|sáček|svazek|krabička|pytlík)/i.test(kolik);
      if (/\d+\s*g\b/i.test(kolik) && !jeBaleni) {
        chyba(id, `"${p.co}": "${kolik}" vypadá jako gramáž k vážení, ne velikost balení`);
      }
    }
  }
}

console.log(`\n${recepty.length} receptů zkontrolováno.`);
if (chyby) {
  console.error(`${chyby} ${chyby === 1 ? "chyba" : chyby < 5 ? "chyby" : "chyb"}.\n`);
  process.exit(1);
}
console.log("Bez chyb.\n");
