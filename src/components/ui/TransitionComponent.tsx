
import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface TransitionComponentProps {
  children: React.ReactNode;
}

const TransitionComponent: React.FC<TransitionComponentProps> = ({ children }) => {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const location = useLocation();
  const locationRef = useRef(location);

  useEffect(() => {
    if (locationRef.current.pathname !== location.pathname) {
      setTransitionStage('fadeOut');
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('fadeIn');
        locationRef.current = location;
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [location, children]);

  return (
    <div 
      className={
        transitionStage === 'fadeIn' 
          ? 'animate-fade-in animate-slide-up'
          : 'animate-fade-out duration-300'
      }
    >
      {displayChildren}
    </div>
  );
};

export default TransitionComponent;
