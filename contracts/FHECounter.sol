// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@fhevm/solidity/contracts/FHE.sol";

/**
 * @title Quantum Temporal Engine - Advanced FHE Time Counter
 * @dev Secure encrypted temporal counter with quantum chronomorphic operations and spacetime validation
 * @notice This contract provides time-secured counting operations with temporal dimension access control
 * @author Chrono Labs
 */
contract TemporalFHECounter {
    using FHE for euint32;

    // ============= TEMPORAL EVENTS =============
    event ChronoStreamAccelerated(address indexed timekeeper, uint256 timestamp);
    event ChronoStreamReversed(address indexed timekeeper, uint256 timestamp);
    event TemporalVortexReset(address indexed chronomaster, uint256 timestamp);
    event QuantumDecryptionRequested(address indexed requester, uint256 requestId);
    event QuantumDecryptionFulfilled(uint256 indexed requestID);
    event ChronoPhaseShifted(CounterStatus newPhase);

    // ============= TEMPORAL ERRORS =============
    error ChronalUnauthorized();
    error TemporalFieldLocked();
    error InvalidChronoOperation();
    error QuantumDecryptionInProgress();

    // ============= CHRONO STATES =============
    enum CounterStatus { 
        ACTIVE,           // Temporal field active
        PAUSED,           // Time stream paused
        DECRYPTING,       // Quantum revelation in progress
        MAINTENANCE       // Chrono maintenance mode
    }

    // ============= SPACETIME VARIABLES =============
    address public chronomaster;
    string public constant COUNTER_NAME = "Quantum Temporal Counter";
    
    // Encrypted temporal state
    euint32 private encryptedChronoCount;
    uint32 public decryptedTemporalValue;
    bool public isChronoDecrypted;
    
    // Time stream management
    CounterStatus public temporalStatus;
    uint256 public totalChronoOperations;
    uint256 public temporalOrigin;
    uint256 public lastChronoEvent;
    
    // Quantum decryption management
    uint256 private quantumDecryptionRequestId;
    bool private quantumDecryptionInProgress;
    
    // Temporal configuration
    mapping(address => bool) public authorizedTimekeepers;
    mapping(address => uint256) public timekeeperOperations;

    // ============= TEMPORAL MODIFIERS =============
    modifier onlyChronmaster() {
        if (msg.sender != chronomaster) revert ChronalUnauthorized();
        _;
    }

    modifier onlyAuthorizedTimekeeper() {
        if (msg.sender != chronomaster && !authorizedTimekeepers[msg.sender]) {
            revert ChronalUnauthorized();
        }
        _;
    }

    modifier whenTemporalActive() {
        if (temporalStatus != CounterStatus.ACTIVE) revert TemporalFieldLocked();
        _;
    }

    modifier whenNotDecryptingQuantum() {
        if (quantumDecryptionInProgress) revert QuantumDecryptionInProgress();
        _;
    }

    // ============= TEMPORAL CONSTRUCTOR =============
    constructor() {
        chronomaster = msg.sender;
        encryptedChronoCount = FHE.asEuint32(0);
        decryptedTemporalValue = 0;
        isChronoDecrypted = true;
        temporalStatus = CounterStatus.ACTIVE;
        temporalOrigin = block.timestamp;
        lastChronoEvent = block.timestamp;
        
        // Auto-authorize chronomaster
        authorizedTimekeepers[chronomaster] = true;
    }

    // ============= CHRONO OPERATIONS =============
    
    /**
     * @dev Accelerate the encrypted chrono stream by a temporal value
     * @param inputEuint32 The encrypted value to add to the temporal counter
     * @param inputProof The quantum proof for the encrypted input
     */
    function accelerateTimestream(bytes32 inputEuint32, bytes calldata inputProof) 
        external 
        onlyAuthorizedTimekeeper 
        whenTemporalActive 
        whenNotDecryptingQuantum 
    {
        euint32 value = FHE.asEuint32(inputEuint32, inputProof);
        encryptedChronoCount = encryptedChronoCount.add(value);
        
        _updateChronoStats();
        emit ChronoStreamAccelerated(msg.sender, block.timestamp);
    }

    /**
     * @dev Reverse the encrypted chrono stream by a temporal value
     * @param inputEuint32 The encrypted value to subtract from the temporal counter
     * @param inputProof The quantum proof for the encrypted input
     */
    function reverseTimestream(bytes32 inputEuint32, bytes calldata inputProof) 
        external 
        onlyAuthorizedTimekeeper 
        whenTemporalActive 
        whenNotDecryptingQuantum 
    {
        euint32 value = FHE.asEuint32(inputEuint32, inputProof);
        encryptedChronoCount = encryptedChronoCount.sub(value);
        
        _updateChronoStats();
        emit ChronoStreamReversed(msg.sender, block.timestamp);
    }

    // ============= QUANTUM DECRYPTION MANAGEMENT =============
    
    /**
     * @dev Request quantum revelation of the current temporal value
     */
    function requestChronoDecryption() external onlyAuthorizedTimekeeper whenNotDecryptingQuantum {
        quantumDecryptionInProgress = true;
        temporalStatus = CounterStatus.DECRYPTING;
        
        quantumDecryptionRequestId = FHE.decrypt(encryptedChronoCount);
        
        emit QuantumDecryptionRequested(msg.sender, quantumDecryptionRequestId);
        emit ChronoPhaseShifted(CounterStatus.DECRYPTING);
    }

    /**
     * @dev Callback function for quantum decryption fulfillment
     * @param requestId The temporal request identifier
     * @param temporalValue The revealed quantum chrono value
     * @param signatures The spacetime signatures for verification
     */
    function callbackDecryptChrono(
        uint256 requestId,
        uint32 temporalValue,
        bytes[] calldata signatures
    ) external {
        if (requestId == quantumDecryptionRequestId) {
            decryptedTemporalValue = temporalValue;
            isChronoDecrypted = true;
            quantumDecryptionInProgress = false;
            temporalStatus = CounterStatus.ACTIVE;
            
            emit QuantumDecryptionFulfilled(requestId);
            emit ChronoPhaseShifted(CounterStatus.ACTIVE);
        }
    }

    // ============= CHRONOMASTER FUNCTIONS =============
    
    /**
     * @dev Authorize a new temporal timekeeper
     * @param timekeeper The address to grant chrono access to
     */
    function authorizeTimekeeper(address timekeeper) external onlyChronmaster {
        authorizedTimekeepers[timekeeper] = true;
    }

    /**
     * @dev Revoke temporal access from a timekeeper
     * @param timekeeper The address to revoke chrono access from
     */
    function revokeTimekeeper(address timekeeper) external onlyChronmaster {
        if (timekeeper != chronomaster) {
            authorizedTimekeepers[timekeeper] = false;
        }
    }

    /**
     * @dev Set the temporal phase status
     * @param newStatus The new chrono phase to enter
     */
    function setTemporalStatus(CounterStatus newStatus) external onlyChronmaster {
        temporalStatus = newStatus;
        emit ChronoPhaseShifted(newStatus);
    }

    /**
     * @dev Emergency pause the temporal counter
     */
    function pauseTemporalField() external onlyChronmaster {
        temporalStatus = CounterStatus.PAUSED;
        emit ChronoPhaseShifted(CounterStatus.PAUSED);
    }

    /**
     * @dev Resume temporal counter operations
     */
    function resumeTemporalField() external onlyChronmaster {
        temporalStatus = CounterStatus.ACTIVE;
        emit ChronoPhaseShifted(CounterStatus.ACTIVE);
    }

    // ============= TEMPORAL VIEW FUNCTIONS =============
    
    /**
     * @dev Get the encrypted quantum chrono value
     */
    function getChronoCount() external view onlyAuthorizedTimekeeper returns (euint32) {
        return encryptedChronoCount;
    }

    /**
     * @dev Get the decrypted temporal count value
     */
    function getDecryptedTemporalValue() external view returns (uint32) {
        return decryptedTemporalValue;
    }

    /**
     * @dev Get the current temporal phase status
     */
    function getTemporalStatus() external view returns (CounterStatus) {
        return temporalStatus;
    }

    /**
     * @dev Check if the chrono has been revealed through quantum decryption
     */
    function isChronoRevealed() external view returns (bool) {
        return isChronoDecrypted;
    }

    /**
     * @dev Get comprehensive temporal counter statistics
     */
    function getTemporalStats() external view returns (
        string memory name,
        CounterStatus currentStatus,
        uint256 totalOps,
        uint256 creation,
        uint256 lastOp,
        bool decrypted,
        uint32 revealedValue
    ) {
        return (
            COUNTER_NAME,
            temporalStatus,
            totalChronoOperations,
            temporalOrigin,
            lastChronoEvent,
            isChronoDecrypted,
            decryptedTemporalValue
        );
    }

    /**
     * @dev Get temporal system computational limits
     */
    function getQuantumComputeInfo() external pure returns (
        uint256 sequentialLimit,
        uint256 globalLimit,
        uint256 accelerateCost,
        uint256 reverseCost
    ) {
        return (
            1000,  // Sequential chrono limit
            10000, // Global quantum limit  
            65,    // Acceleration cost in gas
            65     // Reversal cost in gas
        );
    }

    /**
     * @dev Check if timekeeper has temporal authorization
     * @param timekeeper The address to check chrono access for
     */
    function isTimekeeperAuthorized(address timekeeper) external view returns (bool) {
        return timekeeper == chronomaster || authorizedTimekeepers[timekeeper];
    }

    // ============= INTERNAL TEMPORAL FUNCTIONS =============
    
    /**
     * @dev Update operation statistics for chrono tracking
     */
    function _updateChronoStats() internal {
        totalChronoOperations++;
        timekeeperOperations[msg.sender]++;
        lastChronoEvent = block.timestamp;
        isChronoDecrypted = false; // Mark as needing new quantum revelation
    }
}