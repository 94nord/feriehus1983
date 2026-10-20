import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ADMIN_URL, ROD } from './stack';

type Data = Record<string, unknown>;

export const SENESTE_NYHED = {
  titel: 'Generalforsamling og nyt om vejene',
  slug: 'generalforsamling-og-nyt-om-vejene',
  alt: 'Havet ved feriehusene en stille morgen',
};
export const ANTAL_TESTNYHEDER = 24;
export const LINKS = [
  { titel: 'Kommunen', url: 'https://example.com/kommune' },
  { titel: 'Forsyning', url: 'https://example.com/forsyning' },
  { titel: 'Vedtægter', url: 'https://example.com/vedtaegter' },
];
export const SIDER = [
  { titel: 'Om foreningen', slug: 'om-foreningen' },
  { titel: 'Ordensregler', slug: 'ordensregler' },
];

const tekst = (t: string) => [{ type: 'paragraph', children: [{ type: 'text', text: t }] }];

export async function seed(token: string) {
  const headers = { Authorization: `Bearer ${token}` };

  async function opret(sti: string, data: Data) {
    const res = await fetch(`${ADMIN_URL}${sti}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) throw new Error(`POST ${sti}: ${res.status} ${await res.text()}`);
  }

  // Strapis REST API publicerer som standard; kladder kræver ?status=draft
  const nyhed = (data: Data) => opret('/api/nyheder', data);
  const kladde = (sti: string, data: Data) => opret(`${sti}?status=draft`, data);

  const form = new FormData();
  const fil = readFileSync(path.join(ROD, 'tests/fixtures/billede.jpg'));
  form.append('files', new Blob([fil], { type: 'image/jpeg' }), 'havet.jpg');
  form.append('fileInfo', JSON.stringify({ alternativeText: SENESTE_NYHED.alt }));
  const upload = await fetch(`${ADMIN_URL}/api/upload`, { method: 'POST', headers, body: form });
  if (!upload.ok) throw new Error(`upload: ${upload.status} ${await upload.text()}`);
  const [billede] = (await upload.json()) as { id: number }[];

  for (let i = 1; i <= ANTAL_TESTNYHEDER; i++) {
    await nyhed({
      titel: `Testnyhed nummer ${i}`,
      slug: `testnyhed-${i}`,
      uddrag: `Kort uddrag af testnyhed ${i}.`,
      indhold: tekst(`Brødtekst for testnyhed ${i}.`),
    });
  }

  await nyhed({
    titel: SENESTE_NYHED.titel,
    slug: SENESTE_NYHED.slug,
    uddrag: 'Indkaldelse til generalforsamling og status på vejarbejdet.',
    billede: billede.id,
    indhold: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Der indkaldes til ' },
          { type: 'text', text: 'ordinær generalforsamling', bold: true },
          { type: 'text', text: '. Se mere hos ' },
          { type: 'link', url: 'https://example.com/kommune', children: [{ type: 'text', text: 'kommunen' }] },
          { type: 'text', text: '.' },
        ],
      },
      { type: 'heading', level: 2, children: [{ type: 'text', text: 'Dagsorden' }] },
      {
        type: 'list',
        format: 'ordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Valg af dirigent' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Beretning <script>window.__xss = 1</script>' }] },
        ],
      },
    ],
  });

  await kladde('/api/nyheder', { titel: 'Kladde', slug: 'kladde', uddrag: 'Kladde', indhold: tekst('Kladde') });

  for (const [i, link] of LINKS.entries()) {
    await opret('/api/links', { ...link, sortering: i });
  }

  // Oprettes i omvendt rækkefølge for at teste, at sortering bestemmer listen
  for (const [i, side] of [...SIDER.entries()].reverse()) {
    await opret('/api/sider', { ...side, sortering: i, indhold: tekst(`Tekst om ${side.titel}.`) });
  }
  await kladde('/api/sider', { titel: 'Kladdeside', slug: 'kladdeside', sortering: 9, indhold: tekst('Kladde') });
}
