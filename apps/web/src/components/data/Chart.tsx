import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  height?: number;
  className?: string;
}

export function Chart({
  data,
  xKey,
  yKey,
  height = 350,
  className,
}: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width='100%' height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id='colorUv' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey={xKey}
            stroke='#888888'
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke='#888888'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={value => `${value}`}
          />
          <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className='rounded-lg border bg-background p-2 shadow-sm'>
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='flex flex-col'>
                        <span className='text-[0.70rem] uppercase text-muted-foreground'>
                          {xKey}
                        </span>
                        <span className='font-bold text-muted-foreground'>
                          {payload[0].payload[xKey]}
                        </span>
                      </div>
                      <div className='flex flex-col'>
                        <span className='text-[0.70rem] uppercase text-muted-foreground'>
                          {yKey}
                        </span>
                        <span className='font-bold'>
                          {payload[0].payload[yKey]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            }}
          />
          <Area
            type='monotone'
            dataKey={yKey}
            stroke='#8884d8'
            fillOpacity={1}
            fill='url(#colorUv)'
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
