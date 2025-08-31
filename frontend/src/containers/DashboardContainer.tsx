import React from 'react';
import { useWalletContext } from '../providers/WalletProvider';
import FHECounterDemo from '../components/FHECounterDemo';
import WalletConnectionCard from '../components/wallet/WalletConnectionCard';
import NetworkWarningCard from '../components/network/NetworkWarningCard';
import './DashboardContainer.css';

const DashboardContainer: React.FC = () => {
  const { isConnected, provider, account, chainId } = useWalletContext();

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-grid">
          <WalletConnectionCard />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">🔐 FHEVM Counter DApp</h2>
        <p className="dashboard-subtitle">
          Fully Homomorphic Encryption Counter with Zama FHEVM
        </p>
      </div>
      
      <div className="dashboard-content">
        <FHECounterDemo 
          provider={provider} 
          account={account} 
          chainId={chainId} 
        />
      </div>
    </div>
  );
};

export default DashboardContainer;