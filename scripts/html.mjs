import { parse } from 'parse5';

export function elements(html) {
  const nodes = [];
  const visit = (node) => {
    if (node.tagName) {
      node.attr = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
      nodes.push(node);
    }
    for (const child of node.childNodes ?? []) visit(child);
  };
  visit(parse(html));
  return nodes;
}

export function textContent(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes ?? []).map(textContent).join('');
}
