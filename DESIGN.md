---
name: Feriehusforeningen af 1983
description: Rolig, ordentlig nyheds- og informationsside for foreningens feriehus. Hvid side i en petrol-ramme med marehalm som accent.
colors:
  petrol: "oklch(0.387 0.052 218)"
  petrol-deep: "oklch(0.31 0.05 218)"
  marehalm: "oklch(0.938 0.021 86)"
  marehalm-dark: "oklch(0.86 0.03 85)"
  paper: "oklch(1 0 0)"
  border: "oklch(0.84 0.03 85)"
  text: "oklch(0.23 0.02 220)"
  muted: "oklch(0.45 0.025 220)"
typography:
  title:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.5rem + 2vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  subheading:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  list-title:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  meta:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  nav:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  small: "4px"
  medium: "8px"
spacing:
  xs: "0.25rem"
  s: "0.5rem"
  m: "1rem"
  l: "2rem"
  xl: "3.5rem"
components:
  logo-placeholder:
    borderColor: "{colors.marehalm-dark}"
    rounded: "{rounded.small}"
    size: "2.5rem"
  nav-link:
    textColor: "{colors.marehalm}"
    typography: "{typography.nav}"
    padding: "0.5rem 0"
  nav-link-active:
    textColor: "{colors.paper}"
  text-link:
    textColor: "{colors.petrol}"
  text-link-hover:
    textColor: "{colors.petrol-deep}"
  news-list-item:
    typography: "{typography.list-title}"
    padding: "0.75rem 0.75rem"
    rounded: "{rounded.small}"
  news-list-item-active:
    backgroundColor: "{colors.marehalm}"
    textColor: "{colors.petrol}"
  notice:
    backgroundColor: "{colors.marehalm}"
    textColor: "{colors.text}"
    rounded: "{rounded.medium}"
    padding: "1rem 1.25rem"
  site-header:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.paper}"
  skip-link:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.paper}"
    rounded: "{rounded.small}"
    padding: "0.5rem 1rem"
  site-footer:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.marehalm-dark}"
    typography: "{typography.meta}"
    padding: "0.5rem 0"
---

# Design System: Feriehusforeningen af 1983

## 1. Overview

**Creative North Star: "Havet om huset."**

Det dybe, grønblå hav og den lyse marehalm i klitterne. Siden er hvid og rolig, og havets petrol rammer den ind som et bånd i top og bund. Marehalm dukker kun op som en stille accent: den nyhed, man læser, og beskeder. To farver og hvidt, intet andet.

Siden er en opslagstavle for en forening, ikke et magasin og ikke en bookingportal. Typografien bærer alt: én meget letlæselig skrift i få vægte, generøs brødtekst og tydeligt hierarki gennem størrelse og vægt. Layoutet er et fast, forudsigeligt to-kolonne-system: nyhedslisten i siden, indholdet i midten. Det ændrer sig ikke fra side til side, så læseren altid ved, hvor de er.

Designet er bevidst konservativt. Konservativt betyder gennemarbejdet og tidløst: præcis afstand, ordentlige linjelængder, rigtige tomme tilstande. Det betyder ikke gråt eller gammeldags.

**Layout og responsivitet.**
- Indholdsbredde maks. 72rem, sidemargin 1rem på mobil (`--space-m`).
- To kolonner over 768px: nyhedsliste (20rem) til venstre, indhold til højre. Siden selv ruller ikke; indholdskolonnen og selve listen med nyheder ruller hver for sig, mens "Nyheder"-overskriften og bladringen står fast. Under 768px ruller siden normalt: indhold først, nyhedslisten under, sidefoden til sidst.
- Brødtekst holdes på maks. 68ch linjelængde, også når kolonnen er bredere.
- Lodret rytme: tæt inden for en gruppe (`s`), luft mellem grupper (`l`), stor luft mellem sidens hovedområder (`xl`).

**Bevægelse.** Kun tilstandsskift: farve og baggrund på hover og fokus, 150ms med ease-out-quart (`cubic-bezier(0.25, 1, 0.5, 1)`). Ingen indgangsanimationer, ingen scroll-effekter. Under `prefers-reduced-motion: reduce` er overgangene øjeblikkelige.

**Billeder.** Billeder kommer fra bestyrelsen via CMS'et og er indholdets egne. Der tilføjes aldrig dekorative stockfotos eller illustrationer. Billeder vises i kolonnens fulde bredde med lille afrunding og bevarer deres eget format (ingen tvungen beskæring).

## 2. Colors: Hav og marehalm

Strategi: **to farver på hvidt**. Siden er hvid, petrol er rammen og det, man kan klikke på, og marehalm er en lille accent.

### Primær
- **Petrol** (`petrol`): sidehoved og sidefod som fulde bånd, links i tekst, fokusring, "Spring til indhold", markering af tekst og titlen på den nyhed, man læser. 9.5:1 mod hvid, 8:1 mod marehalm.
- **Dyb petrol** (`petrol-deep`): hover på links.

### Flader
- **Marehalm** (`marehalm`): baggrund for den aktive nyhed i listen og for beskedbokse. Tekst i hovedmenuen på petrol (8:1). Aldrig som baggrund for hele siden.
- **Mørk marehalm** (`marehalm-dark`): tekst i sidefoden og kanten om logo-pladsen på petrol (6.2:1).
- **Hvid** (`paper`): sidens baggrund.

### Neutral
- **Kant** (`border`): 1px om arket og mellem elementer i lister. Kun dekorativ; bærer aldrig information alene.
- **Tekst** (`text`): al brødtekst og overskrifter. 16.9:1 mod hvid, 14:1 mod marehalm.
- **Dæmpet** (`muted`): datoer, uddrag, "Side 2 af 5". 7.4:1 mod hvid, 6.1:1 mod marehalm.

**To-farve-reglen.** Der bruges kun petrol og marehalm på hvidt. Ingen tredje farve. Petrol som flade findes kun i sidehoved, sidefod og "Spring til indhold".

**Ingen farve uden ord.** Farve er aldrig det eneste tegn på en tilstand. Aktivt menupunkt har også understregning; aktiv nyhed har også en baggrundsflade; links i tekst er altid understreget.

## 3. Typography

**Skrift:** Atkinson Hyperlegible Next (Braille Institute), hentet fra Google Fonts eller selvhostet, med `system-ui, sans-serif` som fallback. Valgt fordi bogstavformerne er tegnet til at være umulige at forveksle (I/l/1, O/0), også for læsere med nedsat syn, og fordi den har fuld understøttelse af æ, ø og å. Den passer til en forening, hvor læserne har alle aldre: ordentlig, venlig og uden manerer.

**Karakter.** Én familie, hierarki gennem størrelse og vægt. Overskrifter i 700, brødtekst i 400, navigation i 500, listetitler i 600. Ingen kursiv-overskrifter, ingen versaler ud over almindelige forbogstaver.

### Hierarki
- **Titel** (700, `clamp(2rem, 1.5rem + 2vw, 2.75rem)`, 1.15): sidens h1, nyhedens titel. Én pr. side. `text-wrap: balance`.
- **Overskrift** (700, 1.625rem, 1.25): h2, inkl. "Nyheder" over nyhedslisten. `text-wrap: balance`.
- **Underoverskrift** (700, 1.3125rem, 1.3): h3 og dybere i artikler.
- **Brødtekst** (400, 1.125rem, 1.6): al løbende tekst. Maks. 68ch. `text-wrap: pretty`.
- **Listetitel** (600, 1.0625rem, 1.35): titler i nyhedslisten og på linksiden.
- **Metadata** (400, 0.9375rem, 1.45, farve `muted`): datoer, uddrag, sidetal, sidefod.
- **Navigation** (500, 1.0625rem): hovedmenuen.

**Seksten-pixel-gulvet.** Rodstørrelsen er 16px på alle skærme og bliver aldrig mindre. Ingen tekst går under 0.9375rem (15px). Små skærme får mindre luft, ikke mindre tekst.

## 4. Elevation

Siden er flad. Der er ingen skygger nogen steder. Lag og grupper skabes med 1px `border`-linjer, `marehalm`-accenter og luft.

**Ingen-skygge-reglen.** Hvis et element har brug for en skygge for at skille sig ud, er det layoutet, der er galt. Løs det med afstand eller en skillelinje.

## 5. Components

### Sidehoved
Fuldt `petrol`-bånd med foreningens navn i `paper`. Indhold: logo + foreningens navn til venstre, hovedmenu til højre. På smalle skærme brydes menuen under logoet; den skjules aldrig bag en burgermenu (der er kun tre punkter).

### Logo (placeholder)
Det rigtige logo er ikke leveret endnu. Indtil da vises en neutral placeholder: en tom firkant på 2.5rem med 1px `marehalm-dark`-ramme på petrol og afrundede hjørner (`small`). Den er bevidst anonym, så den ikke forveksles med et færdigt logo. Ved siden af står foreningens navn i 700-vægt, `paper`-farve, 1.125rem. Hele gruppen er ét link til forsiden.

Når logoet kommer, erstattes placeholderen af `/public/logo.svg` i samme højde (2.5rem). Navnet står stadig ved siden af logoet; logoet står aldrig alene uden tekst. Faviconet skiftes samtidig.

### Hovedmenu
Tekstlinks i `marehalm` på petrol, navigationstypografi, 2rem mellemrum. Hover: `paper` og understregning (2px, 0.3em offset). Aktiv side (`aria-current="page"`): `paper` og permanent 2px understregning, samme vægt som de andre punkter, så menuen ikke flytter sig. Klikfladen er mindst 44px høj.

### Tekstlinks
`petrol`, altid understreget (1px, 0.2em offset, `text-decoration-skip-ink: auto`). Hover: `petrol-deep` og 2px understregning. Besøgte links skifter ikke farve.

### Fokus
Alle interaktive elementer: 2px `petrol`-outline med 2px offset, kun ved `:focus-visible`; i sidehovedet `marehalm`. Den fjernes aldrig.

### Spring til indhold
Skjult, indtil den får fokus. Vises derefter øverst til venstre som en udfyldt `petrol`-pille med hvid tekst.

### Nyhedsliste (sidekolonne)
Overskriften "Nyheder" i overskrift-typografi. Hver nyhed er ét link over hele elementet: titel (listetitel), dato og uddrag (metadata, `muted`) stablet lodret med 0.25rem mellemrum. Elementerne adskilles af 1px `border`-linjer, ikke kort. Hover: titlen bliver understreget. Aktiv nyhed: `marehalm`-baggrund med lille afrunding og titel i `petrol`, samme vægt som de andre titler, så teksten ikke brydes om ved klik.

### Bladring
Under nyhedslisten: "← Forrige" til venstre, "Side 2 af 5" i midten (metadata, `muted`), "Næste →" til højre. Mangler et link, holdes pladsen, så sidetallet ikke flytter sig.

### Artikel
Titel øverst, dato lige under i metadata-typografi, derefter billede og brødtekst. Hovedbilledet fylder kolonnens bredde. Billeder i brødteksten er mindre: højst 32rem brede og 26rem høje, i deres eget format. Alle med `small` afrunding og 2rem luft over og under. Editoren har ingen størrelse pr. billede. Citater og kodeblokke kan ikke vælges i editoren; findes de i ældre indhold, vises citater (`blockquote`) indrykket 1.5rem, sættes i underoverskrift-størrelse med 400-vægt og et stort „ i `petrol` foran. Ingen farvet kant i siden. Lister bruger almindelige punkter og tal med 0.5rem mellem punkterne.

### Link- og sidelister
Linksiden og informationssiden: hvert punkt adskilt af en 1px `border`-linje, titel som listetitel-link i `petrol`, beskrivelse under i brødtekst-farve. Ingen ikoner, ingen kort.

### Beskeder (tomme tilstande og fejl)
"Der er ingen nyheder endnu", "Siden kunne ikke hente indhold lige nu" og lignende: `marehalm`-baggrund, 1px `border`-ramme hele vejen rundt, `medium` afrunding, brødtekst. Rolig og ikke alarmerende; der bruges ikke rødt.

### Sidefod
Fuldt, lavt `petrol`-bånd i hele sidens bredde nederst (0.5rem luft). På computer står det fast nederst, da siden selv ikke ruller. Foreningens navn og evt. kontaktoplysninger i metadata-typografi, `marehalm-dark`.

## 6. Do's and Don'ts

### Do
- **Gør** brødteksten stor (1.125rem) og luftig (1.6), og hold linjerne under 68ch.
- **Gør** hierarkiet tydeligt med størrelse og vægt, før du overhovedet tænker på farve.
- **Gør** links tydelige: petrol og understreget, altid.
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
- **Ikke** en tredje farve, og ikke marehalm som baggrund for hele siden. Petrol, marehalm og hvidt er hele paletten.
- **Ikke** dekorative stockfotos eller illustrationer. Billeder er bestyrelsens indhold, intet andet.
- **Ikke** en burgermenu. Tre menupunkter kan altid ses.
