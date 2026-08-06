/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards (container). Model: card
 * Source: https://www.merkle.com/
 * Instances (two distinct source structures — parser handles both):
 *   (a) .teasergallerylist.mer-featured-tgl  -> featured teaser cards
 *        each <li.cmp-list__item> = image + pretitle + heading + "Learn more" link
 *   (b) .container.responsivegrid.text-left  -> capability grid item
 *        single container = icon image + heading + description (no link)
 *
 * Structure (per library-description.txt): container block, one row per card,
 * each row has 2 columns:
 *   - cell 1: image  (icon / teaser image)
 *   - cell 2: text   (richtext: pretitle, heading, description, CTA)
 * imageAlt is a collapsed field (Alt suffix) -> lives on the <img> alt attr.
 * Empty image or text cell must still be included (per description).
 *
 * Dynamic Media note: images are Scene7 DM URLs kept as raw <img>; the
 * merkle-dm-images transformer rewrites them to carrier anchors afterTransform.
 */

function fieldCell(document, fieldName, nodes) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
  return frag;
}

// Extract the ordered richtext nodes (pretitle, heading, description, CTA)
// from a single card element. Works for both featured teasers and capability
// grid items.
function extractTextNodes(document, card) {
  const nodes = [];

  const pretitle = card.querySelector('.cmp-teaser__pretitle');
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    nodes.push(p);
  }

  const heading = card.querySelector('.cmp-teaser__title, h1, h2, h3, h4, h5, h6');
  if (heading && heading.textContent.trim()) {
    const level = /^h[1-6]$/i.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h3';
    const h = document.createElement(level);
    h.textContent = heading.textContent.trim();
    nodes.push(h);
  }

  // Description: capability grid uses .cmp-text p; teaser may use a description div.
  const description = card.querySelector('.cmp-teaser__description, .cmp-text p');
  if (description && description.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    nodes.push(p);
  }

  // CTA: featured teaser wraps the whole card in an anchor and shows link text
  // in a .mer-link-text span ("Learn more"). Capability items have no link.
  const wrapperAnchor = card.querySelector('a.mer-clickabkle-wrapper, a[href]');
  if (wrapperAnchor && wrapperAnchor.getAttribute('href')) {
    const linkTextEl = card.querySelector('.mer-link-text');
    const text = (linkTextEl ? linkTextEl.textContent : wrapperAnchor.textContent).trim();
    if (text) {
      const a = document.createElement('a');
      a.setAttribute('href', wrapperAnchor.getAttribute('href'));
      a.textContent = text;
      nodes.push(a);
    }
  }

  return nodes;
}

export default function parse(element, { document }) {
  // Featured teaser list -> multiple <li> cards; capability grid -> single item.
  let cardEls = Array.from(element.querySelectorAll('li.cmp-list__item, .cmp-list__item'));
  if (cardEls.length === 0) {
    // Single-card container (capability grid item): the element itself is the card.
    cardEls = [element];
  }

  const cells = [];

  cardEls.forEach((card) => {
    const img = card.querySelector('img');
    const textNodes = extractTextNodes(document, card);

    // Skip genuinely empty cards.
    if (!img && textNodes.length === 0) return;

    const imageCell = img ? fieldCell(document, 'image', [img]) : '';
    const textCell = textNodes.length ? fieldCell(document, 'text', textNodes) : '';

    cells.push([imageCell, textCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
