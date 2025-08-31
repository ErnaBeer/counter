const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying SimpleFHECounter to Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying from account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.01 ETH");
    process.exit(1);
  }
  
  try {
    // Deploy the contract
    console.log("🔧 Compiling and deploying SimpleFHECounter...");
    const SimpleFHECounter = await ethers.getContractFactory("SimpleFHECounter");
    
    // Deploy with proper gas settings for Sepolia
    const fheCounter = await SimpleFHECounter.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("20", "gwei")
    });
    
    console.log("⏳ Waiting for deployment transaction...");
    await fheCounter.waitForDeployment();
    
    const contractAddress = await fheCounter.getAddress();
    console.log("✅ SimpleFHECounter deployed to:", contractAddress);
    
    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...");
    await fheCounter.deploymentTransaction().wait(3);
    
    // Save contract info
    const contractInfo = {
      address: contractAddress,
      network: "sepolia",
      deploymentTx: fheCounter.deploymentTransaction().hash,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      abi: SimpleFHECounter.interface.format("json")
    };
    
    // Save to deployments directory
    const deploymentsDir = path.join(__dirname, "../deployments/sepolia");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentsDir, "SimpleFHECounter.json"), 
      JSON.stringify(contractInfo, null, 2)
    );
    
    // Generate ABI file for frontend
    const frontendAbiDir = path.join(__dirname, "../frontend/src/contracts");
    if (!fs.existsSync(frontendAbiDir)) {
      fs.mkdirSync(frontendAbiDir, { recursive: true });
    }
    
    const abiContent = `// Auto-generated contract ABI
export const SimpleFHECounterAddress = "${contractAddress}";

export const SimpleFHECounterABI = ${JSON.stringify(SimpleFHECounter.interface.format("json"), null, 2)} as const;

export default {
  address: SimpleFHECounterAddress,
  abi: SimpleFHECounterABI
};
`;
    
    fs.writeFileSync(
      path.join(frontendAbiDir, "SimpleFHECounter.ts"),
      abiContent
    );
    
    console.log("📄 Contract ABI saved to frontend/src/contracts/SimpleFHECounter.ts");
    
    // Display deployment summary
    console.log("\n🎉 Deployment Summary:");
    console.log("=====================================");
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: Sepolia Testnet`);
    console.log(`🔗 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`📊 Deployment TX: https://sepolia.etherscan.io/tx/${fheCounter.deploymentTransaction().hash}`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`⛽ Gas Used: ~3,000,000`);
    console.log("=====================================");
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    try {
      const owner = await fheCounter.owner();
      console.log("✅ Contract owner:", owner);
      console.log("✅ Contract is responsive and deployed correctly!");
    } catch (error) {
      console.log("⚠️  Basic test failed:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  });