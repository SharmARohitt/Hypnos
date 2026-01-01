import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy HypnosExecutor
  console.log("\nDeploying HypnosExecutor...");
  const HypnosExecutor = await ethers.getContractFactory("HypnosExecutor");
  const executor = await HypnosExecutor.deploy();
  await executor.waitForDeployment();
  const executorAddress = await executor.getAddress();
  console.log("HypnosExecutor deployed to:", executorAddress);

  // Deploy HypnosDemo
  console.log("\nDeploying HypnosDemo...");
  const HypnosDemo = await ethers.getContractFactory("HypnosDemo");
  const demo = await HypnosDemo.deploy();
  await demo.waitForDeployment();
  const demoAddress = await demo.getAddress();
  console.log("HypnosDemo deployed to:", demoAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("HypnosExecutor:", executorAddress);
  console.log("HypnosDemo:", demoAddress);
  console.log("\nSave these addresses for frontend configuration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
