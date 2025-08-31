# Temporal Warp Portal - Quantum Processing Frontend

An intelligent React interface for interacting with both standard and FHE (Fully Homomorphic Encryption) temporal processing systems.

## Features

⏰ **Dual Temporal Interface**
- Standard Temporal: Traditional transparent spacetime operations
- Quantum Temporal: Fully homomorphic encrypted chronomorphic operations

🔗 **Temporal Web3 Integration**
- MetaMask temporal wallet connection
- Multi-dimension support (Hardhat local, Sepolia quantum testnet)
- Real-time spacetime transaction feedback

🕰️ **Quantum UI/UX**
- Responsive temporal design
- Beautiful chronomorphic gradient styling
- Spacetime toast notifications
- Temporal loading states and quantum error handling

## Prerequisites

- Node.js (v18.x or v20.x)
- MetaMask browser extension
- Running Hardhat local network (for development)

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## Configuration

### 1. Contract Addresses
Update contract addresses in `src/utils/contracts.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  Counter: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // From deployment
  FHECounter: "YOUR_TEMPORAL_FHE_COUNTER_ADDRESS_HERE" // Deploy to Sepolia
};
```

### 2. Network Configuration
The app supports:
- **Hardhat Local** (ChainID: 31337) - For standard temporal testing
- **Sepolia Testnet** (ChainID: 11155111) - For quantum temporal operations

## Usage

### Temporal Development Mode
```bash
npm run chrono-start
```
Opens the Temporal Portal at [http://localhost:3000](http://localhost:3000)

### Quantum Production Build
```bash
npm run temporal-build
```

## How to Use the Temporal Warp Portal

### 1. Connect Temporal Wallet
- Click "Connect MetaMask Temporal Wallet"
- Approve the spacetime connection in MetaMask

### 2. Standard Temporal Interface
- Enter quantum values in the input field
- Click "Accelerate Timestream" or "Reverse Timestream"
- View real-time temporal activity updates

### 3. Quantum Temporal Interface
- Switch to Sepolia quantum testnet in MetaMask
- Enter chronomorphic data to encrypt
- Click "Encrypt & Accelerate" or "Encrypt & Reverse"
- Operations are performed on encrypted temporal data

## Network Setup

### Local Development (Hardhat)
1. Start the backend:
```bash
cd .. # Go back to project root
npx hardhat node
```

2. Add Hardhat network to MetaMask:
- Network Name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

### Sepolia Testnet (for FHE)
1. Add Sepolia to MetaMask (usually pre-configured)
2. Get Sepolia ETH from faucets
3. Deploy quantum temporal contracts to Sepolia
4. Update contract address in configuration

## Features Breakdown

### Standard Temporal Interface
- ✅ Real-time spacetime activity display
- ✅ Accelerate/Reverse temporal operations
- ✅ Quantum input validation
- ✅ Temporal transaction status tracking
- ✅ Spacetime error handling

### Quantum Temporal Interface
- ✅ Encrypted temporal state display
- ✅ Dimension network compatibility checking
- ✅ Encrypted chronomorphic input handling (demo)
- ⚠️ **Note**: Uses simplified temporal encryption for demo purposes
- 🔄 Ready for full FHEVM quantum integration

### Temporal Wallet Integration
- ✅ MetaMask quantum connection
- ✅ Timekeeper account switching detection
- ✅ Dimension network switching detection
- ✅ Spacetime connection status indicator

## Temporal Technical Stack

- **React 18** with TypeScript for quantum mechanics
- **Ethers.js v6** for temporal blockchain interaction
- **Styled Components** for spacetime styling
- **React Toastify** for chronomorphic notifications
- **FHEVM Solidity** temporal quantum library integration

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx      # Wallet connection UI
│   │   ├── CounterInterface.tsx   # Standard counter UI
│   │   └── FHECounterInterface.tsx # FHE counter UI
│   ├── hooks/
│   │   └── useWallet.ts           # Wallet connection logic
│   ├── utils/
│   │   └── contracts.ts           # Contract ABIs and addresses
│   ├── App.tsx                    # Main application
│   └── index.tsx                  # Entry point
├── public/
│   └── index.html
└── package.json
```

## Troubleshooting

### Common Issues

1. **"Please install MetaMask" error**
   - Install MetaMask browser extension
   - Refresh the page

2. **Network not supported**
   - Switch to Hardhat Local (31337) for standard temporal
   - Switch to Sepolia (11155111) for quantum temporal

3. **Transaction failures**
   - Check you have sufficient ETH for gas
   - Verify contract is deployed on current network
   - Check console for detailed error messages

4. **Quantum Temporal Counter not working**
   - Temporal operations require Sepolia testnet
   - Ensure quantum temporal contract is deployed
   - Current demo uses simplified chronomorphic encryption

### Development Tips

1. **Testing with Local Hardhat**
   - Use account #0 from Hardhat accounts
   - Standard temporal works immediately
   - Quantum temporal will show network warning

2. **Testing with Sepolia**
   - Get Sepolia ETH from faucets
   - Deploy quantum temporal contract first
   - Update contract address in config

## Future Enhancements

- 🔄 Full FHEVM client library integration
- 🔄 Real encrypted input generation
- 🔄 Decryption result display
- 🔄 Multiple FHE data types support
- 🔄 Transaction history
- 🔄 Mobile responsiveness improvements

## License

MIT License

---

**Ready to explore the future of private temporal smart contracts!** ⏰