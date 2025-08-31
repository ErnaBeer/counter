// Enhanced React Hook for FHEVM Meta Transactions with Real On-Chain Interactions
import { useState, useCallback, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  FHEVMMetaManager, 
  FHEMetaTransaction, 
  createFHEVMMetaManager, 
  getEtherscanUrl 
} from '../utils/fhevm-meta';

export interface FHEVMMetaHookState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  transactions: FHEMetaTransaction[];
  currentTransaction: FHEMetaTransaction | null;
}

export interface FHEVMMetaHookActions {
  initialize: (provider: ethers.BrowserProvider, contractAddress: string) => Promise<void>;
  executeMetaTransaction: (
    functionName: string,
    params: { name: string; value: number | boolean; type: 'euint32' | 'ebool' | 'euint64' }[],
    contractABI: any[]
  ) => Promise<FHEMetaTransaction>;
  verifyTransaction: (txHash: string) => Promise<boolean>;
  getTransactionStatus: (txHash: string) => Promise<any>;
  readEncryptedValue: (functionName: string, contractABI: any[]) => Promise<any>;
  clearError: () => void;
  clearTransactions: () => void;
}

export interface UseFHEVMMetaTransactionsResult extends FHEVMMetaHookState, FHEVMMetaHookActions {}

export const useFHEVMMetaTransactions = (): UseFHEVMMetaTransactionsResult => {
  const [state, setState] = useState<FHEVMMetaHookState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    transactions: [],
    currentTransaction: null
  });

  const metaManagerRef = useRef<FHEVMMetaManager | null>(null);
  const chainIdRef = useRef<number | null>(null);

  // Update state helper
  const updateState = useCallback((updates: Partial<FHEVMMetaHookState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize the FHEVM Meta Manager
  const initialize = useCallback(async (provider: ethers.BrowserProvider, contractAddress: string) => {
    try {
      updateState({ isLoading: true, error: null });
      console.log('🚀 Initializing FHEVM Meta Transactions Hook:', { contractAddress });

      // Get chain ID
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      chainIdRef.current = chainId;

      console.log('🌐 Network detected:', { chainId, name: network.name });

      // Check network support
      if (!FHEVMMetaManager.isNetworkSupported(chainId)) {
        throw new Error(`Network ${chainId} is not supported for FHEVM operations`);
      }

      // Create and initialize meta manager
      console.log('⚙️ Creating FHEVM Meta Manager...');
      const manager = await createFHEVMMetaManager(provider, chainId, contractAddress);
      metaManagerRef.current = manager;

      updateState({
        isInitialized: true,
        isLoading: false,
        error: null
      });

      console.log('✅ FHEVM Meta Transactions Hook initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize FHEVM Meta Transactions:', error);
      updateState({
        isInitialized: false,
        isLoading: false,
        error: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }, [updateState]);

  // Execute meta transaction with real on-chain interactions
  const executeMetaTransaction = useCallback(async (
    functionName: string,
    params: { name: string; value: number | boolean; type: 'euint32' | 'ebool' | 'euint64' }[],
    contractABI: any[]
  ): Promise<FHEMetaTransaction> => {
    if (!metaManagerRef.current) {
      throw new Error('FHEVM Meta Manager not initialized');
    }

    try {
      updateState({ isLoading: true, error: null });
      console.log('🔄 Starting meta transaction execution:', { functionName, paramsCount: params.length });

      // Create encrypted parameters
      console.log('🔐 Creating encrypted parameters...');
      const encryptedParams = await metaManagerRef.current.createEncryptedParams(functionName, params);
      console.log('✅ Parameters encrypted successfully');

      // Execute meta transaction
      console.log('📤 Executing meta transaction...');
      const metaTx = await metaManagerRef.current.executeMetaTransaction(
        functionName,
        encryptedParams,
        contractABI
      );

      // Update state with new transaction
      updateState({
        isLoading: false,
        error: null,
        transactions: [metaTx, ...state.transactions],
        currentTransaction: metaTx
      });

      console.log('🎉 Meta transaction completed successfully:', {
        id: metaTx.id,
        txHash: metaTx.txHash,
        status: metaTx.status,
        etherscanUrl: chainIdRef.current ? getEtherscanUrl(chainIdRef.current, metaTx.txHash || '') : undefined
      });

      return metaTx;
    } catch (error) {
      console.error('❌ Meta transaction execution failed:', error);
      updateState({
        isLoading: false,
        error: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      throw error;
    }
  }, [updateState]);

  // Verify transaction on-chain
  const verifyTransaction = useCallback(async (txHash: string): Promise<boolean> => {
    if (!metaManagerRef.current) {
      throw new Error('FHEVM Meta Manager not initialized');
    }

    try {
      console.log('🔍 Verifying transaction:', txHash);
      const verification = await metaManagerRef.current.verifyTransaction(txHash);
      
      console.log('✅ Transaction verification result:', verification);
      return verification.isValid && verification.status === 1;
    } catch (error) {
      console.error('❌ Transaction verification failed:', error);
      updateState({
        error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return false;
    }
  }, [updateState]);

  // Get real-time transaction status
  const getTransactionStatus = useCallback(async (txHash: string) => {
    if (!metaManagerRef.current) {
      throw new Error('FHEVM Meta Manager not initialized');
    }

    try {
      const status = await metaManagerRef.current.getTransactionStatus(txHash);
      console.log('📊 Transaction status:', status);
      return status;
    } catch (error) {
      console.error('❌ Failed to get transaction status:', error);
      throw error;
    }
  }, []);

  // Read encrypted value from contract
  const readEncryptedValue = useCallback(async (functionName: string, contractABI: any[]) => {
    if (!metaManagerRef.current) {
      throw new Error('FHEVM Meta Manager not initialized');
    }

    try {
      updateState({ isLoading: true, error: null });
      console.log('📖 Reading encrypted value:', functionName);
      
      const result = await metaManagerRef.current.readEncryptedValue(functionName, contractABI);
      
      updateState({ isLoading: false, error: null });
      console.log('📊 Encrypted value read successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to read encrypted value:', error);
      updateState({
        isLoading: false,
        error: `Read failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      throw error;
    }
  }, [updateState]);

  // Clear error state
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Clear all transactions
  const clearTransactions = useCallback(() => {
    updateState({ transactions: [], currentTransaction: null });
  }, [updateState]);

  // Auto-update transaction statuses
  useEffect(() => {
    if (!state.isInitialized || state.transactions.length === 0) return;

    const updateTransactionStatuses = async () => {
      const updatedTransactions = await Promise.all(
        state.transactions.map(async (tx) => {
          if (tx.status === 'completed' || tx.status === 'failed' || !tx.txHash) {
            return tx;
          }

          try {
            const status = await getTransactionStatus(tx.txHash);
            return {
              ...tx,
              status: status.confirmed ? ('completed' as const) : tx.status
            } as FHEMetaTransaction;
          } catch (error) {
            console.error('Failed to update transaction status:', error);
            return tx;
          }
        })
      );

      if (JSON.stringify(updatedTransactions) !== JSON.stringify(state.transactions)) {
        updateState({ transactions: updatedTransactions });
      }
    };

    const interval = setInterval(updateTransactionStatuses, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [state.isInitialized, state.transactions, getTransactionStatus, updateState]);

  return {
    ...state,
    initialize,
    executeMetaTransaction,
    verifyTransaction,
    getTransactionStatus,
    readEncryptedValue,
    clearError,
    clearTransactions
  };
};

export default useFHEVMMetaTransactions;