// Enhanced FHEVM Meta Transaction System with Real On-Chain Interactions
import { ethers } from 'ethers';
import { FHEVMClient, createFHEVMClient } from './fhevm';

// Enhanced meta transaction types
export interface FHEMetaTransaction {
  id: string;
  contractAddress: string;
  functionName: string;
  encryptedParams: EncryptedParameter[];
  userAddress: string;
  timestamp: number;
  chainId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  decryptedResult?: any;
}

export interface EncryptedParameter {
  name: string;
  type: 'euint32' | 'ebool' | 'euint64';
  handle: string;
  proof: string;
  originalValue?: number | boolean;
}

// Enhanced FHEVM Meta Transaction Manager
export class FHEVMMetaManager {
  private fhevmClient: FHEVMClient | null = null;
  private provider: ethers.BrowserProvider;
  private chainId: number;
  private contractAddress: string;
  private isInitialized = false;

  constructor(provider: ethers.BrowserProvider, chainId: number, contractAddress: string) {
    this.provider = provider;
    this.chainId = chainId;
    this.contractAddress = contractAddress;
  }

  // Initialize the FHEVM client with enhanced error handling
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing FHEVMMetaManager:', {
        chainId: this.chainId,
        contractAddress: this.contractAddress,
        providerType: this.provider.constructor.name
      });

      this.fhevmClient = await createFHEVMClient(this.provider);
      this.isInitialized = true;
      
      console.log('✅ FHEVMMetaManager initialized successfully');
      console.log('🔍 FHEVM Client ready:', this.fhevmClient.isReady());
      
      // Verify network compatibility
      if (this.chainId === 11155111) {
        console.log('🌐 Connected to Sepolia - Real FHEVM operations enabled');
      } else if (this.chainId === 31337) {
        console.log('🧪 Connected to local network - Mock FHEVM operations');
      } else {
        console.warn('⚠️ Network not optimized for FHEVM operations');
      }
    } catch (error) {
      console.error('❌ Failed to initialize FHEVMMetaManager:', error);
      throw new Error(`FHEVM Meta Manager initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create encrypted parameters for meta transactions
  async createEncryptedParams(
    functionName: string,
    params: { name: string; value: number | boolean; type: 'euint32' | 'ebool' | 'euint64' }[]
  ): Promise<EncryptedParameter[]> {
    if (!this.isInitialized || !this.fhevmClient) {
      throw new Error('FHEVMMetaManager not initialized');
    }

    console.log('🔐 Creating encrypted parameters:', { functionName, paramsCount: params.length });

    const encryptedParams: EncryptedParameter[] = [];

    for (const param of params) {
      try {
        console.log(`📊 Encrypting parameter: ${param.name} = ${param.value} (${param.type})`);
        
        let encryptedInput;
        if (param.type === 'ebool') {
          encryptedInput = await this.fhevmClient.createEncryptedBoolInput(
            this.contractAddress,
            Boolean(param.value)
          );
        } else {
          encryptedInput = await this.fhevmClient.createEncryptedInput(
            this.contractAddress,
            Number(param.value),
            param.type as 'euint32' | 'ebool'
          );
        }

        encryptedParams.push({
          name: param.name,
          type: param.type,
          handle: encryptedInput.handle,
          proof: encryptedInput.proof,
          originalValue: param.value
        });

        console.log(`✅ Parameter ${param.name} encrypted successfully`);
      } catch (error) {
        console.error(`❌ Failed to encrypt parameter ${param.name}:`, error);
        throw new Error(`Failed to encrypt parameter ${param.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('🔒 All parameters encrypted successfully');
    return encryptedParams;
  }

  // Execute meta transaction with real on-chain verification
  async executeMetaTransaction(
    functionName: string,
    encryptedParams: EncryptedParameter[],
    contractABI: any[]
  ): Promise<FHEMetaTransaction> {
    if (!this.isInitialized || !this.fhevmClient) {
      throw new Error('FHEVMMetaManager not initialized');
    }

    const userAddress = await (await this.provider.getSigner()).getAddress();
    const transactionId = `fhe_meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('🚀 Executing FHE meta transaction:', {
      id: transactionId,
      functionName,
      contractAddress: this.contractAddress,
      userAddress,
      paramsCount: encryptedParams.length
    });

    const metaTx: FHEMetaTransaction = {
      id: transactionId,
      contractAddress: this.contractAddress,
      functionName,
      encryptedParams,
      userAddress,
      timestamp: Date.now(),
      chainId: this.chainId,
      status: 'pending'
    };

    try {
      // Create contract instance
      const signer = await this.provider.getSigner();
      const contract = new ethers.Contract(this.contractAddress, contractABI, signer);

      console.log('📋 Contract instance created, preparing transaction...');

      // Verify contract has the function
      if (!contract[functionName]) {
        throw new Error(`Function ${functionName} not found in contract`);
      }

      // Prepare transaction parameters
      const txParams: any[] = [];
      for (const param of encryptedParams) {
        if (param.type === 'ebool' || param.type.startsWith('euint')) {
          // For FHEVM encrypted types, pass handle and proof
          txParams.push(param.handle);
          txParams.push(param.proof);
        }
      }

      console.log('📝 Transaction parameters prepared:', {
        functionName,
        paramsCount: txParams.length,
        handles: encryptedParams.map(p => ({ name: p.name, handlePreview: p.handle.substring(0, 10) + '...' }))
      });

      metaTx.status = 'processing';

      // Execute the transaction
      console.log('📤 Sending transaction to blockchain...');
      const tx = await contract[functionName](...txParams);
      
      console.log('⏳ Transaction sent, waiting for confirmation:', tx.hash);
      metaTx.txHash = tx.hash;

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      });

      metaTx.status = receipt.status === 1 ? 'completed' : 'failed';
      metaTx.blockNumber = receipt.blockNumber;
      metaTx.gasUsed = receipt.gasUsed.toString();

      // Log transaction details for verification
      console.log('🔍 Transaction Details for On-Chain Verification:', {
        transactionId: metaTx.id,
        contractAddress: metaTx.contractAddress,
        txHash: metaTx.txHash,
        blockNumber: metaTx.blockNumber,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${metaTx.txHash}`,
        status: metaTx.status
      });

      return metaTx;
    } catch (error) {
      console.error('❌ Meta transaction execution failed:', error);
      metaTx.status = 'failed';
      throw new Error(`Meta transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Verify transaction on-chain
  async verifyTransaction(txHash: string): Promise<{
    isValid: boolean;
    blockNumber: number | null;
    gasUsed: string | null;
    status: number | null;
    contractAddress: string | null;
  }> {
    try {
      console.log('🔍 Verifying transaction on-chain:', txHash);
      
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return {
          isValid: false,
          blockNumber: null,
          gasUsed: null,
          status: null,
          contractAddress: null
        };
      }

      const verification = {
        isValid: true,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        contractAddress: receipt.to
      };

      console.log('✅ Transaction verification successful:', verification);
      return verification;
    } catch (error) {
      console.error('❌ Transaction verification failed:', error);
      return {
        isValid: false,
        blockNumber: null,
        gasUsed: null,
        status: null,
        contractAddress: null
      };
    }
  }

  // Get real-time transaction status
  async getTransactionStatus(txHash: string): Promise<{
    confirmed: boolean;
    blockNumber: number | null;
    confirmations: number;
    gasUsed: string | null;
  }> {
    try {
      const [receipt, currentBlock] = await Promise.all([
        this.provider.getTransactionReceipt(txHash),
        this.provider.getBlockNumber()
      ]);

      if (!receipt) {
        return {
          confirmed: false,
          blockNumber: null,
          confirmations: 0,
          gasUsed: null
        };
      }

      return {
        confirmed: receipt.status === 1,
        blockNumber: receipt.blockNumber,
        confirmations: currentBlock - receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  // Enhanced contract interaction with proper error handling
  async readEncryptedValue(functionName: string, contractABI: any[]): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('FHEVMMetaManager not initialized');
    }

    try {
      console.log('📖 Reading encrypted value from contract:', {
        contractAddress: this.contractAddress,
        functionName
      });

      const contract = new ethers.Contract(this.contractAddress, contractABI, this.provider);
      
      if (!contract[functionName]) {
        throw new Error(`Function ${functionName} not found in contract`);
      }

      const result = await contract[functionName]();
      console.log('📊 Encrypted value read successfully:', {
        functionName,
        resultType: typeof result,
        resultLength: result?.length || 'N/A'
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to read encrypted value:', error);
      throw error;
    }
  }

  // Check if manager is ready for operations
  isReady(): boolean {
    return this.isInitialized && this.fhevmClient !== null && this.fhevmClient.isReady();
  }

  // Get supported networks
  static getSupportedNetworks(): number[] {
    return [11155111, 31337]; // Sepolia and Hardhat
  }

  // Check network compatibility
  static isNetworkSupported(chainId: number): boolean {
    return this.getSupportedNetworks().includes(chainId);
  }
}

// Create a meta manager instance
export const createFHEVMMetaManager = async (
  provider: ethers.BrowserProvider,
  chainId: number,
  contractAddress: string
): Promise<FHEVMMetaManager> => {
  const manager = new FHEVMMetaManager(provider, chainId, contractAddress);
  await manager.initialize();
  return manager;
};

// Export utility functions
export const generateTransactionId = (): string => {
  return `fhe_meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getEtherscanUrl = (chainId: number, txHash: string): string => {
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  } else if (chainId === 1) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  return '#';
};

export default FHEVMMetaManager;