import Link from 'next/link';
import { getLocalePath } from '@/lib/i18n';

interface FooterProps {
  lang: string;
}

// ============================================
// Shared Data (same across all languages)
// ============================================
const socialLinks: { name: string; href: string; icon: React.ReactNode }[] = [];

// External links (same labels across all languages)
const relatedProjects: { label: string; href: string }[] = [
  { label: 'Claude Code', href: 'https://claude.ai/code' },
  { label: 'OpenAI Codex', href: 'https://openai.com/codex' },
  { label: 'Cherry Studio', href: 'https://cherry-ai.com' },
];

const friendshipLinks: { label: string; href: string }[] = [
  { label: 'AionUi', href: 'https://www.aionui.com' },
  { label: 'OpenClaw', href: 'https://openclaw.ai' },
  { label: 'CC Switch', href: 'https://github.com/farion1231/cc-switch' },
];

// ============================================
// Internal link paths (only labels need translation)
// ============================================
const internalPaths = {
  aboutProject: 'docs/concepts',
  features: 'docs/developer',
  userGuide: 'docs/user-guide',
  appGuide: 'docs/apps',
  apiDocs: 'docs/api',
} as const;

// ============================================
// Translations (only text that differs by language)
// ============================================
interface FooterTranslation {
  sections: {
    about: {
      title: string;
      aboutProject: string;
      features: string;
    };
    docs: {
      title: string;
      appGuide: string;
      userGuide: string;
      apiDocs: string;
    };
    relatedProjects: string;
    friendshipLinks: string;
  };
  copyright: string;
}

const translations: Record<string, FooterTranslation> = {
  zh: {
    sections: {
      about: {
        title: '小恐龙 API',
        aboutProject: '基础概念',
        features: '开发者接入',
      },
      docs: {
        title: '文档',
        appGuide: '客户端教程',
        userGuide: '用户指南',
        apiDocs: 'AI 模型接口',
      },
      relatedProjects: '相关项目',
      friendshipLinks: '友情链接',
    },
    copyright: '© 2026 小恐龙 API. All Rights Reserved.',
  },
};

// ============================================
// Build sections from translations
// ============================================
function buildSections(t: FooterTranslation) {
  return [
    {
      title: t.sections.about.title,
      links: [
        {
          label: t.sections.about.aboutProject,
          href: internalPaths.aboutProject,
        },
        { label: t.sections.about.features, href: internalPaths.features },
      ],
    },
    {
      title: t.sections.docs.title,
      links: [
        {
          label: t.sections.docs.userGuide,
          href: internalPaths.userGuide,
        },
        { label: t.sections.docs.appGuide, href: internalPaths.appGuide },
        { label: t.sections.docs.apiDocs, href: internalPaths.apiDocs },
      ],
    },
    {
      title: t.sections.relatedProjects,
      links: relatedProjects.map((p) => ({ ...p, external: true })),
    },
    {
      title: t.sections.friendshipLinks,
      links: friendshipLinks.map((p) => ({ ...p, external: true })),
    },
  ];
}

// ============================================
// Footer Component
// ============================================
export function Footer({ lang }: FooterProps) {
  const t = translations[lang] || translations.zh;
  const sections = buildSections(t);

  return (
    <footer className="border-fd-border bg-fd-card/30 mt-auto border-t backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        {/* Top: Links Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-fd-foreground mb-4 text-sm font-semibold">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fd-muted-foreground hover:text-fd-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={getLocalePath(lang, link.href)}
                        className="text-fd-muted-foreground hover:text-fd-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: Copyright and Social */}
        <div className="border-fd-border flex flex-col items-start justify-between gap-4 border-t pt-8 sm:flex-row sm:items-center">
          {/* Left: Copyright */}
          <div className="text-fd-muted-foreground flex flex-col gap-2 text-xs">
            <p>{t.copyright}</p>
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const isExternal = social.href.startsWith('http');
              const Component = isExternal ? 'a' : Link;
              return (
                <Component
                  key={social.name}
                  href={
                    isExternal ? social.href : getLocalePath(lang, social.href)
                  }
                  {...(isExternal && {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  })}
                  className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </Component>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
