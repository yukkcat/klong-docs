import { docs } from '@/.source';
import {
  type InferPageType,
  type LoaderPlugin,
  loader,
} from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { openapiPlugin } from 'fumadocs-openapi/server';
import { i18n } from '@/lib/i18n';

const publicDocRoots = new Set([
  'api',
  'apps',
  'concepts',
  'developer',
  'user-guide',
]);

const publicAppPages = new Set([
  undefined,
  'index',
  'claude-code',
  'codex-cli',
  'cc-switch',
  'cherry-studio',
  'aionui',
  'openclaw',
]);

const publicAiModelGroups = new Set([
  undefined,
  'audio',
  'chat',
  'completions',
  'embeddings',
  'images',
  'models',
  'moderations',
  'realtime',
  'rerank',
  'videos',
]);

function shouldKeepPublicPath(path: string): boolean {
  const [root, section, group] = path.split('/');

  if (!root) return true;
  if (!publicDocRoots.has(root)) return false;

  if (root === 'api') {
    if (section === undefined || section === 'index') return true;
    if (section !== 'ai-model') return false;
    return publicAiModelGroups.has(group);
  }

  if (root === 'apps') {
    return publicAppPages.has(section);
  }

  return true;
}

const publicDocsPlugin: LoaderPlugin = {
  name: 'klong-public-docs',
  enforce: 'pre',
  transformStorage({ storage }) {
    for (const path of storage.getFiles()) {
      const file = storage.read(path);
      const normalized = path.replace(/\\/g, '/');
      const withoutExtension =
        file?.format === 'meta'
          ? normalized.replace(/(^|\/)meta\.json$/, '').replace(/\/$/, '')
          : normalized.replace(/\.(mdx|md|json)$/, '');
      const publicPath = withoutExtension.replace(/(^|\/)index$/, '');

      if (!shouldKeepPublicPath(publicPath)) {
        storage.delete(path);
      }
    }
  },
};

export const source = loader({
  baseUrl: '/docs',
  i18n,
  source: docs.toFumadocsSource(),
  plugins: [
    publicDocsPlugin,
    lucideIconsPlugin(),
    openapiPlugin(), // Add badges to API pages in the page tree
  ],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}
