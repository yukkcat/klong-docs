import type { Viewport, Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.klong.lat'),
  title: {
    default: '小恐龙 API 文档',
    template: '%s - 小恐龙 API 文档',
  },
  description: '小恐龙 API 接入文档、模型列表、客户端教程和接口参考。',
  other: {
    charset: 'utf-8',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#fff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
