import React from 'react';
import xIcon from '../assets/x.png';
import globeIcon from '../assets/globe.png';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  text-align: left;
  border: 2px solid black;
  width: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin: 0 0 0.75rem 0;
  }
`;

const Description = styled.p`
  margin: 0;
  color: #666;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.4;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    gap: 0.75rem;
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;

interface ProductCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  twitterUrl?: string;
  websiteUrl?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  title, 
  description, 
  onClick,
  twitterUrl,
  websiteUrl
}) => {
  const handleClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <Card onClick={onClick}>
      <Title>{title}</Title>
      <Description>{description}</Description>
      <SocialLinks onClick={(e) => e.stopPropagation()}>
        {twitterUrl && (
          <SocialLink 
            href={twitterUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => handleClick(e, twitterUrl)}
          >
            <img src={xIcon} alt="Twitter" />
            Twitter
          </SocialLink>
        )}
        {websiteUrl && (
          <SocialLink 
            href={websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => handleClick(e, websiteUrl)}
          >
            <img src={globeIcon} alt="Website" />
            Website
          </SocialLink>
        )}
      </SocialLinks>
    </Card>
  );
};

export default ProductCard;
