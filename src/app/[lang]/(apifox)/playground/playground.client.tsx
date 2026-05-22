'use client';

import {
  BookOpenText,
  Braces,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clipboard,
  Code2,
  Copy,
  FileJson,
  KeyRound,
  List,
  Loader2,
  Play,
  Search,
  Server,
  Settings2,
  TerminalSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

type RunnableEndpoint = 'models' | 'chat' | 'responses' | 'embeddings';

type EndpointItem = {
  id: RunnableEndpoint | string;
  title: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  runnable?: boolean;
};

type EndpointGroup = {
  title: string;
  items: EndpointItem[];
};

type PlaygroundResponse = {
  status: number;
  ok: boolean;
  data: unknown;
};

type JsonRecord = Record<string, unknown>;
type CopyTarget = 'curl' | 'body' | 'page' | 'raw';
type RequestPreview = 'body' | 'curl';

const endpointGroups: EndpointGroup[] = [
  {
    title: '文档说明',
    items: [
      {
        id: 'overview',
        title: '小恐龙 API 说明',
        method: 'GET',
        path: '/v1',
        description:
          '默认接口地址为 https://api.klong.lat，OpenAI 兼容 Base URL 为 https://api.klong.lat/v1。',
      },
    ],
  },
  {
    title: '模型（Models）',
    items: [
      {
        id: 'models',
        title: '列出模型',
        method: 'GET',
        path: '/v1/models',
        description: '查询当前 API Key 可用模型，适合接入前验证 Key 和权限。',
        runnable: true,
      },
    ],
  },
  {
    title: '聊天（Chat）',
    items: [
      {
        id: 'chat',
        title: '创建聊天补全',
        method: 'POST',
        path: '/v1/chat/completions',
        description:
          'OpenAI Chat Completions 兼容格式，适合聊天、编程和客户端工具。',
        runnable: true,
      },
      {
        id: 'responses',
        title: '创建 Response',
        method: 'POST',
        path: '/v1/responses',
        description: 'OpenAI Responses API 兼容格式，适合 Codex CLI 一类工具。',
        runnable: true,
      },
    ],
  },
  {
    title: '嵌入（Embeddings）',
    items: [
      {
        id: 'embeddings',
        title: '创建嵌入向量',
        method: 'POST',
        path: '/v1/embeddings',
        description: '文本向量接口，适合知识库、RAG 和语义检索。',
        runnable: true,
      },
    ],
  },
  {
    title: '图像（Images）',
    items: [
      {
        id: 'images-generations',
        title: '创建图像',
        method: 'POST',
        path: '/v1/images/generations',
        description: '文生图接口，按实际模型能力开放。',
      },
    ],
  },
  {
    title: '客户端教程',
    items: [
      {
        id: 'claude-code',
        title: 'Claude Code 接入',
        method: 'GET',
        path: '/docs/apps/claude-code',
        description: '配置 Claude Code、Codex CLI、CC Switch 等客户端时使用。',
      },
    ],
  },
];

const runnableIds = new Set<RunnableEndpoint>([
  'models',
  'chat',
  'responses',
  'embeddings',
]);

const defaultEndpoint = endpointGroups[2].items[0];

const modelPlaceholder = '<model-id>';

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as JsonRecord;
}

function contentToText(value: unknown): string {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;

        const record = asRecord(item);
        if (!record) return '';

        if (typeof record.text === 'string') return record.text;
        if (typeof record.content === 'string') return record.content;

        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  const record = asRecord(value);
  if (!record) return '';

  if (typeof record.text === 'string') return record.text;
  if (typeof record.content === 'string') return record.content;

  return '';
}

function extractModelIds(data: unknown): string[] {
  const record = asRecord(data);
  const list = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(data)
      ? data
      : [];

  const ids = list
    .map((item) => {
      if (typeof item === 'string') return item;

      const itemRecord = asRecord(item);
      return typeof itemRecord?.id === 'string' ? itemRecord.id : '';
    })
    .filter(Boolean);

  return Array.from(new Set(ids));
}

function extractAssistantOutput(data: unknown): string {
  const record = asRecord(data);
  if (!record) return '';

  if (typeof record.output_text === 'string') return record.output_text;

  const choices = Array.isArray(record.choices) ? record.choices : [];
  for (const choice of choices) {
    const choiceRecord = asRecord(choice);
    const message = asRecord(choiceRecord?.message);
    const messageText = contentToText(message?.content);

    if (messageText) return messageText;

    if (typeof choiceRecord?.text === 'string') return choiceRecord.text;
  }

  const output = Array.isArray(record.output) ? record.output : [];
  for (const item of output) {
    const itemRecord = asRecord(item);
    const contentText = contentToText(itemRecord?.content);

    if (contentText) return contentText;
  }

  return '';
}

function extractErrorMessage(data: unknown): string {
  const record = asRecord(data);
  if (!record) return typeof data === 'string' ? data : '';

  const error = asRecord(record.error);
  if (typeof error?.message === 'string') return error.message;
  if (typeof record.message === 'string') return record.message;
  if (typeof record.error === 'string') return record.error;
  if (typeof record.detail === 'string') return record.detail;

  return '';
}

function getRunnableId(id: string): RunnableEndpoint | null {
  return runnableIds.has(id as RunnableEndpoint)
    ? (id as RunnableEndpoint)
    : null;
}

function buildBody(endpoint: string, model: string, prompt: string) {
  if (endpoint === 'models') return undefined;

  if (endpoint === 'responses') {
    return {
      model,
      input: prompt,
    };
  }

  if (endpoint === 'embeddings') {
    return {
      model,
      input: prompt,
    };
  }

  return {
    model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    stream: false,
  };
}

function buildResponseExample(endpoint: string, model: string) {
  const exampleModel =
    model && model !== modelPlaceholder ? model : '<model-id>';

  if (endpoint === 'overview') {
    return {
      base_url: 'https://api.klong.lat/v1',
      auth: 'Authorization: Bearer sk-your-api-key',
      content_type: 'application/json',
    };
  }

  if (endpoint === 'models') {
    return {
      object: 'list',
      data: [
        { id: 'gpt-5.5', object: 'model' },
        { id: 'claude-opus-4-7', object: 'model' },
      ],
    };
  }

  if (endpoint === 'responses') {
    return {
      id: 'resp_example',
      object: 'response',
      model: exampleModel,
      output_text: '请求成功后这里会返回模型输出。',
      usage: {
        input_tokens: 32,
        output_tokens: 24,
        total_tokens: 56,
      },
    };
  }

  if (endpoint === 'embeddings') {
    return {
      object: 'list',
      data: [
        {
          object: 'embedding',
          index: 0,
          embedding: [0.0123, -0.0456, 0.0789],
        },
      ],
      model: exampleModel,
      usage: {
        prompt_tokens: 12,
        total_tokens: 12,
      },
    };
  }

  if (endpoint === 'chat') {
    return {
      id: 'chatcmpl_example',
      object: 'chat.completion',
      model: exampleModel,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: '请求成功后这里会返回模型输出。',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 30,
        completion_tokens: 24,
        total_tokens: 54,
      },
    };
  }

  if (endpoint === 'images-generations') {
    return {
      created: 1779436646,
      data: [
        {
          url: 'https://...',
        },
      ],
    };
  }

  return {
    note: '这是教程入口，不是可直接请求的 API 接口。',
  };
}

function buildCurl(
  endpoint: EndpointItem,
  apiKey: string,
  model: string,
  prompt: string
) {
  const auth = apiKey.trim() || 'sk-your-api-key';

  if (!endpoint.runnable) {
    return '当前条目是说明文档，不是可直接运行的 API 接口。';
  }

  if (endpoint.method === 'GET') {
    return `curl https://api.klong.lat${endpoint.path} \\
  -H "Authorization: Bearer ${auth}"`;
  }

  return `curl https://api.klong.lat${endpoint.path} \\
  -H "Authorization: Bearer ${auth}" \\
  -H "Content-Type: application/json" \\
  -d '${stringify(buildBody(endpoint.id, model, prompt))}'`;
}

function methodClass(method: EndpointItem['method']) {
  return method === 'GET'
    ? 'bg-cyan-50 text-cyan-700 ring-cyan-600/15'
    : 'bg-sky-50 text-sky-700 ring-sky-600/15';
}

export function PlaygroundClient() {
  const [apiKey, setApiKey] = useState('');
  const [selectedId, setSelectedId] = useState(defaultEndpoint.id);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState('用三句话介绍小恐龙 API 的接入方式。');
  const [result, setResult] = useState<PlaygroundResponse | null>(null);
  const [error, setError] = useState('');
  const [modelsError, setModelsError] = useState('');
  const [modelsLoading, setModelsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<CopyTarget | ''>('');
  const [requestPreview, setRequestPreview] = useState<RequestPreview>('body');

  const endpoints = endpointGroups.flatMap((group) => group.items);
  const selectedEndpoint =
    endpoints.find((item) => item.id === selectedId) || defaultEndpoint;
  const runnableId = getRunnableId(selectedEndpoint.id);
  const selectedModel = model || availableModels[0] || modelPlaceholder;
  const requestBody = useMemo(
    () => buildBody(selectedEndpoint.id, selectedModel, prompt),
    [prompt, selectedEndpoint.id, selectedModel]
  );
  const curl = useMemo(
    () => buildCurl(selectedEndpoint, apiKey, selectedModel, prompt),
    [apiKey, prompt, selectedEndpoint, selectedModel]
  );
  const assistantOutput = result ? extractAssistantOutput(result.data) : '';
  const responseModelIds = result ? extractModelIds(result.data) : [];
  const responseError =
    result && !result.ok ? extractErrorMessage(result.data) : '';
  const activeRequestPreview =
    requestPreview === 'body' && requestBody ? 'body' : 'curl';
  const requestPreviewContent =
    activeRequestPreview === 'body' && requestBody
      ? stringify(requestBody)
      : curl;
  const requestPreviewTitle =
    activeRequestPreview === 'body' ? 'JSON Body' : 'cURL';
  const responseExample = buildResponseExample(
    selectedEndpoint.id,
    selectedModel
  );

  async function copy(text: string, target: CopyTarget) {
    await navigator.clipboard.writeText(text);
    setCopied(target);
    window.setTimeout(() => setCopied(''), 1400);
  }

  async function loadModels(options: { showResult?: boolean } = {}) {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setModelsError('请先填入你的 API Key，再获取模型列表。');
      return [];
    }

    setModelsLoading(true);
    setModelsError('');

    try {
      const response = await fetch('/api/playground', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: trimmedKey,
          endpoint: 'models',
        }),
      });

      const data = (await response.json()) as PlaygroundResponse;
      if (options.showResult) setResult(data);

      if (!data.ok) {
        setModelsError(`模型列表返回 ${data.status}，请检查 Key 是否可用。`);
        return [];
      }

      const ids = extractModelIds(data.data);
      if (ids.length === 0) {
        setModelsError('模型列表请求成功，但没有解析到可用模型 ID。');
        return [];
      }

      setAvailableModels(ids);
      setModel((current) =>
        current && ids.includes(current) ? current : ids[0]
      );
      return ids;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '获取模型列表失败，请稍后重试。';
      setModelsError(message);
      return [];
    } finally {
      setModelsLoading(false);
    }
  }

  async function runRequest() {
    if (!runnableId) {
      setError('这个条目是文档入口，不能直接发送请求。');
      return;
    }

    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError('请先填入你的 API Key。');
      return;
    }

    let requestModel = model || availableModels[0] || '';
    if (selectedEndpoint.method === 'POST' && !requestModel) {
      const ids = await loadModels();
      requestModel = ids[0] || '';

      if (!requestModel) {
        setError('请先通过 /v1/models 获取可用模型，再发送请求。');
        return;
      }
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/playground', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: trimmedKey,
          endpoint: runnableId,
          model: requestModel,
          prompt,
        }),
      });

      const data = (await response.json()) as PlaygroundResponse;
      setResult(data);

      if (runnableId === 'models') {
        const ids = extractModelIds(data.data);
        if (ids.length > 0) {
          setAvailableModels(ids);
          setModel((current) =>
            current && ids.includes(current) ? current : ids[0]
          );
        }
      }

      if (!data.ok) {
        setError(`请求返回 ${data.status}，请检查 Key、模型或接口兼容性。`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="apifox-playground min-h-screen bg-[#f6f7fb] text-[#20242c]">
      <header className="sticky top-0 z-30 border-b border-[#e7e9f0] bg-white">
        <div className="flex h-14 items-center justify-between px-5">
          <div className="flex items-center gap-8">
            <Link href="/zh" className="flex items-center gap-2 font-semibold">
              <span className="grid size-7 place-items-center rounded-md bg-[#0891b2] text-sm font-bold text-white">
                K
              </span>
              <span>小恐龙 API</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-[#5c6270] md:flex">
              <Link href="/zh">首页</Link>
              <Link
                href="/zh/playground"
                className="font-medium text-[#0891b2]"
              >
                Apifox 操练场
              </Link>
              <Link href="/zh/docs">文档</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/zh/docs/apps"
              className="hidden rounded-md border border-[#d9dce6] px-3 py-1.5 text-sm text-[#4d5565] md:inline-flex"
            >
              客户端教程
            </Link>
            <Link
              href="/zh/docs/api"
              className="rounded-md bg-[#0891b2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0e7490]"
            >
              AI 模型接口
            </Link>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-[292px_minmax(0,1fr)] xl:grid-cols-[292px_minmax(560px,1fr)_400px]">
        <aside className="apifox-scrollbar border-r border-[#e4e7ef] bg-white lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:overflow-y-auto">
          <div className="border-b border-[#eef0f5] p-4">
            <div className="flex h-9 items-center gap-2 rounded-md border border-[#dfe2eb] bg-[#f9fafc] px-3 text-sm text-[#8a91a3]">
              <Search className="size-4" />
              <span>搜索接口或教程</span>
            </div>
          </div>
          <div className="p-3">
            {endpointGroups.map((group) => (
              <div key={group.title} className="mb-3">
                <button className="mb-1 flex w-full items-center justify-between px-2 py-2 text-xs font-semibold text-[#7b8292]">
                  <span>{group.title}</span>
                  <ChevronDown className="size-3.5" />
                </button>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id);
                        setError('');
                        setResult(null);
                      }}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                        selectedEndpoint.id === item.id
                          ? 'bg-[#e6f7fb] text-[#0891b2]'
                          : 'text-[#424957] hover:bg-[#f7f8fb]'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1',
                          methodClass(item.method)
                        )}
                      >
                        {item.method}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-[#9aa1b1]">
                          {item.path}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0 bg-white">
          <div className="border-b border-[#e7e9f0] px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded px-2 py-1 text-xs font-semibold ring-1',
                      methodClass(selectedEndpoint.method)
                    )}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <code className="rounded bg-[#f4f6fb] px-2 py-1 text-sm text-[#4f5666]">
                    {selectedEndpoint.path}
                  </code>
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-normal text-[#171a21]">
                  {selectedEndpoint.title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5d6575]">
                  {selectedEndpoint.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(window.location.href, 'page')}
                className="inline-flex items-center gap-2 rounded-md border border-[#d9dce6] bg-white px-3 py-2 text-sm text-[#4d5565] hover:bg-[#f7f8fb]"
              >
                {copied === 'page' ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Clipboard className="size-4" />
                )}
                {copied === 'page' ? '已复制' : '复制页面'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-6">
            <section className="order-3 rounded-lg border border-[#e6e8ef] bg-white">
              <div className="flex items-center gap-2 border-b border-[#edf0f5] px-4 py-3">
                <Server className="size-4 text-[#0891b2]" />
                <h2 className="text-sm font-semibold">接口信息</h2>
              </div>
              <div className="grid gap-0 text-sm md:grid-cols-2">
                {[
                  ['默认接口地址', 'https://api.klong.lat', Server],
                  ['OpenAI Base URL', 'https://api.klong.lat/v1', KeyRound],
                  ['认证方式', 'Bearer Token', Settings2],
                  ['内容类型', 'application/json', FileJson],
                ].map(([label, value, Icon], index) => (
                  <div
                    key={label as string}
                    className={cn(
                      'p-4',
                      index > 0 &&
                        'border-t border-[#edf0f5] md:border-t-0 md:border-l'
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs text-[#858d9f]">
                      <Icon className="size-3.5" />
                      {label as string}
                    </div>
                    <div className="mt-2 font-medium break-all text-[#303643]">
                      {value as string}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="order-4 rounded-lg border border-[#e6e8ef] bg-white">
              <div className="flex items-center gap-2 border-b border-[#edf0f5] px-4 py-3">
                <BookOpenText className="size-4 text-[#0891b2]" />
                <h2 className="text-sm font-semibold">请求参数</h2>
              </div>
              <div className="apifox-scrollbar overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-[#fafbfe] text-xs text-[#7a8294]">
                    <tr>
                      <th className="px-4 py-3 font-medium">参数名</th>
                      <th className="px-4 py-3 font-medium">位置</th>
                      <th className="px-4 py-3 font-medium">类型</th>
                      <th className="px-4 py-3 font-medium">必填</th>
                      <th className="px-4 py-3 font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f5]">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">
                        Authorization
                      </td>
                      <td className="px-4 py-3">Header</td>
                      <td className="px-4 py-3">string</td>
                      <td className="px-4 py-3">是</td>
                      <td className="px-4 py-3 text-[#5f6878]">
                        Bearer sk-your-api-key
                      </td>
                    </tr>
                    {selectedEndpoint.method === 'POST' && (
                      <>
                        <tr>
                          <td className="px-4 py-3 font-mono text-xs">model</td>
                          <td className="px-4 py-3">Body</td>
                          <td className="px-4 py-3">string</td>
                          <td className="px-4 py-3">是</td>
                          <td className="px-4 py-3 text-[#5f6878]">
                            模型 ID，从 /v1/models 返回值选择
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-xs">
                            {selectedEndpoint.id === 'responses'
                              ? 'input'
                              : selectedEndpoint.id === 'embeddings'
                                ? 'input'
                                : 'messages'}
                          </td>
                          <td className="px-4 py-3">Body</td>
                          <td className="px-4 py-3">
                            {selectedEndpoint.id === 'chat'
                              ? 'array'
                              : 'string'}
                          </td>
                          <td className="px-4 py-3">是</td>
                          <td className="px-4 py-3 text-[#5f6878]">
                            请求输入内容
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="order-1 overflow-hidden rounded-lg border border-[#d8edf3] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f5] bg-[#fbfdff] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Play className="size-4 text-[#0891b2]" />
                  <h2 className="text-sm font-semibold">在线调试</h2>
                  <span className="rounded bg-[#e6f7fb] px-2 py-0.5 text-xs text-[#087990]">
                    {selectedEndpoint.method}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={runRequest}
                  disabled={loading || !runnableId}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#0891b2] px-3 text-sm font-medium text-white hover:bg-[#0e7490] disabled:cursor-not-allowed disabled:bg-[#8fd7e5]"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  发送请求
                </button>
              </div>

              <div className="grid border-b border-[#edf0f5] bg-[#f8fcfe] text-xs text-[#697184] sm:grid-cols-3">
                <div className="border-b border-[#edf0f5] px-4 py-3 sm:border-r sm:border-b-0">
                  <div className="mb-1 text-[#8a91a3]">Base URL</div>
                  <div className="font-mono text-[#303643]">
                    https://api.klong.lat
                  </div>
                </div>
                <div className="border-b border-[#edf0f5] px-4 py-3 sm:border-r sm:border-b-0">
                  <div className="mb-1 text-[#8a91a3]">Endpoint</div>
                  <div className="font-mono text-[#303643]">
                    {selectedEndpoint.path}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="mb-1 text-[#8a91a3]">Auth</div>
                  <div className="font-mono text-[#303643]">Bearer Token</div>
                </div>
              </div>

              <div className="grid gap-0 2xl:grid-cols-[minmax(280px,0.9fr)_minmax(360px,1.1fr)]">
                <div className="space-y-4 p-4">
                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-[#697184]">
                      API Key
                    </span>
                    <div className="flex gap-2">
                      <input
                        value={apiKey}
                        onChange={(event) => {
                          setApiKey(event.target.value);
                          setModelsError('');
                        }}
                        placeholder="sk-your-api-key"
                        type="password"
                        className="h-10 min-w-0 flex-1 rounded-md border border-[#dfe2eb] bg-white px-3 text-sm outline-none focus:border-[#0891b2]"
                      />
                      <button
                        type="button"
                        onClick={() => loadModels({ showResult: true })}
                        disabled={modelsLoading}
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-[#c9e8ef] bg-[#e6f7fb] px-3 text-xs font-medium text-[#0891b2] hover:bg-[#d7f1f7] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {modelsLoading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Server className="size-3.5" />
                        )}
                        获取模型
                      </button>
                    </div>
                  </label>

                  {selectedEndpoint.method === 'GET' && (
                    <div className="rounded-md border border-[#d8edf3] bg-[#f5fbfd] px-3 py-2 text-sm leading-6 text-[#4f6670]">
                      GET 接口不需要请求 Body，填入 API Key 后可以直接发送。
                    </div>
                  )}

                  {selectedEndpoint.method === 'POST' && (
                    <>
                      <label className="grid gap-2">
                        <span className="flex items-center justify-between gap-2 text-xs font-medium text-[#697184]">
                          <span>模型</span>
                          {availableModels.length > 0 && (
                            <span className="font-normal text-[#9aa1b1]">
                              来自 /v1/models，共 {availableModels.length} 个
                            </span>
                          )}
                        </span>
                        <select
                          value={model}
                          onChange={(event) => setModel(event.target.value)}
                          disabled={
                            modelsLoading || availableModels.length === 0
                          }
                          className="h-10 rounded-md border border-[#dfe2eb] bg-white px-3 text-sm outline-none focus:border-[#0891b2]"
                        >
                          {availableModels.length === 0 && (
                            <option value="">先获取模型列表</option>
                          )}
                          {availableModels.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        {modelsError && (
                          <span className="text-xs leading-5 text-red-600">
                            {modelsError}
                          </span>
                        )}
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-medium text-[#697184]">
                          输入
                        </span>
                        <textarea
                          value={prompt}
                          onChange={(event) => setPrompt(event.target.value)}
                          rows={5}
                          className="min-h-28 rounded-md border border-[#dfe2eb] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#0891b2]"
                        />
                      </label>
                    </>
                  )}

                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#edf0f5] bg-[#fbfcff] p-4 2xl:border-t-0 2xl:border-l">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Code2 className="size-4 text-[#0891b2]" />
                        请求预览
                      </div>
                      <div className="mt-1 text-xs text-[#8a91a3]">
                        当前展示：{requestPreviewTitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-md border border-[#dfe2eb] bg-white p-1">
                        <button
                          type="button"
                          onClick={() =>
                            requestBody && setRequestPreview('body')
                          }
                          disabled={!requestBody}
                          className={cn(
                            'inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium',
                            activeRequestPreview === 'body'
                              ? 'bg-[#e6f7fb] text-[#087990]'
                              : 'text-[#697184] hover:bg-[#f4f6fb]',
                            !requestBody && 'cursor-not-allowed opacity-40'
                          )}
                        >
                          <Code2 className="size-3.5" />
                          Body
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequestPreview('curl')}
                          className={cn(
                            'inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium',
                            activeRequestPreview === 'curl'
                              ? 'bg-[#e6f7fb] text-[#087990]'
                              : 'text-[#697184] hover:bg-[#f4f6fb]'
                          )}
                        >
                          <TerminalSquare className="size-3.5" />
                          cURL
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copy(requestPreviewContent, activeRequestPreview)
                        }
                        className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[#5d6575] hover:bg-[#edf2f7]"
                      >
                        {copied === activeRequestPreview ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                        {copied === activeRequestPreview ? '已复制' : '复制'}
                      </button>
                    </div>
                  </div>
                  <pre className="apifox-scrollbar apifox-code-block max-h-[360px] min-h-64 overflow-auto rounded-md border border-[#d9e8ef] p-3 text-xs leading-5 text-[#303643]">
                    <code>{requestPreviewContent}</code>
                  </pre>
                </div>
              </div>
            </section>

            <section className="order-2 rounded-lg border border-[#e6e8ef] bg-white">
              <div className="flex items-center gap-2 border-b border-[#edf0f5] px-4 py-3">
                <Braces className="size-4 text-[#0891b2]" />
                <h2 className="text-sm font-semibold">返回示例</h2>
              </div>
              <pre className="apifox-scrollbar apifox-code-block max-h-[360px] overflow-auto p-4 text-xs leading-6 text-[#303643]">
                <code>{stringify(responseExample)}</code>
              </pre>
            </section>
          </div>
        </section>

        <aside className="apifox-scrollbar border-l border-[#e4e7ef] bg-[#fbfcff] xl:sticky xl:top-14 xl:h-[calc(100vh-56px)] xl:overflow-y-auto">
          <div className="border-b border-[#e7e9f0] bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">响应结果</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#81899b]">
                  <Circle
                    className={cn(
                      'size-2 fill-current',
                      result?.ok ? 'text-cyan-500' : 'text-[#b7bdca]'
                    )}
                  />
                  {result ? `HTTP ${result.status}` : 'Ready'}
                </div>
              </div>
              <List className="size-4 text-[#0891b2]" />
            </div>
          </div>

          <div className="space-y-4 p-4">
            <section className="overflow-hidden rounded-lg border border-[#e1e5ee] bg-white">
              <div className="flex items-center gap-2 border-b border-[#edf0f5] px-3 py-2 text-sm font-semibold">
                <List className="size-4 text-[#0891b2]" />
                Response
              </div>
              {assistantOutput ? (
                <div className="bg-[#fbfcff] p-3">
                  <div className="mb-2 text-xs font-medium text-[#697184]">
                    模型回复
                  </div>
                  <div className="rounded-md border border-[#d9eef4] bg-white p-3 text-sm leading-6 whitespace-pre-wrap text-[#303643]">
                    {assistantOutput}
                  </div>
                </div>
              ) : responseModelIds.length > 0 ? (
                <div className="bg-[#fbfcff] p-3">
                  <div className="mb-2 text-xs font-medium text-[#697184]">
                    可用模型
                  </div>
                  <div className="apifox-scrollbar flex max-h-48 flex-wrap gap-1.5 overflow-auto">
                    {responseModelIds.map((id) => (
                      <span
                        key={id}
                        className="rounded border border-[#c9e8ef] bg-[#e6f7fb] px-2 py-1 text-xs text-[#087990]"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              ) : responseError ? (
                <div className="bg-red-50 p-3">
                  <div className="mb-2 text-xs font-medium text-red-700">
                    请求错误
                  </div>
                  <div className="rounded-md border border-red-200 bg-white p-3 text-sm leading-6 text-red-700">
                    {responseError}
                  </div>
                </div>
              ) : (
                <div className="min-h-36 p-3 text-sm leading-6 text-[#7d8596]">
                  发送请求后，这里会优先显示模型回复。需要排查时，可以展开下面的原始响应。
                </div>
              )}
              {result && (
                <details className="border-t border-[#edf0f5]">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-medium text-[#697184] hover:bg-[#f7f9fc]">
                    <span>查看原始 JSON</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        copy(stringify(result.data), 'raw');
                      }}
                      className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[#5d6575] hover:bg-[#edf2f7]"
                    >
                      {copied === 'raw' ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copied === 'raw' ? '已复制' : '复制'}
                    </button>
                  </summary>
                  <pre className="apifox-scrollbar apifox-code-block max-h-80 overflow-auto border-t border-[#edf0f5] p-3 text-xs leading-5 text-[#303643]">
                    <code>{stringify(result.data)}</code>
                  </pre>
                </details>
              )}
            </section>

            <div className="pb-3 text-center text-xs text-[#9aa1b1]">
              Built for 小恐龙 API
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
