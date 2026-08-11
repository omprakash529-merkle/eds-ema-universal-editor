/* eslint-disable */
/**
 * Convert hand-authored EDS block-table markdown (tools/importer/nexcent.md)
 * into JCR XML using @adobe/helix-md2jcr with this project's component models.
 * Produces jcr-ingest-nexcent/index.xml.
 */
import { readFile, writeFile } from 'node:fs/promises';

const NM = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules';
const REPO = '/backups/omprakash529-merkle/eds-ema-universal-editor/repo';

async function main() {
  const { md2jcr } = await import(`${NM}/@adobe/helix-md2jcr/src/index.js`);

  const md = await readFile(`${REPO}/tools/importer/nexcent.md`, 'utf-8');
  const models = JSON.parse(await readFile(`${REPO}/component-models.json`, 'utf-8'));
  const definition = JSON.parse(await readFile(`${REPO}/component-definition.json`, 'utf-8'));
  const filters = JSON.parse(await readFile(`${REPO}/component-filters.json`, 'utf-8'));

  const jcr = await md2jcr(md, { models, definition, filters });
  const xml = jcr.toString();
  await writeFile(`${REPO}/jcr-ingest-nexcent/index.xml`, xml, 'utf-8');
  console.log('OK: wrote jcr-ingest-nexcent/index.xml, length', xml.length);
}

main().catch((e) => { console.error('FAILED:', e.stack || e.message); process.exit(1); });
