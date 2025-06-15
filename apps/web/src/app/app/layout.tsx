import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppNavBar } from '../../components/layouts/AppNavbar';
import { getCurrentUser } from './_actions/user';

const AppLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  if (!user) return redirect('/auth/login');

  return (
    <div className='flex flex-col min-h-screen'>
      <header className='container'>
        <AppNavBar />
      </header>
      <main className='flex-1'>
        <div className='flex items-center justify-between max-w-6xl py-4 mx-auto md:py-6'>
          <div className='w-full'>{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
