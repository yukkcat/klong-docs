import { i18n } from '@/lib/i18n';
import Image from 'next/image';
import type { LinkItemType } from 'fumadocs-ui/layouts/docs';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const linkItems: LinkItemType[] = [];

export const logo = (
  <Image
    alt="小恐龙 API"
    src="/assets/klong.svg"
    width={20}
    height={20}
    className="size-5"
    priority
    unoptimized
  />
);

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    i18n,
    nav: {
      title: (
        <>
          {logo}
          <span className="font-medium in-[header]:text-[15px] [.uwu_&]:hidden">
            小恐龙 API
          </span>
        </>
      ),
    },
  };
}
