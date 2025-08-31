import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting Standard FHE Counter deployment...");
  
  // Get the contract factory
  const FHECounter = await ethers.getContractFactory("FHECounter");
  
  // Deploy the contract
  console.log("📝 Deploying FHECounter contract...");
  const fheCounter = await FHECounter.deploy();
  
  // Wait for deployment to be mined
  await fheCounter.waitForDeployment();
  
  const contractAddress = await fheCounter.getAddress();
  console.log("✅ FHECounter deployed to:", contractAddress);
  
  // Display deployment information
  console.log("\n🔍 Deployment Summary:");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", "sepolia");
  console.log("Chain ID:", 11155111);
  
  // Etherscan verification URL
  console.log("🔗 Etherscan URL:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "FHECounter",
    contractAddress: contractAddress,
    network: "sepolia",
    chainId: 11155111,
    deploymentTime: new Date().toISOString(),
    deployer: (await ethers.getSigners())[0].address
  };
  
  console.log("\n📋 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return contractAddress;
}

// Execute deployment
main()
  .then((address) => {
    console.log(`\n🎉 Deployment completed successfully!`);
    console.log(`Contract Address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });