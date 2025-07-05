import React from 'react';
import './ProgressIndicator.scss';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
}) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="progress-indicator">
      <div className="progress-info">
        <span className="progress-text">
          Progress: {current}/{total}
        </span>
        <span className="progress-percentage">{Math.round(percentage)}%</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      <div className="progress-steps">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`progress-step ${index < current ? 'completed' : ''} ${
              index === current - 1 ? 'current' : ''
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
