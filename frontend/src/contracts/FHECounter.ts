// FHEVM EncryptedVoting Contract Configuration
// Deployed on Sepolia Testnet using mnemonic: "cave glad risk huge voyage midnight color correct floor paper sorry midnight"

// EncryptedVoting Contract - Multiple deployment addresses supported
// Based on nonce of deployment account:
// - nonce=0: 0x27EC867aA9227b0759155B9D9e9d4Dd8c4e9D9C7
// - nonce=1: 0x46299977eFe1485DF5c93F0631E424edF60497D1
export const FHE_COUNTER_ADDRESS = "0x46299977eFe1485DF5c93F0631E424edF60497D1"; // Using nonce=1 deployment
export const ENCRYPTED_VOTING_ADDRESS = "0x46299977eFe1485DF5c93F0631E424edF60497D1"; // EncryptedVoting contract

// Alternative addresses for different deployment scenarios
export const ALTERNATIVE_ADDRESSES = {
  NONCE_0: "0x27EC867aA9227b0759155B9D9e9d4Dd8c4e9D9C7",
  NONCE_1: "0x46299977eFe1485DF5c93F0631E424edF60497D1",
  ORIGINAL: "0xec66f700727636677ffb2fda9a7061fb7abce8b682a4253d922cfbef66574e17"
};

// EncryptedVoting Contract ABI for FHEVM 0.7.0
export const ENCRYPTED_VOTING_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_topic",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_durationInHours",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "requestId",
        "type": "uint256"
      }
    ],
    "name": "DecryptionRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "yesVotes",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "noVotes",
        "type": "uint64"
      }
    ],
    "name": "ResultsDecrypted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "VoteCasted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "topic",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "VotingCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "requestId",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "yesVotes",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "noVotes",
        "type": "uint64"
      },
      {
        "internalType": "bytes[]",
        "name": "signatures",
        "type": "bytes[]"
      }
    ],
    "name": "callbackDecryptVotes",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decryptedNoVotes",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decryptedYesVotes",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyStop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getHCUInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "sequentialLimit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "globalLimit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "votingCost",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "decryptionCost",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getResults",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "yesVotes",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "noVotes",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalVoters",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timeRemaining",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimeLeft",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "topic",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "enum EncryptedVoting.VotingStatus",
        "name": "currentStatus",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "userHasVoted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "grantVoteAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isVotingActive",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
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
    "name": "status",
    "outputs": [
      {
        "internalType": "enum EncryptedVoting.VotingStatus",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifyVoteAccess",
    "outputs": [
      {
        "internalType": "bool",
        "name": "canAccessYes",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "canAccessNo",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "support",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voteDeadline",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingTopic",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Legacy FHE Counter ABI for backward compatibility (mutable for ethers)
export const FHE_COUNTER_ABI = ENCRYPTED_VOTING_ABI as any[];

export const ETHERSCAN_URL = `https://sepolia.etherscan.io/address/${FHE_COUNTER_ADDRESS}`;
export const ENCRYPTED_VOTING_ETHERSCAN_URL = `https://sepolia.etherscan.io/address/${ENCRYPTED_VOTING_ADDRESS}`;

// Main export for EncryptedVoting contract
export default {
  address: ENCRYPTED_VOTING_ADDRESS,
  abi: ENCRYPTED_VOTING_ABI,
  etherscan: ENCRYPTED_VOTING_ETHERSCAN_URL,
  contractName: "EncryptedVoting"
};

// Legacy export for backward compatibility
export const FHE_COUNTER_CONFIG = {
  address: FHE_COUNTER_ADDRESS,
  abi: FHE_COUNTER_ABI,
  etherscan: ETHERSCAN_URL,
  contractName: "FHECounter (Legacy)"
};