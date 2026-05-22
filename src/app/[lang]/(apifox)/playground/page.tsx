import { i18n } from '@/lib/i18n';
import { PlaygroundClient } from './playground.client';

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}

export async function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
