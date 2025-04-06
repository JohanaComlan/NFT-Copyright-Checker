// 单纯是用来补全数据库里的SHA-256的，没别的用
export async function updateAllSHA256Hashes() {
  const network = "sepolia"; // or goerli, sepolia, etc.
  const api_key = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  // Step 1: 工具函数：计算 SHA256
  async function getSHA256FromImageUrl(imageUrl) {
    try {
      const res = await fetch(imageUrl);
      const buffer = await res.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      return (
        "0x" +
        [...new Uint8Array(hashBuffer)]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")
      );
    } catch (err) {
      console.error("❌ Failed to hash image:", imageUrl, err);
      return null;
    }
  }

  // Step 2: 工具函数：通过 contract + tokenId 获取 NFT
  async function fetchNFTDetail(contract, tokenId) {
    const baseURL = `https://eth-${network}.g.alchemy.com/nft/v3/${api_key}/`;
    const fetchURL = `${baseURL}getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&refreshCache=false`;

    try {
      const res = await fetch(fetchURL, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error(`❌ Failed to fetch NFT ${contract} #${tokenId}:`, err);
      return null;
    }
  }

  // Step 3: 获取所有未更新 sha256 的数据
  const res = await fetch("/api/image-list");
  const { data } = await res.json();

  if (!data || !Array.isArray(data)) {
    console.error("❌ Invalid response from /api/image-list");
    return;
  }

  // Step 4: 遍历每条记录
  for (const item of data) {
    const { contract, tokenId } = item;
    const nft = await fetchNFTDetail(contract, tokenId);
    if (!nft || !nft.image?.cachedUrl) {
      console.warn(`⚠️ NFT ${contract} #${tokenId} has no image, skipping`);
      continue;
    }

    const sha256 = await getSHA256FromImageUrl(nft.image.cachedUrl);
    if (!sha256) {
      console.warn(`⚠️ Skipped ${tokenId} due to hash failure`);
      continue;
    }

    const updateRes = await fetch("/api/update-sha256", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contract, tokenId, sha256 }),
    });

    const result = await updateRes.json();
    if (result.success) {
      console.log(`✅ Updated ${contract} #${tokenId} with SHA256`);
    } else {
      console.warn(`❌ Failed to update ${tokenId}:`, result.error);
    }
  }
}
