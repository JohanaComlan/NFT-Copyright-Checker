import { ethers } from "ethers";
import abi from "./abi/ProofOfCreationABI.json";
import addresses from "./contract/contractAddress.json";

const contractAddress = addresses.ProofOfCreation;

export async function mintNFTWithMetaMask(metadataURL) {
  if (!window.ethereum) {
    throw new Error("Please install the MetaMask extension");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.mintNFT(metadataURL);
  console.log("📨 Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed:", receipt.blockHash);

  // 解析 NFTMinted 事件拿 tokenId
  let tokenId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed.name === "NFTMinted") {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch (err) {
      // ignore non-matching logs
    }
  }

  if (tokenId) {
    console.log("🎉 Minted Token ID:", tokenId);
  } else {
    console.warn("⚠️ No NFTMinted event found.");
  }

  return {
    tokenId,
    contractAddress,
  };
}
