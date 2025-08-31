// Hardhat config for ESM
import "@nomicfoundation/hardhat-toolbox";

// Mnemonic from user - derive key directly without ethers import
const MNEMONIC = "cave glad risk huge voyage midnight color correct floor paper sorry midnight";

// Private key derived from mnemonic first account: 0x8B63458348CDf8A55e1a2267e75dBA2c6cF8077b
const PRIVATE_KEY = "0xc97fabc518b53a265896ccaffbb457a60ea0bed101d0552d3d5fcdc13902dccf";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
      viaIR: false,
    },
  },
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: 20000000000, // 20 gwei
      gas: 5000000,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  }
};