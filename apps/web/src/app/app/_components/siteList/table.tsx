'use client';

import { useState } from 'react';

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
  // This was here for realtime but I cannot get it working
  const [sites, _] = useState<Site[]>(initialSites);

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
