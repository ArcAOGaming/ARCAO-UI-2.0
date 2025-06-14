import React, { useState } from 'react';
import { PIToken, TickHistoryEntry } from 'ao-js-sdk/dist/src/clients/pi';
import { TokenClient } from 'ao-js-sdk/dist/src/clients/ao';
import { PITokenClient } from 'ao-js-sdk/dist/src/clients/pi';
import { DryRunResult } from '@permaweb/aoconnect/browser'
import '../../Mint.css';

interface TokenData {
  tokenId: string;
  processId: string;
  ticker: string;
  name: string;
  balance: string;
  claimableBalance: string;
  tickHistory: TickHistoryEntry[];
  isLoading: boolean;
  treasury?: string;
  status?: string;
  logoUrl?: string;
  infoData?: DryRunResult;
}

interface TokenCardProps {
  index: number;
  tokenId: string;
  processId: string;
  token: PIToken | undefined;
  tokenData: TokenData | undefined;
  // Base token data passed as separate properties
  baseBalance?: string;
  baseInfo?: DryRunResult | null;
  isRefreshing: boolean;
  delegationMap: Map<string, number>;
  fetchTokenData: (piClient: PITokenClient, baseClient: TokenClient, isRefresh: boolean) => Promise<void>;
  piClient: PITokenClient;
  baseClient: TokenClient;
}

const LoadingSpinner: React.FC = () => {
  return <div className="loading-spinner"></div>;
};

const TokenCard: React.FC<TokenCardProps> = ({
  index,
  tokenId,
  processId,
  token,
  tokenData,
  baseBalance,
  baseInfo,
  isRefreshing,
  delegationMap,
  fetchTokenData,
  piClient,
  baseClient
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const ticker = token?.ticker || token?.flp_token_ticker || 'Unknown';
  
  return (
    <div className="token-card token-card-max" key={index}>
      <div className="token-header">
        <div className="token-identity">
          {token?.flp_token_logo ? (
            <div className="token-logo">
              <img 
                src={`https://arweave.net/${token.flp_token_logo}`}
                alt={ticker} 
                onError={(e) => {
                  // Handle image loading errors by hiding the broken image
                  (e.target as HTMLImageElement).style.display = 'none';
                  // Show fallback
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#777;">${ticker.slice(0, 2)}</div>`;
                  }
                }}
              />
            </div>
          ) : (
            <div className="token-logo-fallback">
              {ticker.slice(0, 2)}
            </div>
          )}
          <div>
            <h3 style={{ margin: '0 0 2px 0' }}>{ticker} <span style={{ fontSize: '0.7em', opacity: 0.7 }}>({tokenId.slice(0, 6)}...)</span></h3>
            {tokenData?.name && tokenData.name !== ticker && (
              <div style={{ fontSize: '0.85em', color: '#666' }}>{tokenData.name}</div>
            )}
          </div>
        </div>
        <div>
          <button 
            className="refresh" 
            onClick={() => fetchTokenData(piClient, baseClient, true)}
            disabled={isRefreshing}
            title="Refresh token data"
          >
            {isRefreshing ? <LoadingSpinner /> : '⟳'} Refresh
          </button>
        </div>
      </div>
      
      <div className="token-info">
        <p>
          <strong>Process ID:</strong> 
          <span 
            className="token-id-truncated" 
            title="Click to copy to clipboard"
            style={{ cursor: 'pointer' }}
            onClick={() => navigator.clipboard.writeText(tokenId)}
          >
            {`${tokenId.slice(0, 4)}...${tokenId.slice(-4)}`}
          </span>
        </p>
        <p>
          <strong>Token Address:</strong> {token?.flp_token_process ? (
            <span 
              className="token-id-truncated" 
              title="Click to copy to clipboard"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (token?.flp_token_process) {
                  navigator.clipboard.writeText(token.flp_token_process);
                }
              }}
            >
              {token?.flp_token_process ? `${token.flp_token_process.slice(0, 4)}...${token.flp_token_process.slice(-4)}` : 'N/A'}
            </span>
          ) : 'N/A'}
        </p>
        <p>
          <strong>Treasury:</strong> {token?.treasury ? (
            <span 
              className="token-id-truncated" 
              title="Click to copy to clipboard"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (token?.treasury) {
                  navigator.clipboard.writeText(token.treasury);
                }
              }}
            >
              {token?.treasury ? `${token.treasury.slice(0, 4)}...${token.treasury.slice(-4)}` : 'N/A'}
            </span>
          ) : 'N/A'}
        </p>
        <p><strong>Created:</strong> {token?.created_at_ts ? new Date(token.created_at_ts).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Status:</strong> {token?.status || 'N/A'}</p>
        {delegationMap.has(tokenId) && (
          <p>
            <strong>Your Delegation:</strong>{' '}
            <span className="token-delegation">
              {delegationMap.get(tokenId)}%
            </span>
          </p>
        )}
      </div>
      
      {/* Token Details Dropdown */}
      <div style={{ marginTop: '15px' }}>
        <details 
          onToggle={(e) => {
            setDetailsOpen(e.currentTarget.open);
            // Load data when opening if needed
            if (e.currentTarget.open && (!tokenData || tokenData.tickHistory.length === 0)) {
              fetchTokenData(piClient, baseClient, true);
            }
          }}
        >
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '0.9rem',
            padding: '8px 12px',
            backgroundColor: '#f0f5ff',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Token Details & History</span>
            {detailsOpen && isRefreshing && <LoadingSpinner />}
          </summary>
          
          {/* Content area */}
          <div style={{ 
            marginTop: '10px', 
            padding: '12px', 
            background: '#f5f8ff', 
            borderRadius: '6px', 
            fontSize: '0.85rem'
          }}>

            
            {/* Balance Information Section */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>PI Token Balance</h4>
              {tokenData?.isLoading ? (
                <div className="status-label loading">
                  <LoadingSpinner /> Loading balance information...
                </div>
              ) : (
                <div className="balance-container">
                  <div className="balance-box available">
                    <p><strong>Balance:</strong></p>
                    <p className="balance-amount">{tokenData?.balance || '0'}</p>
                  </div>
                  <div className="balance-box claimable">
                    <p><strong>Claimable:</strong></p>
                    <p className="balance-amount">{tokenData?.claimableBalance || '0'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Base Token Information Section */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Base Token Balance</h4>
              {tokenData?.isLoading ? (
                <div className="status-label loading">
                  <LoadingSpinner /> Loading balance information...
                </div>
              ) : (
                <div className="balance-container">
                  <div className="balance-box available" style={{ width: '100%' }}>
                    <p><strong>Balance:</strong></p>
                    <p className="balance-amount">{baseBalance || '0'}</p>
                  </div>
                  {baseInfo && (
                    <div className="base-token-info" style={{ fontSize: '0.8rem', marginTop: '10px', color: '#666' }}>
                      {baseInfo.Messages?.[0]?.Data && (
                        <details>
                          <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>Base Token Info</summary>
                          <pre style={{ background: '#f0f0f0', padding: '8px', borderRadius: '4px', overflow: 'auto', maxHeight: '150px' }}>
                            {JSON.stringify(JSON.parse(baseInfo.Messages[0].Data), null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Yield History Section */}
            <div style={{ marginBottom: '15px' }}>
              <div className="history-header">
                <h4 style={{ marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Yield History</h4>
                <div>
                  <span className="history-count">
                    {tokenData?.tickHistory?.length || 0} entries
                  </span>
                  {tokenData?.tickHistory && tokenData.tickHistory.length > 0 && (
                    <button 
                      className="refresh"
                      onClick={() => fetchTokenData(piClient, baseClient, true)}
                      style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '2px 6px' }}
                      title="Refresh yield history"
                    >
                      Refresh History
                    </button>
                  )}
                </div>
              </div>
              
              {tokenData?.tickHistory && tokenData.tickHistory.length > 0 ? (
                <>
                  <div className="history-container">
                    {tokenData.tickHistory.slice(0, 5).map((entry: TickHistoryEntry, idx: number) => (
                      <div key={idx} className={`history-entry ${idx % 2 === 0 ? 'history-entry-even' : ''}`}>
                        <div className="history-entry-row">
                          <span>Date: {new Date(entry.Timestamp * 1000).toLocaleString()}</span>
                          <span>Amount: <strong>{entry.TokensDistributed || entry.PiReceived || '0'}</strong></span>
                        </div>
                        {entry.YieldCycle && (
                          <div className="history-cycle">
                            Cycle: {entry.YieldCycle}
                            {(entry as any).PiPerToken && <span> • PI per Token: {(entry as any).PiPerToken}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                    {tokenData.tickHistory.length > 5 && (
                      <div className="history-more">
                        <details>
                          <summary className="view-more">
                            View {tokenData.tickHistory.length - 5} more entries...
                          </summary>
                          <div className="history-container">
                            {tokenData.tickHistory.slice(5).map((entry: TickHistoryEntry, idx: number) => (
                              <div key={idx + 5} className={`history-entry ${(idx + 5) % 2 === 0 ? 'history-entry-even' : ''}`}>
                                <div className="history-entry-row">
                                  <span>Date: {new Date(entry.Timestamp * 1000).toLocaleString()}</span>
                                  <span>Amount: <strong>{entry.TokensDistributed || entry.PiReceived || '0'}</strong></span>
                                </div>
                                {entry.YieldCycle && (
                                  <div className="history-cycle">
                                    Cycle: {entry.YieldCycle}
                                    {(entry as any).PiPerToken && <span> • PI per Token: {(entry as any).PiPerToken}</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-history">
                  No yield history available. 
                  <button 
                    className="refresh"
                    onClick={() => fetchTokenData(piClient, baseClient, true)}
                    style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '2px 6px' }}
                  >
                    Check Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default TokenCard;
