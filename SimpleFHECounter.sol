// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.28;

import "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title SimpleFHECounter
 * @notice A simple FHE counter contract compatible with Zama's official template
 * @dev Uses FHEVM 0.7.0 with encrypted counter operations
 */
contract SimpleFHECounter is SepoliaConfig {
    // Events
    event Incremented(address indexed sender);
    event Decremented(address indexed sender);
    
    // State variables
    euint32 private counter;
    address public owner;
    
    // Constructor
    constructor() {
        owner = msg.sender;
        counter = FHE.asEuint32(0); // Initialize with encrypted zero
    }
    
    // Modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    /**
     * @notice Increment the encrypted counter
     * @param inputEuint32 Encrypted input value
     * @param inputProof ZK proof for the encrypted input
     */
    function increment(
        bytes32 inputEuint32, 
        bytes calldata inputProof
    ) external {
        euint32 value = FHE.asEuint32(inputEuint32, inputProof);
        counter = FHE.add(counter, value);
        emit Incremented(msg.sender);
    }
    
    /**
     * @notice Decrement the encrypted counter
     * @param inputEuint32 Encrypted input value
     * @param inputProof ZK proof for the encrypted input
     */
    function decrement(
        bytes32 inputEuint32, 
        bytes calldata inputProof
    ) external {
        euint32 value = FHE.asEuint32(inputEuint32, inputProof);
        counter = FHE.sub(counter, value);
        emit Decremented(msg.sender);
    }
    
    /**
     * @notice Get the encrypted counter value
     * @dev Returns the encrypted counter that can be used in other operations
     * @return The encrypted counter value
     */
    function getCount() external view returns (euint32) {
        return counter;
    }
}