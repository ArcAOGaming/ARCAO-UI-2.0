import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Delegate2ArcAO from '../components/Delegate2ArcAO';

// Target date: Friday, May 23rd 2025, 8AM Eastern Time
const TARGET_DATE = new Date('2025-05-23T08:00:00-04:00').getTime();

// Show countdown only if target date hasn't passed
const SHOW_COUNTDOWN = Date.now() < TARGET_DATE;

const CountdownContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 100;
  color: #333;
  font-family: 'Roboto Mono', monospace;
  backdrop-filter: blur(4px);
`;

const CountdownTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #333;
  animation: glow 1.5s ease-in-out infinite alternate;
  padding: 0 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    letter-spacing: 1px;
  }

  @keyframes glow {
    from {
      text-shadow: 0 0 10px rgba(0, 170, 255, 0.7);
    }
    to {
      text-shadow: 0 0 20px rgba(0, 170, 255, 1.0), 0 0 30px rgba(0, 170, 255, 0.8);
    }
  }
`;

const CountdownTimer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.98);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const CountdownUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    min-width: calc(50% - 1rem);
    margin-bottom: 1rem;
  }
`;

const CountdownValue = styled.div`
  font-size: 5rem;
  font-weight: bold;
  color: #333;
  min-width: 120px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 3rem;
    min-width: 80px;
  }
`;

const CountdownLabel = styled.div`
  font-size: 1.2rem;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 1rem;
    letter-spacing: 1px;
  }
`;

const CountdownMessage = styled.p`
  font-size: 1.5rem;
  max-width: 800px;
  text-align: center;
  line-height: 1.6;
  color: #666;
  margin: 0 1rem;
  background: rgba(255, 255, 255, 0.98);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 1.25rem;
    line-height: 1.5;
  }
`;

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const CountdownComponent: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [showCountdown, setShowCountdown] = useState<boolean>(() => {
    const initialTimeLeft = calculateTimeLeft();
    return Object.keys(initialTimeLeft).length > 0;
  });

  function calculateTimeLeft(): TimeLeft {
    const difference = TARGET_DATE - new Date().getTime();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Hide countdown if no time left
      if (Object.keys(newTimeLeft).length === 0) {
        setShowCountdown(false);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  });

  if (!showCountdown) return null;

  return (
    <CountdownContainer>
      <CountdownTitle>Coming Soon</CountdownTitle>
      <CountdownTimer>
        <CountdownUnit>
          <CountdownValue>{timeLeft.days}</CountdownValue>
          <CountdownLabel>Days</CountdownLabel>
        </CountdownUnit>
        <CountdownUnit>
          <CountdownValue>{timeLeft.hours}</CountdownValue>
          <CountdownLabel>Hours</CountdownLabel>
        </CountdownUnit>
        <CountdownUnit>
          <CountdownValue>{timeLeft.minutes}</CountdownValue>
          <CountdownLabel>Minutes</CountdownLabel>
        </CountdownUnit>
        <CountdownUnit>
          <CountdownValue>{timeLeft.seconds}</CountdownValue>
          <CountdownLabel>Seconds</CountdownLabel>
        </CountdownUnit>
      </CountdownTimer>
      <CountdownMessage>
        ARCAO Delegation will be available on Friday, May 23rd at 8:00 AM Eastern Time. 
        Please check back then to participate.
      </CountdownMessage>
    </CountdownContainer>
  );
};

const Delegate: React.FC = () => {
  return (
    <div className="delegate-page" id="delegate" style={{ position: 'relative' }}>
      <CountdownComponent />
      <Delegate2ArcAO />
    </div>
  );
};

export default Delegate;
