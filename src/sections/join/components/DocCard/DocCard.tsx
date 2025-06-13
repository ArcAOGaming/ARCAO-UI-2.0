import React from 'react';
import './DocCard.css';

interface DocCardProps {
  title: string;
  description: React.ReactNode;
  buttonText: string;
  buttonUrl: string;
}

const DocCard: React.FC<DocCardProps> = ({
  title,
  description,
  buttonText,
  buttonUrl
}) => {
  return (
    <div className="doc-card">
      <h3 className="doc-card__title">{title}</h3>
      <p className="doc-card__description">{description}</p>
      <a
        href={buttonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="doc-card__button"
      >
        <span className="doc-card__star doc-card__star--top">★</span>
        {buttonText}
        <span className="doc-card__star doc-card__star--bottom">★</span>
      </a>
    </div>
  );
};

export default DocCard;
