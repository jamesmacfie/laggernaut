'use client';

import { useEffect, useState } from 'react';
import { getSites } from '../../_actions/sites';
import { Loader2 } from 'lucide-react';
import NewSiteDialog from '../newSiteDialog';
import { Card } from 'ui';
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
    <Card>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>Sites</h2>
        <NewSiteDialog onSiteCreated={fetchSites} />
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='w-8 h-8 text-gray-500 animate-spin' />
        </div>
      ) : (
        <SiteTable initialSites={sites} />
      )}
    </Card>
  );
}
