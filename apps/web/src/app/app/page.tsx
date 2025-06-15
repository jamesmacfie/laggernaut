import { Suspense } from 'react';
import { getCurrentUser } from './_actions/user';
import { Skeleton } from 'ui';
import SiteList from './_components/siteList';

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <section className='pt-3 pb-4 space-y-3 md:pb-5 md:pt-5 lg:py-24'>
      <div className='container flex max-w-[64rem] flex-col items-center gap-4 text-center'>
        <Suspense fallback={<Skeleton className='w-[350px] h-[150px]' />}>
          <SiteList />
        </Suspense>
      </div>
    </section>
  );
};

export default Page;
