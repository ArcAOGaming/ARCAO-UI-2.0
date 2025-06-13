import React from 'react';
import styled from 'styled-components';

interface GameCardProps {
  title: string;
  image: string;
  onClick: () => void;
  creator: string;
  creatorLogo: string;
  externalLink?: string;
}

const CardContainer = styled.div`
  background: white;
  border-radius: 10px;
  border: 1px solid #eee;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.8rem;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const CardTitle = styled.h3`
  color: #fff;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
`;

const Creator = styled.div`
  color: #aaa;
  font-size: 0.9rem;
  margin: 5px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const CreatorLogo = styled.img`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
`;

const GameCard: React.FC<GameCardProps> = ({ title, image, onClick, creator, creatorLogo, externalLink }) => {
  const handleClick = () => {
    if (externalLink) {
      window.open(externalLink, '_blank', 'noopener,noreferrer');
    } else {
      onClick();
    }
  };

  return (
    <CardContainer onClick={handleClick}>
      <CardImage src={image} alt={title} />
      {/* <CardTitle>{title}</CardTitle> */}
      <Creator>
        <CreatorLogo src={creatorLogo} alt={`${creator} logo`} />
        by {creator}
      </Creator>
    </CardContainer>
  );
};

export default GameCard;
