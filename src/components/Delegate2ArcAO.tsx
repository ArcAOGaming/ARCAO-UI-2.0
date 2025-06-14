import React, { useState, useEffect } from 'react';
import { useWallet } from '../shared-components/Wallet/WalletContext';
import { PIDelegateClient } from 'ao-js-sdk';
import './Delegate2ArcAO.css';
import { AO } from '@arcaogaming/project-links';

// Type definitions for delegation data
interface DelegationInfo {
  walletTo: string;
  factor: number;
  percentage: number;
}

const Delegate2ArcAO: React.FC = () => {
  // State for wallet and client
  const { isConnected, address } = useWallet();
  const [delegateClient, setDelegateClient] = useState<PIDelegateClient | null>(null);
  
  // State for delegation data
  const [delegations, setDelegations] = useState<DelegationInfo[]>([]);
  const [totalFactor, setTotalFactor] = useState<number>(0);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    fetchingDelegations: false,
    updatingDelegation: false
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // ARCAO wallet address //TODO swap this out for our wallet
  const ARCAO_WALLET = 'nYHhoSEtelyL3nQ6_CFoOVnZfnz2VHK-nEez962YMm8';

  // Initialize the Delegate client
  useEffect(() => {
    if (isConnected && address) {
      initDelegateClient();
    }
  }, [isConnected, address]);

  // Initialize delegate client
  const initDelegateClient = () => {
    const PI_DELEGATE_PROCESS_ID = 'cuxSKjGJ-WDB9PzSkVkVVrIBSh3DrYHYz44usQOj5yE';
    
    console.log('Creating a PIDelegateClient with improved error handling');
    
    const client = PIDelegateClient.builder()
      .withProcessId(PI_DELEGATE_PROCESS_ID)
      .withAOConfig({
        MODE: 'legacy',
        CU_URL: "https://ur-cu.randao.net"
      })
      .build();
    
    console.log('PIDelegateClient created');
    setDelegateClient(client);
    
    // Fetch delegations once the client is initialized
    fetchDelegations(client);
    
    return client;
  };

  // Function to fetch delegations with fallback
  const fetchDelegations = async (client: PIDelegateClient) => {
    if (!address) {
      setError('Wallet not connected. Please connect your wallet.');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, fetchingDelegations: true }));
      setError(null);
      console.log('Fetching delegation information with fallbacks...');
      
      // Set up fallback endpoints to try in order
      const endpoints = [
        "https://ur-cu.randao.net",
        "https://cu4.randao.net", 
        "https://ao-testnet-cu.onrender.com",
        "https://ao-cu.web.app"
      ];
      
      // Create timeout promise
      const createTimeoutPromise = () => {
        return new Promise<string>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Delegation info request timed out after 15 seconds'));
          }, 15000);
        });
      };
      
      // Try to get delegation data with fallback
      let delegationDataStr = '';
      let lastError: Error | null = null;
      let success = false;
      
      // Try each endpoint until one succeeds or all fail
      for (const endpoint of endpoints) {
        if (success) break;
        
        try {
          console.log(`Attempting to use endpoint: ${endpoint}`);
          // Create a client configured with the current endpoint
          const tempClient = PIDelegateClient.builder()
            .withProcessId(client.baseConfig.processId)
            .withAOConfig({
              MODE: 'legacy',
              CU_URL: endpoint
            })
            .build();
          
          // Race between the getDelegation call and a timeout
          delegationDataStr = await Promise.race([
            tempClient.getDelegation(address),
            createTimeoutPromise()
          ]);
          
          // If we get here, the call succeeded
          console.log(`Successfully got delegation data from ${endpoint}`);
          success = true;
        } catch (error) {
          console.warn(`Error with endpoint ${endpoint}:`, error);
          lastError = error as Error;
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed, use a default empty response
      if (!success) {
        console.error('All endpoints failed:', lastError);
        delegationDataStr = JSON.stringify({
          totalFactor: "0",
          delegationPrefs: [],
          lastUpdate: Date.now(),
          wallet: address || "unknown"
        });
      }
      
      if (!delegationDataStr) {
        setError('No delegation data returned');
        return;
      }
      
      // Parse the delegation data
      try {
        const delegationInfo = JSON.parse(delegationDataStr);
        console.log('Parsed delegation info:', delegationInfo);
        
        // Get the total factor and delegations
        const totalFactor = parseInt(delegationInfo.totalFactor) || 0;
        setTotalFactor(totalFactor);
        
        // Calculate percentages and create delegation list
        const delegationList: DelegationInfo[] = [];
        
        if (delegationInfo.delegationPrefs && delegationInfo.delegationPrefs.length > 0) {
          for (const pref of delegationInfo.delegationPrefs) {
            const { walletTo, factor } = pref;
            const factorNum = parseInt(factor);
            
            // Calculate percentage with 2 decimal places
            const percentage = parseFloat(((factorNum / totalFactor) * 100).toFixed(2));
            
            delegationList.push({
              walletTo,
              factor: factorNum,
              percentage
            });
          }
          
          console.log(`Found ${delegationList.length} delegation entries`);
        } else {
          console.log('No delegation preferences found in the data');
        }
        
        setDelegations(delegationList);
      } catch (parseError) {
        console.error('Error parsing delegation data:', parseError);
        setError('Error parsing delegation data');
      }
    } catch (error: any) {
      console.error('Error in delegation info flow:', error);
      setError(error.message || 'Error fetching delegation information');
    } finally {
      setLoading(prev => ({ ...prev, fetchingDelegations: false }));
    }
  };

  // Function to update a delegation with fallback endpoints
  const updateDelegation = async (walletTo: string, factor: number) => {
    if (!delegateClient || !address) {
      setError('Delegate client or wallet address not available');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, updatingDelegation: true }));
      setError(null);
      setSuccess(null);
      console.log('Updating delegation preference with fallback mechanism...');
      
      const delegationData = {
        walletFrom: address,
        walletTo: walletTo,
        factor: factor
      };
      
      console.log('Delegation data to send:', delegationData);
      
      // Set up fallback endpoints to try in order
      const endpoints = [
        "https://ur-cu.randao.net",
        "https://cu4.randao.net", 
        "https://ao-testnet-cu.onrender.com",
        "https://ao-cu.web.app"
      ];
      
      // Create timeout promise - will reject after 15 seconds
      const createTimeoutPromise = () => {
        return new Promise<string>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Delegation update request timed out after 15 seconds'));
          }, 15000);
        });
      };
      
      // Track last error and success status
      let lastError: Error | null = null;
      let operationSuccess = false;
      let result = '';
      
      // Try each endpoint until one succeeds or all fail
      for (const endpoint of endpoints) {
        if (operationSuccess) break;
        
        try {
          console.log(`Attempting to update delegation using endpoint: ${endpoint}`);
          
          // Create a client configured with the current endpoint
          const tempClient = PIDelegateClient.builder()
            .withProcessId(delegateClient.baseConfig.processId)
            .withAOConfig({
              MODE: 'legacy',
              CU_URL: endpoint
            })
            .build();
          
          // Race between the setDelegation call and a timeout
          result = await Promise.race([
            tempClient.setDelegation(delegationData as any),
            createTimeoutPromise()
          ]);
          
          // If we get here, the call succeeded
          console.log(`Successfully updated delegation using ${endpoint}`);
          operationSuccess = true;
        } catch (error) {
          console.warn(`Error with endpoint ${endpoint}:`, error);
          lastError = error as Error;
          // Continue to next endpoint
        }
      }
      
      // Check if any endpoint succeeded
      if (!operationSuccess) {
        throw lastError || new Error('All endpoints failed when updating delegation');
      }
      
      console.log('Delegation update result:', result);
      
      // Refresh delegations
      await fetchDelegations(delegateClient);
      
      setSuccess(`Successfully updated delegation to ${walletTo}`);
    } catch (error: any) {
      console.error('Error updating delegation:', error);
      setError(error.message || 'Error updating delegation');
    } finally {
      setLoading(prev => ({ ...prev, updatingDelegation: false }));
    }
  };

  // Delegate 100% to ArcAO - this works by:
  // 1. First clearing all existing delegations by setting them to 0
  // 2. Then setting the ArcAO delegation to 100%
  const delegateToArcAO = async () => {
    if (!delegateClient || !address || loading.updatingDelegation) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, updatingDelegation: true }));
      setError(null);
      setSuccess(null);
      
      // First, clear all existing delegations by setting them to 0
      for (const delegation of delegations) {
        if (delegation.walletTo !== ARCAO_WALLET && delegation.factor > 0) {
          console.log(`Clearing delegation to ${delegation.walletTo}`);
          
          // Create delegationData for zeroing out
          const delegationData = {
            walletFrom: address,
            walletTo: delegation.walletTo,
            factor: 0
          };
          
          await updateDelegation(delegation.walletTo, 0);
        }
      }
      
      // Now set 100% delegation to ArcAO (factor 10000 = 100%)
      await updateDelegation(ARCAO_WALLET, 10000);
      
      setSuccess('Successfully delegated 100% to ArcAO');
    } catch (error: any) {
      console.error('Error in full delegation process:', error);
      setError(error.message || 'Error delegating to ArcAO');
    } finally {
      setLoading(prev => ({ ...prev, updatingDelegation: false }));
    }
  };

  // Format wallet address for display (truncate)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  // Check if a wallet is the ArcAO wallet
  const isArcAOWallet = (wallet: string) => {
    return wallet === ARCAO_WALLET;
  };

  return (
    <div className="delegate-container">
      <h1>Delegate to ArcAO</h1>
      
      {!isConnected ? (
        <div className="connect-wallet-message">
          <p>Please connect your wallet to manage delegations</p>
        </div>
      ) : (
        <div className="delegation-content">
          <div className="delegations-header">
            <h2>Your Current Delegations</h2>
            <button 
              className="refresh-button" 
              onClick={() => delegateClient && fetchDelegations(delegateClient)}
              disabled={loading.fetchingDelegations}
            >
              {loading.fetchingDelegations ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {loading.fetchingDelegations ? (
            <div className="loading">Loading delegations...</div>
          ) : delegations.length === 0 ? (
            <div className="no-delegations">
              <p>You don't have any delegations set up yet.</p>
            </div>
          ) : (
            <div className="delegations-list">
              <div className="delegations-table">
                <div className="table-header">
                  <div className="wallet-column">Delegated</div>
                  <div className="percentage-column">Percentage</div>
                  <div className="actions-column">Actions</div>
                </div>
                
                {delegations.map((delegation, index) => (
                  <div key={index} className={`delegation-row ${isArcAOWallet(delegation.walletTo) ? 'arcao-delegation' : ''}`}>
                    <div className="wallet-column">
                      {isArcAOWallet(delegation.walletTo) ? (
                        <span className="arcao-badge">ArcAO</span>
                      ) : ''} 
                      {formatAddress(delegation.walletTo)}
                    </div>
                    <div className="percentage-column">{delegation.percentage}%</div>
                    <div className="actions-column">
                      <button 
                        onClick={() => updateDelegation(delegation.walletTo, 0)}
                        disabled={loading.updatingDelegation || delegation.factor === 0}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="total-row">
                  <div className="wallet-column">Total</div>
                  <div className="percentage-column">100%</div>
                  <div className="actions-column"></div>
                </div>
              </div>
            </div>
          )}
          
          <div className="delegation-actions">
            <button 
              className="delegate-arcao-button" 
              onClick={delegateToArcAO}
              disabled={loading.updatingDelegation}
            >
              {loading.updatingDelegation ? 'Processing...' : 'Delegate to ArcAO'}
            </button>
            
            <div className="info-note">
              <p><strong>Support the Future of ArcAO</strong></p>

              <p>
              By delegating your <strong>AO Yield</strong> to the <strong>ArcAO Fair Launch</strong>, you’re not just redirecting resources—you’re becoming an <strong>early-stage funder</strong> of the ArcAO ecosystem.
              </p>

              <p>
              This exclusive delegation sets <strong>ArcAO as your sole delegate</strong>, helping power its growth and development.
              </p>
              <p>
                Want more control? Visit the <a href={AO.delegate}>AO Delegations Page</a> for granular options.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delegate2ArcAO;
