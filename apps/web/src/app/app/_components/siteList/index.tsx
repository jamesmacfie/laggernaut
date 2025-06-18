'use client';

import { useEffect, useState } from 'react';
import { getSites } from '../../_actions/sites';
import { Loader2 } from 'lucide-react';
import NewSiteDialog from '../newSiteDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from 'ui';
import SiteTable from './table';

interface Site {
  id: string;
  url: string;
  name: string;
  state: 'pending' | 'active' | 'inactive';
  thumbnail_url: string | null;
  created_at: string;
}

export default function SiteList() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await getSites();
      setSites(data || []);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return (
    <Card className='@container/card w-full'>
      <CardHeader>
        <CardDescription>Site Management</CardDescription>
        <div className='flex justify-between items-center'>
          <CardTitle className='text-2xl font-semibold'>
            {sites.length} Total Sites
          </CardTitle>
          <NewSiteDialog onSiteCreated={fetchSites} />
        </div>
      </CardHeader>

      <div className='px-6'>
        {loading ? (
          <div className='flex justify-center items-center py-8'>
            <Loader2 className='w-8 h-8 text-gray-500 animate-spin' />
          </div>
        ) : (
          <SiteTable sites={sites} />
        )}
      </div>
    </Card>
  );
}
