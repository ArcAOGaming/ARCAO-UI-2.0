import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  PIOracleClient,
  PITokenClient, 
  PIDelegateClient
} from 'ao-js-sdk/dist/src/clients/pi';
// Use specific type imports from their correct locations
import { PIToken } from 'ao-js-sdk/dist/src/clients/pi/oracle/abstract/IPIOracleClient';
import { TickHistoryEntry } from 'ao-js-sdk/dist/src/clients/pi/PIToken/abstract/IPITokenClient';
import { DelegationInfo } from 'ao-js-sdk/dist/src/clients/pi/delegate/abstract/types';
import { TokenData } from 'ao-js-sdk/dist/src/clients/pi/PIToken/types';
import { TokenClientMap, TokenClientPair, StateStructure } from 'ao-js-sdk/dist/src/clients/pi/oracle/types';
import { TokenClient } from 'ao-js-sdk/dist/src/clients/ao';
import { DryRunResult } from '@permaweb/aoconnect/dist/lib/dryrun';
import { useWallet } from '../shared-components/Wallet/WalletContext';
import './Mint.css';

// Import new component files
import PITokens from './mint/components/PITokens';
import DelegationManagement from './mint/components/DelegationManagement';

// StateStructure type is now imported from ao-js-sdk

// All styled components have been replaced with CSS classes from Mint.css

// Helper component for loading spinner
// Helper components for the Mint component

const LoadingSpinner: React.FC = () => {
  return <div className="loading-spinner"></div>;
};


// TokenClientPair and TokenClientMap types are now imported from ao-js-sdk

// TokenData type is now imported from ao-js-sdk

const Mint: React.FC = () => {
  // Get the wallet address from the wallet context
  const { address: walletAddress } = useWallet();
  
  const [oracleClient, setOracleClient] = useState<PIOracleClient | null>(null);
  const [delegateClient, setDelegateClient] = useState<PIDelegateClient | null>(null);
  const [infoData, setInfoData] = useState<DryRunResult | null>(null);
  const [tokenInfo, setTokenInfo] = useState<DryRunResult | null>(null);
  const [delegateInfo, setDelegateInfo] = useState<DryRunResult | null>(null);
  const [delegationData, setDelegationData] = useState<DelegationInfo | null>(null);
  const [tickHistoryData, setTickHistoryData] = useState<TickHistoryEntry[]>([]);
  const [piTokensData, setPiTokensData] = useState<PIToken[]>([]);
  const [balanceData, setBalanceData] = useState<string>('');
  const [claimableBalanceData, setClaimableBalanceData] = useState<string>('');
  const [tokenClients, setTokenClients] = useState<TokenClientMap>({});
  const [tokensMap, setTokensMap] = useState<Map<string, PIToken>>(new Map());
  const [tokenClientPairs, setTokenClientPairs] = useState<[PITokenClient, TokenClient][]>([]);
  const [tokenDataMap, setTokenDataMap] = useState<Map<string, TokenData>>(new Map());
  const [baseTokenDataMap, setBaseTokenDataMap] = useState<Map<string, {
    balance: string;
    info: DryRunResult | null;
  }>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState<{[key: string]: boolean}>({});
  const [delegationMap, setDelegationMap] = useState<Map<string, number>>(new Map()); // Map of token ID to delegation percentage
  
  const [loading, setLoading] = useState<StateStructure>({
    oracleClient: false,
    delegateClient: false,
    delegateInfo: false,
    piTokens: false,
    tokenInfo: false,
    tickHistory: false,
    balance: false,
    claimableBalance: false,
    tokenClients: false,
    tokenClientPairs: false,
    delegationInfo: false,
    updatingDelegation: false
  });
  
  // State for delegation management form
  const [delegationForm, setDelegationForm] = useState({
    walletTo: '',
    factor: 500,
    formDirty: false
  });
  
  const [errors, setErrors] = useState<{[key: string]: string | null}>({
    oracleClient: null,
    delegateClient: null,
    delegateInfo: null,
    piTokens: null,
    tokenInfo: null,
    tickHistory: null,
    balance: null,
    claimableBalance: null,
    tokenClients: null,
    tokenClientPairs: null,
    delegationInfo: null,
    updatingDelegation: null
  });

  // Use ref to track if we've already loaded data
  // This prevents duplicate data loading in React StrictMode
  const dataLoadedRef = React.useRef(false);

  useEffect(() => {
    // Skip duplicate initialization in StrictMode
    if (dataLoadedRef.current) {
      console.log('Skipping duplicate initialization in StrictMode');
      return;
    }
    
    // Mark as loaded to prevent duplicates
    dataLoadedRef.current = true;
    
    // Initialize the Oracle client with custom CU URL
    const initOracleClient = () => {
      // Process ID for the Oracle client (from ao-js-sdk constants)
      const DELEGATION_ORACLE_PROCESS_ID = 'It-_AKlEfARBmJdbJew1nG9_hIaZt0t20wQc28mFGBE';
      
      // Create an instance with custom CU URL using the static build method
      const client = PIOracleClient.builder()
        .withProcessId(DELEGATION_ORACLE_PROCESS_ID) // Add the required process ID
        .withAOConfig({
          MODE: 'legacy',
          CU_URL: "https://ur-cu.randao.net"
        })
        .build();
      setOracleClient(client);
      return client;
    };
    
    // Initialize the Delegate client with custom CU URL
    const initDelegateClient = () => {
      // Process ID for the Delegate client (from ao-js-sdk constants)
      const PI_DELEGATE_PROCESS_ID = 'cuxSKjGJ-WDB9PzSkVkVVrIBSh3DrYHYz44usQOj5yE';
      
      console.log('Creating a PIDelegateClient with improved error handling');
      
      // Create the client with the primary endpoint
      const client = PIDelegateClient.builder()
        .withProcessId(PI_DELEGATE_PROCESS_ID) // Add the required process ID
        .withAOConfig({
          MODE: 'legacy',
          CU_URL: "https://ur-cu.randao.net"
        })
        .build();
      
      console.log('PIDelegateClient created');
      setDelegateClient(client);
      return client;
    };
    
    console.log('Initializing clients and fetching data (first load)');
    // Create the clients and fetch all data
    const oracleClientInstance = initOracleClient();
    const delegateClientInstance = initDelegateClient();
    fetchAllData(oracleClientInstance, delegateClientInstance);
  }, []);
  
  // Add a specific useEffect to refresh delegation data when wallet address changes
  useEffect(() => {
    if (walletAddress && delegateClient) {
      console.log('Wallet address changed, fetching delegation info...');
      fetchDelegationInfo(delegateClient);
    }
  }, [walletAddress, delegateClient]);
  
  // We don't need this useEffect anymore since we're handling token data fetching in fetchAllData
  // This useEffect was causing duplicate API calls for each token

  const fetchAllData = async (oracleClient: PIOracleClient, delegateClient: PIDelegateClient) => {
    console.log('Starting initial data fetch - optimized to avoid duplicate API calls');
    
    try {
      // IMPORTANT: We need to fetch tokens data FIRST and only ONCE
      // This avoids the duplicate network requests
      let tokensData: string = '';
      let parsedTokens: PIToken[] = [];
      
      try {
        setLoading(prev => ({ ...prev, piTokens: true, tokensMap: true }));
        console.log('Fetching PI tokens (single request)');
        
        // Get tokens data just once
        tokensData = await oracleClient.getPITokens();
        parsedTokens = oracleClient.parsePITokens(tokensData);
        
        // Store the parsed token data
        setPiTokensData(parsedTokens);
        
        // Create and store the tokens map manually (without making another API call)
        const tokensMap = new Map<string, PIToken>();
        for (const token of parsedTokens) {
          if (token.flp_token_ticker) {
            tokensMap.set(token.flp_token_ticker, token);
          }
        }
        setTokensMap(tokensMap);
        
        setErrors(prev => ({ ...prev, piTokens: null, tokensMap: null }));
        console.log(`Successfully fetched ${parsedTokens.length} PI tokens in a single request`);
      } catch (error: any) {
        console.error('Error fetching PI tokens:', error);
        setErrors(prev => ({
          ...prev,
          piTokens: error.message,
          tokensMap: error.message
        }));
      } finally {
        setLoading(prev => ({ ...prev, piTokens: false, tokensMap: false }));
      }
      
      // Now fetch oracle info and delegation info in parallel
      const [infoResult, delegationInfoResult] = await Promise.all([
        // Get general info
        (async () => {
          try {
            setLoading(prev => ({ ...prev, info: true }));
            const data = await oracleClient.getInfo();
            setInfoData(data);
            setErrors(prev => ({ ...prev, info: null }));
            return data;
          } catch (error: any) {
            console.error('Error fetching info:', error);
            setErrors(prev => ({ ...prev, info: error.message }));
            return null;
          } finally {
            setLoading(prev => ({ ...prev, info: false }));
          }
        })(),
        
        // Get delegation info
        (async () => {
          if (!walletAddress) return null;
          return fetchDelegationInfo(delegateClient);
        })()
      ]);
      
      // Step 3: Now create token clients using the information we already have
      try {
        setLoading(prev => ({ ...prev, tokenClients: true, tokenClientPairs: true }));
        
        // Use the built-in method from ao-js-sdk to create client pairs
        // This now uses the default builder pattern under the hood
        const clientPairs = await oracleClient.createTokenClientPairsArray();
        
        console.log(`Created ${clientPairs.length} token client pairs (without redundant API call)`);
        setTokenClientPairs(clientPairs);
        
        // Convert to map format for backward compatibility
        const clientsObj: TokenClientMap = {};
        clientPairs.forEach(([piClient, baseClient], index) => {
          const key = piClient.baseConfig.processId;
          clientsObj[key] = {
            piClient,
            baseClient
          };
          
          // Only process the token data using the information we already have from tokensMap
          // This eliminates redundant API calls to each token
          const tokenId = piClient.baseConfig.processId;
          const processId = baseClient.baseConfig.processId;
          
          // Find matching token in the tokens map (we already have this data)
          const token = Array.from(tokensMap.values()).find(t => 
            t.id === tokenId || t.process === processId || t.flp_token_process === processId);
          
          if (token) {
            // Pre-populate token data with what we already know from tokensMap
            // This eliminates the need for separate API calls to each token
            const ticker = token.ticker || token.flp_token_ticker || 'Unknown';
            const name = token.flp_token_name || ticker;
            const treasury = token.treasury || '';
            const status = token.status || '';
            const logoUrl = token.flp_token_logo ? `https://arweave.net/${token.flp_token_logo}` : '';
            
            setTokenDataMap(prev => new Map(prev).set(tokenId, {
              tokenId,
              processId,
              ticker,
              name,
              treasury,
              status,
              logoUrl,
              balance: '0',         // These will be fetched only when a user interacts with the token
              claimableBalance: '0', // to eliminate unnecessary network requests on page load
              tickHistory: [],
              isLoading: false
            }));
          }
          
          // We'll load detailed token data (balance, history) only when a user interacts with a token or uses refresh
        });
        
        setTokenClients(clientsObj);
        setErrors(prev => ({ ...prev, tokenClients: null, tokenClientPairs: null }));
      } catch (error: any) {
        console.error('Error creating token clients:', error);
        setErrors(prev => ({ ...prev, tokenClients: error.message, tokenClientPairs: error.message }));
      } finally {
        setLoading(prev => ({ ...prev, tokenClients: false, tokenClientPairs: false }));
      }
    } catch (error) {
      console.error('Error in fetchAllData:', error);
    }
  };

  // Oracle client functions
  const fetchInfo = async (client: PIOracleClient) => {
    try {
      setLoading(prev => ({ ...prev, info: true }));
      const data = await client.getInfo();
      setInfoData(data);
      setErrors(prev => ({ ...prev, info: null }));
    } catch (error: any) {
      console.error('Error fetching info:', error);
      setErrors(prev => ({ ...prev, info: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, info: false }));
    }
  };

  const fetchPITokens = async (client: PIOracleClient) => {
    try {
      setLoading(prev => ({ ...prev, piTokens: true }));
      const data = await client.getPITokens();
      const parsedData = client.parsePITokens(data);
      setPiTokensData(parsedData);
      setErrors(prev => ({ ...prev, piTokens: null }));
    } catch (error: any) {
      console.error('Error fetching PI tokens:', error);
      setErrors(prev => ({ ...prev, piTokens: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, piTokens: false }));
    }
  };

  const fetchTokensMap = async (client: PIOracleClient) => {
    try {
      setLoading(prev => ({ ...prev, tokensMap: true }));
      const map = await client.getTokensMap();
      setTokensMap(map);
      setErrors(prev => ({ ...prev, tokensMap: null }));
    } catch (error: any) {
      console.error('Error fetching tokens map:', error);
      setErrors(prev => ({ ...prev, tokensMap: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, tokensMap: false }));
    }
  };
  
  const fetchTokenClients = async (client: PIOracleClient) => {
    try {
      setLoading(prev => ({ ...prev, tokenClients: true }));
      // Use the createTokenClientPairs method that now uses default builders
      const clientPairsMap = await client.createTokenClientPairs();
      
      // Convert Map to object for easier state management
      const clientsObj: TokenClientMap = {};
      clientPairsMap.forEach((value: [PITokenClient, TokenClient], key: string) => {
        const [piClient, baseClient] = value;
        clientsObj[key] = {
          piClient,
          baseClient
        };
      });
      
      setTokenClients(clientsObj);
      setErrors(prev => ({ ...prev, tokenClients: null }));
    } catch (error: any) {
      console.error('Error creating token clients:', error);
      setErrors(prev => ({ ...prev, tokenClients: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, tokenClients: false }));
    }
  };

  const fetchTokenClientPairs = async (client: PIOracleClient) => {
    try {
      setLoading(prev => ({ ...prev, tokenClientPairs: true }));
      // This method now uses default builders under the hood
      const clientPairs = await client.createTokenClientPairsArray();
      setTokenClientPairs(clientPairs);
      setErrors(prev => ({ ...prev, tokenClientPairs: null }));
    } catch (error: any) {
      console.error('Error creating token client pairs:', error);
      setErrors(prev => ({ ...prev, tokenClientPairs: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, tokenClientPairs: false }));
    }
  };
  
  // Function to fetch delegation information with improved error handling and fallback
  const fetchDelegationInfo = async (client: PIDelegateClient) => {
    try {
      setLoading(prev => ({ ...prev, delegationInfo: true }));
      console.log('Fetching delegation information with enhanced error handling...');
      
      // Check if wallet address is available
      if (!walletAddress) {
        console.warn('No wallet address available for delegation check');
        return;
      }
      
      console.log(`Using wallet address for delegation check: ${walletAddress}`);
      
      // Set up fallback endpoints to try in order
      const endpoints = [
        "https://ur-cu.randao.net",
        "https://cu4.randao.net", 
        "https://ao-testnet-cu.onrender.com",
        "https://ao-cu.web.app"
      ];
      
      // Create timeout promise - will reject after 15 seconds (from memory)
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
            tempClient.getDelegation(walletAddress),
            createTimeoutPromise()
          ]);
          
          // If we get here, the call succeeded
          console.log(`Successfully got delegation data from ${endpoint}`);
          success = true;
          
          // Log the data for debugging
          console.log('Raw delegation data string:', delegationDataStr);
          try {
            const rawDataObj = JSON.parse(delegationDataStr);
            console.log('Raw delegation data as object:', rawDataObj);
            console.log('Total factor:', rawDataObj.totalFactor);
            console.log('Delegation preferences:', rawDataObj.delegationPrefs);
            console.log('Last update:', new Date(rawDataObj.lastUpdate).toLocaleString());
            console.log('Wallet:', rawDataObj.wallet);
          } catch (parseErr) {
            console.error('Error parsing raw delegation data:', parseErr);
          }
        } catch (error) {
          console.warn(`Error with endpoint ${endpoint}:`, error);
          lastError = error as Error;
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed, use a default empty response
      if (!success) {
        console.error('All endpoints failed:', lastError);
        console.log('Using default empty delegation data');
        delegationDataStr = JSON.stringify({
          totalFactor: "0",
          delegationPrefs: [],
          lastUpdate: Date.now(),
          wallet: walletAddress || "unknown"
        });
      }
      
      if (!delegationDataStr) {
        console.log('No delegation data available');
        return;
      }
      
      // Parse delegation info with robust error handling
      let delegationInfo: DelegationInfo | null = null;
      try {
        delegationInfo = client.parseDelegationInfo(delegationDataStr);
        setDelegationData(delegationInfo);
        console.log('Parsed delegation info:', delegationInfo);
        
        // Don't initialize the form with preferences since we now handle one delegation at a time
        console.log('Current wallet address:', walletAddress);
      } catch (error) {
        console.error('Error parsing delegation data:', error);
        return;
      }
      
      // Calculate delegation percentages for each token
      const newDelegationMap = new Map<string, number>();
      
      if (delegationInfo && delegationInfo.delegationPrefs && delegationInfo.delegationPrefs.length > 0) {
        const totalFactor = parseInt(delegationInfo.totalFactor) || 10000;
        console.log(`Total delegation factor: ${totalFactor}`);
        
        // Process each delegation preference
        for (const pref of delegationInfo.delegationPrefs) {
          const { walletTo, factor } = pref;
          
          // Calculate percentage with 2 decimal places
          const percentage = parseFloat(((factor / totalFactor) * 100).toFixed(2));
          
          // Add to the map
          newDelegationMap.set(walletTo, percentage);
          console.log(`Delegation to ${walletTo}: ${percentage}%`);
        }
        
        console.log(`Found ${newDelegationMap.size} delegation entries`);
      } else {
        console.log('No delegation preferences found in the data');
      }
      
      setDelegationMap(newDelegationMap);
      setErrors(prev => ({ ...prev, delegationInfo: null }));
    } catch (error: any) {
      console.error('Error in delegation info flow:', error);
      setErrors(prev => ({ ...prev, delegationInfo: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, delegationInfo: false }));
    }
  };
  
  // Function to update delegation preferences with fallback mechanism
  const updateDelegation = async () => {
    if (!delegateClient || !walletAddress) {
      console.error('Delegate client or wallet address not available');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, updatingDelegation: true }));
      console.log('Updating delegation preference with fallback mechanism...');
      
      const delegationData = {
        walletFrom: walletAddress,
        walletTo: delegationForm.walletTo,
        factor: delegationForm.factor
      };
      
      console.log('Delegation data to send:', delegationData);
      
      // Set up fallback endpoints to try in order (same as in fetchDelegationInfo)
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
      let success = false;
      let result = '';
      
      // Try each endpoint until one succeeds or all fail
      for (const endpoint of endpoints) {
        if (success) break;
        
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
          success = true;
        } catch (error) {
          console.warn(`Error with endpoint ${endpoint}:`, error);
          lastError = error as Error;
          // Continue to next endpoint
        }
      }
      
      // Check if any endpoint succeeded
      if (!success) {
        throw lastError || new Error('All endpoints failed when updating delegation');
      }
      
      console.log('Delegation update result:', result);
      setDelegationForm(prev => ({ ...prev, formDirty: false }));
      
      // Refresh delegation info
      fetchDelegationInfo(delegateClient);
      
      setErrors(prev => ({ ...prev, updatingDelegation: null }));
    } catch (error: any) {
      console.error('Error updating delegation:', error);
      setErrors(prev => ({ ...prev, updatingDelegation: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, updatingDelegation: false }));
    }
  };
  
  // Helper function to handle delegation field changes
  const handleDelegationChange = (field: 'walletTo' | 'factor', value: string) => {
    setDelegationForm(prev => ({
      ...prev,
      [field]: field === 'factor' ? (parseInt(value) || 0) : value,
      formDirty: true
    }));
  };

  // Update to accept any string key to maintain backward compatibility
  const renderLoadingState = (key: string) => {
    if (loading[key as keyof typeof loading]) {
      return (
        <div className="status-label loading">
          <LoadingSpinner /> Loading...
        </div>
      );
    }
    return null;
  };

  const renderError = (key: string) => {
    if (errors[key]) {
      return (
        <div className="status-label error">
          Error: {errors[key]}
        </div>
      );
    }
    return null;
  };

  // Function to fetch data for a specific token client pair and store in state
  const fetchTokenData = async (piClient: PITokenClient, baseClient: TokenClient, isRefresh = false) => {
    const tokenId = piClient.baseConfig.processId;
    const processId = baseClient.baseConfig.processId;
    
    try {
      // Set loading state for this token
      if (isRefresh) {
        setIsRefreshing(prev => ({ ...prev, [tokenId]: true }));
      }
      
      console.log(`Fetching data for token ${tokenId}${isRefresh ? ' (refresh)' : ''}`);
      
      // Try to find the token in the tokens map to get ticker and status
      const token = Array.from(tokensMap.values()).find(t => 
        t.id === tokenId || t.process === processId);
      const ticker = token?.ticker || token?.flp_token_ticker || 'Unknown';
      const name = token?.flp_token_name || ticker;
      const treasury = token?.treasury || '';
      const status = token?.status || '';
      const logoUrl = token?.flp_token_logo ? `https://arweave.net/${token.flp_token_logo}` : '';
      
      // Initialize token data if it doesn't exist
      if (!tokenDataMap.has(tokenId)) {
        setTokenDataMap(prev => new Map(prev).set(tokenId, {
          tokenId,
          processId,
          ticker,
          name,
          treasury,
          status,
          logoUrl,
          balance: '0',
          claimableBalance: '0',
          tickHistory: [],
          isLoading: true
        }));
      } else {
        // Set loading state
        setTokenDataMap(prev => {
          const newMap = new Map(prev);
          const currentData = newMap.get(tokenId);
          if (currentData) {
            newMap.set(tokenId, { ...currentData, isLoading: true });
          }
          return newMap;
        });
      }
      
      // Fetch essential data in parallel (both PI token and base token data)
      const [
        // PI Token data
        balance, 
        claimableBalance, 
        tickHistoryStr,
        // Base Token data
        baseBalance,
        baseInfoResponse
      ] = await Promise.all([
        // PI Token requests
        piClient.getBalance().catch(error => {
          console.error(`Error fetching PI balance for ${tokenId}:`, error);
          return '0';
        }),
        piClient.getClaimableBalance().catch(error => {
          console.error(`Error fetching claimable balance for ${tokenId}:`, error);
          return '0';
        }),
        piClient.getTickHistory().catch(error => {
          console.error(`Error fetching tick history for ${tokenId}:`, error);
          return '[]';
        }),
        // Base Token requests
        baseClient.balance().catch(error => {
          console.error(`Error fetching base token balance for ${processId}:`, error);
          return '0';
        }),
        baseClient.dryrun('', [{ name: "Action", value: "Info" }]).catch(error => {
          console.error(`Error fetching base token info for ${processId}:`, error);
          return null;
        })
      ]);
      
      // Parse tick history
      let tickHistory: TickHistoryEntry[] = [];
      try {
        tickHistory = piClient.parseTickHistory(tickHistoryStr);
        console.log(`Received ${tickHistory.length} tick history entries for ${tokenId}`);
      } catch (error) {
        console.error(`Error parsing tick history for ${tokenId}:`, error);
      }
      
      // Log base token information
      console.log(`Base token balance for ${processId}: ${baseBalance}`);
      if (baseInfoResponse) {
        console.log(`Base token info for ${processId}:`, baseInfoResponse);
      }
      
      // Update token data state
      setTokenDataMap(prev => {
        const newMap = new Map(prev);
        newMap.set(tokenId, {
          tokenId,
          processId,
          ticker,
          name,
          treasury,
          status,
          logoUrl,
          balance,
          claimableBalance,
          tickHistory,
          isLoading: false
        });
        return newMap;
      });
      
      // Update base token data state separately
      setBaseTokenDataMap(prev => {
        const newMap = new Map(prev);
        newMap.set(processId, {
          balance: baseBalance,
          info: baseInfoResponse
        });
        return newMap;
      });
      
      console.log(`Successfully fetched data for token ${tokenId}:\n` + 
                 `PI Token - Balance: ${balance}, Claimable: ${claimableBalance}\n` +
                 `Base Token - Balance: ${baseBalance}`);
      console.log(`Full token data updated for ${ticker} (${tokenId})`);
      
    } catch (error) {
      console.error(`Error in fetchTokenData for ${tokenId}:`, error);
      // Update error state
      setTokenDataMap(prev => {
        const newMap = new Map(prev);
        const currentData = newMap.get(tokenId) || {
          tokenId,
          processId,
          ticker: 'Unknown',
          name: 'Unknown Token',
          balance: '0',
          claimableBalance: '0',
          tickHistory: [],
          isLoading: false
        };
        newMap.set(tokenId, { ...currentData, isLoading: false });
        return newMap;
      });
    } finally {
      if (isRefresh) {
        setIsRefreshing(prev => ({ ...prev, [tokenId]: false }));
      }
    }
  };
  
  // Function to refresh all token data
  const refreshAllTokenData = async () => {
    try {
      // Set all tokens to refreshing state
      const refreshingState: { [key: string]: boolean } = {};
      tokenClientPairs.forEach(([piClient]) => {
        refreshingState[piClient.baseConfig.processId] = true;
      });
      setIsRefreshing(refreshingState);
      
      // Refresh all tokens in parallel
      await Promise.all(tokenClientPairs.map(([piClient, baseClient]) => 
        fetchTokenData(piClient, baseClient, true)
      ));
      
      console.log('All token data refreshed');
    } catch (error) {
      console.error('Error refreshing all token data:', error);
    } finally {
      // Clear all refreshing states
      const clearState: { [key: string]: boolean } = {};
      tokenClientPairs.forEach(([piClient]) => {
        clearState[piClient.baseConfig.processId] = false;
      });
      setIsRefreshing(clearState);
    }
  };
  
  return (
    <div className="mint-container" id="mint">
      <h1 className="title">PI Token Integration</h1>
      
      {/* Use the DelegationManagement component */}
      <DelegationManagement 
        delegationData={delegationData}
        delegationForm={delegationForm}
        loading={{ delegationInfo: loading.delegationInfo, updatingDelegation: loading.updatingDelegation }}
        handleDelegationChange={handleDelegationChange}
        updateDelegation={updateDelegation}
        renderLoadingState={renderLoadingState}
        renderError={renderError}
        tokens={piTokensData}
        processToTokenMap={(() => {
          // Create a map with all possible token identifiers
          const map = new Map<string, PIToken>();
          
          // Add by process ID
          piTokensData.forEach(token => {
            if (token.process) map.set(token.process, token);
            if (token.id) map.set(token.id, token); 
            if (token.flp_token_process) map.set(token.flp_token_process, token);
            if (token.treasury) map.set(token.treasury, token);
          });
          
          return map;
        })()}
      />
      
      {/* Use the PITokens component */}
      <PITokens 
        piTokensData={piTokensData}
        tokenClientPairs={tokenClientPairs}
        tokenDataMap={tokenDataMap}
        baseTokenDataMap={baseTokenDataMap}
        isRefreshing={isRefreshing}
        delegationMap={delegationMap}
        fetchTokenData={fetchTokenData}
        refreshAllTokenData={refreshAllTokenData}
        renderLoadingState={renderLoadingState}
        renderError={renderError}
      />
    </div>
  );
};

export default Mint;
