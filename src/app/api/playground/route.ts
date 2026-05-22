import { z } from 'zod';

export const runtime = 'edge';

const requestSchema = z.object({
  apiKey: z.string().min(1),
  endpoint: z.enum(['models', 'chat', 'responses', 'embeddings']),
  model: z.string().optional(),
  prompt: z.string().optional(),
  requestBody: z.unknown().optional(),
});

const endpointConfig = {
  models: {
    method: 'GET',
    path: '/models',
  },
  chat: {
    method: 'POST',
    path: '/chat/completions',
  },
  responses: {
    method: 'POST',
    path: '/responses',
  },
  embeddings: {
    method: 'POST',
    path: '/embeddings',
  },
} as const;

function buildBody(
  endpoint: keyof typeof endpointConfig,
  model: string,
  prompt = '用三句话介绍小恐龙 API 的接入方式。'
) {
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
  };
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return Response.json(
      {
        status: 400,
        ok: false,
        data: {
          error: 'Invalid JSON',
          message: '请求体必须是合法 JSON。',
        },
      },
      { status: 400 }
    );
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        status: 400,
        ok: false,
        data: {
          error: 'Invalid playground request',
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const { apiKey, endpoint, model, prompt, requestBody } = parsed.data;
  const config = endpointConfig[endpoint];
  const requestModel = model ?? '';

  if (config.method === 'POST' && requestBody === undefined && !requestModel) {
    return Response.json(
      {
        status: 400,
        ok: false,
        data: {
          error: 'Missing model',
          message: '请先通过 /v1/models 获取可用模型，再选择模型发送请求。',
        },
      },
      { status: 400 }
    );
  }

  const upstreamBody =
    config.method === 'POST'
      ? (requestBody ?? buildBody(endpoint, requestModel, prompt))
      : undefined;

  const upstream = await fetch(`https://api.klong.lat/v1${config.path}`, {
    method: config.method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: upstreamBody === undefined ? undefined : JSON.stringify(upstreamBody),
  });

  const text = await upstream.text();
  let data: unknown = text;

  try {
    data = JSON.parse(text);
  } catch {
    data = { text };
  }

  return Response.json(
    {
      status: upstream.status,
      ok: upstream.ok,
      data,
    },
    { status: upstream.ok ? 200 : upstream.status }
  );
}
