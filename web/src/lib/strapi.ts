import { MEDIA_URL, STRAPI_CACHE_SECONDS, STRAPI_TOKEN, STRAPI_URL } from 'astro:env/server';

export const NYHEDER_PR_SIDE = 10;
const CACHE_MS = STRAPI_CACHE_SECONDS * 1000;

export interface BilledeFormat {
  url: string;
  width: number;
  height: number;
}

export interface Billede {
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats: Record<string, BilledeFormat> | null;
}

export interface Nyhed {
  documentId: string;
  titel: string;
  slug: string;
  uddrag: string;
  indhold?: Block[];
  billede: Billede | null;
  publishedAt: string;
}

export interface Link {
  documentId: string;
  titel: string;
  url: string;
  beskrivelse: string | null;
}

export interface Side {
  documentId: string;
  titel: string;
  slug: string;
  indhold?: Block[];
}

export interface TekstNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface LinkNode {
  type: 'link';
  url: string;
  children: TekstNode[];
}

export type InlineNode = TekstNode | LinkNode;

export type Block =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: 'quote'; children: InlineNode[] }
  | { type: 'code'; children: TekstNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: ListeElement[] }
  | { type: 'image'; image: Billede };

export type ListeElement =
  | { type: 'list-item'; children: InlineNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: ListeElement[] };

interface Svar<T> {
  data: T;
  meta: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}

const cache = new Map<string, { udloeber: number; data: unknown }>();

async function hent<T>(sti: string, { brugCache = true } = {}): Promise<Svar<T>> {
  const gemt = brugCache ? cache.get(sti) : undefined;
  if (gemt && gemt.udloeber > Date.now()) return gemt.data as Svar<T>;

  const res = await fetch(`${STRAPI_URL}${sti}`, {
    headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
  });
  if (!res.ok) throw new Error(`Strapi svarede ${res.status} på ${sti}`);

  const data = (await res.json()) as Svar<T>;
  if (brugCache) cache.set(sti, { udloeber: Date.now() + CACHE_MS, data });
  return data;
}

export async function hentNyheder(side: number) {
  const params = new URLSearchParams({
    sort: 'publishedAt:desc',
    'pagination[page]': String(side),
    'pagination[pageSize]': String(NYHEDER_PR_SIDE),
    'fields[0]': 'titel',
    'fields[1]': 'slug',
    'fields[2]': 'uddrag',
    'fields[3]': 'publishedAt',
  });
  const svar = await hent<Nyhed[]>(`/api/nyheder?${params}`);
  return {
    nyheder: svar.data,
    antalSider: svar.meta.pagination?.pageCount ?? 1,
  };
}

export async function hentNyhed(slug: string) {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    populate: 'billede',
  });
  const svar = await hent<Nyhed[]>(`/api/nyheder?${params}`);
  return svar.data[0] ?? null;
}

export async function hentSenesteNyhed() {
  const params = new URLSearchParams({
    sort: 'publishedAt:desc',
    'pagination[pageSize]': '1',
    populate: 'billede',
  });
  const svar = await hent<Nyhed[]>(`/api/nyheder?${params}`);
  return svar.data[0] ?? null;
}

export async function hentLinks() {
  const params = new URLSearchParams({
    sort: 'sortering:asc',
    'pagination[pageSize]': '100',
  });
  const svar = await hent<Link[]>(`/api/links?${params}`);
  return svar.data;
}

export async function hentSider() {
  const params = new URLSearchParams({
    sort: 'sortering:asc',
    'pagination[pageSize]': '100',
    'fields[0]': 'titel',
    'fields[1]': 'slug',
  });
  const svar = await hent<Side[]>(`/api/sider?${params}`);
  return svar.data;
}

export async function hentSide(slug: string) {
  const params = new URLSearchParams({ 'filters[slug][$eq]': slug });
  const svar = await hent<Side[]>(`/api/sider?${params}`);
  return svar.data[0] ?? null;
}

export type PreviewType = 'nyhed' | 'side';

// Forhåndsvisning: henter en nyhed eller side (også kladder) direkte, uden cache
export async function hentTilPreview(type: PreviewType, documentId: string, status: 'draft' | 'published') {
  const sti = type === 'nyhed' ? 'nyheder' : 'sider';
  const params = new URLSearchParams({ status });
  if (type === 'nyhed') params.set('populate', 'billede');
  try {
    const svar = await hent<Nyhed | Side>(`/api/${sti}/${encodeURIComponent(documentId)}?${params}`, { brugCache: false });
    return svar.data;
  } catch (e) {
    if (e instanceof Error && e.message.includes('svarede 404')) return null;
    throw e;
  }
}

export function medieUrl(url: string) {
  return url.startsWith('http') ? url : `${MEDIA_URL}${url}`;
}

// Strapis genererede størrelser; originalen sendes kun, hvis der ikke er nogen
function billedeStoerrelser(billede: Billede): BilledeFormat[] {
  const formater = Object.values(billede.formats ?? {});
  return (formater.length > 0 ? formater : [billede]).sort((a, b) => a.width - b.width);
}

export function billedeSrc(billede: Billede) {
  return medieUrl(billedeStoerrelser(billede).at(-1)!.url);
}

export function billedeSrcset(billede: Billede) {
  return billedeStoerrelser(billede)
    .map((f) => `${medieUrl(f.url)} ${f.width}w`)
    .join(', ');
}

const datoFormat = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });

export function formaterDato(iso: string) {
  return datoFormat.format(new Date(iso));
}
