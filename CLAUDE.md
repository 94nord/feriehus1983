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
- Hvid baggrund, klitrose-rød som eneste stærke farve (højst 10 % af skærmen), Atkinson Hyperlegible Next, ingen skygger, kun bløde overgange ved hover og fokus.
- WCAG 2.2 AA. Grundtekst mindst 16px på alle skærme.
- Logoet er endnu en placeholder; det rigtige kommer som `web/public/logo.svg`.
- CSS-tokens ligger i `web/src/styles/tokens.css` og bruger danske navne (`--farve-*`, `--afstand-*`). Følg den konvention.
