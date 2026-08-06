/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-hero
 * Base block: carousel (container). Model: carousel-hero-item
 * Source: https://www.merkle.com/  (selector: .teasercarousel.carousel)
 * Generated for xwalk project (field hints required).
 *
 * Structure (per library-description.txt): container block, one row per slide.
 * Each slide row has 2 columns:
 *   - cell 1: image_url    (image URL as plain text)
 *   - cell 2: content_text (richtext: pretitle, heading, description, CTA links)
 *
 * Image handling: the image URL is emitted as PLAIN TEXT into the image_url
 * field (an editable URL field in Universal Editor). The block JS builds the
 * responsive <picture> from this URL at render time via createOptimizedPicture,
 * which routes Dynamic Media / Scene7 URLs through the aem.js dispatcher (params
 * preserved) and handles ordinary DAM paths too. Because no <img> is emitted,
 * the merkle-dm-images transformer has nothing to rewrite in these cells.
 */

// Build a single cell as a DocumentFragment with its field hint comment first.
function fieldCell(document, fieldName, nodes) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
  return frag;
}

// Build a clean anchor from a source CTA link (text lives in a nested span).
function buildCta(document, anchor) {
  if (!anchor) return null;
  const href = anchor.getAttribute('href');
  if (!href) return null;
  const textEl = anchor.querySelector('.cmp-button__text');
  const text = (textEl ? textEl.textContent : anchor.textContent).trim();
  if (!text) return null;
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = text;
  return a;
}

export default function parse(element, { document }) {
  // Each carousel item is a slide. Fallback to teaser containers if needed.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (slides.length === 0) {
    slides = Array.from(element.querySelectorAll('.teaser, .cmp-teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // --- cell 1: image URL (plain text) ---
    const img = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');
    const imgUrl = img ? (img.getAttribute('src') || '') : '';

    // --- cell 2: content (richtext) ---
    const contentNodes = [];

    const pretitle = slide.querySelector('.cmp-teaser__pretitle');
    if (pretitle && pretitle.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = pretitle.textContent.trim();
      contentNodes.push(p);
    }

    const heading = slide.querySelector('.cmp-teaser__title, h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent.trim()) {
      const level = /^h[1-6]$/i.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h2';
      const h = document.createElement(level);
      h.textContent = heading.textContent.trim();
      contentNodes.push(h);
    }

    const description = slide.querySelector('.cmp-teaser__description');
    if (description && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentNodes.push(p);
    }

    const ctaAnchors = Array.from(slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));
    ctaAnchors.forEach((anchor) => {
      const cta = buildCta(document, anchor);
      if (cta) contentNodes.push(cta);
    });

    // Skip empty slides (defensive: carousel action/indicator artifacts).
    if (!imgUrl && contentNodes.length === 0) return;

    // Emit the image URL as plain text (editable URL field in Universal Editor).
    const urlNode = imgUrl ? document.createTextNode(imgUrl) : null;
    const imageCell = urlNode ? fieldCell(document, 'image_url', [urlNode]) : '';
    const contentCell = fieldCell(document, 'content_text', contentNodes);

    cells.push([imageCell, contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
