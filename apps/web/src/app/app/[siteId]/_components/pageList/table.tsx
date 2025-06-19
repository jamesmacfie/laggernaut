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
  Button,
} from 'ui';
import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  ExternalLink,
} from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const filteredPages =
    site.pages?.filter(page => {
      const searchStr = filter.toLowerCase();
      return (
        page.url.toLowerCase().includes(searchStr) ||
        (page.name?.toLowerCase() || '').includes(searchStr)
      );
    }) || [];

  const pageCount = Math.ceil(filteredPages.length / pageSize);
  const paginatedPages = filteredPages.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  return (
    <div className='space-y-4 pb-4'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 items-center space-x-2'>
          <Input
            placeholder='Filter pages...'
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
              <TableHead className='w-[30%] text-left'>Title</TableHead>
              <TableHead className='w-[15%] text-left'>Status</TableHead>
              <TableHead className='w-[15%] text-left'>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPages.map(page => (
              <TableRow key={page.id}>
                <TableCell className='max-w-[40%] text-left'>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
                    <Link
                      href={{ pathname: `/app/${site.id}/${page.id}` }}
                      className='hover:underline font-medium truncate'
                    >
                      {page.url}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className='max-w-[30%] text-left'>
                  <span className='truncate block'>{page.name || '-'}</span>
                </TableCell>
                <TableCell className='w-[15%] text-left'>
                  <StatePill state={page.state} />
                </TableCell>
                <TableCell className='w-[15%] text-left text-muted-foreground'>
                  {new Date(page.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {paginatedPages.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  No pages found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 pt-2'>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Page {currentPage + 1} of {pageCount}
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(0)}
          disabled={currentPage === 0}
        >
          <ChevronsLeft className='h-4 w-4' />
          <span className='sr-only'>First page</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 0}
        >
          <ChevronLeft className='h-4 w-4' />
          <span className='sr-only'>Previous page</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === pageCount - 1}
        >
          <ChevronRight className='h-4 w-4' />
          <span className='sr-only'>Next page</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(pageCount - 1)}
          disabled={currentPage === pageCount - 1}
        >
          <ChevronsRight className='h-4 w-4' />
          <span className='sr-only'>Last page</span>
        </Button>
      </div>
    </div>
  );
};

export default PageListTable;
