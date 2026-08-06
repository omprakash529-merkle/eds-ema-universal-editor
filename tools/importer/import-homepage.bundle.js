/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function fieldCell(document, fieldName, nodes) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${fieldName} `));
    nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
    return frag;
  }
  function buildCta(document, anchor) {
    if (!anchor) return null;
    const href = anchor.getAttribute("href");
    if (!href) return null;
    const textEl = anchor.querySelector(".cmp-button__text");
    const text = (textEl ? textEl.textContent : anchor.textContent).trim();
    if (!text) return null;
    const a = document.createElement("a");
    a.setAttribute("href", href);
    a.textContent = text;
    return a;
  }
  function parse(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (slides.length === 0) {
      slides = Array.from(element.querySelectorAll(".teaser, .cmp-teaser"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const imgUrl = img ? img.getAttribute("src") || "" : "";
      const contentNodes = [];
      const pretitle = slide.querySelector(".cmp-teaser__pretitle");
      if (pretitle && pretitle.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = pretitle.textContent.trim();
        contentNodes.push(p);
      }
      const heading = slide.querySelector(".cmp-teaser__title, h1, h2, h3, h4, h5, h6");
      if (heading && heading.textContent.trim()) {
        const level = /^h[1-6]$/i.test(heading.tagName) ? heading.tagName.toLowerCase() : "h2";
        const h = document.createElement(level);
        h.textContent = heading.textContent.trim();
        contentNodes.push(h);
      }
      const description = slide.querySelector(".cmp-teaser__description");
      if (description && description.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        contentNodes.push(p);
      }
      const ctaAnchors = Array.from(slide.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a"));
      ctaAnchors.forEach((anchor) => {
        const cta = buildCta(document, anchor);
        if (cta) contentNodes.push(cta);
      });
      if (!imgUrl && contentNodes.length === 0) return;
      const urlNode = imgUrl ? document.createTextNode(imgUrl) : null;
      const imageCell = urlNode ? fieldCell(document, "image_url", [urlNode]) : "";
      const contentCell = fieldCell(document, "content_text", contentNodes);
      cells.push([imageCell, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function fieldCell2(document, fieldName, nodes) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${fieldName} `));
    nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
    return frag;
  }
  function extractTextNodes(document, card) {
    const nodes = [];
    const pretitle = card.querySelector(".cmp-teaser__pretitle");
    if (pretitle && pretitle.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = pretitle.textContent.trim();
      nodes.push(p);
    }
    const heading = card.querySelector(".cmp-teaser__title, h1, h2, h3, h4, h5, h6");
    if (heading && heading.textContent.trim()) {
      const level = /^h[1-6]$/i.test(heading.tagName) ? heading.tagName.toLowerCase() : "h3";
      const h = document.createElement(level);
      h.textContent = heading.textContent.trim();
      nodes.push(h);
    }
    const description = card.querySelector(".cmp-teaser__description, .cmp-text p");
    if (description && description.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = description.textContent.trim();
      nodes.push(p);
    }
    const wrapperAnchor = card.querySelector("a.mer-clickabkle-wrapper, a[href]");
    if (wrapperAnchor && wrapperAnchor.getAttribute("href")) {
      const linkTextEl = card.querySelector(".mer-link-text");
      const text = (linkTextEl ? linkTextEl.textContent : wrapperAnchor.textContent).trim();
      if (text) {
        const a = document.createElement("a");
        a.setAttribute("href", wrapperAnchor.getAttribute("href"));
        a.textContent = text;
        nodes.push(a);
      }
    }
    return nodes;
  }
  function parse2(element, { document }) {
    let cardEls = Array.from(element.querySelectorAll("li.cmp-list__item, .cmp-list__item"));
    if (cardEls.length === 0) {
      cardEls = [element];
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector("img");
      const imgUrl = img ? img.getAttribute("src") || "" : "";
      const textNodes = extractTextNodes(document, card);
      if (!imgUrl && textNodes.length === 0) return;
      const urlNode = imgUrl ? document.createTextNode(imgUrl) : null;
      const imageCell = urlNode ? fieldCell2(document, "image_url", [urlNode]) : "";
      const textCell = textNodes.length ? fieldCell2(document, "text", textNodes) : "";
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-reel.js
  function fieldCell3(document, fieldName, nodes) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${fieldName} `));
    nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
    return frag;
  }
  function parse3(element, { document }) {
    const sourceEl = element.querySelector("video source[src], source[src], video[src]");
    const existingLink = element.querySelector("a[href]");
    const videoUrl = sourceEl && (sourceEl.getAttribute("src") || sourceEl.getAttribute("href")) || existingLink && existingLink.getAttribute("href") || "";
    const posterImg = element.querySelector(".cmp-video__player__controls img, img");
    const posterUrl = posterImg ? posterImg.getAttribute("src") || "" : "";
    const cells = [];
    if (videoUrl) {
      const a = document.createElement("a");
      a.setAttribute("href", videoUrl);
      a.textContent = videoUrl;
      cells.push([fieldCell3(document, "uri", [a])]);
    }
    if (posterUrl) {
      cells.push([fieldCell3(document, "poster", [document.createTextNode(posterUrl)])]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "video-reel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-cases.js
  function fieldCell4(document, fieldName, nodes) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${fieldName} `));
    nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
    return frag;
  }
  function parse4(element, { document }) {
    let slides = Array.from(element.querySelectorAll("li.cmp-list__item, .cmp-list__item"));
    if (slides.length === 0) {
      slides = Array.from(element.querySelectorAll(".featuredcard, .mer-featured-card"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const imgUrl = img ? img.getAttribute("src") || "" : "";
      const contentNodes = [];
      const pretitle = slide.querySelector(".cmp-teaser__pretitle");
      if (pretitle && pretitle.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = pretitle.textContent.trim();
        contentNodes.push(p);
      }
      const heading = slide.querySelector(".cmp-teaser__title, h1, h2, h3, h4, h5, h6");
      if (heading && heading.textContent.trim()) {
        const level = /^h[1-6]$/i.test(heading.tagName) ? heading.tagName.toLowerCase() : "h3";
        const h = document.createElement(level);
        h.textContent = heading.textContent.trim();
        contentNodes.push(h);
      }
      const wrapperAnchor = slide.querySelector("a.mer-clickabkle-wrapper, a[href]");
      if (wrapperAnchor && wrapperAnchor.getAttribute("href")) {
        const linkTextEl = slide.querySelector(".mer-link-text");
        const text = (linkTextEl ? linkTextEl.textContent : wrapperAnchor.textContent).trim();
        if (text) {
          const a = document.createElement("a");
          a.setAttribute("href", wrapperAnchor.getAttribute("href"));
          a.textContent = text;
          contentNodes.push(a);
        }
      }
      if (!imgUrl && contentNodes.length === 0) return;
      const urlNode = imgUrl ? document.createTextNode(imgUrl) : null;
      const imageCell = urlNode ? fieldCell4(document, "image_url", [urlNode]) : "";
      const contentCell = fieldCell4(document, "content_text", contentNodes);
      cells.push([imageCell, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-cases", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/merkle-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        // OneTrust consent banner + preference center
        "#ot-sdk-btn-floating",
        // OneTrust floating cookie-settings button
        ".onetrust-pc-dark-filter",
        // OneTrust modal dark overlay
        '[id^="batBeacon"]'
        // Bing/UET tracking beacon divs
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        // header experience fragment
        "footer",
        // footer experience fragment
        ".cmp-experiencefragment--header",
        // defensive: header XF wrapper
        ".cmp-experiencefragment--footer",
        // defensive: footer XF wrapper
        "nav",
        // primary + language navigation
        ".mer-header-space",
        // header spacer div
        "h1.visually-hidden",
        // shell-injected screen-reader page title (outside main)
        "iframe",
        // reCAPTCHA / DoubleClick / TTD tracking iframes
        "link",
        // stray <link> elements
        "noscript",
        // noscript fallbacks
        "script"
        // any script tags
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-data-layer-enabled");
        el.removeAttribute("data-cmp-data-layer-name");
        el.removeAttribute("data-cmp-hook-image");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/merkle-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections;
    if (!Array.isArray(sections) || sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;
      if (section.style) {
        const smBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(smBlock);
      }
      if (i > 0) {
        const hr = doc.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/transformers/merkle-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse,
    "cards": parse2,
    "video-reel": parse3,
    "carousel-cases": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Merkle homepage: hero carousel, featured content cards (latest and greatest), capability grid (built for the experience economy), and case study cards (our work in action).",
    urls: [
      "https://www.merkle.com/"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".teasercarousel.carousel"]
      },
      {
        name: "cards",
        instances: [".teasergallerylist.mer-featured-tgl", ".container.responsivegrid.text-left"]
      },
      {
        name: "video-reel",
        instances: [".video.centered"]
      },
      {
        name: "carousel-cases",
        instances: [".listcards.teasergallerylist"]
      },
      {
        name: "section-experience-economy",
        instances: ["#main-content > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.full-bleed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.blue-black-background.full-bleed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)"],
        section: "dark"
      }
    ],
    sections: [
      {
        id: "rc3",
        name: "Hero carousel",
        selector: "#main-content > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.full-bleed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.blue-black-background.full-bleed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1)",
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Our latest and greatest",
        selector: "#main-content > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.full-bleed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2)",
        style: null,
        blocks: ["cards"],
        defaultContent: [".teaser.cmp-teaser-layout-large.content-center"]
      },
      {
        id: "rc5",
        name: "Built for the experience economy",
        selector: "#main-content > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.full-bleed.aem-GridColumn.aem-GridColumn--default--12 > div.cmp-container > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.container.responsivegrid.blue-black-background.full-bleed.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)",
        style: "dark",
        blocks: ["cards", "video-reel", "carousel-cases"],
        defaultContent: [
          ".teaser.cmp-teaser-layout-large.cmp-teaser-blue-black.top-spacer-s.content-center",
          ".teaser.cmp-teaser-layout-large.cmp-teaser-blue-black.top-spacer-m.content-center"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.filter((blockDef) => !blockDef.name.startsWith("section-")).forEach((blockDef) => {
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
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
      if (typeof globalThis.process === "undefined") globalThis.process = {};
      if (typeof globalThis.process.cwd !== "function") globalThis.process.cwd = () => "/";
      if (typeof window !== "undefined") window.process = globalThis.process;
      if (typeof Object.prototype.cwd !== "function") {
        Object.defineProperty(Object.prototype, "cwd", {
          value: () => "/",
          enumerable: false,
          configurable: true,
          writable: true
        });
      }
    },
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
