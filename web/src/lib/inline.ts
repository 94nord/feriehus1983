import type { InlineNode, TekstNode } from './strapi';

const erstatninger: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escape(tekst: string) {
  return tekst.replace(/[&<>"']/g, (tegn) => erstatninger[tegn]);
}

function sikkerUrl(url: string) {
  return /^(https?:|mailto:|\/)/i.test(url) ? url : '#';
}

function tekstTilHtml(node: TekstNode) {
  let html = escape(node.text).replace(/\n/g, '<br>');
  if (node.code) html = `<code>${html}</code>`;
  if (node.bold) html = `<strong>${html}</strong>`;
  if (node.italic) html = `<em>${html}</em>`;
  if (node.underline) html = `<u>${html}</u>`;
  if (node.strikethrough) html = `<s>${html}</s>`;
  return html;
}

// Strapi "blocks" inline-noder til HTML; al tekst escapes
export function inlineTilHtml(noder: InlineNode[]) {
  return noder
    .map((node) => {
      if (node.type === 'link') {
        const url = sikkerUrl(node.url);
        const ekstern = /^https?:/i.test(url);
        const attr = ekstern ? ' rel="noopener noreferrer"' : '';
        return `<a href="${escape(url)}"${attr}>${node.children.map(tekstTilHtml).join('')}</a>`;
      }
      return tekstTilHtml(node);
    })
    .join('');
}
