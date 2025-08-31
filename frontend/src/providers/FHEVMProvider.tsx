import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWalletContext } from './WalletProvider';
import { createFHEVMClient, FHEVMClient } from '../utils/fhevm';

interface FHEVMContextType {
  isReady: boolean;
  isLoading: boolean;
  networkSupported: boolean;
  encryptedCount: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  performEncryptAdd: (value: number) => Promise<void>;
  performEncryptSub: (value: number) => Promise<void>;
  refreshState: () => Promise<void>;
  fhevmClient: FHEVMClient | null;
  sdkStatus: string;
}

const FHEVMContext = createContext<FHEVMContextType | undefined>(undefined);

export const useFHEVMContext = () => {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error('useFHEVMContext must be used within a FHEVMProvider');
  }
  return context;
};

interface FHEVMProviderProps {
  children: React.ReactNode;
}

export const FHEVMProvider: React.FC<FHEVMProviderProps> = ({ children }) => {
  const { provider, account, chainId } = useWalletContext();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [networkSupported, setNetworkSupported] = useState(false);
  const [encryptedCount, setEncryptedCount] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [fhevmClient, setFhevmClient] = useState<FHEVMClient | null>(null);
  const [sdkStatus, setSdkStatus] = useState<string>('idle');

  useEffect(() => {
    const initializeFHEVM = async () => {
      if (!chainId || !provider) {
        setNetworkSupported(false);
        setIsReady(false);
        setFhevmClient(null);
        return;
      }
      
      const isSepolia = chainId === 11155111;
      const isLocalHardhat = chainId === 31337;
      const isSupported = isSepolia || isLocalHardhat;
      
      setNetworkSupported(isSupported);
      
      if (isSupported && provider && account) {
        try {
          console.log('🔧 Initializing FHEVM client...', { chainId, account });
          setSdkStatus('initializing');
          
          const client = await createFHEVMClient(provider);
          setFhevmClient(client);
          setIsReady(client.isReady());
          setSdkStatus('ready');
          
          console.log('✅ FHEVM client initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize FHEVM client:', error);
          setSdkStatus('error');
          setFhevmClient(null);
          setIsReady(false);
        }
      } else {
        setIsReady(false);
        setFhevmClient(null);
        setSdkStatus('idle');
      }
    };

    initializeFHEVM();
  }, [provider, account, chainId]);

  const createEncryptedInput = useCallback(async (value: number, contractAddress: string) => {
    if (!fhevmClient) {
      throw new Error('FHEVM client not available');
    }
    
    try {
      console.log('🔐 Creating encrypted input using FHEVM client...', { value, contractAddress });
      return await fhevmClient.createEncryptedInput(contractAddress, value, 'euint32');
    } catch (error) {
      console.error('Error creating encrypted input:', error);
      throw error;
    }
  }, [fhevmClient]);

  const performEncryptAdd = useCallback(async (value: number) => {
    if (!provider || !networkSupported || !fhevmClient) {
      toast.error('FHEVM client not ready or network not supported');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐➕ Starting FHEVM Add operation...');
      
      const contractAddress = "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1";
      const encryptedInput = await createEncryptedInput(value, contractAddress);
      const signer = await provider.getSigner();
      
      console.log('📝 Encrypted input created:', {
        handle: encryptedInput.handle.substring(0, 20) + '...',
        proofLength: encryptedInput.proof.length
      });
      
      const tx = await signer.sendTransaction({
        to: contractAddress,
        data: ethers.concat([
          ethers.id("add(bytes32,bytes)").slice(0, 10),
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["bytes32", "bytes"],
            [encryptedInput.handle, encryptedInput.proof]
          )
        ]),
        gasPrice: ethers.parseUnits('20', 'gwei'), // Lower gas price for Sepolia
        gasLimit: BigInt(500000), // Reduced gas limit
        type: 0
      });
      
      toast.info(`🔐➕ Add transaction submitted: ${tx.hash.substring(0, 10)}...`);
      
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        toast.success('🎉 FHEVM Add operation successful!');
        setInputValue('');
        await refreshState();
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error: any) {
      console.error('FHEVM Add operation failed:', error);
      
      if (error.message.includes('dropped') || error.message.includes('replaced')) {
        toast.error('🚫 Transaction dropped or replaced');
      } else if (error.message.includes('execution reverted')) {
        toast.error('🔧 FHEVM Add execution failed - check contract deployment');
      } else {
        toast.error('🔐➕ FHEVM Add failed: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [provider, networkSupported, fhevmClient, createEncryptedInput]);

  const performEncryptSub = useCallback(async (value: number) => {
    if (!provider || !networkSupported || !fhevmClient) {
      toast.error('FHEVM client not ready or network not supported');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐➖ Starting FHEVM Sub operation...');
      
      const contractAddress = "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1";
      const encryptedInput = await createEncryptedInput(value, contractAddress);
      const signer = await provider.getSigner();
      
      console.log('📝 Encrypted input created:', {
        handle: encryptedInput.handle.substring(0, 20) + '...',
        proofLength: encryptedInput.proof.length
      });
      
      const tx = await signer.sendTransaction({
        to: contractAddress,
        data: ethers.concat([
          ethers.id("subtract(bytes32,bytes)").slice(0, 10),
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["bytes32", "bytes"],
            [encryptedInput.handle, encryptedInput.proof]
          )
        ]),
        gasPrice: ethers.parseUnits('20', 'gwei'), // Lower gas price for Sepolia
        gasLimit: BigInt(500000), // Reduced gas limit
        type: 0
      });
      
      toast.info(`🔐➖ Sub transaction submitted: ${tx.hash.substring(0, 10)}...`);
      
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        toast.success('🎉 FHEVM Sub operation successful!');
        setInputValue('');
        await refreshState();
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error: any) {
      console.error('FHEVM Sub operation failed:', error);
      
      if (error.message.includes('dropped') || error.message.includes('replaced')) {
        toast.error('🚫 Transaction dropped or replaced');
      } else if (error.message.includes('execution reverted')) {
        toast.error('🔧 FHEVM Sub execution failed - check contract deployment');
      } else {
        toast.error('🔐➖ FHEVM Sub failed: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [provider, networkSupported, fhevmClient, createEncryptedInput]);

  const refreshState = useCallback(async () => {
    if (!provider || !account) return;
    
    try {
      const timestamp = Date.now();
      const mockHandle = ethers.id(`encrypted_${timestamp}_${account}`);
      setEncryptedCount(mockHandle);
    } catch (error) {
      console.error('Error refreshing state:', error);
    }
  }, [provider, account]);

  useEffect(() => {
    if (isReady) {
      refreshState();
    }
  }, [isReady, refreshState]);

  const contextValue: FHEVMContextType = {
    isReady,
    isLoading,
    networkSupported,
    encryptedCount,
    inputValue,
    setInputValue,
    performEncryptAdd,
    performEncryptSub,
    refreshState,
    fhevmClient,
    sdkStatus,
  };

  return (
    <FHEVMContext.Provider value={contextValue}>
      {children}
    </FHEVMContext.Provider>
  );
};