'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  StatePill,
} from 'ui';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

interface Site {
  id: string;
  url: string;
  name: string | null;
  state: 'pending' | 'active' | 'inactive';
  created_at: string;
}

interface SiteTableProps {
  sites: Site[];
}

const SiteTable = ({ sites }: SiteTableProps) => {
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const filteredSites = sites.filter(site => {
    const searchStr = filter.toLowerCase();
    return (
      site.url.toLowerCase().includes(searchStr) ||
      (site.name?.toLowerCase() || '').includes(searchStr)
    );
  });

  const pageCount = Math.ceil(filteredSites.length / pageSize);
  const paginatedSites = filteredSites.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  return (
    <div className='pb-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-1 items-center space-x-2'>
          <Input
            placeholder='Filter sites...'
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[40%] text-left'>URL</TableHead>
              <TableHead className='w-[30%] text-left'>Name</TableHead>
              <TableHead className='w-[15%] text-left'>Status</TableHead>
              <TableHead className='w-[15%] text-left'>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSites.map(site => (
              <TableRow key={site.id}>
                <TableCell className='max-w-[40%] text-left'>
                  <div className='flex gap-2 items-center'>
                    <Globe className='flex-shrink-0 w-4 h-4 text-muted-foreground' />
                    <Link
                      href={{ pathname: `/app/${site.id}` }}
                      className='font-medium truncate hover:underline'
                    >
                      {site.url}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className='max-w-[30%] text-left'>
                  <span className='block truncate'>{site.name || '-'}</span>
                </TableCell>
                <TableCell className='w-[15%] text-left'>
                  <StatePill state={site.state} />
                </TableCell>
                <TableCell className='w-[15%] text-left text-muted-foreground'>
                  {new Date(site.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {paginatedSites.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  No sites found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex justify-end items-center pt-2 space-x-2'>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Page {currentPage + 1} of {pageCount}
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(0)}
          disabled={currentPage === 0}
        >
          <ChevronsLeft className='w-4 h-4' />
          <span className='sr-only'>First page</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 0}
        >
          <ChevronLeft className='w-4 h-4' />
          <span className='sr-only'>Previous page</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === pageCount - 1}
        >
          <ChevronRight className='w-4 h-4' />
          <span className='sr-only'>Next page</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(pageCount - 1)}
          disabled={currentPage === pageCount - 1}
        >
          <ChevronsRight className='w-4 h-4' />
          <span className='sr-only'>Last page</span>
        </Button>
      </div>
    </div>
  );
};

export default SiteTable;
