import { expect } from "chai";
import { ethers } from "hardhat";
import { HypnosExecutor, HypnosDemo } from "../typechain-types";

describe("HypnosExecutor", function () {
  let executor: HypnosExecutor;
  let demo: HypnosDemo;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const HypnosExecutorFactory = await ethers.getContractFactory("HypnosExecutor");
    executor = await HypnosExecutorFactory.deploy();

    const HypnosDemoFactory = await ethers.getContractFactory("HypnosDemo");
    demo = await HypnosDemoFactory.deploy();
  });

  describe("Permission Management", function () {
    it("Should grant a permission", async function () {
      const target = await demo.getAddress();
      const selector = "0x00000000"; // Any function
      const maxValue = ethers.parseEther("1.0");
      const maxTokenAmount = 0;
      const tokenAddress = ethers.ZeroAddress;
      const expiry = 0; // No expiry

      const tx = await executor.grantPermission(
        user.address,
        target,
        selector,
        maxValue,
        maxTokenAmount,
        tokenAddress,
        expiry
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = executor.interface.parseLog(log);
          return parsed?.name === "PermissionGranted";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should revoke a permission", async function () {
      const target = await demo.getAddress();
      const selector = "0x00000000";
      const maxValue = ethers.parseEther("1.0");
      const maxTokenAmount = 0;
      const tokenAddress = ethers.ZeroAddress;
      const expiry = 0;

      const tx = await executor.grantPermission(
        user.address,
        target,
        selector,
        maxValue,
        maxTokenAmount,
        tokenAddress,
        expiry
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = executor.interface.parseLog(log);
          return parsed?.name === "PermissionGranted";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = executor.interface.parseLog(event);
        const permissionId = parsed?.args[1];

        const revokeTx = await executor.connect(user).revokePermission(permissionId);
        await revokeTx.wait();

        const permission = await executor.getPermission(user.address, permissionId);
        expect(permission.active).to.be.false;
      }
    });
  });

  describe("Execution", function () {
    it("Should execute with permission", async function () {
      const target = await demo.getAddress();
      const selector = "0x00000000";
      const maxValue = ethers.parseEther("1.0");
      const maxTokenAmount = 0;
      const tokenAddress = ethers.ZeroAddress;
      const expiry = 0;

      const grantTx = await executor.grantPermission(
        user.address,
        target,
        selector,
        maxValue,
        maxTokenAmount,
        tokenAddress,
        expiry
      );

      const grantReceipt = await grantTx.wait();
      const grantEvent = grantReceipt?.logs.find((log: any) => {
        try {
          const parsed = executor.interface.parseLog(log);
          return parsed?.name === "PermissionGranted";
        } catch {
          return false;
        }
      });

      if (grantEvent) {
        const parsed = executor.interface.parseLog(grantEvent);
        const permissionId = parsed?.args[1];

        // Encode incrementCounter function call
        const iface = demo.interface;
        const data = iface.encodeFunctionData("incrementCounter", []);

        const execTx = await executor.connect(user).executeWithPermission(
          permissionId,
          target,
          data,
          0
        );

        const execReceipt = await execTx.wait();
        expect(execReceipt?.status).to.equal(1);

        // Check counter was incremented
        const state = await demo.getState();
        expect(state.counter).to.equal(1n);
      }
    });

    it("Should reject execution exceeding max value", async function () {
      const target = await demo.getAddress();
      const selector = "0x00000000";
      const maxValue = ethers.parseEther("0.01");
      const maxTokenAmount = 0;
      const tokenAddress = ethers.ZeroAddress;
      const expiry = 0;

      const grantTx = await executor.grantPermission(
        user.address,
        target,
        selector,
        maxValue,
        maxTokenAmount,
        tokenAddress,
        expiry
      );

      const grantReceipt = await grantTx.wait();
      const grantEvent = grantReceipt?.logs.find((log: any) => {
        try {
          const parsed = executor.interface.parseLog(log);
          return parsed?.name === "PermissionGranted";
        } catch {
          return false;
        }
      });

      if (grantEvent) {
        const parsed = executor.interface.parseLog(grantEvent);
        const permissionId = parsed?.args[1];

        // Try to execute with value exceeding limit
        const iface = demo.interface;
        const data = iface.encodeFunctionData("deposit", []);

        await expect(
          executor.connect(user).executeWithPermission(
            permissionId,
            target,
            data,
            ethers.parseEther("0.1") // Exceeds 0.01 limit
          )
        ).to.be.revertedWith("HypnosExecutor: value exceeds limit");
      }
    });
  });
});
