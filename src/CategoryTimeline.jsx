import React from 'react';
import { categoryColors } from './categoryColors';

function getColor(category) {
  const normalized = category.trim();
  return categoryColors[normalized] || '#ccc';
}

function CategoryTimeline({ timeline }) {
  if (!timeline) return null;

  return (
    <div style={{ margin: '2rem 0' }}>
      <h3>📊 Timeline of Activities</h3>
      <div style={{ display: 'flex', height: 40 }}>
        {timeline.map((seg, idx) => {
          const duration = seg.end_minute - seg.start_minute;
          return (
            <div
              key={idx}
              title={`${seg.start_minute}–${seg.end_minute} min: ${seg.category}`}
              style={{
                flexGrow: duration,
                background: getColor(seg.category),
                borderRight: idx < timeline.length - 1 ? '2px solid #fff' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 12,
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {seg.category}
            </div>
          );
        })}
      </div>
      {/* Timestamp labels for each segment */}
      <div style={{ display: 'flex', marginTop: 4 }}>
        {timeline.map((seg, idx) => {
          const duration = seg.end_minute - seg.start_minute;
          return (
            <div
              key={idx}
              style={{
                flexGrow: duration,
                textAlign: 'center',
                fontSize: 11,
                color: '#555'
              }}
            >
              <span>
                {seg.start_minute}
                {seg.start_minute !== seg.end_minute
                  ? `–${seg.end_minute} min`
                  : ` min`}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
        <span>Start</span>
        <span>End</span>
      </div>
    </div>
  );
}

export default CategoryTimeline;