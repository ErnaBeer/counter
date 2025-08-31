const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Simple FHE Counter deployment...");
  
  // Get the contract factory
  const SimpleFHECounter = await ethers.getContractFactory("SimpleFHECounter");
  
  // Deploy the contract
  console.log("📝 Deploying SimpleFHECounter contract...");
  const simpleFHECounter = await SimpleFHECounter.deploy();
  
  // Wait for deployment to be mined
  await simpleFHECounter.waitForDeployment();
  
  const contractAddress = await simpleFHECounter.getAddress();
  console.log("✅ SimpleFHECounter deployed to:", contractAddress);
  
  // Display deployment information
  console.log("\n🔍 Deployment Summary:");
  console.log("Contract Name: SimpleFHECounter");
  console.log("Contract Address:", contractAddress);
  console.log("Network: sepolia");
  console.log("Chain ID: 11155111");
  
  // Get deployer info
  const [deployer] = await ethers.getSigners();
  console.log("Deployer Address:", deployer.address);
  
  // Etherscan verification URL
  console.log("🔗 Etherscan URL:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "SimpleFHECounter",
    contractAddress: contractAddress,
    network: "sepolia",
    chainId: 11155111,
    deploymentTime: new Date().toISOString(),
    deployer: deployer.address
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
    console.log(`\nNext steps:`);
    console.log(`1. Update frontend configuration with new address: ${address}`);
    console.log(`2. Test FHE interactions through the frontend`);
    console.log(`3. Verify contract on Etherscan if needed`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });