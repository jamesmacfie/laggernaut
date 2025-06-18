'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  StatePill,
} from 'ui';
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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

  const filteredSites = sites.filter(site => {
    const searchStr = filter.toLowerCase();
    return (
      site.url.toLowerCase().includes(searchStr) ||
      (site.name?.toLowerCase() || '').includes(searchStr)
    );
  });

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Input
          placeholder='Filter sites...'
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSites.map(site => (
            <TableRow key={site.id}>
              <TableCell className='font-medium'>
                <Link
                  href={{ pathname: `/app/${site.id}` }}
                  className='hover:underline'
                >
                  {site.url}
                </Link>
              </TableCell>
              <TableCell>{site.name || '-'}</TableCell>
              <TableCell>
                <StatePill state={site.state} />
              </TableCell>
              <TableCell>
                {new Date(site.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
          {filteredSites.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className='text-center'>
                No sites found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SiteTable;
