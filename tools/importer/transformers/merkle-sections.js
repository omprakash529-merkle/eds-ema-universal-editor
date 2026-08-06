/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: merkle.com section breaks + section metadata.
 *
 * Driven entirely by payload.template.sections (from page-templates.json).
 * For the "homepage" template there are 3 sections (verified against
 * migration-work/cleaned.html — each selector matches exactly one element):
 *
 *   rc3 "Hero carousel"                  style=null   (first section)
 *   rc4 "Our latest and greatest"        style=null
 *   rc5 "Built for the experience economy" style=dark
 *
 * Expected output under <main>:
 *   - Section breaks (<hr>): 2  (before rc4 and rc5; none before the first)
 *   - Section Metadata blocks: 1 (for rc5, style=dark)
 *
 * Runs in afterTransform only. Sections are processed in reverse document
 * order so inserting siblings never shifts the position of sections not yet
 * processed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = payload && payload.template && payload.template.sections;
  if (!Array.isArray(sections) || sections.length < 2) return;

  const doc = element.ownerDocument;

  // Process in reverse so DOM insertions don't shift earlier sections.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) continue;

    // Section Metadata block for sections that declare a style. The block
    // belongs to its section (it sits after the section's content and, for
    // non-last sections, before the following <hr>). Inserting immediately
    // after the section element achieves that placement.
    if (section.style) {
      const smBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(smBlock);
    }

    // Section break before every section except the first.
    if (i > 0) {
      const hr = doc.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
