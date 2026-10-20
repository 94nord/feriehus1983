---
name: Feriehusforeningen af 1983
description: Rolig, ordentlig nyheds- og informationsside for foreningens feriehus. Klitrose på hvidt.
colors:
  klitrose: "oklch(0.47 0.155 345)"
  klitrose-dyb: "oklch(0.38 0.13 345)"
  klitrose-lys: "oklch(0.955 0.025 345)"
  hvid: "oklch(1 0 0)"
  flade: "oklch(0.972 0.008 338)"
  kant: "oklch(0.885 0.012 338)"
  tekst: "oklch(0.235 0.018 338)"
  daempet: "oklch(0.47 0.02 338)"
typography:
  titel:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.5rem + 2vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  overskrift:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  underoverskrift:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  broedtekst:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  liste-titel:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  metadata:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  navigation:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  lille: "4px"
  mellem: "8px"
spacing:
  xs: "0.25rem"
  s: "0.5rem"
  m: "1rem"
  l: "2rem"
  xl: "3.5rem"
components:
  logo-placeholder:
    backgroundColor: "{colors.flade}"
    rounded: "{rounded.lille}"
    size: "2.5rem"
  hovedmenu-link:
    textColor: "{colors.tekst}"
    typography: "{typography.navigation}"
    padding: "0.5rem 0"
  hovedmenu-link-aktiv:
    textColor: "{colors.klitrose}"
  tekst-link:
    textColor: "{colors.klitrose}"
  tekst-link-hover:
    textColor: "{colors.klitrose-dyb}"
  nyhedsliste-element:
    typography: "{typography.liste-titel}"
    padding: "0.75rem 0.75rem"
    rounded: "{rounded.lille}"
  nyhedsliste-element-aktiv:
    backgroundColor: "{colors.klitrose-lys}"
    textColor: "{colors.klitrose-dyb}"
  besked:
    backgroundColor: "{colors.flade}"
    textColor: "{colors.tekst}"
    rounded: "{rounded.mellem}"
    padding: "1rem 1.25rem"
  spring-over:
    backgroundColor: "{colors.klitrose}"
    textColor: "{colors.hvid}"
    rounded: "{rounded.lille}"
    padding: "0.5rem 1rem"
  sidefod:
    backgroundColor: "{colors.flade}"
    textColor: "{colors.daempet}"
    typography: "{typography.metadata}"
    padding: "2rem 0"
---

# Design System: Feriehusforeningen af 1983

## 1. Overview

**Creative North Star: "Klitrosen ved huset."**

Den dybrøde hybenrose, der står i klitterne ved næsten alle danske sommerhuse. Den er genkendelig og lidt kraftig, men den gror stille i kanten af billedet. Det er rollen for farven her: siden er hvid, ren og rolig, og klitrosen dukker kun op, hvor der skal ske noget (links, den side man står på, fokus, en tynd streg i toppen).

Siden er en opslagstavle for en forening, ikke et magasin og ikke en bookingportal. Typografien bærer alt: én meget letlæselig skrift i få vægte, generøs brødtekst og tydeligt hierarki gennem størrelse og vægt. Layoutet er et fast, forudsigeligt to-kolonne-system: nyhedslisten i siden, indholdet i midten. Det ændrer sig ikke fra side til side, så læseren altid ved, hvor de er.

Designet er bevidst konservativt. Konservativt betyder gennemarbejdet og tidløst: præcis afstand, ordentlige linjelængder, rigtige tomme tilstande. Det betyder ikke gråt eller gammeldags.

**Layout og responsivitet.**
- Indholdsbredde maks. 72rem, sidemargin 1rem på mobil (`--afstand-m`).
- To kolonner over 768px: nyhedsliste (20rem) til venstre, indhold til højre, 2rem mellemrum. Under 768px: indhold først, nyhedslisten under.
- Brødtekst holdes på maks. 68ch linjelængde, også når kolonnen er bredere.
- Lodret rytme: tæt inden for en gruppe (`s`), luft mellem grupper (`l`), stor luft mellem sidens hovedområder (`xl`).

**Bevægelse.** Kun tilstandsskift: farve og baggrund på hover og fokus, 150ms med ease-out-quart (`cubic-bezier(0.25, 1, 0.5, 1)`). Ingen indgangsanimationer, ingen scroll-effekter. Under `prefers-reduced-motion: reduce` er overgangene øjeblikkelige.

**Billeder.** Billeder kommer fra bestyrelsen via CMS'et og er indholdets egne. Der tilføjes aldrig dekorative stockfotos eller illustrationer. Billeder vises i kolonnens fulde bredde med lille afrunding og bevarer deres eget format (ingen tvungen beskæring).

## 2. Colors: Klitrose-paletten

Strategi: **afdæmpet**. Hvid flade, næsten sort tekst med et strejf af klitrosens farvetone, og én kraftig farve, der bruges på højst 10 % af fladen.

### Primary
- **Klitrose** (`klitrose`): links i tekst, aktivt menupunkt, fokusring, "Spring til indhold" og den 4px streg øverst på siden. Kontrast 7.5:1 mod hvid.
- **Dyb klitrose** (`klitrose-dyb`): hover på links og tekst på den lyse klitrose-baggrund (aktiv nyhed i listen).
- **Lys klitrose** (`klitrose-lys`): baggrund for den nyhed, man læser lige nu, i nyhedslisten. Det eneste sted, farven bruges som flade.

### Neutral
- **Hvid** (`hvid`): sidens baggrund. Ren hvid, ingen varm tone.
- **Flade** (`flade`): sidefod og beskedbokse. Næsten hvid med et svagt rosa skær.
- **Kant** (`kant`): 1px skillelinjer mellem listeelementer, under sidehovedet og om beskedbokse. Kun dekorativt; bærer aldrig information alene.
- **Tekst** (`tekst`): al brødtekst og overskrifter. 16.8:1 mod hvid.
- **Dæmpet** (`daempet`): datoer, uddrag i nyhedslisten, sidefod, "Side 2 af 5". 6.9:1 mod hvid, så det kan bruges til tekst i alle størrelser.

**Ti-procent-reglen.** Klitrose dækker aldrig mere end en tiendedel af en skærm. Ingen klitrose-knapper, -bjælker eller -baggrunde ud over dem, der er nævnt ovenfor. Hvis farven begynder at føles som en kampagne, er der for meget.

**Ingen farve uden ord.** Farve er aldrig det eneste tegn på en tilstand. Aktivt menupunkt har også understregning; aktiv nyhed har også fed titel; links i tekst er altid understreget.

## 3. Typography

**Skrift:** Atkinson Hyperlegible Next (Braille Institute), hentet fra Google Fonts eller selvhostet, med `system-ui, sans-serif` som fallback. Valgt fordi bogstavformerne er tegnet til at være umulige at forveksle (I/l/1, O/0), også for læsere med nedsat syn, og fordi den har fuld understøttelse af æ, ø og å. Den passer til en forening, hvor læserne har alle aldre: ordentlig, venlig og uden manerer.

**Karakter.** Én familie, hierarki gennem størrelse og vægt. Overskrifter i 700, brødtekst i 400, navigation i 500, listetitler i 600. Ingen kursiv-overskrifter, ingen versaler ud over almindelige forbogstaver.

### Hierarki
- **Titel** (700, `clamp(2rem, 1.5rem + 2vw, 2.75rem)`, 1.15): sidens h1, nyhedens titel. Én pr. side. `text-wrap: balance`.
- **Overskrift** (700, 1.625rem, 1.25): h2, inkl. "Nyheder" over nyhedslisten. `text-wrap: balance`.
- **Underoverskrift** (700, 1.3125rem, 1.3): h3 og dybere i artikler.
- **Brødtekst** (400, 1.125rem, 1.6): al løbende tekst. Maks. 68ch. `text-wrap: pretty`.
- **Listetitel** (600, 1.0625rem, 1.35): titler i nyhedslisten og på linksiden.
- **Metadata** (400, 0.9375rem, 1.45, farve `daempet`): datoer, uddrag, sidetal, sidefod.
- **Navigation** (500, 1.0625rem): hovedmenuen.

**Seksten-pixel-gulvet.** Rodstørrelsen er 16px på alle skærme og bliver aldrig mindre. Ingen tekst går under 0.9375rem (15px). Små skærme får mindre luft, ikke mindre tekst.

## 4. Elevation

Siden er flad. Der er ingen skygger nogen steder. Lag og grupper skabes med 1px `kant`-linjer, `flade`-baggrund og luft.

**Ingen-skygge-reglen.** Hvis et element har brug for en skygge for at skille sig ud, er det layoutet, der er galt. Løs det med afstand eller en skillelinje.

## 5. Components

### Sidehoved
Hvid baggrund med en 4px `klitrose`-streg helt øverst (fuld bredde, `border-top`) og en 1px `kant`-linje i bunden. Indhold: logo + foreningens navn til venstre, hovedmenu til højre. På smalle skærme brydes menuen under logoet; den skjules aldrig bag en burgermenu (der er kun tre punkter).

### Logo (placeholder)
Det rigtige logo er ikke leveret endnu. Indtil da vises en neutral placeholder: en firkant på 2.5rem i `flade` med 1px `kant`-ramme og afrundede hjørner (`lille`). Den er bevidst anonym, så den ikke forveksles med et færdigt logo. Ved siden af står foreningens navn i 700-vægt, `tekst`-farve, 1.125rem. Hele gruppen er ét link til forsiden.

Når logoet kommer, erstattes placeholderen af `/public/logo.svg` i samme højde (2.5rem). Navnet står stadig ved siden af logoet; logoet står aldrig alene uden tekst. Faviconet skiftes samtidig.

### Hovedmenu
Tekstlinks i `tekst`-farve, navigationstypografi, 1.5rem mellemrum. Hover: understregning (2px, 0.3em offset). Aktiv side (`aria-current="page"`): `klitrose`-farve plus permanent 2px understregning i `klitrose`. Klikfladen er mindst 44px høj.

### Tekstlinks
`klitrose`, altid understreget (1px, 0.2em offset, `text-decoration-skip-ink: auto`). Hover: `klitrose-dyb` og 2px understregning. Besøgte links skifter ikke farve.

### Fokus
Alle interaktive elementer: 2px `klitrose`-outline med 2px offset, kun ved `:focus-visible`. Den fjernes aldrig.

### Spring til indhold
Skjult, indtil den får fokus. Vises derefter øverst til venstre som en udfyldt `klitrose`-pille med hvid tekst. Det er det eneste sted, klitrose bruges som knapflade.

### Nyhedsliste (sidekolonne)
Overskriften "Nyheder" i overskrift-typografi. Hver nyhed er ét link over hele elementet: titel (listetitel), dato og uddrag (metadata, `daempet`) stablet lodret med 0.25rem mellemrum. Elementerne adskilles af 1px `kant`-linjer, ikke kort. Hover: titlen bliver understreget. Aktiv nyhed: `klitrose-lys`-baggrund med lille afrunding, titel i `klitrose-dyb` og fed.

### Bladring
Under nyhedslisten: "← Forrige" til venstre, "Side 2 af 5" i midten (metadata, `daempet`), "Næste →" til højre. Mangler et link, holdes pladsen, så sidetallet ikke flytter sig.

### Artikel
Titel øverst, dato lige under i metadata-typografi, derefter billede og brødtekst. Billeder fylder kolonnens bredde med `lille` afrunding og 2rem luft over og under. Citater (`blockquote`) indrykkes 1.5rem, sættes i underoverskrift-størrelse med 400-vægt og et stort „ i `klitrose` foran. Ingen farvet kant i siden. Lister bruger almindelige punkter og tal med 0.5rem mellem punkterne.

### Link- og sidelister
Linksiden og informationssiden: hvert punkt adskilt af en 1px `kant`-linje, titel som listetitel-link i `klitrose`, beskrivelse under i brødtekst-farve. Ingen ikoner, ingen kort.

### Beskeder (tomme tilstande og fejl)
"Der er ingen nyheder endnu", "Siden kunne ikke hente indhold lige nu" og lignende: `flade`-baggrund, 1px `kant`-ramme hele vejen rundt, `mellem` afrunding, brødtekst. Rolig og ikke alarmerende; der bruges ikke rødt.

### Sidefod
Fuld bredde, `flade`-baggrund, 1px `kant`-linje i toppen, 2rem luft. Foreningens navn og evt. kontaktoplysninger i metadata-typografi, `daempet`.

## 6. Do's and Don'ts

### Do
- **Gør** brødteksten stor (1.125rem) og luftig (1.6), og hold linjerne under 68ch.
- **Gør** hierarkiet tydeligt med størrelse og vægt, før du overhovedet tænker på farve.
- **Gør** links tydelige: klitrose og understreget, altid.
- **Gør** tomme tilstande og fejl lige så ordentlige som det normale indhold.
- **Gør** layoutet robust over for rigtigt indhold: meget lange titler, nyheder uden billede, ét eller hundrede links.
- **Gør** fokus synligt på alt, der kan klikkes på.

### Don't
- **Ikke** som en **bookingportal / Airbnb**: ingen billedkarruseller, ingen "Book nu"-knapper, ingen prisskilte, ingen salgstone. Feriehuset er et gode for medlemmerne, ikke et produkt.
- **Ikke** som **moderne startup / SaaS**: ingen gradienter, ingen gradient-tekst, ingen glas-effekter, ingen hero-sektion med store tal, ingen scroll-animationer, ingen trendy display-skrift.
- **Ikke** skygger, kort-i-kort eller ens kortgitre med ikon + overskrift + tekst.
- **Ikke** farvede kantstriber i siden af citater, beskeder eller listeelementer.
- **Ikke** små versal-overskrifter med ekstra spatiering ("NYHEDER") over sektionerne.
- **Ikke** mindre tekst på mobil. Rodstørrelsen er 16px overalt.
- **Ikke** klitrose som stor flade. Hvis mere end en tiendedel af skærmen er rosa, så skru ned.
- **Ikke** dekorative stockfotos eller illustrationer. Billeder er bestyrelsens indhold, intet andet.
- **Ikke** en burgermenu. Tre menupunkter kan altid ses.
