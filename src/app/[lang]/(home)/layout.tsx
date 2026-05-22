import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions, linkItems } from '@/lib/layout.shared';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';
import { Footer } from '@/components/footer';
import Link from 'fumadocs-core/link';
import {
  BookOpen,
  CircleUserRound,
  FileCode,
  KeyRound,
  PlaySquare,
  Rocket,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { getLocalePath } from '@/lib/i18n';

const NAV_ITEMS = [
  { key: 'concepts', icon: BookOpen, path: '/concepts' },
  { key: 'start', icon: Rocket, path: '/developer/quickstart' },
  { key: 'userGuide', icon: CircleUserRound, path: '/user-guide' },
  { key: 'auth', icon: KeyRound, path: '/developer/authentication' },
  { key: 'api', icon: FileCode, path: '/api' },
  { key: 'playground', icon: PlaySquare, path: 'playground' },
  { key: 'apps', icon: Sparkles, path: '/apps' },
] as const;

const i18nText: Record<
  string,
  Record<string, { text: string; desc: string }>
> = {
  zh: {
    title: { text: '文档', desc: '' },
    apiReference: { text: 'AI 模型接口', desc: '' },
    concepts: {
      text: '基础概念',
      desc: '先理解 URL、Key、模型、Token 和客户端。',
    },
    start: { text: '快速开始', desc: '5 分钟跑通第一次模型调用。' },
    userGuide: {
      text: '用户指南',
      desc: '令牌、定价、用量记录和配额充值。',
    },
    auth: { text: '地址与鉴权', desc: 'Base URL、Bearer Token 和环境变量。' },
    api: { text: 'AI 模型接口', desc: 'Chat、Responses、Models 等模型接口。' },
    playground: {
      text: 'API 操练场',
      desc: '在线发送请求，查看真实返回结果。',
    },
    apps: {
      text: '客户端教程',
      desc: 'Claude Code、Codex CLI、AionUi、Cherry Studio 等接入教程。',
    },
  },
};

const getTexts = (lang: string) => i18nText[lang] || i18nText.zh;

const buildNavItems = (lang: string, docsUrl: string) => {
  const texts = getTexts(lang);
  return NAV_ITEMS.map(({ key, icon: Icon, path }) => ({
    text: texts[key].text,
    desc: texts[key].desc,
    url: path.startsWith('/') ? `${docsUrl}${path}` : getLocalePath(lang, path),
    Icon,
  }));
};

function MenuLinkItem({
  item,
  className,
}: {
  item: { text: string; desc: string; url: string; Icon: LucideIcon };
  className?: string;
}) {
  const { Icon, text, desc, url } = item;
  return (
    <NavbarMenuLink href={url} className={className}>
      <Icon className="bg-fd-primary text-fd-primary-foreground mb-2 rounded-md p-1" />
      <p className="font-medium">{text}</p>
      <p className="text-fd-muted-foreground text-sm">{desc}</p>
    </NavbarMenuLink>
  );
}

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  const texts = getTexts(lang);
  const docsUrl = getLocalePath(lang, 'docs');
  const navItems = buildNavItems(lang, docsUrl);
  const apiReferenceUrl = getLocalePath(lang, 'docs/api');

  return (
    <div className="flex min-h-screen flex-col">
      <HomeLayout
        {...baseOptions(lang)}
        links={[
          {
            type: 'menu',
            on: 'menu',
            text: texts.title.text,
            items: navItems.map(({ text, url, Icon }) => ({
              text,
              url,
              icon: <Icon />,
            })),
          },
          {
            type: 'main',
            on: 'menu',
            text: texts.apiReference.text,
            url: apiReferenceUrl,
            icon: <FileCode />,
          },
          {
            type: 'main',
            on: 'menu',
            text: texts.playground.text,
            url: getLocalePath(lang, 'playground'),
            icon: <PlaySquare />,
          },
          {
            type: 'custom',
            on: 'nav',
            children: (
              <NavbarMenu>
                <NavbarMenuTrigger>
                  <Link href={docsUrl}>{texts.title.text}</Link>
                </NavbarMenuTrigger>
                <NavbarMenuContent className="text-[15px]">
                  <NavbarMenuLink
                    href={getLocalePath(lang, 'docs/developer/quickstart')}
                    className="overflow-hidden p-0 md:row-span-2"
                  >
                    <div className="relative h-52 overflow-hidden border-b bg-gradient-to-br from-sky-50 via-cyan-50 to-fuchsia-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950">
                      <img
                        src="/assets/header.webp"
                        alt="小恐龙 API 首页预览"
                        className="h-full w-full object-cover object-top"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-fd-card to-transparent" />
                    </div>
                    <div className="p-4">
                      <p className="font-medium">{navItems[1].text}</p>
                      <p className="text-fd-muted-foreground text-sm">
                        {navItems[1].desc}
                      </p>
                    </div>
                  </NavbarMenuLink>
                  <MenuLinkItem item={navItems[0]} className="lg:col-start-2" />
                  <MenuLinkItem item={navItems[2]} className="lg:col-start-2" />
                  <MenuLinkItem
                    item={navItems[3]}
                    className="lg:col-start-3 lg:row-start-1"
                  />
                  <MenuLinkItem
                    item={navItems[4]}
                    className="lg:col-start-3 lg:row-start-2"
                  />
                  <MenuLinkItem
                    item={navItems[5]}
                    className="lg:col-start-4 lg:row-start-1"
                  />
                  <MenuLinkItem
                    item={navItems[6]}
                    className="lg:col-start-4 lg:row-start-2"
                  />
                </NavbarMenuContent>
              </NavbarMenu>
            ),
          },
          {
            type: 'main',
            on: 'nav',
            text: texts.apiReference.text,
            url: apiReferenceUrl,
          },
          {
            type: 'main',
            on: 'nav',
            text: texts.playground.text,
            url: getLocalePath(lang, 'playground'),
          },
          ...linkItems,
        ]}
        className="flex-1 dark:bg-neutral-950 dark:[--color-fd-background:var(--color-neutral-950)]"
      >
        {children}
      </HomeLayout>
      <Footer lang={lang} />
    </div>
  );
}
