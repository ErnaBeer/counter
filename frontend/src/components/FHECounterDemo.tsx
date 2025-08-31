"use client";

import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import { useFhevm } from '../utils/fhevm-hooks';
import { useFHECounter } from '../hooks/useFHECounter';
import { useInMemoryStorage } from '../hooks/useInMemoryStorage';
import './FHECounterDemo.css';

interface FHECounterDemoProps {
  provider: ethers.BrowserProvider | null;
  account: string | null;
  chainId: number | null;
}

const FHECounterDemo: React.FC<FHECounterDemoProps> = ({ provider, account, chainId }) => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<ethers.Provider | null>(null);
  
  const sameChainRef = useRef<(chainId: number | undefined) => boolean>((currentChainId) => currentChainId === chainId);
  const sameSignerRef = useRef<(signer: ethers.JsonRpcSigner | undefined) => boolean>((currentSigner) => currentSigner === ethersSigner);

  // Initialize providers when available
  React.useEffect(() => {
    const initializeProviders = async () => {
      if (provider && account) {
        try {
          const signer = await provider.getSigner(account);
          setEthersSigner(signer);
          setEthersReadonlyProvider(provider);
        } catch (error) {
          console.error('Failed to initialize providers:', error);
        }
      }
    };
    initializeProviders();
  }, [provider, account]);
  
  // FHEVM instance using the proper hook pattern
  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider: provider || undefined,
    chainId: chainId || undefined,
    enabled: !!provider && !!account,
    initialMockChains: { 31337: "http://localhost:8545" },
  });
  
  // Display error if present
  const hasError = fhevmError && fhevmError !== null;
  
  // FHE Counter hook with all the logic
  const fheCounter = useFHECounter({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider ? (window as any).ethereum : undefined,
    chainId: chainId || undefined,
    ethersSigner: ethersSigner || undefined,
    ethersReadonlyProvider: ethersReadonlyProvider || undefined,
    sameChain: sameChainRef,
    sameSigner: sameSignerRef,
  });
  
  const isConnected = !!account && !!provider;
  const networkSupported = chainId === 11155111 || chainId === 31337; // Sepolia or Hardhat
  
  // Component logic without styling variables


  if (!isConnected) {
    return (
      <div className="fhe-counter-demo">
        <div className="wallet-warning">
          <h3>👛 Wallet Not Connected</h3>
          <p>Please connect your wallet to interact with FHEVM contracts.</p>
        </div>
      </div>
    );
  }
  
  if (!networkSupported) {
    return (
      <div className="fhe-counter-demo">
        <div className="network-warning">
          <h3>⚠️ Network Not Supported</h3>
          <p>Please connect to Sepolia testnet (Chain ID: 11155111) to use FHEVM features.</p>
          <p>Current chain ID: {chainId}</p>
        </div>
      </div>
    );
  }
  
  if (fheCounter.isDeployed === false) {
    return (
      <div className="fhe-counter-demo">
        <div className="deployment-error">
          <h3>📋 Contract Not Found</h3>
          <p>FHECounter contract is not deployed on chain {chainId}.</p>
          <p>Please deploy the contract first or check the deployment configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fhe-counter-demo">
      <div className="demo-header">
        <h1>🔐 FHEVM Counter Demo</h1>
        <p>Fully Homomorphic Encryption Counter with Zama FHEVM</p>
        <div className="etherscan-link">
          <a 
            href={`https://sepolia.etherscan.io/address/${fheCounter.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            🔍 View Contract on Etherscan
          </a>
        </div>
      </div>

      <div className="demo-status">
        <div className="status-item">
          <span className="label">Chain ID:</span>
          <span className="address">{chainId}</span>
        </div>
        <div className="status-item">
          <span className="label">Account:</span>
          <span className="address">{account?.substring(0, 6)}...{account?.substring(-4)}</span>
        </div>
        <div className="status-item">
          <span className="label">Contract:</span>
          <span className="address">{fheCounter.contractAddress?.substring(0, 8)}...</span>
        </div>
        <div className="status-item">
          <span className="label">Status:</span>
          <span className={`status ${fhevmStatus || 'idle'}`}>{fhevmStatus || 'Idle'}</span>
        </div>
      </div>

      <div className="contract-stats">
        <h3>📊 Contract Information</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">FHEVM Instance:</span>
            <span className="stat-value">{fhevmInstance ? "✅ Ready" : "❌ Not Ready"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Contract Deployed:</span>
            <span className="stat-value">{fheCounter.isDeployed ? "✅ Yes" : "❌ No"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Can Get Count:</span>
            <span className="stat-value">{fheCounter.canGetCount ? "✅ Yes" : "❌ No"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Can Decrypt:</span>
            <span className="stat-value">{fheCounter.canDecrypt ? "✅ Yes" : "❌ No"}</span>
          </div>
        </div>
      </div>

      <div className="contract-stats">
        <h3>🔢 Counter Status</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Counter Handle:</span>
            <span className="stat-value">{fheCounter.handle ? fheCounter.handle.substring(0, 10) + "..." : "None"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Decrypted Value:</span>
            <span className="stat-value">
              {fheCounter.isDecrypted ? String(fheCounter.clear) : "🔒 Encrypted"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Is Decrypting:</span>
            <span className="stat-value">{fheCounter.isDecrypting ? "⏳ Yes" : "✅ No"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Operations Running:</span>
            <span className="stat-value">{fheCounter.isIncOrDec ? "⏳ Yes" : "✅ No"}</span>
          </div>
        </div>
      </div>

      <div className="counter-operations">
        <h3>🎮 Counter Operations</h3>
        
        <div className="button-grid">
          <button
            className="operation-button increment"
            disabled={!fheCounter.canIncOrDec}
            onClick={() => fheCounter.incOrDec(+1)}
          >
            {fheCounter.canIncOrDec ? "➕ Increment by 1" : 
             fheCounter.isIncOrDec ? "⏳ Processing..." : "❌ Cannot Increment"}
          </button>
          
          <button
            className="operation-button decrement"
            disabled={!fheCounter.canIncOrDec}
            onClick={() => fheCounter.incOrDec(-1)}
          >
            {fheCounter.canIncOrDec ? "➖ Decrement by 1" : 
             fheCounter.isIncOrDec ? "⏳ Processing..." : "❌ Cannot Decrement"}
          </button>
          
          <button
            className="operation-button decrypt"
            disabled={!fheCounter.canDecrypt}
            onClick={fheCounter.decryptCountHandle}
          >
            {fheCounter.canDecrypt ? "🔓 Decrypt Counter" : 
             fheCounter.isDecrypting ? "⏳ Decrypting..." :
             fheCounter.isDecrypted ? `🔓 Value: ${fheCounter.clear}` : "🔒 Nothing to Decrypt"}
          </button>
          
          <button
            className="operation-button"
            disabled={!fheCounter.canGetCount}
            onClick={fheCounter.refreshCountHandle}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            {fheCounter.canGetCount ? "🔄 Refresh Count" : 
             fheCounter.isRefreshing ? "⏳ Refreshing..." : "❌ Cannot Refresh"}
          </button>
        </div>
      </div>

      {fheCounter.message && (
        <div className="demo-info">
          <h3>📝 Status Message</h3>
          <p><strong>Latest:</strong> {fheCounter.message}</p>
        </div>
      )}

      {hasError && (
        <div className="demo-info" style={{ borderColor: '#dc2626', backgroundColor: '#fef2f2' }}>
          <h3>⚠️ FHEVM Error</h3>
          <p><strong>Error:</strong> {fhevmError?.message || String(fhevmError)}</p>
        </div>
      )}

      <div className="demo-info">
        <h3>ℹ️ How to Use</h3>
        <ul>
          <li><strong>Increment/Decrement:</strong> Perform encrypted arithmetic operations on the counter</li>
          <li><strong>Decrypt:</strong> Reveal the current encrypted counter value</li>
          <li><strong>Refresh:</strong> Fetch the latest encrypted counter handle from the contract</li>
          <li><strong>View on Etherscan:</strong> Monitor real-time transactions on the blockchain</li>
        </ul>
      </div>
    </div>
  );
};

// Helper functions removed - using direct rendering in component

export default FHECounterDemo;