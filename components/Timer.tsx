
import React, { useState, useEffect, useCallback } from 'react';

interface TimerProps {
  initialMinutes: number;
  onTimeUp?: () => void;
  isRunning: boolean;
}

export const Timer: React.FC<TimerProps> = ({ initialMinutes, onTimeUp, isRunning }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  const handleTimeUp = useCallback(() => {
    if (onTimeUp) {
      onTimeUp();
    }
  }, [onTimeUp]);
  
  useEffect(() => {
    setSecondsLeft(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) {
      if (secondsLeft <= 0) {
        handleTimeUp();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, secondsLeft, handleTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className={`p-3 rounded-lg shadow text-center font-mono text-2xl 
      ${secondsLeft < 60 ? 'text-red-600 bg-red-100' : 'text-gray-700 bg-gray-200'}`}>
      Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
