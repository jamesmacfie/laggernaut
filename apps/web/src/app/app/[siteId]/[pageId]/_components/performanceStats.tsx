'use client';

import { Card } from 'ui';

interface PerformanceData {
  performance_score: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  total_blocking_time: number;
  cumulative_layout_shift: number;
  speed_index: number;
  time_to_interactive: number;
  accessibility_score: number;
  best_practices_score: number;
  seo_score: number;
  total_byte_weight: number;
  dom_size: number;
  created_at: string;
}

interface Props {
  data: PerformanceData;
}

const PerformanceStats = ({ data }: Props) => {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Performance Score</h3>
        <p className='mt-2 text-2xl font-bold'>
          {Math.round(data.performance_score)}%
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>First Contentful Paint</h3>
        <p className='mt-2 text-2xl font-bold'>
          {(data.first_contentful_paint / 1000).toFixed(2)}s
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Largest Contentful Paint</h3>
        <p className='mt-2 text-2xl font-bold'>
          {(data.largest_contentful_paint / 1000).toFixed(2)}s
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Total Blocking Time</h3>
        <p className='mt-2 text-2xl font-bold'>
          {Math.round(data.total_blocking_time)}ms
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Cumulative Layout Shift</h3>
        <p className='mt-2 text-2xl font-bold'>
          {data.cumulative_layout_shift.toFixed(3)}
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Speed Index</h3>
        <p className='mt-2 text-2xl font-bold'>
          {(data.speed_index / 1000).toFixed(2)}s
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Time to Interactive</h3>
        <p className='mt-2 text-2xl font-bold'>
          {(data.time_to_interactive / 1000).toFixed(2)}s
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Last Updated</h3>
        <p className='mt-2 text-2xl font-bold'>
          {new Date(data.created_at).toLocaleDateString()}
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Accessibility Score</h3>
        <p className='mt-2 text-2xl font-bold'>
          {Math.round(data.accessibility_score)}%
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Best Practices Score</h3>
        <p className='mt-2 text-2xl font-bold'>
          {Math.round(data.best_practices_score)}%
        </p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>SEO Score</h3>
        <p className='mt-2 text-2xl font-bold'>{Math.round(data.seo_score)}%</p>
      </Card>
      <Card className='p-4'>
        <h3 className='text-sm font-medium'>Total Byte Weight</h3>
        <p className='mt-2 text-2xl font-bold'>
          {Math.round(data.total_byte_weight / 1024)}KB
        </p>
      </Card>
    </div>
  );
};

export default PerformanceStats;
