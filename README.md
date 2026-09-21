# Úterní kuchařka

Generátor jednoduchých receptů v jednotném formátu, s nákupním seznamem řazeným podle sekcí prodejny. Pro člověka, který chce vařit, ale nechce studovat recepty.

Statický web. Žádný build, žádné závislosti, žádný server.

## Co to řeší

Běžné recepty předpokládají zkušenost, kterou začátečník nemá. „Osolit podle chuti“, „smažit dozlatova“, „chvíli povařit“. Tenhle formát to zakazuje. Každý krok má konkrétní číslo a viditelný znak, podle kterého poznáš, že je hotový.

Druhý problém: vaříš pro jednoho, ale suroviny se prodávají po baleních. Každý recept proto má povinnou sekci **Co zbyde a co s tím**.

## Soubory

| Soubor | K čemu |
|---|---|
| `SYSTEM-PROMPT.md` | **Jádro.** Prompt pro LLM. Vlož do Claude, ChatGPT nebo čehokoliv, vyplň blok PROFIL, dostaneš recept jako JSON. |
| `schema.json` | JSON Schema jednoho receptu. |
| `recepty.js` | Data. `window.RECEPTY = [ … ]`. Nový recept = nový objekt v poli. |
| `index.html` | Prohlížeč. Čte `recepty.js`, vykreslí seznam a detail. |
| `validate.mjs` | Kontrola dat proti schématu a proti zakázaným formulacím. |

## Použití

Otevři `index.html` v prohlížeči. Funguje i přes `file://`, data se načítají skriptem, ne fetchem.

Nový recept:

1. Otevři `SYSTEM-PROMPT.md`, uprav blok PROFIL podle sebe.
2. Vlož celý soubor do LLM, přidej větu typu „Napiš recept, Itálie, s rybou“.
3. Výsledný JSON objekt vlož do pole v `recepty.js`.
4. `node validate.mjs`
5. Commit.

## Co se ukládá

Odškrtaný nákupní seznam, hodnocení a poznámky se ukládají do `localStorage` prohlížeče. Nikam se neposílají. Jiný prohlížeč nebo jiné zařízení je neuvidí.

## GitHub Pages

Repozitář → Settings → Pages → Source: **GitHub Actions**. Workflow v `.github/workflows/pages.yml` publikuje kořen repa při každém pushi do `main`.

## Přizpůsobení

Barvy, typografie a rozměry jsou CSS proměnné na začátku `<style>` v `index.html`. Světlé a tmavé téma se přepíná podle nastavení systému.

Blok PROFIL v `SYSTEM-PROMPT.md` je jediné místo, kde se mění počet porcí, časový limit, obchod, vybavení a zákazy.

## Licence

MIT.
