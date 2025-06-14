import React, { useState, useEffect } from 'react';
import './Header.css';
import styled from 'styled-components';
import WalletConnection from '../shared-components/Wallet/WalletConnection';
import { ARCAO_LINKS } from '../links';
import { scrollToSection, VALID_SECTIONS, SectionId } from '../utils/scrollUtils';
interface HeaderProps {
  toggleSidebar: () => void;
  isPage?: boolean;
}

const WalletWrapper = styled.div`
  position: fixed;
  right: 40px;
  top: 16px;
  z-index: 102;

  @media (min-width: 769px) and (max-width: 1024px) {
    position: relative;
    right: 0;
    top: 0;
    margin-left: auto;
  }

  @media (max-width: 768px) {
    position: relative;
    right: 0;
    top: 0;
  }
`;

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isPage }) => {
  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    // Initialize active section from URL hash if present
    const hash = window.location.hash.slice(1);
    return (VALID_SECTIONS.includes(hash as SectionId) ? hash : 'start') as SectionId;
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const sections = VALID_SECTIONS.map(id => {
        const element = document.getElementById(id);
        if (!element) return { id, top: 0 };
        return {
          id,
          top: element.offsetTop
        };
      });

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sections[i].top) {
          const newSection = sections[i].id;
          if (activeSection !== newSection) {
            setActiveSection(newSection);
            // Update URL hash without triggering scroll
            // window.history.replaceState(null, '', `#${newSection}`);
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const handleSectionChange = (sectionId: SectionId) => {
    if (isPage) {
      // If on a separate page, navigate back to main page with section hash
      // and force a reload to ensure proper scroll
      window.location.href = `/#${sectionId}`;
      setTimeout(() => {
        window.location.reload();
      }, 50);
    } else {
      setActiveSection(sectionId);
      scrollToSection(sectionId);
    }
  };

  return (
    <header className="header">
      <a href="/" style={{ textDecoration: 'none' }}>
        <img
          src="/logo.png"
          alt="Arc Logo"
          className="header-logo"
          style={{ cursor: 'pointer' }}
        />
      </a>

      {!isPage && (
        <div className="nav-container">
          <div className="radio-inputs">
          <label className="radio">
            <input
              type="radio"
              name="section"
              checked={!isPage && activeSection === 'start'}
              onChange={() => handleSectionChange('start')}
            />
            <span className="name">Start</span>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="section"
              checked={!isPage && activeSection === 'games'}
              onChange={() => handleSectionChange('games')}
            />
            <span className="name">Play</span>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="section"
              checked={!isPage && activeSection === 'about'}
              onChange={() => handleSectionChange('about')}
            />
            <span className="name">Learn</span>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="section"
              checked={!isPage && activeSection === 'join'}
              onChange={() => handleSectionChange('join')}
            />
            <span className="name">Join</span>
          </label>
          {/* <label className="radio">
            <input
              type="radio"
              name="section"
              checked={activeSection === 'mint'}
              onChange={() => scrollToSection('mint')}
            />
            <span className="name">Mint</span>
          </label> */}
          <label className="radio">
            <input
              type="radio"
              name="section"
              checked={!isPage && activeSection === 'delegate'}
              onChange={() => handleSectionChange('delegate')}
            />
            <span className="name">Delegate</span>
          </label>
          </div>
        </div>
      )}

      <WalletWrapper>
        <WalletConnection />
      </WalletWrapper>
    </header>
  );
};

export default Header;
