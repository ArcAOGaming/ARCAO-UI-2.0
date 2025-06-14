import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import GameCard from './components/GameCard';
import BackgroundAnimation from './components/BackgroundAnimation';
import TextScramble from './components/TextScramble';
import ProductCard from './components/ProductCard';
import Join from './sections/join/Join';
import Delegate from './sections/Delegate';
import Mint from './components/Mint';
import Ambassador from './pages/Ambassador/Ambassador';
import { WalletProvider, useWallet } from './shared-components/Wallet/WalletContext';
import { handleHashChange, isValidPage } from './utils/scrollUtils';
import { ScoreProvider } from './shared-components/Score/ScoreContext';
import { games } from './games/games';
import styled, { createGlobalStyle } from 'styled-components';
import './App.css';
import { ARCAO_LINKS, RANDAO_LINKS, SATOSHIS_PALACE_LINKS } from './links';
import { GOOGLE_ANALYTICS_ID } from './constants';

// Dynamic imports for game components
const GameComponents = {
  PONG: React.lazy(() => import('./games/PongGame')),
  BRICK_BLITZ: React.lazy(() => import('./games/TetrisGame')),
  MAZE_MUNCHER: React.lazy(() => import('./games/SatoshiManGame')),
  FEAST_OR_FAMINE: React.lazy(() => import('./games/FeastFamine')),
} as const;

type GameComponentType = keyof typeof GameComponents;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FeaturedSection = styled.section`
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  margin-top: 2rem;
  
  h2 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.5rem;
    color: #333;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 3rem auto 0;
  padding: 0 1rem;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin: 2rem auto 0;
    padding: 0 1rem;
  }
`;

const AboutSection = styled.section`
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  margin-top: 8rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
    margin-top: 4rem;
  }
  
  h2 {
    margin-bottom: 2rem;
    font-size: 2.5rem;
    color: #333;
    
    @media (max-width: 768px) {
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }
  }

  p {
    max-width: 800px;
    margin: 0 auto 3rem;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #666;
    padding: 0 1rem;
    
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 2rem;
    }
  }

  h3 {
    margin: 2rem 0 1rem;
    font-size: 2rem;
    color: #333;
    
    @media (max-width: 768px) {
      font-size: 1.75rem;
      margin: 1.5rem 0 1rem;
    }
  }
`;

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
`;

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;

  .app {
    min-height: 100vh;
  }

  .main-content {
    min-height: 100vh;
    padding-bottom: 2rem;
  }
`;

const GameOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  overflow: hidden;
`;

interface GameComponentProps {
  gameId: string;
}

// Initialize Google Analytics
ReactGA.initialize(GOOGLE_ANALYTICS_ID);

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  useEffect(() => {
    const handlePageChange = () => {
      const hash = window.location.hash.slice(1);
      if (isValidPage(hash)) {
        setCurrentPage(hash);
        // Track page view
        ReactGA.send({ hitType: "pageview", page: `/#${hash}` });
        // Reset URL to just the hash
        if (window.location.pathname !== '/') {
          window.history.replaceState(null, '', `/#${hash}`);
        }
      } else {
        setCurrentPage(null);
        // Track home page view
        ReactGA.send({ hitType: "pageview", page: "/" });
      }
    };

    // Handle initial state
    handlePageChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handlePageChange);
    return () => {
      window.removeEventListener('hashchange', handlePageChange);
    };
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { isConnected, connect } = useWallet();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Track sidebar toggle
    ReactGA.event({
      category: "Navigation",
      action: "Toggle Sidebar",
      label: !isSidebarOpen ? "Open" : "Close"
    });
  };

  const handleGameClick = async (gameId: string) => {
    if (!isConnected) {
      try {
        await connect();
        setSelectedGame(gameId);
        // Track game start event
        ReactGA.event({
          category: "Game",
          action: "Start",
          label: gameId
        });
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        return;
      }
    } else {
      setSelectedGame(gameId);
    }
  };

  const GameComponent = selectedGame
    ? (GameComponents[selectedGame as GameComponentType] ?? null)
    : null;

  return (
    <AppContainer>
      <GlobalStyle />
      <div className="app">
        {currentPage === 'ambassador' ? (
          <Ambassador />
        ) : (
          <>
            <Header toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} />
            <BackgroundAnimation isVisible={!selectedGame} />
            <main className="main-content">
          {selectedGame ? (
            <React.Suspense fallback={<div>Loading game...</div>}>
              {GameComponent && (
                <GameOverlay>
                  <ScoreProvider>
                    <GameComponent gameId={selectedGame} />
                  </ScoreProvider>
                </GameOverlay>
              )}
            </React.Suspense>
          ) : (
            <>
              <section id="start" className="hero-section">
                <TextScramble text="Provably Fair Gaming" />
                <p className="hero-description">
                  Experience a new era where gaming meets blockchain innovation. We're transforming the way you play, trade, and own in-game assets with proven scores, complete transparency, and true autonomy, all within a secure and provably fair ecosystem.
                </p>
                <a href="#games" className="hero-button">
                  <span className="star-top">★</span>
                  Explore Games
                  <span className="star-bottom">★</span>
                </a>
              </section>

              <FeaturedSection id="games">
                <h2>Featured Games</h2>
                <GameGrid>
                  {games.map(game => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      image={`/Game_Logos/${game.id}.png` || "/placeholder.jpg"}
                      creator={game.creator}
                      creatorLogo={game.creatorLogo}
                      externalLink={game.externalLink}
                      onClick={() => handleGameClick(game.id)}
                    />
                  ))}
                </GameGrid>
              </FeaturedSection>

              <AboutSection id="about">
                <h2>About Us</h2>
                <p>
                  Welcome to ArcAO, where we're revolutionizing the gaming experience through blockchain technology.
                  Our platform offers provably fair gaming experiences, ensuring complete transparency and trust in every game.
                  Built on cutting-edge technology, we provide a secure and entertaining environment for players worldwide.
                </p>

                <h3>Our Products</h3>
                <ProductGrid>
                  <ProductCard
                    title="Satoshi's Palace"
                    description="Experience the future of gaming with Satoshi's Palace, where blockchain meets entertainment. Dive into a world of provably fair gaming and exclusive rewards."
                    onClick={() => {
                      ReactGA.event({
                        category: "Product",
                        action: "Click",
                        label: "Satoshi's Palace"
                      });
                      window.open(SATOSHIS_PALACE_LINKS.WEBSITE, '_blank');
                    }}
                    twitterUrl={SATOSHIS_PALACE_LINKS.X}
                    websiteUrl={SATOSHIS_PALACE_LINKS.WEBSITE}
                  />
                  <ProductCard
                    title="RandAO"
                    description="Discover RandAO, our innovative random number generation protocol built on Arweave. Providing verifiable randomness for decentralized applications."
                    onClick={() => {
                      ReactGA.event({
                        category: "Product",
                        action: "Click",
                        label: "RandAO"
                      });
                      window.open(RANDAO_LINKS.WEBSITE, '_blank');
                    }}
                    twitterUrl={RANDAO_LINKS.X}
                    websiteUrl={RANDAO_LINKS.WEBSITE}
                  />
                </ProductGrid>
              </AboutSection>

              <Join />

              {/* Delegate Section */}
              <section id="delegate" className="delegate-section" style={{ marginTop: '8rem' }}>
                <Delegate />
              </section>

              {/* Mint Section */}
              {/* <Mint /> */}
            </>
          )}
            </main>
            <Footer />
          </>
        )}
      </div>
    </AppContainer>
  );
};

const App: React.FC = () => {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
};

export default App;
