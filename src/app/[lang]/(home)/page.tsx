import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CircleUserRound,
  Code2,
  KeyRound,
  PlaySquare,
  Rocket,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { Hero } from './page.client';
import { getLocalePath, i18n } from '@/lib/i18n';

const highlights = [
  {
    icon: <BookOpen className="size-4" />,
    title: '先讲清楚概念',
    text: 'URL、Key、模型、Token、输入输出和客户端先解释明白。',
  },
  {
    icon: <Terminal className="size-4" />,
    title: '客户端教程',
    text: 'Claude Code、OpenAI Codex CLI、CC Switch、Cherry Studio 都有独立配置说明。',
  },
  {
    icon: <CircleUserRound className="size-4" />,
    title: '用户指南',
    text: '令牌、定价、充值、用量记录和聊天应用接入都能查到。',
  },
];

const quickLinks = [
  {
    icon: <BookOpen className="size-5" />,
    title: '基础概念',
    text: 'API Key、Base URL、模型、Token、输入输出和常见客户端。',
    href: '/zh/docs/concepts',
  },
  {
    icon: <KeyRound className="size-5" />,
    title: 'API 地址与鉴权',
    text: 'Base URL、Bearer Token、环境变量和密钥安全。',
    href: '/zh/docs/developer/authentication',
  },
  {
    icon: <Code2 className="size-5" />,
    title: 'OpenAI 兼容调用',
    text: 'Chat Completions、Responses、模型列表等常用接口。',
    href: '/zh/docs/developer/openai-compatible',
  },
  {
    icon: <CircleUserRound className="size-5" />,
    title: '用户指南',
    text: '令牌管理、使用 API、聊天应用集成、定价、使用记录和配额充值。',
    href: '/zh/docs/user-guide',
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: '模型列表与推荐',
    text: '聊天用 gpt-5.4、gpt-5.5 或 claude-opus-4-7；代码优先用 gpt-5.5 或 claude-opus-4-7。',
    href: '/zh/docs/developer/models',
  },
  {
    icon: <PlaySquare className="size-5" />,
    title: 'API 操练场',
    text: '在线发送请求，检查 Key、模型和真实接口返回。',
    href: '/zh/playground',
  },
];

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <main className="text-landing-foreground dark:text-landing-foreground-dark pb-10">
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-4">
        <div className="relative flex min-h-[620px] overflow-hidden rounded-2xl border bg-origin-border md:min-h-[680px]">
          <Hero />
          <div className="z-2 flex w-full flex-col px-5 py-10 md:p-12 lg:w-[68%]">
            <p className="border-brand/50 text-brand w-fit rounded-full border bg-white/50 px-3 py-2 text-xs font-medium backdrop-blur dark:bg-black/20">
              小恐龙 API 接入中心
            </p>
            <h1 className="leading-tighter mt-8 max-w-3xl text-4xl font-semibold tracking-normal md:text-5xl xl:text-6xl">
              把小恐龙 API
              <br />
              接进你的客户端和代码。
            </h1>
            <p className="text-fd-muted-foreground mt-6 max-w-2xl text-base leading-7 md:text-lg">
              面向客户和开发者的 API 文档站：从获取
              Key、选择模型、配置客户端，到接口调试，都按实际接入路径整理好。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={getLocalePath(lang, 'docs/concepts')}
                className="bg-brand text-brand-foreground hover:bg-brand-200 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-medium tracking-normal transition-colors"
              >
                <BookOpen className="size-4" />
                先看基础概念
              </Link>
              <Link
                href={getLocalePath(lang, 'docs/developer/quickstart')}
                className="bg-fd-background/80 text-fd-foreground hover:bg-fd-accent inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-medium tracking-normal transition-colors"
              >
                <Rocket className="size-4" />
                快速开始
              </Link>
              <Link
                href={getLocalePath(lang, 'docs/user-guide')}
                className="bg-fd-background/80 text-fd-foreground hover:bg-fd-accent inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-medium tracking-normal transition-colors"
              >
                <CircleUserRound className="size-4" />
                用户指南
              </Link>
              <Link
                href={getLocalePath(lang, 'docs/apps')}
                className="bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-medium tracking-normal transition-colors"
              >
                <Terminal className="size-4" />
                客户端教程
              </Link>
              <Link
                href={getLocalePath(lang, 'playground')}
                className="bg-fd-background/80 text-fd-foreground hover:bg-fd-accent inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-medium tracking-normal transition-colors"
              >
                <PlaySquare className="size-4" />
                API 操练场
              </Link>
            </div>
            <div className="mt-auto grid gap-3 pt-12 md:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="border-fd-border/70 bg-fd-background/70 rounded-lg border p-4 backdrop-blur"
                >
                  <div className="text-brand mb-3">{item.icon}</div>
                  <h2 className="text-fd-foreground text-sm font-semibold">
                    {item.title}
                  </h2>
                  <p className="text-fd-muted-foreground mt-2 text-sm leading-6">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-[1400px] gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="border-fd-border bg-fd-card hover:border-brand/60 group rounded-lg border p-5 transition-colors"
          >
            <div className="text-brand">{item.icon}</div>
            <h2 className="text-fd-foreground mt-4 text-base font-semibold">
              {item.title}
            </h2>
            <p className="text-fd-muted-foreground mt-2 text-sm leading-6">
              {item.text}
            </p>
            <span className="text-brand mt-4 inline-flex items-center gap-1 text-sm font-medium">
              查看文档
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
