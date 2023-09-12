import { useState } from 'react';

export const usePerformanceTimer = () => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const start = () => {
    setStartTime(performance.now());
  };

  const end = () => {
    setEndTime(performance.now());
  };
  return { startTime, endTime, start, end };
};
