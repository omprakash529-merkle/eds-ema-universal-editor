/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: video-reel
 * Base block: video (simple block). Model: video-reel
 * Source: https://www.merkle.com/  (selector: .video.centered)
 *
 * Structure (per library-description.txt): 1 column, up to 3 rows.
 *   row 1: block name (added by createBlock)
 *   row 2: video source URI  -> model field `uri`
 *   row 3: optional poster/placeholder image -> model field `placeholder_image`
 * The `classes` model field (autoplay options) and `placeholder_imageAlt`
 * (collapsed Alt suffix) do not get their own rows.
 *
 * Source: a native <video> with a <source src="...mp4"> and a poster <img>.
 * The video block decorator expects a link to the video; we emit an <a> whose
 * href is the source URL as the uri cell.
 */

function fieldCell(document, fieldName, nodes) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
  return frag;
}

export default function parse(element, { document }) {
  // Video source URL: <source src> inside <video>, or a direct anchor.
  const sourceEl = element.querySelector('video source[src], source[src], video[src]');
  const existingLink = element.querySelector('a[href]');
  const videoUrl = (sourceEl && (sourceEl.getAttribute('src') || sourceEl.getAttribute('href')))
    || (existingLink && existingLink.getAttribute('href'))
    || '';

  // Poster / placeholder image (the video controls preview <img>).
  const posterImg = element.querySelector('.cmp-video__player__controls img, img');

  const cells = [];

  // Row 2: video URI as an anchor (video block resolves the linked video).
  if (videoUrl) {
    const a = document.createElement('a');
    a.setAttribute('href', videoUrl);
    a.textContent = videoUrl;
    cells.push([fieldCell(document, 'uri', [a])]);
  }

  // Row 3: optional placeholder image.
  if (posterImg) {
    cells.push([fieldCell(document, 'placeholder_image', [posterImg])]);
  }

  // Empty-block guard: nothing usable found.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-reel', cells });
  element.replaceWith(block);
}
