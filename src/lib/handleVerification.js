import { verifyNFT } from "@/lib/verifyNFT";
import { checkNFTInDatabase } from "@/lib/checkNFTInDatabase";

// Handles the full 3-step verification process for an NFT
export async function handleVerification({
  nft,
  setSteps,
  setModalOpen,
  setVerificationStatus, // optional
}) {
  if (!nft?.contract?.address || !nft?.tokenId || !nft?.image?.cachedUrl) {
    console.error("Invalid NFT data");
    return;
  }

  if (!window.ethereum) {
    alert("Please install MetaMask to proceed with verification.");
    return;
  }

  // Start: Open modal & initialize steps
  setModalOpen(true);
  setSteps([
    { title: "Ownership Verification", status: "loading" },
    { title: "Duplication Check", status: "idle" },
    { title: "Blockchain Recording", status: "idle" }
  ]);

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const userAddress = accounts[0].toLowerCase();

    // Fetch ownership from Alchemy
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    const baseURL = `https://eth-sepolia.g.alchemy.com/nft/v3/${apiKey}/getOwnersForNFT`;
    const fetchURL = `${baseURL}?contractAddress=${nft.contract.address}&tokenId=${nft.tokenId}`;

    const response = await fetch(fetchURL, {
      method: "GET",
      headers: { accept: "application/json" }
    });
    const data = await response.json();

    if (data.owners?.[0]?.toLowerCase() !== userAddress) {
      setSteps([
        {
          title: "Ownership Verification",
          status: "error",
          message: "You are not the owner of this NFT and cannot proceed with verification."
        },
        { title: "Duplication Check", status: "idle" },
        { title: "Blockchain Recording", status: "idle" }
      ]);
      return;
    }

    // Step 1 success
    setSteps(prev => {
      const updated = [...prev];
      updated[0].status = "success";
      updated[1].status = "loading";
      return updated;
    });

    // Step 2: Check for duplication
    const db_result = await checkNFTInDatabase({
      imageUrl: nft.image.cachedUrl,
      contract: nft.contract.address,
      tokenId: nft.tokenId,
      owner: userAddress,
    });

    if (!db_result || db_result.success === false) {
      setSteps(prev => {
        const updated = [...prev];
        updated[1] = {
          ...updated[1],
          status: "error",
          message: "Database verification failed: " + (db_result?.error || "Unknown error.")
        };
        return updated;
      });
      return;
    }

    if (db_result.matched) {
      const match = db_result.match;
      setSteps(prev => {
        const updated = [...prev];
        updated[1] = {
          ...updated[1],
          status: "error",
          message: "This image has already been verified in the system.",
          owner: match.owner,
          contract: match.contract,
          tokenId: match.tokenId,
          timestamp: new Date(match.timestamp).toLocaleString()
        };
        return updated;
      });
      return;
    }

    // Step 2 success
    setSteps(prev => {
      const updated = [...prev];
      updated[1].status = "success";
      updated[2].status = "loading";
      return updated;
    });

    // Step 3: Record on-chain
    const result = await verifyNFT(nft.contract.address, nft.tokenId);
    setSteps(prev => {
      const updated = [...prev];
      updated[2] = result.success
        ? { ...updated[2], status: "success" }
        : {
            ...updated[2],
            status: "error",
            message: "Blockchain recording failed. Please try again later."
          };
      return updated;
    });

    if (result.success && setVerificationStatus) {
      setVerificationStatus("verified");
    }

  } catch (err) {
    console.error("Verification error:", err);
    setSteps([
      {
        title: "Ownership Verification",
        status: "error",
        message: "An unexpected error occurred during verification. Please try again."
      },
      { title: "Duplication Check", status: "idle" },
      { title: "Blockchain Recording", status: "idle" }
    ]);
  }
}
