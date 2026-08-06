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

## Files in this folder

| File | Purpose |
|------|---------|
| `merkle-homepage-content-package.zip` | **Ready-to-upload CRX content package.** Installs the page at `/content/ema-demo-om/index`. Use this. |
| `index.xml` | The raw JCR `cq:Page` node (same content, unpackaged). |
| `index.md` | Source markdown (reference only). |
| `crx-package/` | Unzipped contents of the package (for inspection). |

The package layout (FileVault standard):
```
jcr_root/content/ema-demo-om/index/.content.xml   ← the page content
META-INF/vault/filter.xml                          ← filter: /content/ema-demo-om/index
META-INF/vault/properties.xml                      ← package metadata
```

## How to ingest (AEM-side — requires AEM Author access)

**Step 1 — Deploy the code first.**
Merge the `merkle-home` branch to `main` so the blocks, the `scripts.js` DM auto-block, and the `aem.js` dispatcher are live. AEM Code Sync handles this automatically on merge. Do this BEFORE importing content, so the blocks exist when the page renders.

**Step 2 — Upload the content package via CRX Package Manager.**
1. Go to `https://<your-aem-author-host>/crx/packmgr/index.jsp` (e.g. `https://author-p24773-e1522172.adobeaemcloud.com/crx/packmgr/index.jsp`).
2. Click **Upload Package** → choose `merkle-homepage-content-package.zip` → **OK**.
3. Click **Install** on the uploaded package. It creates the page at `/content/ema-demo-om/index`.

**Step 3 — Open in Universal Editor** to confirm the blocks are editable, then **Preview / Publish**.

After publish, the page renders at:
- Preview: `https://main--eds-ema-universal-editor--omprakash529-merkle.aem.page/` (path `/index` under the site)
- Live: `https://main--eds-ema-universal-editor--omprakash529-merkle.aem.live/`

> This ingest step runs in your AEM Author environment with your login. It is not performed by the migration tooling — the injected credentials here cover `admin.hlx.page` and `admin.da.live` only, not the AEM Author instance.

### If Package Manager isn't your flow
The raw `index.xml` is a valid `cq:Page` node — if you use a repo-based content deployment or the AEM Cloud content-import tooling instead, point it at `/content/ema-demo-om/index` using `index.xml` directly.
