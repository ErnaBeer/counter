import { ethers } from 'ethers';
import { GenericStringStorage } from './GenericStringStorage';
import { FhevmInstance } from './fhevm-hooks';

export class FhevmDecryptionSignature {
  constructor(
    public readonly privateKey: string,
    public readonly publicKey: string,
    public readonly signature: string,
    public readonly contractAddresses: string[],
    public readonly userAddress: string,
    public readonly startTimestamp: number,
    public readonly durationDays: number
  ) {}

  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    signer: ethers.JsonRpcSigner,
    storage: GenericStringStorage
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const userAddress = await signer.getAddress();
      const storageKey = `fhevm_sig_${userAddress}_${contractAddresses.join(',')}`;
      
      // Try to load from storage first
      const stored = await storage.get(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Check if signature is still valid (not expired)
          const now = Math.floor(Date.now() / 1000);
          const expirationTime = parsed.startTimestamp + (parsed.durationDays * 24 * 60 * 60);
          
          if (now < expirationTime) {
            return new FhevmDecryptionSignature(
              parsed.privateKey,
              parsed.publicKey,
              parsed.signature,
              parsed.contractAddresses,
              parsed.userAddress,
              parsed.startTimestamp,
              parsed.durationDays
            );
          }
        } catch (e) {
          console.warn('Failed to parse stored signature, creating new one');
        }
      }

      // Create new signature
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 30; // 30 days validity
      
      // Generate mock signature data for now
      // In real implementation, this would use the FHEVM instance
      const mockPrivateKey = ethers.id(`private_${userAddress}_${startTimestamp}`);
      const mockPublicKey = ethers.id(`public_${userAddress}_${startTimestamp}`);
      
      const message = ethers.solidityPackedKeccak256(
        ['string', 'address', 'uint256', 'uint256'],
        ['FHEVM_DECRYPT', userAddress, startTimestamp, durationDays]
      );
      
      const signature = await signer.signMessage(ethers.getBytes(message));
      
      const newSig = new FhevmDecryptionSignature(
        mockPrivateKey,
        mockPublicKey,
        signature,
        contractAddresses,
        userAddress,
        startTimestamp,
        durationDays
      );

      // Store for future use
      await storage.set(storageKey, JSON.stringify({
        privateKey: newSig.privateKey,
        publicKey: newSig.publicKey,
        signature: newSig.signature,
        contractAddresses: newSig.contractAddresses,
        userAddress: newSig.userAddress,
        startTimestamp: newSig.startTimestamp,
        durationDays: newSig.durationDays
      }));

      return newSig;
    } catch (error) {
      console.error('Failed to create FHEVM decryption signature:', error);
      return null;
    }
  }
}