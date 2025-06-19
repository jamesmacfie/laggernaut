'use client';

import { Button } from 'ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type User } from '@supabase/supabase-js';

interface Props {
  className?: string;
  user: User | null;
}

export function AppSidebar({ className, user }: Props) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Sites',
      href: '/app',
      current: pathname === '/app',
    },
    {
      name: 'Settings',
      href: '/app/settings',
      current: pathname.startsWith('/app/settings'),
    },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className='flex-1'>
        <nav className='flex flex-col flex-1'>
          <ul role='list' className='flex flex-col flex-1 gap-y-7'>
            <li>
              <ul role='list' className='-mx-2 space-y-1'>
                {navigation.map(item => (
                  <li key={item.name}>
                    <Link
                      href={item.href as any}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                        ${
                          item.current
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
      <div className='flex flex-col gap-y-2 px-2'>
        <div className='flex gap-x-4 items-center py-3 text-sm font-semibold leading-6 text-white'>
          <span className='sr-only'>Your profile</span>
          <span aria-hidden='true'>{user?.email}</span>
        </div>
        <Button variant='ghost' className='justify-start w-full' asChild>
          <Link href={'/auth/logout' as any}>Sign out</Link>
        </Button>
      </div>
    </div>
  );
}
