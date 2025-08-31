// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@fhevm/solidity/contracts/FHE.sol";

/**
 * @title FHECounter - Standard FHEVM Counter Contract
 * @dev Simple encrypted counter with increment/decrement operations
 * @notice Compatible with FHEVM React Template structure
 */
contract FHECounter {
    using FHE for euint32;

    // Events
    event CounterIncremented(address indexed user);
    event CounterDecremented(address indexed user);
    
    // State variables
    euint32 private count;
    address public owner;
    
    // Constructor
    constructor() {
        owner = msg.sender;
        count = FHE.asEuint32(0);
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /**
     * @dev Get the encrypted count value
     * @return The encrypted count as euint32
     */
    function getCount() external view returns (bytes32) {
        return FHE.sealoutput(count, msg.sender);
    }

    /**
     * @dev Increment the counter by an encrypted value
     * @param encryptedValue The encrypted value to add
     * @param inputProof The proof for the encrypted input
     */
    function increment(bytes32 encryptedValue, bytes calldata inputProof) external {
        euint32 value = FHE.asEuint32(encryptedValue, inputProof);
        count = count.add(value);
        
        emit CounterIncremented(msg.sender);
    }

    /**
     * @dev Decrement the counter by an encrypted value
     * @param encryptedValue The encrypted value to subtract
     * @param inputProof The proof for the encrypted input
     */
    function decrement(bytes32 encryptedValue, bytes calldata inputProof) external {
        euint32 value = FHE.asEuint32(encryptedValue, inputProof);
        count = count.sub(value);
        
        emit CounterDecremented(msg.sender);
    }

    /**
     * @dev Allow decryption of the counter for authorized addresses
     * @param userAddress The address requesting decryption
     * @return The handle for decryption
     */
    function requestDecryption(address userAddress) external view returns (bytes32) {
        return FHE.sealoutput(count, userAddress);
    }
}