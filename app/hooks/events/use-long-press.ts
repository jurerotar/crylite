import { useRef } from 'react';
import type React from 'react';

type UseLongPressEvent = {
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseUp: (e: React.MouseEvent | React.TouchEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
};

const useLongPress = (callback: (e: React.MouseEvent | React.TouchEvent) => void, ms = 1000): UseLongPressEvent => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number | null>(null);

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    startRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      callback(e);
    }, ms);
  };

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'mousedown' || e.type === 'touchstart') {
      start(e);
    }
  };

  return {
    onMouseDown,
    onMouseUp: stop,
    onTouchStart: onMouseDown,
    onTouchEnd: stop,
  };
};

export default useLongPress;
