import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ADMIN_URL, ROOT } from './stack';

type Data = Record<string, unknown>;

// The content is Danish because it is what visitors see
export const LATEST_ARTICLE = {
  title: 'Generalforsamling og nyt om vejene',
  slug: 'generalforsamling-og-nyt-om-vejene',
  alt: 'Havet ved feriehusene en stille morgen',
};
export const PHOTO_IN_BODY = { alt: 'Stort foto med GPS-data' };
export const TEST_ARTICLE_COUNT = 24;
export const LINKS = [
  { title: 'Kommunen', url: 'https://example.com/kommune' },
  { title: 'Forsyning', url: 'https://example.com/forsyning' },
  { title: 'Vedtægter', url: 'https://example.com/vedtaegter' },
];
export const PAGES = [
  { title: 'Om foreningen', slug: 'om-foreningen' },
  { title: 'Ordensregler', slug: 'ordensregler' },
];

const paragraph = (text: string) => [{ type: 'paragraph', children: [{ type: 'text', text }] }];

export async function seed(token: string) {
  const headers = { Authorization: `Bearer ${token}` };

  async function create(path: string, data: Data) {
    const res = await fetch(`${ADMIN_URL}${path}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) throw new Error(`POST ${path}: ${res.status} ${await res.text()}`);
  }

  // Strapi's REST API publishes by default; drafts need ?status=draft
  const article = (data: Data) => create('/api/articles', data);
  const draft = (path: string, data: Data) => create(`${path}?status=draft`, data);

  async function upload(fileName: string, name: string, alt: string) {
    const form = new FormData();
    const file = readFileSync(path.join(ROOT, 'tests/fixtures', fileName));
    form.append('files', new Blob([file], { type: 'image/jpeg' }), name);
    form.append('fileInfo', JSON.stringify({ alternativeText: alt }));
    const res = await fetch(`${ADMIN_URL}/api/upload`, { method: 'POST', headers, body: form });
    if (!res.ok) throw new Error(`upload ${fileName}: ${res.status} ${await res.text()}`);
    const [uploaded] = (await res.json()) as Data[];
    return uploaded;
  }

  const image = await upload('image.jpg', 'havet.jpg', LATEST_ARTICLE.alt);
  // 3200x1800 with EXIF and GPS; must be scaled down and cleaned on upload
  const photo = await upload('large-photo-with-gps.jpg', 'foto.jpg', PHOTO_IN_BODY.alt);

  for (let i = 1; i <= TEST_ARTICLE_COUNT; i++) {
    await article({
      title: `Testnyhed nummer ${i}`,
      slug: `testnyhed-${i}`,
      excerpt: `Kort uddrag af testnyhed ${i}.`,
      body: paragraph(`Brødtekst for testnyhed ${i}.`),
    });
  }

  await article({
    title: LATEST_ARTICLE.title,
    slug: LATEST_ARTICLE.slug,
    excerpt: 'Indkaldelse til generalforsamling og status på vejarbejdet.',
    image: image.id as number,
    body: [
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
      { type: 'image', image: photo, children: [{ type: 'text', text: '' }] },
    ],
  });

  await draft('/api/articles', { title: 'Kladde', slug: 'kladde', excerpt: 'Kladde', body: paragraph('Kladde') });

  for (const [i, link] of LINKS.entries()) {
    await create('/api/links', { ...link, sortOrder: i });
  }

  // Created in reverse order to test that sortOrder decides the list
  for (const [i, page] of [...PAGES.entries()].reverse()) {
    await create('/api/pages', { ...page, sortOrder: i, body: paragraph(`Tekst om ${page.title}.`) });
  }
  await draft('/api/pages', { title: 'Kladdeside', slug: 'kladdeside', sortOrder: 9, body: paragraph('Kladde') });
}
