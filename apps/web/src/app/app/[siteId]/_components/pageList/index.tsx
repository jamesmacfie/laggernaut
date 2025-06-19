import { Card, CardHeader, CardTitle, CardContent } from 'ui';
import PageListTable from './table';

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

interface PageListProps {
  site: Site;
}

const PageList = ({ site }: PageListProps) => {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-2xl font-semibold'>
          {site.pages?.length || 0} Total Pages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PageListTable site={site} />
      </CardContent>
    </Card>
  );
};

export default PageList;
