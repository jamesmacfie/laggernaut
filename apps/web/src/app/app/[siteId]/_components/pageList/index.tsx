import { Card } from 'ui';
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
      <PageListTable site={site} />
    </Card>
  );
};

export default PageList;
