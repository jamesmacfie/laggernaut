'use client';

import { useEffect, useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';

interface Site {
  id: string;
  url: string;
  name: string;
  state: 'pending' | 'active' | 'inactive';
  thumbnail_url: string | null;
  created_at: string;
}

interface Props {
  initialSites: Site[];
}

export default function SiteTable({ initialSites }: Props) {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [loading, setLoading] = useState(false);
  console.log(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  // const supabase = createClientComponentClient({
  //   supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  // });

  useEffect(() => {
    console.log('subscribing to sites-changes');
    // const channel = supabase
    //   .channel('sites-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'site',
    //     },
    //     payload => {
    //       console.log('payload change!', payload);
    //       if (payload.eventType === 'INSERT') {
    //         setSites(prev => [...prev, payload.new as Site]);
    //       } else if (payload.eventType === 'UPDATE') {
    //         setSites(prev =>
    //           prev.map(site =>
    //             site.id === payload.new.id ? (payload.new as Site) : site,
    //           ),
    //         );
    //       } else if (payload.eventType === 'DELETE') {
    //         setSites(prev => prev.filter(site => site.id !== payload.old.id));
    //       }
    //     },
    //   )
    //   .subscribe();

    console.log('subscribing to sites-changes');

    // const channel = supabase
    //   .channel('sites-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: 'UPDATE',
    //       schema: 'public',
    //     },
    //     payload => console.log(payload),
    //   )
    //   .subscribe();

    // return () => {
    //   console.log('unsubscribing from sites-changes');
    //   supabase.removeChannel(channel);
    // };
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-8 h-8 text-gray-500 animate-spin' />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map(site => (
          <TableRow key={site.id}>
            <TableCell className='font-medium'>
              {site.name || 'Unnamed Site'}
            </TableCell>
            <TableCell className='max-w-xs truncate'>{site.url}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  site.state === 'active'
                    ? 'bg-green-100 text-green-800'
                    : site.state === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {site.state}
              </span>
            </TableCell>
            <TableCell>
              {new Date(site.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
