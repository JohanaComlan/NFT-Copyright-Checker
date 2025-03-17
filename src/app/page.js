"use client";
import { useState } from "react";
import { NFTCard } from "./NFTCard";

export default function Home() {
  const [searchType, setSearchType] = useState("wallet"); // "wallet" or "collection"
  const [network, setNetwork] = useState("mainnet");
  const [inputValue, setInputValue] = useState("");
  const [NFTs, setNFTs] = useState([]);
  const [useTokenId, setUseTokenId] = useState(false); // 是否使用 tokenId 查询
  const [tokenId, setTokenId] = useState(""); // 用户输入的 tokenId

  const fetchNFT = async () => {
    let api_key = 'yEVTo2V-shPzg-qzxazhog4MHDX2FxEh';
    let baseURL = `https://eth-${network}.g.alchemy.com/nft/v3/${api_key}/`;
    let options = { method: 'GET', headers: { accept: 'application/json' } };

    console.log("Fetching NFTs for", searchType, ":", inputValue);

    let fetchURL;
    if (searchType === "wallet") {
      fetchURL = `${baseURL}getNFTsForOwner?owner=${inputValue}&withMetadata=true&pageSize=100`;
    } else {
      if (useTokenId && tokenId.trim()) {
        // 如果用户勾选了 Use Token 并输入了 Token ID
        fetchURL = `${baseURL}getNFTMetadata?contractAddress=${inputValue}&tokenId=${tokenId}&refreshCache=false`;
      } else {
        // 普通 Collection 查询
        fetchURL = `${baseURL}getNFTsForContract?contractAddress=${inputValue}&withMetadata=true`;
      }
    }

    try {
      const response = await fetch(fetchURL, options);
      const data = await response.json();

      if (data) {
        console.log("NFTs:", data);
        setNFTs(
          searchType === "wallet"
            ? data.ownedNfts
            : useTokenId && tokenId.trim()
            ? [data] // 如果是单个 NFT 查询，返回单个对象的数组
            : data.nfts
        );
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      {/* 标题区域 */}
      <div className="mt-5 w-2/3 text-center mx-auto">
        <h1 className="text-4xl font-bold text-gray-800">NFT Copyright Checker 🔍</h1>
        <p className="text-gray-600 text-lg mt-2">Verify & Search for NFT Authenticity in Seconds.</p>
      </div>

      {/* 搜索框区域 */}
      <div className="mt-8 flex w-2/3 gap-2 justify-center items-center">
        {/* 下拉菜单 */}
        <select
          className="border border-gray-300 p-2 rounded-lg shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="wallet">💸 Search by Wallet</option>
          <option value="collection">📜 Search by Collection</option>
        </select>

        <select
          className="border border-gray-300 p-2 rounded-lg shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
        >
          <option value="mainnet">🌐 Ethereum</option>
          <option value="sepolia">🛠️ Sepolia</option>
        </select>

        {/* 动态搜索框 */}
        <input
          type="text"
          placeholder={searchType === "wallet" ? "Enter Wallet Address" : "Enter Collection Address"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg flex-grow shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder-gray-400"
        />
      </div>

      {/* Use Token 复选框 + Token ID 输入框 */}
      {searchType === "collection" && (
        <div className="flex items-center mt-3 gap-2">
          <input
            type="checkbox"
            id="useTokenId"
            checked={useTokenId}
            onChange={(e) => setUseTokenId(e.target.checked)}
            className="cursor-pointer"
          />
          <label htmlFor="useTokenId" className="text-gray-700 text-sm cursor-pointer">
            Use Token
          </label>
          <input
            type="text"
            placeholder="Enter Token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className={`border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder-gray-400 ${
              useTokenId ? "border-gray-300" : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
            disabled={!useTokenId}
          />
        </div>
      )}

      {/* 搜索按钮 */}
      <button
        className={`text-white px-4 py-2 mt-3 rounded-md w-1/5 ${
          inputValue.trim() ? "bg-blue-500 hover:bg-blue-700" : "bg-blue-300"
        }`}
        onClick={fetchNFT}
        disabled={!inputValue.trim()}
      >
        Start Search!
      </button>

      {/* NFT 展示区域 */}
      <div className="flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-5 justify-center">
        {NFTs.length > 0 ? (
          NFTs.filter(nft => nft.image?.cachedUrl).map((nft, index) => (
            <NFTCard key={index} nft={nft} onTestnet={network === "sepolia"} />
          ))
        ) : (
          <div className="text-center">
            <p className="text-gray-700 text-lg font-semibold">No NFTs found.</p>
            <p className="text-gray-500 text-sm mt-2">Try these test addresses:</p>

            {/* Contract Addresses */}
            <div className="mt-3 bg-gray-100 p-4 rounded-md shadow-sm">
              <h3 className="text-md font-bold text-gray-700 mb-2">🎨 NFT Collections</h3>
              <ul className="text-gray-600 text-sm">
                <li>Bored Ape: 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D</li>
                <li>Nakadoodles: 0xbD56d7197AADdfa3a06D8773B5337975941F1258</li>
                <li>Other collection with Description: 0x495f947276749Ce646f68AC8c248420045cb7b5e</li>
              </ul>
            </div>

            {/* Wallet Addresses */}
            <div className="mt-3 bg-gray-100 p-4 rounded-md shadow-sm">
              <h3 className="text-md font-bold text-gray-700 mb-2">👛 Wallet Addresses</h3>
              <ul className="text-gray-600 text-sm">
                <li>Doodles Holder: 0x2B3Ab8e7BB14988616359B78709538b10900AB7D</li>
                <li>RM_ART Collection: 0xc9b6321dc216D91E626E9BAA61b06B0E4d55bdb1</li>
              </ul>
            </div>

            {/* Sepolia Wallet */}
            <div className="mt-3 bg-gray-100 p-4 rounded-md shadow-sm">
              <h3 className="text-md font-bold text-gray-700 mb-2">🛠️ Sepolia Testnet</h3>
              <ul className="text-gray-600 text-sm">
                <li>My Wallet: 0x8B6B7a67f310E867cBE08c3Ffa94327CDD18b005</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <button 
        className="fixed bottom-12 right-12 bg-blue-500 shadow-lg p-3 rounded-full hover:bg-blue-600 transition duration-300 hover:scale-110"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" height="32" 
          viewBox="0 0 24 24" 
          fill="white"  // 确保图标是白色
          className="w-12 h-12"
        >
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"/>
        </svg>
      </button>

    </div>
  );
}
