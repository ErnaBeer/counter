// Derive private key from mnemonic
const { generateMnemonic, mnemonicToSeedSync, validateMnemonic } = require('@scure/bip39');
const { wordlist } = require('@scure/bip39/wordlists/english');
const { HDKey } = require('@scure/bip32');
const { ethers } = require('ethers');

async function main() {
    const mnemonic = "cave glad risk huge voyage midnight color correct floor paper sorry midnight";
    
    console.log("🔑 Mnemonic:", mnemonic);
    
    // Validate mnemonic
    if (!validateMnemonic(mnemonic, wordlist)) {
        throw new Error("Invalid mnemonic phrase");
    }
    
    // Convert mnemonic to seed
    const seed = mnemonicToSeedSync(mnemonic);
    console.log("🌱 Seed generated");
    
    // Create HD wallet
    const hdkey = HDKey.fromMasterSeed(seed);
    
    // Derive the first account (m/44'/60'/0'/0/0)
    const derivedKey = hdkey.derive("m/44'/60'/0'/0/0");
    
    if (!derivedKey.privateKey) {
        throw new Error("Failed to derive private key");
    }
    
    const privateKey = "0x" + Buffer.from(derivedKey.privateKey).toString('hex');
    
    // Create wallet to get address
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;
    
    console.log("📍 Derived Address:", address);
    console.log("🔐 Private Key:", privateKey);
    
    // Predicted contract address (nonce 1)
    const predictedContract = ethers.getCreateAddress({
        from: address,
        nonce: 1
    });
    
    console.log("🎯 Predicted Contract Address (nonce=1):", predictedContract);
    
    return { privateKey, address, predictedContract };
}

main().catch(console.error);