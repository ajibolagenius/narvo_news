import { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState('00:00:00');
  useEffect(() => {
    const update = () => setTime(new Date().toISOString().split('T')[1].split('.')[0]);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{time}</span>;
};

export default Clock;
