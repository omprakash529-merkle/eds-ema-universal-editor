/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsParser from './parsers/cards.js';
import videoReelParser from './parsers/video-reel.js';
import carouselCasesParser from './parsers/carousel-cases.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/merkle-cleanup.js';
import sectionsTransformer from './transformers/merkle-sections.js';
import dmImagesTransformer from './transformers/merkle-dm-images.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards': cardsParser,
  'video-reel': videoReelParser,
  'carousel-cases': carouselCasesParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Merkle homepage: hero carousel, featured content cards (latest and greatest), capability grid (built for the experience economy), and case study cards (our work in action).',
  urls: [
    'https://www.merkle.com/',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['.teasercarousel.carousel'],
    },
    {
      name: 'cards',
      instances: ['.teasergallerylist.mer-featured-tgl', '.container.responsivegrid.text-left'],
    },
    {
      name: 'video-reel',
      instances: ['.video.centered'],
    },
    {
      name: 'carousel-cases',
      instances: ['.listcards.teasergallerylist'],
    },
    {
      name: 'section-experience-economy',
      instances: ['#main-content > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.full-bleed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.blue-black-background.full-bleed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)'],
      section: 'dark',
    },
  ],
  sections: [
    {
      id: 'rc3',
      name: 'Hero carousel',
      selector: '#main-content > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.full-bleed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.blue-black-background.full-bleed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)',
      style: null,
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: 'rc4',
      name: 'Our latest and greatest',
      selector: '#main-content > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.full-bleed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['.teaser.cmp-teaser-layout-large.content-center'],
    },
    {
      id: 'rc5',
      name: 'Built for the experience economy',
      selector: '#main-content > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.full-bleed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.blue-black-background.full-bleed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)',
      style: 'dark',
      blocks: ['cards', 'video-reel', 'carousel-cases'],
      defaultContent: [
        '.teaser.cmp-teaser-layout-large.cmp-teaser-blue-black.top-spacer-s.content-center',
        '.teaser.cmp-teaser-layout-large.cmp-teaser-blue-black.top-spacer-m.content-center',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections (adds breaks + metadata),
// then DM images (rewrites parser-modified <img> to carrier anchors). All run in
// both hooks; each transformer guards on hookName internally.
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
  dmImagesTransformer,
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all parseable blocks on the page based on the embedded template.
 * Section marker entries (name starting with "section-") are skipped —
 * those are handled by the sections transformer, not a parser.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks
    .filter((blockDef) => !blockDef.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      });
    });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  /**
   * Runs in the browser before html2md. Works around a bug in the vendored
   * helix-importer bundle: its path-browserify module inlines the `process`
   * global as a bare object literal `{env:{},version:"v20.20.2"}` that lacks
   * cwd(), so vfile's path resolution throws "cwd is not a function" during
   * markdown conversion. Because that literal inherits from Object.prototype,
   * we define a NON-ENUMERABLE Object.prototype.cwd returning '/' (matching
   * the library's own working process polyfill, Is.cwd = () => '/').
   * Non-enumerable so unified/mdast for..in AST traversal is unaffected.
   * This runs only in the throwaway import browser context.
   */
  onLoad: () => {
    if (typeof globalThis.process === 'undefined') globalThis.process = {};
    if (typeof globalThis.process.cwd !== 'function') globalThis.process.cwd = () => '/';
    if (typeof window !== 'undefined') window.process = globalThis.process;
    if (typeof Object.prototype.cwd !== 'function') {
      Object.defineProperty(Object.prototype, 'cwd', {
        value: () => '/',
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
  },

  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup: consent banners, beacons)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (remove header/footer/nav, add section breaks + metadata,
    //    rewrite DM images to carrier anchors)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
