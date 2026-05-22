import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const inputFiles = [
  'openapi/generated/klong/models/list-models.json',
  'openapi/generated/klong/chat/create-chat-completion.json',
  'openapi/generated/klong/responses/create-response.json',
  'openapi/generated/klong/embeddings/create-embedding.json',
];

const outputFile = 'openapi/klong-apifox-openapi.json';

const merged = {
  openapi: '3.1.0',
  info: {
    title: '小恐龙 API',
    version: '1.0.0',
    description:
      '小恐龙 API 文档。Base URL 为 https://api.klong.lat/v1，兼容 OpenAI API 调用格式。',
  },
  servers: [{ url: 'https://api.klong.lat/v1' }],
  tags: [
    { name: '模型（Models）', description: '查询可用模型' },
    { name: '聊天（Chat）', description: 'Chat Completions 与 Responses' },
    { name: '嵌入（Embeddings）', description: '文本向量接口' },
  ],
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: '填写你的小恐龙 API Key，例如 sk-your-api-key。',
      },
    },
    schemas: {},
    responses: {},
  },
};

const componentKinds = ['schemas', 'responses', 'parameters', 'requestBodies'];

function normalizeTags(operation) {
  const tag = operation.tags?.[0];
  if (!tag) return;

  operation.tags = [tag.split('/')[0]];
}

function mergeComponents(document) {
  const components = document.components || {};

  for (const kind of componentKinds) {
    if (!components[kind]) continue;
    merged.components[kind] ??= {};

    for (const [name, value] of Object.entries(components[kind])) {
      merged.components[kind][name] = value;
    }
  }
}

for (const file of inputFiles) {
  const fullPath = path.join(root, file);
  const document = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  mergeComponents(document);

  for (const [apiPath, pathItem] of Object.entries(document.paths || {})) {
    merged.paths[apiPath] ??= {};

    for (const [method, operation] of Object.entries(pathItem)) {
      normalizeTags(operation);
      merged.paths[apiPath][method] = operation;
    }
  }
}

fs.writeFileSync(
  path.join(root, outputFile),
  `${JSON.stringify(merged, null, 2)}\n`,
  'utf8'
);

console.log(`Generated ${outputFile}`);
