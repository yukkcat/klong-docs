'use client';

import { GrainGradient } from '@paper-design/shaders-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [showShaders, setShowShaders] = useState(false);

  useEffect(() => {
    // Apply some delay, otherwise on slower devices, it errors with uniform images not being fully loaded.
    setTimeout(() => {
      setShowShaders(true);
    }, 400);
  }, []);

  return (
    <>
      {showShaders && (
        <GrainGradient
          className="animate-fd-fade-in absolute inset-0 duration-800"
          colors={
            resolvedTheme === 'dark'
              ? ['#06B6D4', '#0EA5E9', '#14B8A6', '#1E3A8A00']
              : ['#22D3EE', '#38BDF8', '#2DD4BF', '#E0F2FE20']
          }
          colorBack="#00000000"
          softness={1}
          intensity={0.9}
          noise={0.5}
          shape="corners"
        />
      )}
      <div className="absolute hidden lg:top-[8%] lg:right-[6%] lg:block">
        <Image
          src="/assets/klong.svg"
          alt="小恐龙 API"
          width={288}
          height={288}
          className="size-32 drop-shadow-2xl sm:size-40 md:size-56 lg:size-56 xl:size-60"
          priority
        />
      </div>
      <div className="absolute right-8 bottom-8 hidden w-[340px] xl:right-12 xl:bottom-10 xl:block 2xl:w-[360px]">
        <div className="overflow-hidden rounded-lg border border-white/15 bg-slate-950/90 font-mono shadow-2xl ring-1 shadow-sky-950/20 ring-sky-200/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
            <span className="size-2.5 rounded-full bg-sky-400/90" />
            <span className="size-2.5 rounded-full bg-cyan-300/90" />
            <span className="size-2.5 rounded-full bg-teal-400/90" />
            <span className="ml-2 text-xs text-slate-400">
              chat/completions
            </span>
            <span className="ml-auto rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-medium text-cyan-100">
              OpenAI compatible
            </span>
          </div>
          <div className="px-3.5 py-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="rounded bg-cyan-400/12 px-2 py-1 font-semibold text-cyan-200">
                POST
              </span>
              <span>/v1/chat/completions</span>
            </div>
            <pre className="mt-3 overflow-hidden text-[11px] leading-5 text-slate-300">
              <code>
                curl https://api.klong.lat/v1/chat/completions \{'\n'}
                {'  '}-H{' '}
                <span className="text-cyan-200">
                  &apos;Authorization: Bearer sk-...&apos;
                </span>{' '}
                \{'\n'}
                {'  '}-H{' '}
                <span className="text-cyan-200">
                  &apos;Content-Type: application/json&apos;
                </span>{' '}
                \{'\n'}
                {'  '}-d &apos;&#123;
                <span className="text-slate-500"> </span>
                &quot;model&quot;:{' '}
                <span className="text-cyan-200">&apos;gpt-5.5&apos;</span>,
                {'\n'}
                {'    '}&quot;messages&quot;: [&#123; &quot;role&quot;:{' '}
                <span className="text-cyan-200">&apos;user&apos;</span>,
                &quot;content&quot;:{' '}
                <span className="text-cyan-200">&apos;Hello&apos;</span> &#125;]
                {'\n'}
                {'  '}&#125;&apos;
              </code>
            </pre>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 px-3.5 py-2 text-[11px] text-slate-400">
            <span className="mr-auto">Authorization: Bearer sk-...</span>
            <span className="rounded border border-white/10 px-1.5 py-0.5 text-slate-300">
              gpt-5.5
            </span>
            <span className="rounded border border-white/10 px-1.5 py-0.5 text-slate-300">
              claude-opus-4-7
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
