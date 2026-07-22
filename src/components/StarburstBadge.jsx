import React from 'react';

export default function StarburstBadge({ text = "SALE", color = "#ff0000", size = 56 }) {
  const points = 18;
  const outerRadius = 50;
  const innerRadius = 36;
  const center = 50;
  
  let polygonPoints = "";
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / points;
    const x = center + radius * Math.sin(angle);
    const y = center - radius * Math.cos(angle);
    polygonPoints += `${x},${y} `;
  }

  return (
    <div style={{ 
      position: 'absolute', 
      top: '12px', 
      left: '12px', 
      width: size, 
      height: size, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 10,
      filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))'
    }}>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <polygon points={polygonPoints.trim()} fill={color} />
      </svg>
      <span style={{ 
        position: 'relative', 
        color: '#fff', 
        fontSize: size * 0.26, 
        fontWeight: '900', 
        zIndex: 1, 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
        transform: 'rotate(-10deg)'
      }}>
        {text}
      </span>
    </div>
  );
}
