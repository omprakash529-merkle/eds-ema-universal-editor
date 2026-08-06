import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Reads a plain-text image URL from a cell. The image cell now holds a URL
 * string (editable "Image URL" field) — possibly wrapped in a <p> by the
 * richtext round-trip — rather than an <img>. Returns '' if the cell has no
 * usable URL or contains real markup (heading/link = it's the body cell).
 */
function readImageUrl(div) {
  if (div.querySelector('h1,h2,h3,h4,h5,h6,a,ul,ol,strong')) return '';
  const text = (div.textContent || '').trim();
  return /^(https?:\/\/|\/|\.\/)\S+$/.test(text) ? text : '';
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const url = readImageUrl(div);
      if (div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else if (url) {
        // Image cell: build a <picture> from the URL. Derive alt from the
        // card heading for accessibility. createOptimizedPicture routes DM/
        // Scene7 URLs through the aem.js dispatcher and handles DAM paths.
        div.className = 'cards-card-image';
        const alt = li.querySelector('h1,h2,h3,h4,h5,h6')?.textContent.trim() || '';
        const pic = createOptimizedPicture(url, alt, false, [{ width: '750' }]);
        div.replaceChildren(pic);
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });
  block.replaceChildren(ul);
}
