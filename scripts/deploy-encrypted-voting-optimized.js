// Gas-Optimized EncryptedVoting Deployment Script
// Using mnemonic: "cave glad risk huge voyage midnight color correct floor paper sorry midnight"
// Deploy to Sepolia with maximum gas efficiency

const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Starting Gas-Optimized EncryptedVoting Deployment");
    console.log("=".repeat(60));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying from address:", deployer.address);

    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

    if (balance < ethers.parseEther("0.005")) {
        throw new Error("❌ Insufficient balance. Need at least 0.005 ETH for gas-optimized deployment");
    }

    // Calculate predicted addresses for reference
    const nonce = await deployer.provider.getTransactionCount(deployer.address);
    const predictedAddresses = {
        current: ethers.getCreateAddress({ from: deployer.address, nonce }),
        next: ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 1 })
    };
    
    console.log("🔮 Predicted contract addresses:");
    console.log("   Current nonce (" + nonce + "):", predictedAddresses.current);
    console.log("   Next nonce (" + (nonce + 1) + "):", predictedAddresses.next);

    // Get current gas conditions for optimization
    console.log("⛽ Analyzing current gas conditions...");
    const feeData = await deployer.provider.getFeeData();
    
    console.log("📊 Current gas prices:");
    console.log("   Gas Price:", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "N/A");
    console.log("   Max Fee:", feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") + " gwei" : "N/A");
    console.log("   Priority Fee:", feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") + " gwei" : "N/A");

    // Deployment parameters - optimized for minimal gas usage
    const TOPIC = "Should we implement Zama FHE in more DApps?";
    const DURATION_HOURS = 24; // 24-hour voting period

    console.log("📝 Deployment parameters:");
    console.log("   Topic:", TOPIC);
    console.log("   Duration:", DURATION_HOURS, "hours");

    try {
        // Get contract factory
        console.log("🔧 Preparing contract factory...");
        const EncryptedVoting = await ethers.getContractFactory("EncryptedVoting");

        // Estimate gas for deployment
        console.log("📏 Estimating deployment gas...");
        const deployTx = await EncryptedVoting.getDeployTransaction(TOPIC, DURATION_HOURS);
        const gasEstimate = await deployer.provider.estimateGas(deployTx);
        
        console.log("📊 Gas estimation:", gasEstimate.toString());

        // Calculate optimized gas settings
        let gasSettings = {};
        
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            // EIP-1559 with 15% discount for efficiency
            gasSettings = {
                gasLimit: gasEstimate * BigInt(120) / BigInt(100), // 20% buffer
                maxFeePerGas: feeData.maxFeePerGas * BigInt(85) / BigInt(100), // 15% discount
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * BigInt(85) / BigInt(100), // 15% discount
                type: 2
            };
            console.log("⚡ Using EIP-1559 with 15% gas discount");
        } else if (feeData.gasPrice) {
            // Legacy pricing with 20% discount
            gasSettings = {
                gasLimit: gasEstimate * BigInt(120) / BigInt(100), // 20% buffer
                gasPrice: feeData.gasPrice * BigInt(80) / BigInt(100), // 20% discount
                type: 0
            };
            console.log("⚡ Using legacy gas pricing with 20% discount");
        } else {
            // Conservative fallback
            gasSettings = {
                gasLimit: gasEstimate * BigInt(150) / BigInt(100), // 50% buffer
                gasPrice: ethers.parseUnits("8", "gwei"), // 8 gwei conservative
                type: 0
            };
            console.log("⚡ Using conservative fallback gas settings");
        }

        // Calculate estimated cost
        const estimatedCost = gasSettings.maxFeePerGas 
            ? gasSettings.gasLimit * gasSettings.maxFeePerGas
            : gasSettings.gasLimit * gasSettings.gasPrice;
        
        console.log("💸 Estimated deployment cost:", ethers.formatEther(estimatedCost), "ETH");

        // Deploy contract with optimized settings
        console.log("🚀 Deploying EncryptedVoting contract...");
        console.log("⚡ Gas Settings:", {
            gasLimit: gasSettings.gasLimit.toString(),
            maxFeePerGas: gasSettings.maxFeePerGas ? ethers.formatUnits(gasSettings.maxFeePerGas, "gwei") + " gwei" : "N/A",
            maxPriorityFeePerGas: gasSettings.maxPriorityFeePerGas ? ethers.formatUnits(gasSettings.maxPriorityFeePerGas, "gwei") + " gwei" : "N/A",
            gasPrice: gasSettings.gasPrice ? ethers.formatUnits(gasSettings.gasPrice, "gwei") + " gwei" : "N/A"
        });

        const contract = await EncryptedVoting.deploy(TOPIC, DURATION_HOURS, gasSettings);
        
        console.log("📝 Transaction hash:", contract.deploymentTransaction().hash);
        console.log("⏳ Waiting for deployment confirmation...");

        // Wait for deployment
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        console.log("✅ EncryptedVoting deployed successfully!");
        console.log("📍 Contract address:", contractAddress);
        console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

        // Get deployment receipt for gas analysis
        const receipt = await contract.deploymentTransaction().wait();
        const actualGasUsed = receipt.gasUsed;
        const actualCost = receipt.gasUsed * receipt.gasPrice;

        console.log("📊 Deployment statistics:");
        console.log("   Gas used:", actualGasUsed.toString());
        console.log("   Gas price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
        console.log("   Actual cost:", ethers.formatEther(actualCost), "ETH");
        console.log("   Block number:", receipt.blockNumber);

        // Verify deployment by calling functions
        console.log("🔍 Verifying deployment...");
        try {
            const [topic, deadline, status, hasVoted] = await contract.getVotingInfo();
            const isActive = await contract.isVotingActive();
            const timeLeft = await contract.getTimeLeft();
            const hcuInfo = await contract.getHCUInfo();

            console.log("✅ Contract verification successful:");
            console.log("   Topic:", topic);
            console.log("   Deadline:", new Date(Number(deadline) * 1000).toLocaleString());
            console.log("   Status:", status);
            console.log("   Is active:", isActive);
            console.log("   Time left:", Math.floor(Number(timeLeft) / 3600), "hours");
            console.log("   HCU limits:");
            console.log("     Sequential:", hcuInfo[0].toString());
            console.log("     Global:", hcuInfo[1].toString());
            console.log("     Voting cost:", hcuInfo[2].toString());
            console.log("     Decryption cost:", hcuInfo[3].toString());

        } catch (error) {
            console.warn("⚠️ Contract verification failed:", error.message);
        }

        // Save deployment information
        const deploymentInfo = {
            network: "sepolia",
            chainId: 11155111,
            contractAddress: contractAddress,
            transactionHash: contract.deploymentTransaction().hash,
            blockNumber: receipt.blockNumber,
            deployerAddress: deployer.address,
            gasUsed: actualGasUsed.toString(),
            gasPrice: receipt.gasPrice.toString(),
            actualCost: ethers.formatEther(actualCost),
            topic: TOPIC,
            durationHours: DURATION_HOURS,
            deployedAt: new Date().toISOString(),
            etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`
        };

        // Write to file for updating configurations
        fs.writeFileSync(
            path.join(__dirname, '../deployment-result.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("📄 Deployment info saved to deployment-result.json");
        console.log("🎉 Deployment completed successfully!");
        
        return {
            address: contractAddress,
            txHash: contract.deploymentTransaction().hash,
            gasUsed: actualGasUsed.toString(),
            cost: ethers.formatEther(actualCost)
        };

    } catch (error) {
        console.error("💥 Deployment failed:", error);
        throw error;
    }
}

// Handle both direct execution and module usage
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("💥 Script failed:", error);
            process.exit(1);
        });
}

module.exports = main;