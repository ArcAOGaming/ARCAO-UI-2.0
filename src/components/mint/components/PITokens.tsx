import React from 'react';
import { PITokenClient } from 'ao-process-clients/dist/src/clients/pi';
import { PIToken } from 'ao-process-clients/dist/src/clients/pi/oracle/abstract/IPIOracleClient';
import { TickHistoryEntry } from 'ao-process-clients/dist/src/clients/pi/PIToken/abstract/IPITokenClient';
import { TokenClient } from 'ao-process-clients/dist/src/clients/ao';
import { DryRunResult } from '@permaweb/aoconnect/dist/lib/dryrun';
import { TokenData } from 'ao-process-clients/dist/src/clients/pi/PIToken/types';
import TokenCard from './TokenCard';
import '../../Mint.css';

interface PITokensProps {
  piTokensData: PIToken[];
  tokenClientPairs: [PITokenClient, TokenClient][];
  tokenDataMap: Map<string, TokenData>;
  baseTokenDataMap: Map<string, {
    balance: string;
    info: DryRunResult | null;
  }>;
  isRefreshing: { [key: string]: boolean };
  delegationMap: Map<string, number>;
  fetchTokenData: (piClient: PITokenClient, baseClient: TokenClient, isRefresh: boolean) => Promise<void>;
  refreshAllTokenData: () => Promise<void>;
  renderLoadingState: (key: string) => JSX.Element | null;
  renderError: (key: string) => JSX.Element | null;
}

const LoadingSpinner: React.FC = () => {
  return <div className="loading-spinner"></div>;
};

const PITokens: React.FC<PITokensProps> = ({
  piTokensData,
  tokenClientPairs,
  tokenDataMap,
  baseTokenDataMap,
  isRefreshing,
  delegationMap,
  fetchTokenData,
  refreshAllTokenData,
  renderLoadingState,
  renderError
}) => {
  return (
    <div>
      <h2 className="section-title">PI Tokens</h2>
      {renderLoadingState('piTokens') || renderLoadingState('tokenClientPairs')}
      {renderError('piTokens') || renderError('tokenClientPairs')}
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={refreshAllTokenData}
          disabled={Object.values(isRefreshing).some(val => val)}
          className="refresh-all-button"
        >
          {Object.values(isRefreshing).some(val => val) ? (
            <>
              <LoadingSpinner /> Refreshing All Token Data...
            </>
          ) : 'Refresh All Token Data'}
        </button>
      </div>
      
      <div className="data-card">
        <h3>Available PI Tokens</h3>
        {piTokensData.length > 0 ? (
          <div className="token-grid">
            {tokenClientPairs.map(([piClient, baseClient], index) => {
              const tokenId = piClient.baseConfig.processId;
              const processId = baseClient.baseConfig.processId;
              const token = piTokensData.find(t => 
                t.id === tokenId || 
                t.process === processId || 
                t.flp_token_process === processId
              );
              const tokenData = tokenDataMap.get(tokenId);
              const isTokenRefreshing = isRefreshing[tokenId] || false;
              
              // Get base token data for this process ID
              const baseTokenData = baseTokenDataMap.get(processId);

              return (
                <TokenCard
                  key={index}
                  index={index}
                  tokenId={tokenId}
                  processId={processId}
                  token={token}
                  tokenData={tokenData}
                  baseBalance={baseTokenData?.balance || '0'}
                  baseInfo={baseTokenData?.info || null}
                  isRefreshing={isTokenRefreshing}
                  delegationMap={delegationMap}
                  fetchTokenData={fetchTokenData}
                  piClient={piClient}
                  baseClient={baseClient}
                />
              );
            })}
          </div>
        ) : (
          <p>No PI tokens available</p>
        )}
      </div>
    </div>
  );
};

export default PITokens;
