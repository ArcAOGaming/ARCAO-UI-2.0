import React from 'react';
import styled from 'styled-components';
import Leaderboard from '../Leaderboard/components/Leaderboard';

const HUDContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
  z-index: 1100;
`;

const BackButton = styled.button`
  position: fixed;
  top: 20px;
  left: 420px;
  background: white;
  color: black;
  border: 2px solid black;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
  z-index: 1100;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ScoreContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 60px;
`;

const ScoreLabel = styled.div`
  color: black;
  font-size: 24px;
  font-weight: bold;
`;

const Score = styled.div`
  color: black;
  font-size: 36px;
  font-weight: bold;
  background: white;
  padding: 15px 30px;
  border-radius: 15px;
  border: 2px solid black;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
`;

const WalletWrapper = styled.div`
  position: fixed;
  right: 40px;
  top: 16px;
  z-index: 1100;
`;

interface HUDProps {
  score: number;
  gameId: string;
  logoSrc?: string;
}

const HUD: React.FC<HUDProps> = ({ score, gameId, logoSrc = "/crown.avif" }) => {
  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <>
      <BackButton onClick={handleBack} title="Back to Games">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </BackButton>
      <HUDContainer>
        <ScoreContainer>
          <ScoreLabel>Score:</ScoreLabel>
          <Score>{score}</Score>
        </ScoreContainer>
      </HUDContainer>
      <Leaderboard gameId={gameId} />
    </>
  );
};

export default HUD;
