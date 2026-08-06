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
 *   - cell 1: media_image  (background/hero image)
 *   - cell 2: content_text (richtext: pretitle, heading, description, CTA links)
 * media_imageAlt is a collapsed field (Alt suffix) -> lives on the <img> alt attr.
 *
 * Dynamic Media note: images are Scene7 DM URLs. They stay as raw <img> here;
 * the merkle-dm-images transformer rewrites them into carrier anchors in
 * afterTransform (after this parser runs). We place the bare <img> (not the
 * <picture>) so the unlinked-image rewrite produces a clean <a href=DM>alt</a>.
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
    // --- cell 1: image ---
    const img = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

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
    if (!img && contentNodes.length === 0) return;

    const imageCell = img ? fieldCell(document, 'media_image', [img]) : '';
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
