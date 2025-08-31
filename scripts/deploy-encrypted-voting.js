// Deploy EncryptedVoting contract to Sepolia with maximum gas optimization
// Uses the provided mnemonic for deployment

import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying EncryptedVoting contract to Sepolia...");
    
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    // Get account balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    // Contract parameters
    const votingTopic = "Should we implement Zama FHE in more DApps?";
    const durationInHours = 24; // 24 hour voting period
    
    console.log("📊 Voting Topic:", votingTopic);
    console.log("⏰ Duration:", durationInHours, "hours");
    
    // Get the ContractFactory
    const EncryptedVoting = await ethers.getContractFactory("EncryptedVoting");
    
    // Deploy with gas optimization (EIP-1559)
    console.log("⚡ Deploying with maximum gas optimization...");
    
    // Get current network gas info
    const feeData = await deployer.provider.getFeeData();
    console.log("🔥 Current gas info:", {
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "N/A",
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") + " gwei" : "N/A",
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") + " gwei" : "N/A"
    });
    
    // Deploy with optimized gas settings (15-20% discount)
    const deploymentOptions = {
        // Use EIP-1559 for better gas optimization
        maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas * 85n / 100n : undefined, // 15% discount
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas * 80n / 100n : undefined, // 20% discount
        gasLimit: 3000000 // Set a reasonable gas limit for FHEVM contract
    };
    
    console.log("⚡ Optimized gas settings:", {
        maxFeePerGas: deploymentOptions.maxFeePerGas ? ethers.formatUnits(deploymentOptions.maxFeePerGas, "gwei") + " gwei" : "N/A",
        maxPriorityFeePerGas: deploymentOptions.maxPriorityFeePerGas ? ethers.formatUnits(deploymentOptions.maxPriorityFeePerGas, "gwei") + " gwei" : "N/A",
        gasLimit: deploymentOptions.gasLimit.toLocaleString()
    });
    
    const contract = await EncryptedVoting.deploy(
        votingTopic, 
        durationInHours,
        deploymentOptions
    );
    
    console.log("⏳ Waiting for deployment transaction...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("✅ EncryptedVoting deployed to:", contractAddress);
    
    // Get deployment transaction details
    const deployTx = contract.deploymentTransaction();
    if (deployTx) {
        const receipt = await deployTx.wait();
        const gasUsed = receipt.gasUsed;
        const effectiveGasPrice = receipt.effectiveGasPrice || receipt.gasPrice;
        const totalCost = gasUsed * effectiveGasPrice;
        
        console.log("📊 Deployment Statistics:");
        console.log("  • Transaction Hash:", deployTx.hash);
        console.log("  • Block Number:", receipt.blockNumber);
        console.log("  • Gas Used:", gasUsed.toLocaleString());
        console.log("  • Effective Gas Price:", ethers.formatUnits(effectiveGasPrice, "gwei"), "gwei");
        console.log("  • Total Cost:", ethers.formatEther(totalCost), "ETH");
        console.log("  • Contract Address:", contractAddress);
    }
    
    // Verify contract is deployed properly
    console.log("🔍 Verifying deployment...");
    try {
        const deployedVotingTopic = await contract.votingTopic();
        const deployedDeadline = await contract.voteDeadline();
        const deployedOwner = await contract.owner();
        const contractStatus = await contract.status();
        
        console.log("✅ Contract verification successful:");
        console.log("  • Topic:", deployedVotingTopic);
        console.log("  • Owner:", deployedOwner);
        console.log("  • Deadline:", new Date(Number(deployedDeadline) * 1000).toLocaleString());
        console.log("  • Status:", contractStatus === 0n ? "Open" : contractStatus === 1n ? "DecryptionInProgress" : "ResultsDecrypted");
        
        // Get HCU information
        const hcuInfo = await contract.getHCUInfo();
        console.log("⚡ FHEVM HCU Information:");
        console.log("  • Sequential Limit:", hcuInfo[0].toLocaleString(), "HCU");
        console.log("  • Global Limit:", hcuInfo[1].toLocaleString(), "HCU");
        console.log("  • Voting Cost:", hcuInfo[2].toLocaleString(), "HCU");
        console.log("  • Decryption Cost:", hcuInfo[3].toLocaleString(), "HCU");
        
    } catch (error) {
        console.error("❌ Contract verification failed:", error.message);
    }
    
    console.log("🎉 Deployment completed successfully!");
    console.log("🔗 Etherscan URL: https://sepolia.etherscan.io/address/" + contractAddress);
    console.log("📋 Contract Address for frontend update:", contractAddress);
    
    return contractAddress;
}

main()
    .then((contractAddress) => {
        console.log("\n🎯 DEPLOYMENT SUMMARY:");
        console.log("  Contract Address:", contractAddress);
        console.log("  Network: Sepolia Testnet");
        console.log("  Topic: Should we implement Zama FHE in more DApps?");
        console.log("  Duration: 24 hours");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });