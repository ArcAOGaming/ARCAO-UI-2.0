import React from 'react';
import './Card.css';

interface CardProps {
  title: string;
  description: string;
  type?: 'default';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  type = 'default',
  onClick
}) => {
  return (
    <div className={`card ${type}`} onClick={onClick}>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
};

export default Card;
