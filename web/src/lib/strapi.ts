import { MEDIA_URL, STRAPI_CACHE_SECONDS, STRAPI_TOKEN, STRAPI_URL } from 'astro:env/server';

export const ARTICLES_PER_PAGE = 10;
const CACHE_MS = STRAPI_CACHE_SECONDS * 1000;

export interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface Image {
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats: Record<string, ImageFormat> | null;
}

export interface Article {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body?: Block[];
  image: Image | null;
  publishedAt: string;
}

export interface Link {
  documentId: string;
  title: string;
  url: string;
  description: string | null;
}

export interface Page {
  documentId: string;
  title: string;
  slug: string;
  body?: Block[];
}

export interface TextNode {
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
  children: TextNode[];
}

export type InlineNode = TextNode | LinkNode;

export type Block =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: 'quote'; children: InlineNode[] }
  | { type: 'code'; children: TextNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: ListElement[] }
  | { type: 'image'; image: Image };

export type ListElement =
  | { type: 'list-item'; children: InlineNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: ListElement[] };

interface Response<T> {
  data: T;
  meta: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}

const cache = new Map<string, { expires: number; data: unknown }>();

async function request<T>(path: string, { useCache = true } = {}): Promise<Response<T>> {
  const cached = useCache ? cache.get(path) : undefined;
  if (cached && cached.expires > Date.now()) return cached.data as Response<T>;

  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
  });
  if (!res.ok) throw new Error(`Strapi responded ${res.status} for ${path}`);

  const data = (await res.json()) as Response<T>;
  if (useCache) cache.set(path, { expires: Date.now() + CACHE_MS, data });
  return data;
}

export async function getArticles(page: number) {
  const params = new URLSearchParams({
    sort: 'publishedAt:desc',
    'pagination[page]': String(page),
    'pagination[pageSize]': String(ARTICLES_PER_PAGE),
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'excerpt',
    'fields[3]': 'publishedAt',
  });
  const res = await request<Article[]>(`/api/articles?${params}`);
  return {
    articles: res.data,
    pageCount: res.meta.pagination?.pageCount ?? 1,
  };
}

export async function getArticle(slug: string) {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    populate: 'image',
  });
  const res = await request<Article[]>(`/api/articles?${params}`);
  return res.data[0] ?? null;
}

export async function getLatestArticle() {
  const params = new URLSearchParams({
    sort: 'publishedAt:desc',
    'pagination[pageSize]': '1',
    populate: 'image',
  });
  const res = await request<Article[]>(`/api/articles?${params}`);
  return res.data[0] ?? null;
}

export async function getLinks() {
  const params = new URLSearchParams({
    sort: 'sortOrder:asc',
    'pagination[pageSize]': '100',
  });
  const res = await request<Link[]>(`/api/links?${params}`);
  return res.data;
}

export async function getPages() {
  const params = new URLSearchParams({
    sort: 'sortOrder:asc',
    'pagination[pageSize]': '100',
    'fields[0]': 'title',
    'fields[1]': 'slug',
  });
  const res = await request<Page[]>(`/api/pages?${params}`);
  return res.data;
}

export async function getPage(slug: string) {
  const params = new URLSearchParams({ 'filters[slug][$eq]': slug });
  const res = await request<Page[]>(`/api/pages?${params}`);
  return res.data[0] ?? null;
}

export type PreviewType = 'article' | 'page';

// Preview: fetches an article or page (drafts included) directly, without cache
export async function getPreview(type: PreviewType, documentId: string, status: 'draft' | 'published') {
  const collection = type === 'article' ? 'articles' : 'pages';
  const params = new URLSearchParams({ status });
  if (type === 'article') params.set('populate', 'image');
  try {
    const res = await request<Article | Page>(`/api/${collection}/${encodeURIComponent(documentId)}?${params}`, {
      useCache: false,
    });
    return res.data;
  } catch (e) {
    if (e instanceof Error && e.message.includes('responded 404')) return null;
    throw e;
  }
}

export function mediaUrl(url: string) {
  return url.startsWith('http') ? url : `${MEDIA_URL}${url}`;
}

// Strapi's generated sizes; the original is only sent if there are none
function imageSizes(image: Image): ImageFormat[] {
  const formats = Object.values(image.formats ?? {});
  return (formats.length > 0 ? formats : [image]).sort((a, b) => a.width - b.width);
}

export function imageSrc(image: Image) {
  return mediaUrl(imageSizes(image).at(-1)!.url);
}

export function imageSrcset(image: Image) {
  return imageSizes(image)
    .map((f) => `${mediaUrl(f.url)} ${f.width}w`)
    .join(', ');
}

const dateFormat = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}
