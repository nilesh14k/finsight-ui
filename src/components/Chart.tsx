"use client";
import { createChart, type IChartApi } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface StockChartProps {
  data: { time: string; value: number }[];
}

export default function StockChart({ data }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (!data || data.length === 0) {
      console.warn('No data available to render the chart.');
      return;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#000',
      },
      grid: {
        vertLines: { color: '#e0e0e0' },
        horzLines: { color: '#e0e0e0' },
      },
    });

    const lineSeries = chart.addLineSeries();

    const formattedData = data.map((item) => {
      if (!item.time) {
        console.error('Missing time field for item:', item);
        return null;
      }
      const date = new Date(item.time);
      if (isNaN(date.getTime())) {
        console.error('Invalid date detected:', item.time);
        return null;
      }
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return {
        time: `${year}-${month}-${day}`, // correct format
        value: item.value,
      };
    }).filter((item) => item !== null);

    if (formattedData.length > 0) {
      const uniqueSortedData = Array.from(
        new Map(formattedData.map(item => [item.time, item])).values()
      ).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
      lineSeries.setData(uniqueSortedData);
      chart.timeScale().fitContent(); // 🧠 Stretch chart to fit time range
    } else {
      console.warn("No valid data points after formatting.");
    }    

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: '100%' }} />;
}
