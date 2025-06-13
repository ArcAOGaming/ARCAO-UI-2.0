import React, { useState, useEffect } from 'react';
import { DelegationInfo } from 'ao-process-clients/dist/src/clients/pi/delegate/abstract/types';
import { PIToken } from 'ao-process-clients/dist/src/clients/pi/oracle/abstract/IPIOracleClient';
import { useWallet } from '../../../shared-components/Wallet/WalletContext';
import { dryrun } from '../../../config/aoConnection';
import '../../Mint.css';

interface DelegationManagementProps {
  delegationData: DelegationInfo | null;
  delegationForm: {
    walletTo: string;
    factor: number;
    formDirty: boolean;
  };
  loading: {
    delegationInfo: boolean;
    updatingDelegation: boolean;
  };
  handleDelegationChange: (field: 'walletTo' | 'factor', value: string) => void;
  updateDelegation: () => Promise<void>;
  renderLoadingState: (key: string) => JSX.Element | null;
  renderError: (key: string) => JSX.Element | null;
  tokens?: PIToken[];
  processToTokenMap?: Map<string, PIToken>;
}

const DelegationManagement: React.FC<DelegationManagementProps> = ({
  delegationData,
  delegationForm,
  loading,
  handleDelegationChange,
  updateDelegation,
  renderLoadingState,
  renderError,
  tokens,
  processToTokenMap = new Map()
}) => {
  // Get the wallet info to check for self-delegations and create clients
  const { address: walletAddress, isConnected } = useWallet();
  
  // State to store token balances
  const [tokenBalances, setTokenBalances] = useState<Map<string, string>>(new Map());
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  
  // Fetch token balances for delegations
  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!delegationData?.delegationPrefs || !walletAddress || !isConnected) return;
      
      setIsLoadingBalances(true);
      const newBalances = new Map<string, string>();
      
      try {
        // Process delegations in parallel
        await Promise.all(delegationData.delegationPrefs.map(async (pref) => {
          // Check if this is the user's own address (self-delegation)
          const isSelfDelegation = walletAddress && pref.walletTo === walletAddress;
          
          // For self-delegations, use AO token process ID
          const AO_TOKEN_PROCESS_ID = '0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc';
          
          // Get token display info for the delegation address
          const matchingToken = processToTokenMap.get(pref.walletTo);
          
          // The token display object - either AO token for self-delegations or the matched token
          const token = isSelfDelegation ? {
            ticker: 'AO',
            status: 'active',
            process: AO_TOKEN_PROCESS_ID
          } : matchingToken;
          
          // IMPORTANT: Use the base token process ID (flp_token_process) instead of the delegation address
          // for making the token client, except for self-delegations where we use AO token
          const processId = isSelfDelegation 
            ? AO_TOKEN_PROCESS_ID 
            : (matchingToken?.flp_token_process || pref.walletTo); // Fall back to delegation address if no flp_token_process
          
          try {
            // Use dryrun directly to get balance information
            // This avoids the wallet integration issues with TokenClient
            console.log(`Fetching balance for delegation to ${pref.walletTo}`);
            console.log(`Using base token process ID ${processId}${isSelfDelegation ? ' (AO Token)' : matchingToken?.flp_token_process ? ' (flp_token_process)' : ' (fallback to delegation address)'}`);
            
            const response = await dryrun({
              process: processId,
              tags: [
                { name: "Action", value: "Balance" },
                { name: "Target", value: walletAddress }
              ]
            });
            
            const balance = response?.Messages?.[0]?.Data || '0';
            console.log(`Balance for ${matchingToken?.ticker || 'AO'} token (${processId}): ${balance}`);
            
            // Store balance using the process ID as the key
            newBalances.set(processId, balance);
            
            // If this delegation has a matching token, also store the balance under the token's process ID
            if (token && token.process) {
              newBalances.set(token.process, balance);
            }
          } catch (error) {
            console.error(`Failed to get balance for delegation to ${pref.walletTo}:`, error);
            newBalances.set(processId, '0');
            if (token?.process) {
              newBalances.set(token.process, '0');
            }
          }
        }));
        
        setTokenBalances(newBalances);
      } catch (error) {
        console.error('Error fetching token balances:', error);
      } finally {
        setIsLoadingBalances(false);
      }
    };
    
    fetchTokenBalances();
  }, [delegationData, walletAddress, isConnected, processToTokenMap]);
  return (
    <div>
      <h2 className="section-title">Delegation Management</h2>
      {renderLoadingState('delegationInfo')}
      {renderError('delegationInfo')}
      {renderLoadingState('updatingDelegation')}
      {renderError('updatingDelegation')}
      <div className="data-card">
        <h3>Your Delegation Preferences</h3>
        {delegationData && (
          <>
            <p>Total Factor: {delegationData.totalFactor} ({delegationData.totalFactor === '10000' ? '100%' : `${parseInt(delegationData.totalFactor)/100}%`})</p>
            <p>Last Updated: {new Date(delegationData.lastUpdate).toLocaleString()}</p>
            <p>Your Address: {delegationData.wallet ? <span title="Click to copy" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(delegationData.wallet)}>{`${delegationData.wallet.slice(0, 4)}...${delegationData.wallet.slice(-4)}`}</span> : 'N/A'}</p>
            
            <div className="form-section">
              <h4>Set Single Delegation</h4>
              <div className="form-row">
                <label className="form-label">Delegation Address:</label>
                <input 
                  className="form-input"
                  type="text" 
                  value={delegationForm.walletTo}
                  onChange={(e) => handleDelegationChange('walletTo', e.target.value)}
                  placeholder="Enter destination process ID or wallet address"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Factor (0-10000):</label>
                <input 
                  className="form-input"
                  type="number" 
                  value={delegationForm.factor}
                  onChange={(e) => handleDelegationChange('factor', e.target.value)}
                  placeholder="Enter factor value (basis points out of 10000)"
                />
              </div>
              <div className="form-row">
                <button 
                  className="button"
                  onClick={updateDelegation} 
                  disabled={!delegationForm.formDirty || loading.updatingDelegation || !delegationForm.walletTo}
                >
                  {loading.updatingDelegation ? 'Setting Delegation...' : 'Set Delegation'}
                </button>
              </div>
              <p className="factor-note">
                Note: Factor is measured in basis points (1/100 of a percent). 10000 = 100%, 5000 = 50%, 500 = 5%, etc.
              </p>
            </div>
            
            <h4>Current Delegations</h4>
            <div style={{ marginTop: '10px' }}>
              {delegationData.delegationPrefs && delegationData.delegationPrefs.length > 0 ? (
                <table className="delegations-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Delegation Address</th>
                      <th className="right">Factor</th>
                      <th className="right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delegationData.delegationPrefs.map((pref: {walletTo: string; factor: number}, index: number) => {
                      const percentage = parseFloat(((pref.factor / parseInt(delegationData.totalFactor)) * 100).toFixed(2));
                      
                      // Check if this is the user's own address (self-delegation)
                      const isSelfDelegation = walletAddress && pref.walletTo === walletAddress;
                      
                      // Find token associated with this address
                      const matchingToken = processToTokenMap.get(pref.walletTo);
                      
                      // For self-delegations, create an AOToken display object
                      // Using the same process ID as in the fetchTokenBalances function
                      const AO_TOKEN_PROCESS_ID = '0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc';
                      const token = isSelfDelegation ? {
                        ticker: 'AO',
                        status: 'active',
                        process: AO_TOKEN_PROCESS_ID
                      } : (matchingToken || null);
                      
                      const ticker = token?.ticker || token?.flp_token_ticker || '';
                      const shortAddr = `${pref.walletTo.slice(0, 4)}...${pref.walletTo.slice(-4)}`;
                      
                      return (
                        <tr key={index}>
                          <td>
                            {token ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {token.flp_token_logo ? (
                                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden' }}>
                                    <img 
                                      src={`https://arweave.net/${token.flp_token_logo}`}
                                      alt={ticker} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                    color: '#777'
                                  }}>
                                    {ticker.slice(0, 2)}
                                  </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span 
                                    title={`Click to copy token ID: ${token?.process || 'Unknown'}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                      if (token?.process) {
                                        // Copy to clipboard
                                        navigator.clipboard.writeText(token.process);
                                        
                                        // Create temporary "Copied!" tooltip
                                        const target = e.currentTarget;
                                        const originalTitle = target.title;
                                        
                                        // Change title to "Copied!"
                                        target.title = "Copied!";
                                        target.style.color = "#28a745";
                                        
                                        // Reset after 1.5 seconds
                                        setTimeout(() => {
                                          target.title = originalTitle;
                                          target.style.color = "";
                                        }, 1500);
                                      }
                                    }}
                                  >
                                    {ticker} <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                      ({token?.process ? `${token.process.slice(0, 4)}...${token.process.slice(-4)}` : 'Unknown ID'})
                                    </span>
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {isLoadingBalances ? 'Loading...' : `Balance: ${tokenBalances.get(pref.walletTo) || tokenBalances.get(token?.process || '') || '0'}`}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <span 
                              title="Click to copy to clipboard"
                              style={{ cursor: 'pointer' }}
                              onClick={() => navigator.clipboard.writeText(pref.walletTo)}
                            >
                              {`${pref.walletTo.slice(0, 4)}...${pref.walletTo.slice(-4)}`}
                            </span>
                          </td>
                          <td className="right">{pref.factor}</td>
                          <td className="right">{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>No delegation preferences set.</p>
              )}
            </div>
          </>
        )}
        {!delegationData && !loading.delegationInfo && (
          <p>No delegation data available. Connect your wallet to view and manage delegations.</p>
        )}
      </div>
    </div>
  );
};

export default DelegationManagement;
