import { Hero } from '@/features/top-page/components/Hero';
import { TopPageContent } from '@/features/top-page/components/TopPageContent';

export default function Home() {
  return (
    <main className="min-h-screen bg-base">
      <Hero />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <TopPageContent />
      </div>
    </main>
  );
}
