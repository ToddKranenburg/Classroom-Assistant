import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { categoryColors } from './categoryColors';

Chart.register(ArcElement, Tooltip, Legend);

function CategoryBreakdownChart({ breakdown }) {
  if (!breakdown) return null;

  const labels = Object.keys(breakdown);
  const data = Object.values(breakdown);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map(label => categoryColors[label] || '#ccc'),
      },
    ],
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h3>⏱️ Time Breakdown by Activity</h3>
      <Pie data={chartData} />
    </div>
  );
}

export default CategoryBreakdownChart;