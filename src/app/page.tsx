import { Hero } from '@/features/top-page/components/Hero';
import { TopPageContent } from '@/features/top-page/components/TopPageContent';
import { resolvePublicStoresWithVacancy } from '@/features/public-vacancy-reflection/public-store-resolver';

export default async function Home() {
  const stores = await resolvePublicStoresWithVacancy();

  return (
    <main className="min-h-screen bg-base">
      <Hero />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <TopPageContent stores={stores} />
      </div>
    </main>
  );
}
