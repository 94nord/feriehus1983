# Feriehusforeningen af 1983

Se [README.md](README.md) for opsætning, drift og tests. Frontenden ligger i `web/` (Astro), CMS'et i `cms/` (Strapi).

## Design Context

Læs disse to filer før ethvert arbejde på frontenden:

- [PRODUCT.md](PRODUCT.md): hvem siden er til, formål, personlighed og hvad den ikke må ligne.
- [DESIGN.md](DESIGN.md): farver, typografi, komponenter og regler. Tokens i frontmatter er normative.

Kort fortalt:

- Indholdsside for ansatte, der kan booke foreningens feriehus. Alle aldre, meget spredt.
- Personlighed: ordentlig, rolig, imødekommende. Konservativt og tidløst, ikke trendy.
- Ikke som en bookingportal/Airbnb, ikke som en moderne startup/SaaS-side.
- Hvid side med to farver: petrol (sidehoved, sidefod, links) og marehalm som lille accent (aktiv nyhed, beskeder). Ingen tredje farve, og marehalm aldrig som sidebaggrund. Atkinson Hyperlegible Next, ingen skygger, kun bløde overgange ved hover og fokus.
- WCAG 2.2 AA. Grundtekst mindst 16px på alle skærme.
- Logoet er endnu en placeholder; det rigtige kommer som `web/public/logo.svg`.
- Al kode er på engelsk (variabler, funktioner, filer, CSS-klasser og -tokens, Strapi-modeller og -felter). Tekst, som besøgende og bestyrelsen ser, og URL'erne er på dansk.
- CSS-tokens ligger i `web/src/styles/tokens.css` og bruger engelske navne (`--color-*`, `--space-*`, `--text-*`). Følg den konvention.
