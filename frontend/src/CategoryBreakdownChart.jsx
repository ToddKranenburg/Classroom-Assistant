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

  const chartOptions = {
    plugins: {
      datalabels: {
        display: false
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value} mins`;
          }
        }
      }
    }
  };

  // Legend table component
  const LegendTable = () => (
    <table style={{ marginLeft: 24, fontSize: 14, borderSpacing: 0 }}>
      <tbody>
        {labels.map((label, idx) => (
          <tr key={label}>
            <td>
              <span
                style={{
                  display: 'inline-block',
                  width: 32,
                  height: 16,
                  borderRadius: 4,
                  background: getColor(label),
                  marginRight: 8,
                  verticalAlign: 'middle'
                }}
              />
            </td>
            <td style={{ paddingRight: 8 }}>{label}</td>
            <td style={{ fontWeight: 'bold' }}>{breakdown[label]} min</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', display: 'flex', alignItems: 'flex-start', gap: 24 }}>
      <div style={{ flex: '0 0 200px' }}>
        <h3>⏱️ Minutes per Activity</h3>
        <Pie data={chartData} options={chartOptions} />
      </div>
      <LegendTable />
    </div>
  );
}

export default CategoryBreakdownChart;