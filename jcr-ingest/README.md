# JCR Ingest — Merkle Homepage

Validated JCR content for the merkle.com homepage migration, ready to import into AEM Author.

## Files

| File | Purpose |
|------|---------|
| `index.xml` | The JCR page content (`cq:Page` → `jcr:content`). This is what AEM ingests. |
| `index.md`  | Source markdown the XML was generated from (reference only). |

## What it contains (validated)

- **cq:Page** with title *"Merkle - We Power the Experience Economy"* and description/og metadata.
- 3 content sections (section_2 carries `style="[dark]"`).
- Blocks: `carousel-hero` (3 slides), `cards` ×5 (7 card items: 3 featured + 4 capability), `video-reel` (1), `carousel-cases` (8 slides).
- All model references resolve against `component-models.json` (`carousel-hero-item`, `carousel-cases-item`, `card`, `video-reel`, `section`).
- **Dynamic Media / Scene7**: 18 image URLs preserved as inline rich-text carrier anchors (`<a href="…/is/image/…">alt</a>`). Zero DAM `fileReference` — DM images are external, not ingested into the DAM. The client-side auto-block (in `scripts/scripts.js`, shipped on the code branch) rebuilds them as responsive `<picture>` at render time.

## Target location in AEM

From `.migration/project.json`:

- **Site path:** `/content/ema-demo-om`
- **Page node:** `/content/ema-demo-om/index` (i.e. this becomes the `index` page under the site)
- **Assets folder:** `/content/dam/ema-demo-om` (only relevant for DAM-managed assets; the DM/Scene7 images here are external and need no DAM upload)

## How to ingest (AEM-side — requires AEM Author access)

1. **Deploy the code first.** Merge / deploy the `merkle-homepage-migration` branch so the blocks, `scripts.js` DM auto-block, and `aem.js` dispatcher are live. AEM Code Sync handles this once merged to `main`.
2. **Import the page content.** Load `index.xml` as the `jcr:content` of a new page at `/content/ema-demo-om/index` using your standard AEM content-ingest method (e.g. package upload via CRX Package Manager, or the AEM import tooling). The XML is already a valid `cq:Page` node.
3. **Open in Universal Editor** to confirm blocks are editable, then Preview / Publish.

> This ingest step runs in your AEM Author environment. It is not performed by the migration tooling — the injected credentials here cover `admin.hlx.page` and `admin.da.live` only, not the AEM Author instance.
