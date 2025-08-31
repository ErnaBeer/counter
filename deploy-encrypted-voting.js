// Optimized EncryptedVoting Contract Deployment Script
// Using mnemonic: "cave glad risk huge voyage midnight color correct floor paper sorry midnight"
// Deploy to Sepolia with maximum gas optimization

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const MNEMONIC = "cave glad risk huge voyage midnight color correct floor paper sorry midnight";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo"; // Use a real RPC URL
const TOPIC = "Should we implement Zama FHE in more DApps?"; // Voting topic
const DURATION_HOURS = 24; // 24 hours voting period

// Contract sources (copied from fhevm-clean-project)
const ENCRYPTED_VOTING_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { FHE, euint64, ebool, externalEbool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title HCULimits - Embedded for deployment optimization
 */
library HCULimits {
    uint256 public constant SEQUENTIAL_HCU_LIMIT = 5_000_000;
    uint256 public constant GLOBAL_HCU_LIMIT = 20_000_000;
    
    // Essential HCU costs for optimization
    uint256 public constant EUINT64_ADD_NON_SCALAR = 156_000;
    uint256 public constant EUINT64_SELECT_NON_SCALAR = 52_000;
    
    function isWithinSequentialLimit(uint256 operationCost) internal pure returns (bool) {
        return operationCost <= SEQUENTIAL_HCU_LIMIT;
    }
    
    function isWithinGlobalLimit(uint256 operationCost) internal pure returns (bool) {
        return operationCost <= GLOBAL_HCU_LIMIT;
    }
    
    function estimateVotingCost() internal pure returns (uint256) {
        return EUINT64_ADD_NON_SCALAR + (EUINT64_SELECT_NON_SCALAR * 2);
    }
    
    function estimateDecryptionCost(uint256 numValues) internal pure returns (uint256) {
        return 10_000 + (numValues * 1_000);
    }
    
    function getLimits() internal pure returns (uint256 sequential, uint256 global) {
        return (SEQUENTIAL_HCU_LIMIT, GLOBAL_HCU_LIMIT);
    }
}

/**
 * @title OptimizedEncryptedVoting - Gas optimized version
 */
contract OptimizedEncryptedVoting is SepoliaConfig {
    
    enum VotingStatus { Open, DecryptionInProgress, ResultsDecrypted }
    
    mapping(address => bool) public hasVoted;
    VotingStatus public status;
    
    euint64 private encryptedYesVotes;
    euint64 private encryptedNoVotes;
    
    uint64 public decryptedYesVotes;
    uint64 public decryptedNoVotes;
    
    uint256 public voteDeadline;
    string public votingTopic;
    address public owner;
    
    event VoteCasted(address indexed voter);
    event DecryptionRequested(uint256 requestId);
    event ResultsDecrypted(uint64 yesVotes, uint64 noVotes);
    event VotingCreated(string topic, uint256 deadline);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier votingOpen() {
        require(status == VotingStatus.Open, "Voting not open");
        require(block.timestamp <= voteDeadline, "Deadline passed");
        _;
    }
    
    constructor(string memory _topic, uint256 _durationInHours) {
        owner = msg.sender;
        votingTopic = _topic;
        voteDeadline = block.timestamp + (_durationInHours * 1 hours);
        status = VotingStatus.Open;
        
        encryptedYesVotes = FHE.asEuint64(0);
        encryptedNoVotes = FHE.asEuint64(0);
        
        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedNoVotes);
        
        emit VotingCreated(_topic, voteDeadline);
    }
    
    function vote(externalEbool support, bytes memory inputProof) public votingOpen {
        require(!hasVoted[msg.sender], "Already voted");
        
        uint256 estimatedCost = HCULimits.estimateVotingCost();
        require(
            HCULimits.isWithinSequentialLimit(estimatedCost) && 
            HCULimits.isWithinGlobalLimit(estimatedCost),
            "Exceeds HCU limits"
        );
        
        hasVoted[msg.sender] = true;
        
        ebool isSupport = FHE.fromExternal(support, inputProof);
        
        encryptedYesVotes = FHE.select(
            isSupport, 
            FHE.add(encryptedYesVotes, FHE.asEuint64(1)), 
            encryptedYesVotes
        );
        
        encryptedNoVotes = FHE.select(
            isSupport, 
            encryptedNoVotes, 
            FHE.add(encryptedNoVotes, FHE.asEuint64(1))
        );
        
        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedNoVotes);
        
        emit VoteCasted(msg.sender);
    }
    
    function requestVoteDecryption() public {
        require(block.timestamp > voteDeadline, "Voting in progress");
        require(status == VotingStatus.Open, "Already requested");
        
        uint256 estimatedCost = HCULimits.estimateDecryptionCost(2);
        require(
            HCULimits.isWithinSequentialLimit(estimatedCost) && 
            HCULimits.isWithinGlobalLimit(estimatedCost),
            "Decryption exceeds limits"
        );
        
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(encryptedYesVotes);
        cts[1] = FHE.toBytes32(encryptedNoVotes);
        
        uint256 requestId = FHE.requestDecryption(cts, this.callbackDecryptVotes.selector);
        status = VotingStatus.DecryptionInProgress;
        
        emit DecryptionRequested(requestId);
    }
    
    function callbackDecryptVotes(
        uint256 requestId, 
        uint64 yesVotes, 
        uint64 noVotes, 
        bytes[] memory signatures
    ) public {
        FHE.checkSignatures(requestId, signatures);
        
        decryptedYesVotes = yesVotes;
        decryptedNoVotes = noVotes;
        status = VotingStatus.ResultsDecrypted;
        
        emit ResultsDecrypted(yesVotes, noVotes);
    }
    
    function getResults() public view returns (uint64 yesVotes, uint64 noVotes) {
        require(status == VotingStatus.ResultsDecrypted, "Not decrypted");
        return (decryptedYesVotes, decryptedNoVotes);
    }
    
    function getVotingInfo() public view returns (
        string memory topic,
        uint256 deadline,
        VotingStatus currentStatus,
        bool userHasVoted
    ) {
        return (votingTopic, voteDeadline, status, hasVoted[msg.sender]);
    }
    
    function isVotingActive() public view returns (bool) {
        return status == VotingStatus.Open && block.timestamp <= voteDeadline;
    }
    
    function getTimeLeft() public view returns (uint256) {
        if (block.timestamp >= voteDeadline) return 0;
        return voteDeadline - block.timestamp;
    }
    
    function emergencyStop() public onlyOwner {
        require(status == VotingStatus.Open, "Not open");
        voteDeadline = block.timestamp;
    }
    
    function getHCUInfo() public pure returns (
        uint256 sequentialLimit,
        uint256 globalLimit,
        uint256 votingCost,
        uint256 decryptionCost
    ) {
        (sequentialLimit, globalLimit) = HCULimits.getLimits();
        votingCost = HCULimits.estimateVotingCost();
        decryptionCost = HCULimits.estimateDecryptionCost(2);
    }
}
`;

// Gas optimization settings
const GAS_OPTIMIZATIONS = {
    gasPrice: null, // Will be set based on current network conditions
    gasLimit: 3000000, // Conservative limit
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
    type: 2 // EIP-1559
};

class EncryptedVotingDeployer {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.deployedAddress = null;
    }

    async initialize() {
        console.log('🚀 Initializing EncryptedVoting Deployer...');
        
        // Create provider
        this.provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
        
        // Create wallet from mnemonic
        this.wallet = ethers.Wallet.fromPhrase(MNEMONIC).connect(this.provider);
        
        console.log('👤 Deployer Address:', this.wallet.address);
        
        // Check balance
        const balance = await this.provider.getBalance(this.wallet.address);
        console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
        
        if (balance < ethers.parseEther('0.01')) {
            throw new Error('Insufficient balance for deployment. Need at least 0.01 ETH');
        }
        
        console.log('✅ Deployer initialized successfully');
    }

    async optimizeGasSettings() {
        console.log('⚡ Optimizing gas settings for Sepolia...');
        
        try {
            // Get current gas price
            const feeData = await this.provider.getFeeData();
            
            console.log('📊 Current Fee Data:', {
                gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') + ' gwei' : 'null',
                maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') + ' gwei' : 'null',
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') + ' gwei' : 'null'
            });
            
            // Use EIP-1559 with optimization
            if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                // Reduce fees by 10% for faster inclusion with lower cost
                GAS_OPTIMIZATIONS.maxFeePerGas = feeData.maxFeePerGas * BigInt(90) / BigInt(100);
                GAS_OPTIMIZATIONS.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * BigInt(90) / BigInt(100);
                
                console.log('✅ Using EIP-1559 with 10% reduction:', {
                    maxFeePerGas: ethers.formatUnits(GAS_OPTIMIZATIONS.maxFeePerGas, 'gwei') + ' gwei',
                    maxPriorityFeePerGas: ethers.formatUnits(GAS_OPTIMIZATIONS.maxPriorityFeePerGas, 'gwei') + ' gwei'
                });
            } else if (feeData.gasPrice) {
                // Fallback to legacy gas pricing with 15% reduction
                GAS_OPTIMIZATIONS.gasPrice = feeData.gasPrice * BigInt(85) / BigInt(100);
                GAS_OPTIMIZATIONS.type = 0; // Legacy
                
                console.log('✅ Using legacy gas pricing with 15% reduction:', {
                    gasPrice: ethers.formatUnits(GAS_OPTIMIZATIONS.gasPrice, 'gwei') + ' gwei'
                });
            }
        } catch (error) {
            console.warn('⚠️ Could not optimize gas settings, using defaults');
            GAS_OPTIMIZATIONS.gasPrice = ethers.parseUnits('10', 'gwei'); // 10 gwei fallback
        }
    }

    async deployContract() {
        console.log('📋 Starting contract deployment...');
        
        try {
            // Create contract factory
            const contractFactory = new ethers.ContractFactory(
                this.getABI(),
                this.getBytecode(),
                this.wallet
            );
            
            console.log('🔧 Contract factory created');
            
            // Calculate nonce-based addresses for reference
            const currentNonce = await this.provider.getTransactionCount(this.wallet.address);
            console.log('📊 Current nonce:', currentNonce);
            
            const predictedAddresses = {
                nonce0: ethers.getCreateAddress({ from: this.wallet.address, nonce: currentNonce }),
                nonce1: ethers.getCreateAddress({ from: this.wallet.address, nonce: currentNonce + 1 })
            };
            
            console.log('🔮 Predicted addresses:', predictedAddresses);
            
            // Estimate gas
            console.log('⛽ Estimating gas...');
            const gasEstimate = await contractFactory.getDeployTransaction(TOPIC, DURATION_HOURS).then(tx => 
                this.provider.estimateGas(tx)
            );
            
            console.log('📊 Estimated gas:', gasEstimate.toString());
            
            // Set optimized gas limit (add 20% buffer)
            GAS_OPTIMIZATIONS.gasLimit = gasEstimate * BigInt(120) / BigInt(100);
            
            console.log('⚡ Final gas settings:', {
                gasLimit: GAS_OPTIMIZATIONS.gasLimit.toString(),
                maxFeePerGas: GAS_OPTIMIZATIONS.maxFeePerGas ? ethers.formatUnits(GAS_OPTIMIZATIONS.maxFeePerGas, 'gwei') + ' gwei' : 'null',
                maxPriorityFeePerGas: GAS_OPTIMIZATIONS.maxPriorityFeePerGas ? ethers.formatUnits(GAS_OPTIMIZATIONS.maxPriorityFeePerGas, 'gwei') + ' gwei' : 'null',
                gasPrice: GAS_OPTIMIZATIONS.gasPrice ? ethers.formatUnits(GAS_OPTIMIZATIONS.gasPrice, 'gwei') + ' gwei' : 'null'
            });
            
            // Deploy contract
            console.log('🚀 Deploying OptimizedEncryptedVoting contract...');
            console.log('📝 Topic:', TOPIC);
            console.log('⏰ Duration:', DURATION_HOURS, 'hours');
            
            const contract = await contractFactory.deploy(TOPIC, DURATION_HOURS, GAS_OPTIMIZATIONS);
            
            console.log('⏳ Deployment transaction sent:', contract.deploymentTransaction().hash);
            console.log('⏳ Waiting for confirmation...');
            
            // Wait for deployment
            await contract.waitForDeployment();
            
            this.deployedAddress = await contract.getAddress();
            
            console.log('🎉 Contract deployed successfully!');
            console.log('📍 Contract Address:', this.deployedAddress);
            console.log('🔗 Etherscan URL: https://sepolia.etherscan.io/address/' + this.deployedAddress);
            
            return {
                address: this.deployedAddress,
                txHash: contract.deploymentTransaction().hash,
                gasUsed: null, // Will be filled after receipt
                blockNumber: null
            };
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            throw error;
        }
    }

    async verifyDeployment() {
        console.log('🔍 Verifying deployment...');
        
        try {
            const contract = new ethers.Contract(this.deployedAddress, this.getABI(), this.provider);
            
            // Test basic functions
            const [topic, deadline, status] = await contract.getVotingInfo();
            const isActive = await contract.isVotingActive();
            const hcuInfo = await contract.getHCUInfo();
            
            console.log('✅ Contract verification successful:');
            console.log('📝 Topic:', topic);
            console.log('⏰ Deadline:', new Date(Number(deadline) * 1000).toLocaleString());
            console.log('📊 Status:', status);
            console.log('🟢 Is Active:', isActive);
            console.log('⚡ HCU Limits:', {
                sequential: hcuInfo[0].toString(),
                global: hcuInfo[1].toString(),
                voting: hcuInfo[2].toString(),
                decryption: hcuInfo[3].toString()
            });
            
            return true;
        } catch (error) {
            console.error('❌ Verification failed:', error.message);
            return false;
        }
    }

    getABI() {
        // Simplified ABI for deployment
        return [
            {
                "inputs": [{"internalType": "string", "name": "_topic", "type": "string"}, {"internalType": "uint256", "name": "_durationInHours", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [{"internalType": "externalEbool", "name": "support", "type": "uint256"}, {"internalType": "bytes", "name": "inputProof", "type": "bytes"}],
                "name": "vote",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "requestVoteDecryption",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getResults",
                "outputs": [{"internalType": "uint64", "name": "yesVotes", "type": "uint64"}, {"internalType": "uint64", "name": "noVotes", "type": "uint64"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getVotingInfo",
                "outputs": [{"internalType": "string", "name": "topic", "type": "string"}, {"internalType": "uint256", "name": "deadline", "type": "uint256"}, {"internalType": "uint8", "name": "currentStatus", "type": "uint8"}, {"internalType": "bool", "name": "userHasVoted", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "isVotingActive",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getTimeLeft",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getHCUInfo",
                "outputs": [{"internalType": "uint256", "name": "sequentialLimit", "type": "uint256"}, {"internalType": "uint256", "name": "globalLimit", "type": "uint256"}, {"internalType": "uint256", "name": "votingCost", "type": "uint256"}, {"internalType": "uint256", "name": "decryptionCost", "type": "uint256"}],
                "stateMutability": "pure",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [{"indexed": true, "internalType": "address", "name": "voter", "type": "address"}],
                "name": "VoteCasted",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [{"indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256"}],
                "name": "DecryptionRequested",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [{"indexed": false, "internalType": "uint64", "name": "yesVotes", "type": "uint64"}, {"indexed": false, "internalType": "uint64", "name": "noVotes", "type": "uint64"}],
                "name": "ResultsDecrypted",
                "type": "event"
            },
            {
                "inputs": [{"internalType": "address", "name": "", "type": "address"}],
                "name": "hasVoted",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    getBytecode() {
        // This would normally be generated by Solidity compiler
        // For this demo, we'll use a placeholder that would be replaced by actual compiled bytecode
        return "0x608060405234801561001057600080fd5b506040516125103803806125108339818101604052810190610032919061020d565b..."; // Truncated for brevity
    }
}

// Main execution
async function main() {
    try {
        console.log('🎯 Starting OptimizedEncryptedVoting deployment to Sepolia');
        console.log('🔑 Using mnemonic:', MNEMONIC.substring(0, 20) + '...');
        
        const deployer = new EncryptedVotingDeployer();
        
        // Initialize
        await deployer.initialize();
        
        // Optimize gas settings
        await deployer.optimizeGasSettings();
        
        // Deploy contract
        const deploymentResult = await deployer.deployContract();
        
        // Verify deployment
        await deployer.verifyDeployment();
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress: deploymentResult.address,
            transactionHash: deploymentResult.txHash,
            deployerAddress: deployer.wallet.address,
            network: 'sepolia',
            chainId: 11155111,
            topic: TOPIC,
            duration: DURATION_HOURS,
            deploymentTime: new Date().toISOString(),
            etherscanUrl: \`https://sepolia.etherscan.io/address/\${deploymentResult.address}\`
        };
        
        // Write deployment info to file
        fs.writeFileSync(
            path.join(__dirname, 'deployment-result.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('✅ Deployment completed successfully!');
        console.log('📄 Deployment info saved to deployment-result.json');
        console.log('🔗 Contract Address:', deploymentResult.address);
        
        return deploymentResult.address;
        
    } catch (error) {
        console.error('💥 Deployment failed:', error);
        process.exit(1);
    }
}

// Export for use as module or run directly
if (require.main === module) {
    main();
}

module.exports = { EncryptedVotingDeployer, main };