import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { NavBar } from '../../components/layouts/Navbar';
import { ThemeToggle } from '../../components/layouts/ThemeToggle';
import { getCurrentUser } from '../app/_actions/user';

const LandingLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  if (user) return redirect('/app');
  return (
    <div className='flex flex-col min-h-screen'>
      <header className='container'>
        <NavBar />
      </header>
      <main className='flex-1'>{children}</main>
      <footer className='container'>
        <div className='flex justify-between items-center py-4 mx-auto max-w-6xl md:py-6'>
          <p className='text-sm leading-loose text-center sm:text-left'>
            Built by le_twix.
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
