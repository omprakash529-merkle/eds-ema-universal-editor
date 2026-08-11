# JCR Ingest — Nexcent Landing Page (from Figma)

Installable content package for the Nexcent landing page. Target path in AEM:
**`/content/ema-demo-om/nexcent`**.

## Files

| File | Purpose |
|------|---------|
| `nexcent-landing-page-package.zip` | **Ready-to-upload CRX content package.** Use this. |
| `index.xml` | The raw JCR `cq:Page` node (unpackaged). |
| `crx-package/` | Unzipped package layout (for inspection). |

## How to ingest (AEM-side — requires AEM Author access)

1. **Deploy the code first** — the branch `nexcent-figma` must be merged/deployed so the `columns`, `cards` blocks and the Nexcent theme in `styles/lazy-styles.css` are live. (Code Sync handles this on merge.)
2. **Upload via CRX Package Manager** — `https://<author-host>/crx/packmgr/index.jsp` → Upload Package → choose `nexcent-landing-page-package.zip` → Install. Creates the page at `/content/ema-demo-om/nexcent`.
3. **Open in Universal Editor**, then Preview / Publish.

## Known gaps (as-packaged) — read before install

This page was authored from the Figma design and converted to JCR via `helix-md2jcr`. The conversion is **partially block-structured**:

- ✅ **Hero** — proper `columns` block (2 columns: text + image).
- ✅ **Feature cards, stats, blog cards, client logos** — proper `cards` blocks (editable card items).
- ✅ **10 sections** with section nodes.
- ⚠️ **3 sections did NOT convert to `columns` blocks** (the two "image + text" feature rows and the testimonial). Due to gridtable-alignment limits in the markdown source, they import as **editable default content** (headings, paragraphs, images, CTA links) rather than a structured `columns` block. They are still fully editable in Universal Editor — just as default content, not a columns block. Re-block them in UE if a columns layout is required.
- ⚠️ **Section-style metadata** (`nexcent light` / `nexcent cta` background theming) is present in the source but did not bind to the section `style` attribute in this conversion. Apply the section style in UE if the tinted background is wanted.

## Images

- **Hero** uses the real Figma illustration (`/drafts/images/nexcent/hero-illustration.png`).
- **All other images are placeholders** (`placeholder.png`) — the real Figma assets were blocked by an API rate limit during migration. Every image is a plain reference, so swap it in Universal Editor (or re-run the image pull) later.

> This ingest runs in your AEM Author environment with your login; it is not performed by the migration tooling.
