import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppSidebar } from '../../components/layouts/AppSidebar';
import { getCurrentUser } from './_actions/user';

const AppLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  if (!user) return redirect('/auth/login');

  return (
    <div className='flex min-h-screen'>
      <div className='p-4 w-64 bg-card border-r'>
        <AppSidebar user={user} />
      </div>
      <div className='flex-1'>
        <main className='container px-4 py-8 mx-auto'>
          <div className='w-full'>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
