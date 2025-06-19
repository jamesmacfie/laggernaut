'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  StatePill,
} from 'ui';
import { useState } from 'react';
import Link from 'next/link';

interface Site {
  id: string;
  name: string | null;
  url: string;
  state: 'pending' | 'active' | 'inactive';
  pages: Array<{
    id: string;
    url: string;
    name: string | null;
    state: 'pending' | 'active' | 'inactive';
    thumbnail_url: string | null;
    created_at: string;
  }>;
}

interface PageListTableProps {
  site: Site;
}

const PageListTable = ({ site }: PageListTableProps) => {
  const [filter, setFilter] = useState('');

  const filteredPages =
    site.pages?.filter(page => {
      const searchStr = filter.toLowerCase();
      return (
        page.url.toLowerCase().includes(searchStr) ||
        (page.name?.toLowerCase() || '').includes(searchStr)
      );
    }) || [];

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Input
          placeholder='Filter pages...'
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className='max-w-sm'
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPages.map(page => (
            <TableRow key={page.id}>
              <TableCell className='font-medium'>
                <a
                  href={page.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  {page.url}
                </a>
              </TableCell>
              <TableCell>{page.name || '-'}</TableCell>
              <TableCell>
                <StatePill state={page.state} />
              </TableCell>
              <TableCell>
                {new Date(page.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Link
                  href={{
                    pathname: `/app/${site.id}/${page.id}`,
                  }}
                  className='text-sm text-blue-600 hover:underline'
                >
                  View Performance
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filteredPages.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className='text-center'>
                No pages found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PageListTable;
