import React from 'react';
import { ToastContainer } from 'react-toastify';
import { WalletProvider } from './providers/WalletProvider';
import EnhancedFHECounterDemo from './components/EnhancedFHECounterDemo';
import { useWalletContext } from './providers/WalletProvider';
import './styles/global.css';
import 'react-toastify/dist/ReactToastify.css';

// App Header Component
const AppHeader: React.FC = () => {
  const { account, isConnected, chainId, connectWallet, disconnectWallet } = useWalletContext();
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <h1>🔐 FHEVM Counter DApp</h1>
          <p>Fully Homomorphic Encryption on Ethereum</p>
        </div>
        
        <div className="wallet-section">
          {isConnected ? (
            <div className="wallet-info">
              <div className="network-info">
                <span className={`network-badge ${chainId === 11155111 ? 'sepolia' : 'other'}`}>
                  {chainId === 11155111 ? '🌐 Sepolia' : `🔗 Chain ${chainId}`}
                </span>
              </div>
              <div className="account-info">
                <span className="account-address">
                  👤 {account?.substring(0, 6)}...{account?.substring(-4)}
                </span>
                <button onClick={disconnectWallet} className="disconnect-button">
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button onClick={connectWallet} className="connect-button">
              🔗 Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  const { provider, account, chainId } = useWalletContext();
  
  return (
    <div className="app">
      <AppHeader />
      
      <main className="main-content">
        <EnhancedFHECounterDemo 
          provider={provider} 
          account={account} 
          chainId={chainId} 
        />
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>🔐 Built with FHEVM & Zama | 🌐 Deployed on Sepolia Testnet</p>
          <div className="footer-links">
            <a 
              href="https://docs.zama.ai/fhevm" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              📚 FHEVM Docs
            </a>
            <a 
              href="https://github.com/zama-ai/fhevm" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              💻 GitHub
            </a>
            <a 
              href="https://sepolia.etherscan.io/address/0x46299977eFe1485DF5c93F0631E424edF60497D1" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              🔍 Contract
            </a>
          </div>
        </div>
      </footer>
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

// Root App with Provider
const App: React.FC = () => {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
};

export default App;