import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from '../assets/background-animation.json';
import './BackgroundAnimation.css';

const BackgroundAnimation: React.FC<{ isVisible?: boolean }> = ({ isVisible = true }) => {
  const playerRef = React.useRef<any>(null);

  return (
    <div className="background-animation" style={{ display: isVisible ? 'block' : 'none' }}>
      <Player
        ref={playerRef}
        src={animationData}
        loop
        autoplay
        renderer="svg"
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid meet',
          progressiveLoad: false,
          hideOnTransparent: false
        }}
        speed={0.25}
        style={{
          position: 'absolute',
          top: '52%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.70)',
          width: '100%',
          height: '100%',
          filter: 'blur(0px)',
        }}
      />
    </div>
  );
};

export default React.memo(BackgroundAnimation);
