import { Suspense } from 'react';
import { getSite } from '../../_actions/sites';
import { getLatestPagePerformance } from './_actions/pagePerformance';
import { Skeleton } from 'ui';
import PerformanceStats from './_components/performanceStats';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
  params: {
    siteId: string;
    pageId: string;
  };
}

interface Page {
  id: string;
  url: string;
  name: string | null;
}

const Page = async ({ params }: PageProps) => {
  let site;
  let performanceData;
  try {
    site = await getSite(params.siteId);
    performanceData = await getLatestPagePerformance(params.pageId);
  } catch (error) {
    notFound();
  }

  const page = site.pages.find((p: Page) => p.id === params.pageId);
  if (!page) {
    notFound();
  }

  return (
    <section className='pt-3 pb-4 space-y-3 md:pb-5 md:pt-5 lg:py-24'>
      <div className='container flex max-w-[64rem] flex-col items-center gap-4'>
        <div className='w-full'>
          <Link
            href={`/app/${site.id}`}
            className='inline-flex items-center mb-4 text-sm text-muted-foreground hover:text-foreground'
          >
            <ChevronLeft className='mr-1 w-4 h-4' />
            Back to Site
          </Link>
          <h1 className='text-3xl font-bold tracking-tight'>
            {page.name || page.url}
          </h1>
          <p className='text-muted-foreground'>
            Performance metrics for this page
          </p>
        </div>
        <Suspense fallback={<Skeleton className='w-full h-[400px]' />}>
          <PerformanceStats data={performanceData} />
        </Suspense>
      </div>
    </section>
  );
};

export default Page;
