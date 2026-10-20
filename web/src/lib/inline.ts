import type { InlineNode, TextNode } from './strapi';

const replacements: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => replacements[char]);
}

function safeUrl(url: string) {
  return /^(https?:|mailto:|\/)/i.test(url) ? url : '#';
}

function textToHtml(node: TextNode) {
  let html = escapeHtml(node.text).replace(/\n/g, '<br>');
  if (node.code) html = `<code>${html}</code>`;
  if (node.bold) html = `<strong>${html}</strong>`;
  if (node.italic) html = `<em>${html}</em>`;
  if (node.underline) html = `<u>${html}</u>`;
  if (node.strikethrough) html = `<s>${html}</s>`;
  return html;
}

// Strapi "blocks" inline nodes to HTML; all text is escaped
export function inlineToHtml(nodes: InlineNode[]) {
  return nodes
    .map((node) => {
      if (node.type === 'link') {
        const url = safeUrl(node.url);
        const external = /^https?:/i.test(url);
        const attrs = external ? ' rel="noopener noreferrer"' : '';
        return `<a href="${escapeHtml(url)}"${attrs}>${node.children.map(textToHtml).join('')}</a>`;
      }
      return textToHtml(node);
    })
    .join('');
}
