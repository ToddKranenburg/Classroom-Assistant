import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { categoryColors } from './categoryColors';

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function getColor(label) {
  const normalized = label.trim();
  return categoryColors[normalized] || '#ccc';
}

function CategoryBreakdownChart({ breakdown }) {
  if (!breakdown) return null;

  const labels = Object.keys(breakdown);
  const data = Object.values(breakdown);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map(getColor),
      },
    ],
  };

  // Disable datalabels plugin so values do not appear on chart
  const chartOptions = {
    plugins: {
      datalabels: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${value} mins`;
          }
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h3>⏱️ Minutes per Activity</h3>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
}

export default CategoryBreakdownChart;