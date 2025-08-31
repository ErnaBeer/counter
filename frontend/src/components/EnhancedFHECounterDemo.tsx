// Enhanced FHEVM Encrypted Voting Demo with Real Meta Transactions and On-Chain Verification
// Updated for EncryptedVoting contract - Vote YES or NO with encrypted ballots
"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useFHEVMMetaTransactions } from '../hooks/useFHEVMMetaTransactions';
import { FHE_COUNTER_ADDRESS, FHE_COUNTER_ABI } from '../contracts/FHECounter';
import { getEtherscanUrl } from '../utils/fhevm-meta';
import ContractDeploymentHelper from './ContractDeploymentHelper';
import './FHECounterDemo.css';

interface EnhancedFHECounterDemoProps {
  provider: ethers.BrowserProvider | null;
  account: string | null;
  chainId: number | null;
}

const EncryptedVotingDemo: React.FC<EnhancedFHECounterDemoProps> = ({ provider, account, chainId }) => {
  const [voteSupport, setVoteSupport] = useState<boolean>(true);
  const [contractStats, setContractStats] = useState<any>(null);
  const [lastTxHash, setLastTxHash] = useState<string>('');
  const [activeContractAddress, setActiveContractAddress] = useState<string>(FHE_COUNTER_ADDRESS);
  const [showDeploymentHelper, setShowDeploymentHelper] = useState<boolean>(false);

  // Use the enhanced FHEVM meta transactions hook
  const {
    isInitialized,
    isLoading,
    error,
    transactions,
    currentTransaction,
    initialize,
    executeMetaTransaction,
    verifyTransaction,
    getTransactionStatus,
    readEncryptedValue,
    clearError,
    clearTransactions
  } = useFHEVMMetaTransactions();

  // Initialize when provider becomes available
  useEffect(() => {
    const initializeMetaTransactions = async () => {
      if (provider && account && chainId && !isInitialized) {
        try {
          console.log('🚀 Initializing Enhanced FHEVM Counter Demo with address:', activeContractAddress);
          await initialize(provider, activeContractAddress);
        } catch (error) {
          console.error('❌ Failed to initialize meta transactions:', error);
        }
      }
    };

    initializeMetaTransactions();
  }, [provider, account, chainId, isInitialized, initialize, activeContractAddress]);

  // Load contract stats
  useEffect(() => {
    const loadContractStats = async () => {
      if (!isInitialized || !provider) return;

      try {
        const contract = new ethers.Contract(activeContractAddress, FHE_COUNTER_ABI, provider);
        
        // Get temporal stats if available
        if (contract.getTemporalStats) {
          const stats = await contract.getTemporalStats();
          setContractStats({
            name: stats.name || 'FHEVM Counter',
            currentStatus: stats.currentStatus || 0,
            totalOps: stats.totalOps?.toString() || '0',
            creation: stats.creation?.toString() || '0',
            lastOp: stats.lastOp?.toString() || '0',
            decrypted: stats.decrypted || false,
            revealedValue: stats.revealedValue?.toString() || '0'
          });
        }
      } catch (error) {
        console.error('Failed to load contract stats:', error);
      }
    };

    loadContractStats();
  }, [isInitialized, provider, transactions, activeContractAddress]);

  // Handle contract address selection from deployment helper
  const handleContractAddressSelected = (address: string) => {
    console.log('📍 Contract address selected:', address);
    setActiveContractAddress(address);
    setShowDeploymentHelper(false);
  };

  // Handle voting YES operation with real meta transaction
  const handleVoteYes = async () => {
    try {
      console.log('🗳️ Casting YES vote');
      clearError();
      
      const metaTx = await executeMetaTransaction(
        'vote', // EncryptedVoting function
        [
          {
            name: 'support',
            value: true, // true for YES vote
            type: 'ebool'
          }
        ],
        FHE_COUNTER_ABI
      );

      setLastTxHash(metaTx.txHash || '');
      console.log('✅ YES vote meta transaction completed:', metaTx);
    } catch (error) {
      console.error('❌ YES vote failed:', error);
    }
  };

  // Handle voting NO operation with real meta transaction
  const handleVoteNo = async () => {
    try {
      console.log('🗳️ Casting NO vote');
      clearError();
      
      const metaTx = await executeMetaTransaction(
        'vote', // EncryptedVoting function
        [
          {
            name: 'support',
            value: false, // false for NO vote
            type: 'ebool'
          }
        ],
        FHE_COUNTER_ABI
      );

      setLastTxHash(metaTx.txHash || '');
      console.log('✅ NO vote meta transaction completed:', metaTx);
    } catch (error) {
      console.error('❌ NO vote failed:', error);
    }
  };

  // Handle decrypt operation for voting results
  const handleDecrypt = async () => {
    try {
      console.log('🔓 Requesting vote result decryption...');
      clearError();
      
      const metaTx = await executeMetaTransaction(
        'requestVoteDecryption',
        [],
        FHE_COUNTER_ABI
      );

      setLastTxHash(metaTx.txHash || '');
      console.log('✅ Vote decryption request completed:', metaTx);
    } catch (error) {
      console.error('❌ Vote decryption request failed:', error);
    }
  };

  // Read voting info
  const handleReadVotingInfo = async () => {
    try {
      console.log('📖 Reading voting information...');
      const votingInfo = await readEncryptedValue('getVotingInfo', FHE_COUNTER_ABI);
      console.log('📊 Voting info:', votingInfo);
    } catch (error) {
      console.error('❌ Failed to read voting info:', error);
    }
  };

  // Verify a transaction
  const handleVerifyTransaction = async (txHash: string) => {
    try {
      const isValid = await verifyTransaction(txHash);
      alert(`Transaction ${txHash.substring(0, 10)}... is ${isValid ? 'VALID' : 'INVALID'}`);
    } catch (error) {
      console.error('❌ Verification failed:', error);
    }
  };

  const isConnected = !!account && !!provider;
  const networkSupported = chainId === 11155111 || chainId === 31337; // Sepolia or Hardhat

  if (!isConnected) {
    return (
      <div className="fhe-counter-demo">
        <div className="wallet-warning">
          <h3>👛 Wallet Not Connected</h3>
          <p>Please connect your wallet to interact with FHEVM meta transactions.</p>
        </div>
      </div>
    );
  }

  if (!networkSupported) {
    return (
      <div className="fhe-counter-demo">
        <div className="network-warning">
          <h3>⚠️ Network Not Supported</h3>
          <p>Please connect to Sepolia testnet (Chain ID: 11155111) for real FHEVM operations.</p>
          <p>Current chain ID: {chainId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fhe-counter-demo">
      <div className="demo-header">
        <h1>🗳️ Enhanced FHEVM Encrypted Voting with Meta Transactions</h1>
        <p>Real on-chain FHE operations with transaction verification</p>
        <div className="etherscan-link">
          <a 
            href={`https://sepolia.etherscan.io/address/${activeContractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            🔍 View Contract on Etherscan
          </a>
          <button 
            onClick={() => setShowDeploymentHelper(!showDeploymentHelper)}
            style={{ 
              marginLeft: '12px', 
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📋 {showDeploymentHelper ? 'Hide' : 'Show'} Deployment Helper
          </button>
        </div>
      </div>

      <div className="demo-status">
        <div className="status-item">
          <span className="label">Network:</span>
          <span className="address">{chainId === 11155111 ? 'Sepolia' : `Chain ${chainId}`}</span>
        </div>
        <div className="status-item">
          <span className="label">Account:</span>
          <span className="address">{account?.substring(0, 6)}...{account?.substring(-4)}</span>
        </div>
        <div className="status-item">
          <span className="label">Contract:</span>
          <span className="address">{activeContractAddress.substring(0, 8)}...</span>
        </div>
        <div className="status-item">
          <span className="label">Meta System:</span>
          <span className={`status ${isInitialized ? 'ready' : 'initializing'}`}>
            {isInitialized ? '✅ Ready' : '⏳ Initializing'}
          </span>
        </div>
      </div>

      {showDeploymentHelper && (
        <ContractDeploymentHelper
          provider={provider}
          chainId={chainId}
          onAddressSelected={handleContractAddressSelected}
        />
      )}

      {contractStats && (
        <div className="contract-stats">
          <h3>📊 Contract Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Name:</span>
              <span className="stat-value">{contractStats.name}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Operations:</span>
              <span className="stat-value">{contractStats.totalOps}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Is Decrypted:</span>
              <span className="stat-value">{contractStats.decrypted ? '✅ Yes' : '🔒 No'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Revealed Value:</span>
              <span className="stat-value">
                {contractStats.decrypted ? contractStats.revealedValue : '🔒 Encrypted'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="counter-operations">
        <h3>🎮 Meta Transaction Operations</h3>
        
        <div className="voting-info">
          <div className="voting-topic">
            <h4>📊 Encrypted Voting Topic:</h4>
            <p>"Should we implement Zama FHE in more DApps?"</p>
          </div>
          <div className="voting-instructions">
            <p>💡 Cast your encrypted vote - YES or NO. Your vote is private and will only be revealed when decryption is requested after voting ends.</p>
          </div>
        </div>
        
        <div className="button-grid">
          <button
            className="operation-button increment"
            disabled={!isInitialized || isLoading}
            onClick={handleVoteYes}
          >
            {isLoading ? '⏳ Processing...' : '✅ Vote YES'}
          </button>
          
          <button
            className="operation-button decrement"
            disabled={!isInitialized || isLoading}
            onClick={handleVoteNo}
          >
            {isLoading ? '⏳ Processing...' : '❌ Vote NO'}
          </button>
          
          <button
            className="operation-button decrypt"
            disabled={!isInitialized || isLoading}
            onClick={handleDecrypt}
          >
            {isLoading ? '⏳ Processing...' : '🔓 Request Vote Decryption'}
          </button>
          
          <button
            className="operation-button"
            disabled={!isInitialized || isLoading}
            onClick={handleReadVotingInfo}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            {isLoading ? '⏳ Processing...' : '📖 Read Voting Info'}
          </button>
        </div>
      </div>

      {currentTransaction && (
        <div className="current-transaction">
          <h3>🔄 Current Transaction</h3>
          <div className="transaction-details">
            <div><strong>ID:</strong> {currentTransaction.id}</div>
            <div><strong>Function:</strong> {currentTransaction.functionName}</div>
            <div><strong>Status:</strong> <span className={`status ${currentTransaction.status}`}>{currentTransaction.status}</span></div>
            {currentTransaction.txHash && (
              <>
                <div><strong>Tx Hash:</strong> 
                  <a 
                    href={getEtherscanUrl(chainId!, currentTransaction.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: '8px' }}
                  >
                    {currentTransaction.txHash.substring(0, 10)}...
                  </a>
                </div>
                <button 
                  onClick={() => handleVerifyTransaction(currentTransaction.txHash!)}
                  className="verify-button"
                >
                  🔍 Verify on Chain
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="transaction-history">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>📝 Transaction History</h3>
            <button onClick={clearTransactions} className="clear-button">Clear History</button>
          </div>
          <div className="transaction-list">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-header">
                  <span className="tx-function">{tx.functionName}</span>
                  <span className={`tx-status ${tx.status}`}>{tx.status}</span>
                </div>
                <div className="tx-details">
                  <div>ID: {tx.id.substring(0, 16)}...</div>
                  {tx.txHash && (
                    <div>
                      Hash: 
                      <a 
                        href={getEtherscanUrl(chainId!, tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: '4px' }}
                      >
                        {tx.txHash.substring(0, 10)}...
                      </a>
                    </div>
                  )}
                  {tx.gasUsed && <div>Gas: {tx.gasUsed}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="demo-info" style={{ borderColor: '#dc2626', backgroundColor: '#fef2f2' }}>
          <h3>⚠️ Error</h3>
          <p><strong>Error:</strong> {error}</p>
          <button onClick={clearError} className="clear-error-button">Clear Error</button>
        </div>
      )}

      {lastTxHash && (
        <div className="demo-info">
          <h3>🔗 Last Transaction</h3>
          <p>
            <strong>View on Etherscan:</strong> 
            <a 
              href={getEtherscanUrl(chainId!, lastTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: '8px' }}
            >
              {lastTxHash}
            </a>
          </p>
        </div>
      )}

      <div className="demo-info">
        <h3>ℹ️ Enhanced Features</h3>
        <ul>
          <li><strong>Real Meta Transactions:</strong> All operations are real on-chain transactions with FHE encryption</li>
          <li><strong>On-Chain Verification:</strong> Verify any transaction directly on the blockchain</li>
          <li><strong>Transaction History:</strong> Track all your FHE operations with full transparency</li>
          <li><strong>Gas Monitoring:</strong> See actual gas costs for each operation</li>
          <li><strong>Live Status:</strong> Real-time transaction status updates</li>
        </ul>
      </div>
    </div>
  );
};

export default EncryptedVotingDemo;