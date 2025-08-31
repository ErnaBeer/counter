// Contract Deployment Detection and Validation System
import { ethers } from 'ethers';
import { FHE_COUNTER_ADDRESS, ALTERNATIVE_ADDRESSES, FHE_COUNTER_ABI } from '../contracts/FHECounter';

export interface ContractDeploymentInfo {
  address: string;
  isDeployed: boolean;
  isContract: boolean;
  hasCode: boolean;
  balance: string;
  transactionCount: number;
  deploymentBlock?: number;
  isVerified: boolean;
  functions: string[];
  etherscanUrl: string;
}

export interface DeploymentValidation {
  recommendedAddress: string;
  validAddresses: string[];
  deploymentInfo: Record<string, ContractDeploymentInfo>;
  bestOption: ContractDeploymentInfo | null;
}

export class ContractDeploymentDetector {
  private provider: ethers.Provider;
  private chainId: number;

  constructor(provider: ethers.Provider, chainId: number) {
    this.provider = provider;
    this.chainId = chainId;
  }

  // Check if an address has deployed contract code
  async checkContractDeployment(address: string): Promise<ContractDeploymentInfo> {
    try {
      console.log(`🔍 Checking contract deployment at ${address}`);
      
      // Get basic account info
      const [code, balance, transactionCount] = await Promise.all([
        this.provider.getCode(address),
        this.provider.getBalance(address),
        this.provider.getTransactionCount(address)
      ]);

      const hasCode = code !== '0x';
      const isContract = hasCode;
      const isDeployed = isContract && code.length > 2; // More than just '0x'

      // Try to create contract instance and check functions
      let functions: string[] = [];
      let isVerified = false;
      
      if (isContract) {
        try {
          const contract = new ethers.Contract(address, FHE_COUNTER_ABI, this.provider);
          
          // Test some common FHEVM functions
          const testFunctions = [
            'getChronoCount',
            'getDecryptedTemporalValue', 
            'getTemporalStats',
            'requestChronoDecryption',
            'accelerateTimestream',
            'reverseTimestream'
          ];

          for (const funcName of testFunctions) {
            if (contract[funcName]) {
              functions.push(funcName);
            }
          }

          isVerified = functions.length > 0;
          console.log(`✅ Contract functions detected: ${functions.join(', ')}`);
        } catch (error) {
          console.log(`⚠️ Could not verify contract functions: ${error}`);
        }
      }

      const deploymentInfo: ContractDeploymentInfo = {
        address,
        isDeployed,
        isContract,
        hasCode,
        balance: ethers.formatEther(balance),
        transactionCount,
        isVerified,
        functions,
        etherscanUrl: this.getEtherscanUrl(address)
      };

      console.log(`📊 Deployment info for ${address}:`, {
        isDeployed,
        isContract,
        balance: deploymentInfo.balance,
        txCount: transactionCount,
        functions: functions.length
      });

      return deploymentInfo;
    } catch (error) {
      console.error(`❌ Error checking contract deployment:`, error);
      return {
        address,
        isDeployed: false,
        isContract: false,
        hasCode: false,
        balance: '0',
        transactionCount: 0,
        isVerified: false,
        functions: [],
        etherscanUrl: this.getEtherscanUrl(address)
      };
    }
  }

  // Validate all potential deployment addresses
  async validateAllDeployments(): Promise<DeploymentValidation> {
    console.log('🔍 Validating all potential contract deployments...');
    
    const addressesToCheck = [
      FHE_COUNTER_ADDRESS,
      ...Object.values(ALTERNATIVE_ADDRESSES)
    ];

    // Remove duplicates
    const uniqueAddresses = [...new Set(addressesToCheck)];
    console.log('📋 Checking addresses:', uniqueAddresses);

    // Check all addresses in parallel
    const deploymentInfos = await Promise.all(
      uniqueAddresses.map(address => this.checkContractDeployment(address))
    );

    // Create deployment info map
    const deploymentInfo: Record<string, ContractDeploymentInfo> = {};
    deploymentInfos.forEach(info => {
      deploymentInfo[info.address] = info;
    });

    // Find valid deployed contracts
    const validAddresses = uniqueAddresses.filter(address => 
      deploymentInfo[address].isDeployed && deploymentInfo[address].isContract
    );

    // Find best option (most functions, highest tx count)
    let bestOption: ContractDeploymentInfo | null = null;
    if (validAddresses.length > 0) {
      bestOption = validAddresses
        .map(addr => deploymentInfo[addr])
        .sort((a, b) => {
          // Sort by number of functions first, then by transaction count
          const funcDiff = b.functions.length - a.functions.length;
          if (funcDiff !== 0) return funcDiff;
          return b.transactionCount - a.transactionCount;
        })[0];
    }

    const recommendedAddress = bestOption?.address || FHE_COUNTER_ADDRESS;

    const validation: DeploymentValidation = {
      recommendedAddress,
      validAddresses,
      deploymentInfo,
      bestOption
    };

    console.log('✅ Deployment validation completed:', {
      recommendedAddress,
      validCount: validAddresses.length,
      bestOption: bestOption?.address || 'None'
    });

    return validation;
  }

  // Get deployment status summary
  async getDeploymentSummary(): Promise<{
    status: 'deployed' | 'pending' | 'failed';
    message: string;
    recommendedAddress: string;
    details: DeploymentValidation;
  }> {
    const validation = await this.validateAllDeployments();
    
    let status: 'deployed' | 'pending' | 'failed';
    let message: string;

    if (validation.bestOption) {
      status = 'deployed';
      message = `Contract deployed at ${validation.bestOption.address} with ${validation.bestOption.functions.length} functions`;
    } else if (validation.validAddresses.length > 0) {
      status = 'pending';
      message = `Found ${validation.validAddresses.length} deployed contracts, but none fully verified`;
    } else {
      status = 'failed';
      message = 'No deployed contracts found at any of the expected addresses';
    }

    return {
      status,
      message,
      recommendedAddress: validation.recommendedAddress,
      details: validation
    };
  }

  // Generate contract address for a given nonce
  static calculateContractAddress(deployerAddress: string, nonce: number): string {
    return ethers.getCreateAddress({
      from: deployerAddress,
      nonce: nonce
    });
  }

  // Get Etherscan URL based on chain ID
  private getEtherscanUrl(address: string): string {
    if (this.chainId === 11155111) {
      return `https://sepolia.etherscan.io/address/${address}`;
    } else if (this.chainId === 1) {
      return `https://etherscan.io/address/${address}`;
    }
    return `#${address}`;
  }

  // Wait for contract deployment
  async waitForDeployment(
    address: string, 
    timeoutMs: number = 30000, 
    checkIntervalMs: number = 2000
  ): Promise<ContractDeploymentInfo> {
    console.log(`⏳ Waiting for contract deployment at ${address}...`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const info = await this.checkContractDeployment(address);
      
      if (info.isDeployed && info.functions.length > 0) {
        console.log(`✅ Contract deployed and verified at ${address}`);
        return info;
      }
      
      console.log(`⏳ Still waiting... (${Math.floor((Date.now() - startTime) / 1000)}s)`);
      await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
    
    throw new Error(`Timeout waiting for contract deployment at ${address}`);
  }
}

// Factory function to create detector
export const createContractDetector = (provider: ethers.Provider, chainId: number): ContractDeploymentDetector => {
  return new ContractDeploymentDetector(provider, chainId);
};

// Utility function to get best contract address
export const getBestContractAddress = async (provider: ethers.Provider, chainId: number): Promise<string> => {
  const detector = createContractDetector(provider, chainId);
  const summary = await detector.getDeploymentSummary();
  return summary.recommendedAddress;
};

export default ContractDeploymentDetector;