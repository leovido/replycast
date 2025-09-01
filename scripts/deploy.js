const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ReplyCast Registry...");

  try {
    // Get the contract factory
    const ReplyCastRegistry = await ethers.getContractFactory(
      "ReplyCastRegistry"
    );
    console.log("✅ Contract factory created");

    // Deploy the contract
    const replyCastRegistry = await ReplyCastRegistry.deploy();
    console.log("📤 Deployment transaction sent");

    // Wait for deployment to finish
    await replyCastRegistry.waitForDeployment();
    console.log("✅ Deployment confirmed");

    const address = await replyCastRegistry.getAddress();
    console.log("🎯 ReplyCast Registry deployed to:", address);

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.chainId);

    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("📦 Block number:", blockNumber);

    console.log("\n🎉 Deployment successful!");
    console.log("📋 Contract address:", address);
    console.log("🌐 Network:", network.name);
    console.log("🔗 Chain ID:", network.chainId);

    // Try to verify (optional)
    if (process.env.BASESCAN_API_KEY) {
      console.log("\n🔍 Verifying contract...");
      try {
        await hre.run("verify:verify", {
          address: address,
          constructorArguments: [],
        });
        console.log("✅ Contract verified on Basescan!");
      } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
        console.log("📝 You can manually verify the contract on Basescan");
      }
    }

    console.log("\n📱 Next steps:");
    console.log("1. Copy the contract address above");
    console.log("2. Update your Mini App with the new address");
    console.log("3. Test the integration!");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
