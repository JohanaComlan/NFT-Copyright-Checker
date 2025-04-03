import { ethers } from "ethers";
import VerificationBitmapABI from "@/lib/abi/VerificationBitmapABI.json";
import contractAddresses from "@/lib/contract/verifyContractAddress.json";

// ✅ 拼接 RPC URL
const getProviderAndContract = () => {
  const privateKey = process.env.NEXT_PUBLIC_METAMASK_PRIVATE_KEY;
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  if (!privateKey || !apiKey) {
    throw new Error("Missing NEXT_PUBLIC_METAMASK_PRIVATE_KEY or NEXT_PUBLIC_ALCHEMY_API_KEY in environment variables");
  }

  const rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const contractAddress = contractAddresses.VerificationBitmap;
  const contract = new ethers.Contract(contractAddress, VerificationBitmapABI, wallet);

  return contract;
};

// ✅ 发起验证
export const verifyNFT = async (nftContractAddress, tokenId) => {
  try {
    const contract = getProviderAndContract();

    console.log("📝 Sending transaction to verify NFT...");
    const tx = await contract.markVerified(nftContractAddress, tokenId);
    console.log("⛓️ Transaction sent! Hash:", tx.hash);

    await tx.wait();
    console.log("✅ NFT successfully verified on-chain!");

    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("❌ Error verifying NFT:", error);
    return { success: false, error: error.message };
  }
};

// ✅ 查询是否已验证
export const isNFTVerified = async (nftContractAddress, tokenId) => {
  try {
    const contract = getProviderAndContract();
    const verified = await contract.isVerified(nftContractAddress, tokenId);
    console.log("🔍 NFT verified status:", verified);
    return verified;
  } catch (error) {
    console.error("❌ Error checking verification status:", error);
    return false;
  }
};
