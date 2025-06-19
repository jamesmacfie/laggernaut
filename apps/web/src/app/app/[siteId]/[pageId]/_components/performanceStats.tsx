'use client';

import { Card, CardHeader, CardTitle, CardDescription } from 'ui';
import { Badge } from 'ui/src/components/ui/badge';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

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
  const getBadgeContent = (
    value: number,
    threshold: number,
    inverse = false,
  ) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return (
      <Badge variant='outline' className='flex gap-1 text-xs rounded-lg'>
        {isGood ? (
          <TrendingUpIcon className='size-3' />
        ) : (
          <TrendingDownIcon className='size-3' />
        )}
        {value.toFixed(0)}%
      </Badge>
    );
  };

  return (
    <div className='grid gap-6 w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Performance Score</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {Math.round(data.performance_score)}%
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.performance_score, 90)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>First Contentful Paint</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {(data.first_contentful_paint / 1000).toFixed(2)}s
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.first_contentful_paint / 1000, 1.8, true)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Largest Contentful Paint</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {(data.largest_contentful_paint / 1000).toFixed(2)}s
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.largest_contentful_paint / 1000, 2.5, true)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Total Blocking Time</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {Math.round(data.total_blocking_time)}ms
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.total_blocking_time, 200, true)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Cumulative Layout Shift</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {data.cumulative_layout_shift.toFixed(3)}
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.cumulative_layout_shift * 100, 0.1, true)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Speed Index</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {(data.speed_index / 1000).toFixed(2)}s
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.speed_index / 1000, 3.4, true)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Time to Interactive</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {(data.time_to_interactive / 1000).toFixed(2)}s
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.time_to_interactive / 1000, 3.8, true)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Last Updated</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {new Date(data.created_at).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Accessibility Score</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {Math.round(data.accessibility_score)}%
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.accessibility_score, 90)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Best Practices Score</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {Math.round(data.best_practices_score)}%
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.best_practices_score, 90)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>SEO Score</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {Math.round(data.seo_score)}%
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.seo_score, 90)}
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative p-6'>
          <CardDescription>Total Byte Weight</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums mt-2'>
            {Math.round(data.total_byte_weight / 1024)}KB
          </CardTitle>
          <div className='absolute top-6 right-6'>
            {getBadgeContent(data.total_byte_weight / 1024 / 1024, 2, true)}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default PerformanceStats;
