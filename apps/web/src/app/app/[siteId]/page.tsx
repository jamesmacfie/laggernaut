import { Suspense } from 'react';
import { getSite } from '../_actions/sites';
import { Skeleton, Button } from 'ui';
import PageList from './_components/pageList';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
  params: {
    siteId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  let site;
  try {
    site = await getSite(params.siteId);
  } catch (error) {
    notFound();
  }

  return (
    <section className='pt-3 pb-4 space-y-3 md:pb-5 md:pt-5 lg:py-24'>
      <div className='container flex max-w-[64rem] flex-col items-center gap-4'>
        <div className='w-full'>
          <Link
            href='/app'
            className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
          >
            <ChevronLeft className='w-4 h-4 mr-1' />
            Back to Sites
          </Link>
          <h1 className='text-3xl font-bold tracking-tight'>
            {site.name || site.url}
          </h1>
          <p className='text-muted-foreground'>
            {site.state === 'pending'
              ? 'Scanning site...'
              : `Found ${site.pages?.length || 0} pages`}
          </p>
        </div>
        <Suspense fallback={<Skeleton className='w-full h-[400px]' />}>
          <PageList site={site} />
        </Suspense>
      </div>
    </section>
  );
};

export default Page;
