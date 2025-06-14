import React from 'react';
import './Footer.css';
import { ARCAO_LINKS } from '../links';
import xIcon from '../assets/x.png';
import discordIcon from '../assets/discord.png';
import telegramIcon from '../assets/telegram.png';

const Footer: React.FC = () => {
  const socials = [
    {
      name: 'Twitter',
      icon: xIcon,
      url: ARCAO_LINKS.X
    },
    {
      name: 'Discord',
      icon: discordIcon,
      url: ARCAO_LINKS.DISCORD_INVITE
    },
    {
      name: 'Telegram',
      icon: telegramIcon,
      url: ARCAO_LINKS.TELEGRAM_INVITE
    }
  ];

  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Arc AO. All rights reserved.</p>
      <div className="footer-socials">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src={social.icon} alt={social.name} />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
