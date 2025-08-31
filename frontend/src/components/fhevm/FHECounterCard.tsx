import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useFHEVMContext } from '../../providers/FHEVMProvider';
import './FHECounterCard.css';

// ⏰ Temporal Quantum Warp Animations for FHE
const temporalStream = keyframes`
  0% { transform: translateX(-100vw) rotateZ(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateX(100vw) rotateZ(360deg); opacity: 0; }
`;

const quantumBlink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const chronoGlow = keyframes`
  0% { text-shadow: 0 0 5px #9d4edd; }
  50% { text-shadow: 0 0 20px #9d4edd, 0 0 30px #c77dff; }
  100% { text-shadow: 0 0 5px #9d4edd; }
`;

const temporalFlicker = keyframes`
  0%, 100% { opacity: 1; filter: hue-rotate(0deg); }
  50% { opacity: 0.8; filter: hue-rotate(45deg); }
`;

// ⏰ Temporal Quantum FHE Container
const TemporalFHEContainer = styled.div`
  background: linear-gradient(135deg, #0f0518, #1a0b2e);
  border: 2px solid #9d4edd;
  padding: 30px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  color: #c77dff;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 3px,
        rgba(157, 78, 221, 0.03) 3px,
        rgba(157, 78, 221, 0.03) 6px
      );
    pointer-events: none;
    z-index: 1;
  }
  
  &::after {
    content: '⏰⚡🌀⏳🔮⭐💫';
    position: absolute;
    top: 50%;
    left: -10%;
    font-size: 12px;
    color: rgba(157, 78, 221, 0.1);
    animation: ${temporalStream} 15s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
`;

const TemporalHeader = styled.div`
  margin-bottom: 25px;
  text-align: center;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '⏰ TEMPORAL_QUANTUM_COUNTER_PORTAL';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    font-size: 10px;
    color: rgba(157, 78, 221, 0.7);
    font-family: 'Orbitron', sans-serif;
  }
`;

const TemporalTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  color: #c77dff;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 3px;
  animation: ${chronoGlow} 2s ease-in-out infinite;
  
  &::after {
    content: '⏰';
    animation: ${quantumBlink} 1.5s infinite;
    margin-left: 8px;
  }
`;

const TemporalSubtitle = styled.p`
  margin: 0;
  color: rgba(199, 125, 255, 0.8);
  font-size: 0.9rem;
  font-family: 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const QuantumDisplay = styled.div`
  background: linear-gradient(135deg, #1a0b2e, #2d1b69);
  padding: 25px;
  border: 1px solid #9d4edd;
  margin-bottom: 25px;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '⏰[QUANTUM_CHRONO_DATA]';
    position: absolute;
    top: -1px;
    left: 10px;
    background: linear-gradient(135deg, #0f0518, #1a0b2e);
    padding: 0 5px;
    font-size: 10px;
    color: #c77dff;
    font-family: 'Orbitron', sans-serif;
  }
`;

const QuantumLabel = styled.div`
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 15px;
  text-align: center;
  color: #c77dff;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 2px;
`;

const QuantumValue = styled.div`
  text-align: center;
  font-weight: 700;
  word-break: break-all;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(157, 78, 221, 0.4);
  padding: 15px;
`;

const QuantumHash = styled.code`
  background: linear-gradient(135deg, #0f0518, #2d1b69);
  color: #c77dff;
  padding: 10px;
  font-size: 0.85rem;
  border: 1px solid #9d4edd;
  font-family: 'Orbitron', monospace;
  animation: ${temporalFlicker} 2.5s ease-in-out infinite;
`;

const QuantumPlaceholder = styled.span`
  color: #ff6b6b;
  font-weight: 700;
  font-size: 1.1rem;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  animation: ${quantumBlink} 2s infinite;
`;

const ControlsSection = styled.div`
  margin-bottom: 25px;
  position: relative;
  z-index: 2;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const QuantumInputLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #c77dff;
  font-size: 0.9rem;
  font-family: 'Rajdhani', sans-serif;
  letter-spacing: 1px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 10px;
`;

const TemporalInput = styled.input`
  flex: 1;
  padding: 15px;
  background: linear-gradient(135deg, #0f0518, #1a0b2e);
  color: #c77dff;
  border: 2px solid #9d4edd;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  
  &::placeholder {
    color: rgba(199, 125, 255, 0.6);
    font-weight: 700;
    text-transform: uppercase;
  }
  
  &:focus {
    outline: none;
    background: linear-gradient(135deg, #1a0b2e, #2d1b69);
    box-shadow: 0 0 15px #9d4edd;
  }
  
  &:disabled {
    background: rgba(15, 5, 24, 0.5);
    color: rgba(199, 125, 255, 0.4);
    border-color: rgba(157, 78, 221, 0.3);
  }
`;

const TemporalButton = styled.button<{ variant: 'refresh' | 'accelerate' | 'reverse' }>`
  padding: 15px 20px;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  border: 2px solid #9d4edd;
  transition: all 0.3s ease;
  position: relative;
  
  ${props => {
    switch (props.variant) {
      case 'refresh':
        return `
          background: linear-gradient(135deg, #0f0518, #1a0b2e);
          color: #c77dff;
          min-width: 80px;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #9d4edd, #c77dff);
            color: #0f0518;
            box-shadow: 0 0 20px #9d4edd;
          }
        `;
      case 'accelerate':
        return `
          background: linear-gradient(135deg, #0f0518, #1a0b2e);
          color: #c77dff;
          flex: 1;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #9d4edd, #c77dff);
            color: #0f0518;
            box-shadow: 0 0 20px #9d4edd;
          }
          
          &::before {
            content: '⏩[ACCEL]';
            position: absolute;
            top: -15px;
            left: 5px;
            font-size: 8px;
            color: #c77dff;
          }
        `;
      case 'reverse':
        return `
          background: linear-gradient(135deg, #0f0518, #1a0b2e);
          color: #ff6b6b;
          border-color: #ff6b6b;
          flex: 1;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            color: #0f0518;
            box-shadow: 0 0 20px #ff6b6b;
          }
          
          &::before {
            content: '⏪[REV]';
            position: absolute;
            top: -15px;
            left: 5px;
            font-size: 8px;
            color: #ff6b6b;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    &:hover {
      background: linear-gradient(135deg, #0f0518, #1a0b2e) !important;
      color: ${props => props.variant === 'reverse' ? '#ff6b6b' : '#c77dff'} !important;
      box-shadow: none !important;
    }
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const QuantumInfoSection = styled.div`
  background: linear-gradient(135deg, #1a0b2e, #2d1b69);
  padding: 20px;
  border: 1px solid #9d4edd;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '⏰[TEMPORAL_SYSTEM_INFO]';
    position: absolute;
    top: -1px;
    left: 10px;
    background: linear-gradient(135deg, #0f0518, #1a0b2e);
    padding: 0 5px;
    font-size: 10px;
    color: #c77dff;
    font-family: 'Orbitron', sans-serif;
  }
`;

const TemporalStatusIndicator = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  background: linear-gradient(135deg, #0f0518, #1a0b2e);
  border: 1px solid #9d4edd;
  font-weight: 700;
  text-transform: uppercase;
  font-family: 'Orbitron', sans-serif;
  color: #c77dff;
  text-align: center;
`;

const AddressInfo = styled.div`
  margin-bottom: 15px;
`;

const AddressItem = styled.div`
  margin-bottom: 8px;
  font-size: 0.8rem;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  
  &::before {
    content: '> ';
    color: #00ff41;
  }
`;

const AddressLabel = styled.span`
  font-weight: 700;
  text-transform: uppercase;
  margin-right: 8px;
  color: #00ff41;
`;

const TemporalAddressValue = styled.code`
  background: linear-gradient(135deg, #0f0518, #1a0b2e);
  color: #c77dff;
  padding: 2px 4px;
  font-family: 'Orbitron', monospace;
  border: 1px solid rgba(157, 78, 221, 0.4);
`;

const QuantumDescription = styled.div`
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  line-height: 1.4;
  font-family: 'Rajdhani', sans-serif;
  color: #c77dff;
  text-align: center;
`;

const QuantumSpinner = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #9d4edd;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: quantumSpin 1.2s linear infinite;
  margin-right: 8px;
  
  @keyframes quantumSpin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }
`;

const FHECounterCard: React.FC = () => {
  const {
    isReady,
    isLoading,
    networkSupported,
    encryptedCount,
    inputValue,
    setInputValue,
    performEncryptAdd,
    performEncryptSub,
    refreshState,
    fhevmClient,
    sdkStatus
  } = useFHEVMContext();

  const handleAddClick = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value <= 0) {
      return;
    }
    await performEncryptAdd(value);
  };

  const handleSubClick = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value <= 0) {
      return;
    }
    await performEncryptSub(value);
  };

  return (
    <TemporalFHEContainer className="fhe-counter-card">
      <TemporalHeader>
        <TemporalTitle>⏰ QUANTUM TEMPORAL WARP</TemporalTitle>
        <TemporalSubtitle>
          EXECUTE ENCRYPTED CHRONOMORPHIC COMPUTATIONS ON SPACETIME DATA STREAMS
        </TemporalSubtitle>
      </TemporalHeader>

      <QuantumDisplay>
        <QuantumLabel>⚡ TEMPORAL ENCRYPTED DATA STREAM</QuantumLabel>
        <QuantumValue>
          {encryptedCount ? (
            <QuantumHash>{encryptedCount}</QuantumHash>
          ) : (
            <QuantumPlaceholder>⏳ TIME CIRCUITS DORMANT ⏰</QuantumPlaceholder>
          )}
        </QuantumValue>
      </QuantumDisplay>

      <ControlsSection>
        <InputGroup>
          <QuantumInputLabel>⏰ TEMPORAL VALUE INPUT</QuantumInputLabel>
          <InputRow>
            <TemporalInput
              type="number"
              placeholder="ENTER CHRONO DATA..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading || !isReady}
              min="1"
            />
            <TemporalButton
              variant="refresh"
              onClick={refreshState}
              disabled={isLoading || !isReady}
              title="REFRESH TEMPORAL STATE"
            >
              ⚡ SYNC
            </TemporalButton>
          </InputRow>
        </InputGroup>

        <ButtonGrid>
          <TemporalButton
            variant="accelerate"
            onClick={handleAddClick}
            disabled={isLoading || !inputValue || !isReady || isNaN(parseInt(inputValue)) || parseInt(inputValue) <= 0}
          >
            {isLoading ? (
              <>
                <QuantumSpinner />
                PROCESSING...
              </>
            ) : (
              <>
                ⏩ ACCELERATE TIMESTREAM
              </>
            )}
          </TemporalButton>

          <TemporalButton
            variant="reverse"
            onClick={handleSubClick}
            disabled={isLoading || !inputValue || !isReady || isNaN(parseInt(inputValue)) || parseInt(inputValue) <= 0}
          >
            {isLoading ? (
              <>
                <QuantumSpinner />
                PROCESSING...
              </>
            ) : (
              <>
                ⏪ REVERSE TIMESTREAM
              </>
            )}
          </TemporalButton>
        </ButtonGrid>
      </ControlsSection>

      <QuantumInfoSection>
        <TemporalStatusIndicator>
          {networkSupported ? (
            sdkStatus === 'ready' ? (
              '⏰ TEMPORAL STATUS: QUANTUM CHRONOMORPHIC FIELDS ACTIVE'
            ) : (
              `⏳ TEMPORAL STATUS: ${sdkStatus.toUpperCase()}`
            )
          ) : (
            '❌ TEMPORAL STATUS: UNSUPPORTED QUANTUM FIELD'
          )}
        </TemporalStatusIndicator>
        
        <AddressInfo>
          <AddressItem>
            <AddressLabel>NETWORK:</AddressLabel>
            <TemporalAddressValue>
              {networkSupported ? 'SEPOLIA/HARDHAT' : 'UNSUPPORTED'}
            </TemporalAddressValue>
          </AddressItem>
          <AddressItem>
            <AddressLabel>SDK STATUS:</AddressLabel>
            <TemporalAddressValue>{sdkStatus}</TemporalAddressValue>
          </AddressItem>
          <AddressItem>
            <AddressLabel>CLIENT:</AddressLabel>
            <TemporalAddressValue>
              {fhevmClient ? 'ACTIVE' : 'INACTIVE'}
            </TemporalAddressValue>
          </AddressItem>
        </AddressInfo>
        
        <QuantumDescription>
          {networkSupported ? (
            'ALL TEMPORAL COMPUTATIONS EXECUTE ON ENCRYPTED SPACETIME STREAMS. ' +
            'CHRONOMORPHIC PATTERNS REMAIN PERMANENTLY SECURED DURING QUANTUM HOMOMORPHIC OPERATIONS.'
          ) : (
            'PLEASE SWITCH TO SEPOLIA TESTNET (CHAIN ID: 11155111) OR LOCAL HARDHAT (31337) ' +
            'TO ACCESS QUANTUM TEMPORAL COMPUTATION CAPABILITIES.'
          )}
        </QuantumDescription>
      </QuantumInfoSection>
    </TemporalFHEContainer>
  );
};

export default FHECounterCard;