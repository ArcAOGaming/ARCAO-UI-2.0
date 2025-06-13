import React, { useState } from 'react';
import styled from 'styled-components';
import { dryrun } from '../../config/aoConnection';
import { useWallet } from './WalletContext';
import UserProfile from '../UserProfile/UserProfile';

const WalletContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WalletButton = styled.button`
  background: #eee;
  color: black;
  border: 1.5px solid black;
  padding: 0.7rem 1.5rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface WalletConnectionProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnect,
  onDisconnect,
  isConnected: externalIsConnected,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    isConnected: contextIsConnected, 
    connect: contextConnect, 
    disconnect: contextDisconnect,
    address,
    bazarProfile
  } = useWallet();

  // Use external isConnected prop if provided, otherwise use context value
  const isConnected = typeof externalIsConnected !== 'undefined' ? externalIsConnected : contextIsConnected;

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const address = await contextConnect();
      onConnect?.(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    contextDisconnect();
    onDisconnect?.();
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
  };

  return (
    <WalletContainer>
      {!isConnected ? (
        <WalletButton onClick={handleConnect} disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </WalletButton>
      ) : (
        <>
          {address && (
            <UserProfile 
              address={address}
              bazarProfile={bazarProfile}
              onCopyAddress={handleCopyAddress}
            />
          )}
          <WalletButton onClick={handleDisconnect}>
            Disconnect
          </WalletButton>
        </>
      )}
    </WalletContainer>
  );
};

export default WalletConnection;