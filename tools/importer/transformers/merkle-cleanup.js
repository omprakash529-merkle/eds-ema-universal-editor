/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: merkle.com site-wide cleanup.
 *
 * Removes non-authorable AEM Sites shell/chrome so that only the page-level
 * authorable content inside <main id="main-content"> survives the import.
 *
 * All selectors below were verified against migration-work/cleaned.html
 * (scraped from https://www.merkle.com/). Nothing is guessed.
 *
 * Verified in cleaned.html:
 *   - <header class="experiencefragment ...">           (1)  header experience fragment
 *   - <footer class="experiencefragment ...">           (1)  footer experience fragment
 *   - .cmp-experiencefragment--header / --footer        (1 each)
 *   - <nav class="cmp-navigation"> + language nav       (2)  primary + language navigation
 *   - #onetrust-consent-sdk                             (1)  OneTrust cookie consent banner
 *   - #ot-sdk-btn-floating                              (1)  OneTrust floating "cookie settings" button
 *   - .onetrust-pc-dark-filter                          (1)  OneTrust dark overlay
 *   - <iframe> (reCAPTCHA, DoubleClick, TTD pixel, ...) (7)  tracking / recaptcha iframes
 *   - .mer-header-space                                 (1)  header spacer div (outside main)
 *   - h1.visually-hidden                                (1)  screen-reader page title added by shell (outside main)
 *   - [id^="batBeacon"]                                 (2)  Bing/UET tracking beacon divs (outside main)
 * None of the above are inside #main-content, so removing them does not
 * touch authorable content.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent / overlays / tracking widgets that block or noise up
    // block parsing. Removed before parsing so parsers never see them.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',     // OneTrust consent banner + preference center
      '#ot-sdk-btn-floating',      // OneTrust floating cookie-settings button
      '.onetrust-pc-dark-filter',  // OneTrust modal dark overlay
      '[id^="batBeacon"]',         // Bing/UET tracking beacon divs
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (header/footer experience fragments, nav)
    // and leftover tracking/embed elements. Removed after block parsing so
    // parsers have already extracted the authorable content in <main>.
    WebImporter.DOMUtils.remove(element, [
      'header',                          // header experience fragment
      'footer',                          // footer experience fragment
      '.cmp-experiencefragment--header', // defensive: header XF wrapper
      '.cmp-experiencefragment--footer', // defensive: footer XF wrapper
      'nav',                             // primary + language navigation
      '.mer-header-space',               // header spacer div
      'h1.visually-hidden',              // shell-injected screen-reader page title (outside main)
      'iframe',                          // reCAPTCHA / DoubleClick / TTD tracking iframes
      'link',                            // stray <link> elements
      'noscript',                        // noscript fallbacks
      'script',                          // any script tags
    ]);

    // Strip non-authorable tracking / data-layer attributes left on elements.
    // Attribute names observed in cleaned.html (data-cmp-* AEM Core Component
    // data-layer hooks and inline handlers). removeAttribute is a no-op when
    // the attribute is absent, so this is safe across all elements.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-data-layer-enabled');
      el.removeAttribute('data-cmp-data-layer-name');
      el.removeAttribute('data-cmp-hook-image');
      el.removeAttribute('onclick');
    });
  }
}
