import { useState } from 'react';

export const usePerformanceTimer = () => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  function start() {
    setStartTime(performance.now());
  }

  function end() {
    setEndTime(performance.now());
  }
  return { startTime, endTime, start, end };
};
export const usePerformanceTimer2 = () => {
  const [startTime2, setStartTime2] = useState(0);
  const [endTime2, setEndTime2] = useState(0);
  function start2() {
    setStartTime2(performance.now());
  }

  function end2() {
    setEndTime2(performance.now());
  }
  return { startTime2, endTime2, start2, end2 };
};
export const usePerformanceTimer3 = () => {
  const [startTime3, setStartTime3] = useState(0);
  const [endTime3, setEndTime3] = useState(0);
  function start3() {
    setStartTime3(performance.now());
  }

  function end3() {
    setEndTime3(performance.now());
  }
  return { startTime3, endTime3, start3, end3 };
};

export const usePerformanceTimer4 = () => {
  const [startTime4, setStartTime4] = useState(0);
  const [endTime4, setEndTime4] = useState(0);
  function start4() {
    setStartTime4(performance.now());
  }

  function end4() {
    setEndTime4(performance.now());
  }
  return { startTime4, endTime4, start4, end4 };
};

export const usePerformanceTimer5 = () => {
  const [startTime5, setStartTime5] = useState(0);
  const [endTime5, setEndTime5] = useState(0);
  function start5() {
    setStartTime5(performance.now());
  }

  function end5() {
    setEndTime5(performance.now());
  }
  return { startTime5, endTime5, start5, end5 };
};
