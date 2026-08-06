/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-cases
 * Base block: carousel (container). Model: carousel-cases-item
 * Source: https://www.merkle.com/  (selector: .listcards.teasergallerylist)
 *
 * "Our work in action" carousel: each <li.cmp-list__item> is a case-study slide
 * wrapped in <a.mer-clickabkle-wrapper>. Slide content:
 *   - image (Scene7 DM)
 *   - pretitle (client/brand name), heading (case title), "Read case" link.
 *
 * Structure (per library-description.txt): container block, one row per slide,
 * each row has 2 columns:
 *   - cell 1: media_image
 *   - cell 2: content_text (richtext: pretitle, heading, CTA)
 * media_imageAlt is a collapsed field (Alt suffix) -> on the <img> alt attr.
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

export default function parse(element, { document }) {
  // Each case study is a list item / featured card.
  let slides = Array.from(element.querySelectorAll('li.cmp-list__item, .cmp-list__item'));
  if (slides.length === 0) {
    slides = Array.from(element.querySelectorAll('.featuredcard, .mer-featured-card'));
  }

  const cells = [];

  slides.forEach((slide) => {
    const img = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    const contentNodes = [];

    const pretitle = slide.querySelector('.cmp-teaser__pretitle');
    if (pretitle && pretitle.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = pretitle.textContent.trim();
      contentNodes.push(p);
    }

    const heading = slide.querySelector('.cmp-teaser__title, h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent.trim()) {
      const level = /^h[1-6]$/i.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h3';
      const h = document.createElement(level);
      h.textContent = heading.textContent.trim();
      contentNodes.push(h);
    }

    // CTA: whole card is wrapped in an anchor; "Read case" text is in a span.
    const wrapperAnchor = slide.querySelector('a.mer-clickabkle-wrapper, a[href]');
    if (wrapperAnchor && wrapperAnchor.getAttribute('href')) {
      const linkTextEl = slide.querySelector('.mer-link-text');
      const text = (linkTextEl ? linkTextEl.textContent : wrapperAnchor.textContent).trim();
      if (text) {
        const a = document.createElement('a');
        a.setAttribute('href', wrapperAnchor.getAttribute('href'));
        a.textContent = text;
        contentNodes.push(a);
      }
    }

    // Skip empty slides.
    if (!img && contentNodes.length === 0) return;

    const imageCell = img ? fieldCell(document, 'media_image', [img]) : '';
    const contentCell = fieldCell(document, 'content_text', contentNodes);

    cells.push([imageCell, contentCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cases', cells });
  element.replaceWith(block);
}
