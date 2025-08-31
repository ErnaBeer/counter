// Contract Deployment Helper Component
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ContractDeploymentDetector, DeploymentValidation, ContractDeploymentInfo } from '../utils/contract-detector';
import { ALTERNATIVE_ADDRESSES } from '../contracts/FHECounter';

interface ContractDeploymentHelperProps {
  provider: ethers.BrowserProvider | null;
  chainId: number | null;
  onAddressSelected: (address: string) => void;
}

const ContractDeploymentHelper: React.FC<ContractDeploymentHelperProps> = ({ 
  provider, 
  chainId, 
  onAddressSelected 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<DeploymentValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  // Auto-detect deployments when provider is available
  useEffect(() => {
    const detectDeployments = async () => {
      if (!provider || !chainId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const detector = new ContractDeploymentDetector(provider, chainId);
        const deploymentValidation = await detector.validateAllDeployments();
        
        setValidation(deploymentValidation);
        
        if (deploymentValidation.bestOption) {
          setSelectedAddress(deploymentValidation.bestOption.address);
          onAddressSelected(deploymentValidation.bestOption.address);
        }
      } catch (err) {
        console.error('Failed to detect deployments:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    detectDeployments();
  }, [provider, chainId, onAddressSelected]);

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address);
    onAddressSelected(address);
  };

  const handleRefresh = async () => {
    if (!provider || !chainId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const detector = new ContractDeploymentDetector(provider, chainId);
      const deploymentValidation = await detector.validateAllDeployments();
      
      setValidation(deploymentValidation);
    } catch (err) {
      console.error('Failed to refresh deployments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateContractAddress = (deployerAddress: string, nonce: number): string => {
    try {
      return ContractDeploymentDetector.calculateContractAddress(deployerAddress, nonce);
    } catch {
      return 'Invalid address';
    }
  };

  if (!provider || !chainId) {
    return (
      <div className="deployment-helper">
        <h3>🔗 Contract Deployment Helper</h3>
        <p>Please connect your wallet to detect contract deployments.</p>
      </div>
    );
  }

  if (chainId !== 11155111) {
    return (
      <div className="deployment-helper">
        <h3>⚠️ Network Not Supported</h3>
        <p>Contract deployment detection is only available on Sepolia testnet.</p>
      </div>
    );
  }

  return (
    <div className="deployment-helper" style={{ 
      padding: '20px', 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      marginBottom: '20px',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>📋 Contract Deployment Status</h3>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '🔄 Checking...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <p style={{ color: '#dc2626', margin: 0 }}>❌ {error}</p>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>🔍 Scanning Sepolia testnet for deployed contracts...</p>
        </div>
      )}

      {validation && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h4>📊 Deployment Summary</h4>
            <div style={{ 
              padding: '12px', 
              backgroundColor: validation.bestOption ? '#f0fdf4' : '#fef3c7', 
              border: `1px solid ${validation.bestOption ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: '4px'
            }}>
              {validation.bestOption ? (
                <div>
                  ✅ <strong>Best Contract Found:</strong> {validation.bestOption.address}
                  <br />
                  📊 Functions: {validation.bestOption.functions.length} | Transactions: {validation.bestOption.transactionCount}
                </div>
              ) : (
                <div>
                  ⚠️ <strong>No fully deployed contracts detected</strong>
                  <br />
                  Found {validation.validAddresses.length} addresses with contract code
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>🔍 All Candidate Addresses</h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {Object.entries(validation.deploymentInfo).map(([address, info]) => (
                <div
                  key={address}
                  style={{
                    padding: '12px',
                    border: `2px solid ${selectedAddress === address ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    backgroundColor: info.isDeployed ? '#f0fdf4' : '#fafafa',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleAddressSelect(address)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {info.isDeployed ? '✅' : info.isContract ? '⚠️' : '❌'} {address}
                        {selectedAddress === address && <span style={{ color: '#3b82f6' }}> (Selected)</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Status: {info.isDeployed ? 'Deployed' : info.isContract ? 'Contract' : 'No Code'} | 
                        Balance: {info.balance} ETH | 
                        Transactions: {info.transactionCount} |
                        Functions: {info.functions.length}
                      </div>
                      {info.functions.length > 0 && (
                        <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>
                          Functions: {info.functions.slice(0, 3).join(', ')}
                          {info.functions.length > 3 && ` +${info.functions.length - 3} more`}
                        </div>
                      )}
                    </div>
                    <a 
                      href={info.etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px'
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      🔍 Etherscan
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4>🧮 Address Generation Reference</h4>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <p><strong>Expected addresses for different deployment nonces:</strong></p>
              <ul>
                <li><strong>Nonce 0:</strong> {ALTERNATIVE_ADDRESSES.NONCE_0}</li>
                <li><strong>Nonce 1:</strong> {ALTERNATIVE_ADDRESSES.NONCE_1}</li>
                <li><strong>Original:</strong> {ALTERNATIVE_ADDRESSES.ORIGINAL}</li>
              </ul>
              <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                💡 Contract addresses are deterministic based on the deployer address and nonce.
                If no contracts are found, the contract may not be deployed yet.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContractDeploymentHelper;