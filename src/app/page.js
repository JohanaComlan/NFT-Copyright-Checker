"use client";
import { useState, useEffect } from "react";
import { NFTCard } from "./NFTCard";
import UploadNFT from "./UploadNFT";
import { ethers } from "ethers";
import VerificationInfoPopUp from "./VerificationInfoPopUp";
import { handleVerification } from "@/lib/handleVerification";

export default function Home() {
  const [searchType, setSearchType] = useState("wallet"); // "wallet" or "collection"
  const [network, setNetwork] = useState("mainnet");
  const [inputValue, setInputValue] = useState("");
  const [NFTs, setNFTs] = useState([]);
  const [useTokenId, setUseTokenId] = useState(false); // 是否使用 tokenId 查询
  const [tokenId, setTokenId] = useState(""); // 用户输入的 tokenId
  const [showUpload, setShowUpload] = useState(false); // 是否打开上传图片弹窗

  const [modalOpen, setModalOpen] = useState(false);
  const [steps, setSteps] = useState([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [searched, setSearched] = useState(false); // 是否执行过搜索

  // const fetchNFT = async (params = {}) => {

  //   setErrorMsg(""); // 清除旧错误
  //   setSearched(true);

  //   const {
  //     searchType: overrideType = searchType,
  //     network: overrideNetwork = network,
  //     inputValue: overrideInput = inputValue,
  //     useTokenId: overrideUseToken = useTokenId,
  //     tokenId: overrideTokenId = tokenId,
  //   } = params;
  
  //   let api_key = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  //   let baseURL = `https://eth-${overrideNetwork}.g.alchemy.com/nft/v3/${api_key}/`;
  //   let options = { method: 'GET', headers: { accept: 'application/json' } };
  
  //   console.log("Fetching NFTs for", overrideType, ":", overrideInput);
  
  //   let fetchURL;
  //   if (overrideType === "wallet") {
  //     fetchURL = `${baseURL}getNFTsForOwner?owner=${overrideInput}&withMetadata=true&pageSize=100`;
  //   } else {
  //     if (overrideUseToken && overrideTokenId.trim()) {
  //       fetchURL = `${baseURL}getNFTMetadata?contractAddress=${overrideInput}&tokenId=${overrideTokenId}&refreshCache=false`;
  //     } else {
  //       fetchURL = `${baseURL}getNFTsForContract?contractAddress=${overrideInput}&withMetadata=true`;
  //     }
  //   }
  
  //   try {
  //     const response = await fetch(fetchURL, options);
  //     const data = await response.json();
  
  //     if (data) {
  //       setNFTs(
  //         overrideType === "wallet"
  //           ? data.ownedNfts
  //           : overrideUseToken && overrideTokenId.trim()
  //           ? [data]
  //           : data.nfts
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching NFTs:", error);
  //   }
  // };
  
  const fetchNFT = async (params = {}) => {
    setErrorMsg(""); // 清除旧错误
    setSearched(true);
  
    const {
      searchType: overrideType = searchType,
      network: overrideNetwork = network,
      inputValue: overrideInput = inputValue,
      useTokenId: overrideUseToken = useTokenId,
      tokenId: overrideTokenId = tokenId,
    } = params;
  
    let api_key = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    let baseURL = `https://eth-${overrideNetwork}.g.alchemy.com/nft/v3/${api_key}/`;
    let options = { method: 'GET', headers: { accept: 'application/json' } };
  
    let fetchURL;
    if (overrideType === "wallet") {
      fetchURL = `${baseURL}getNFTsForOwner?owner=${overrideInput}&withMetadata=true&pageSize=100`;
    } else {
      if (overrideUseToken && overrideTokenId.trim()) {
        fetchURL = `${baseURL}getNFTMetadata?contractAddress=${overrideInput}&tokenId=${overrideTokenId}&refreshCache=false`;
      } else {
        fetchURL = `${baseURL}getNFTsForContract?contractAddress=${overrideInput}&withMetadata=true`;
      }
    }
  
    try {
      const response = await fetch(fetchURL, options);
      const data = await response.json();
  
      let fetchedNFTs = [];
  
      if (data) {
        fetchedNFTs =
          overrideType === "wallet"
            ? data.ownedNfts
            : overrideUseToken && overrideTokenId.trim()
            ? [data]
            : data.nfts;
  
        const displayableNFTs = fetchedNFTs?.filter(nft => nft.image?.cachedUrl);
        setNFTs(displayableNFTs);
  
        if (!displayableNFTs || displayableNFTs.length === 0) {
          setErrorMsg("No NFTs found or no displayable images.");
        }
      } else {
        setNFTs([]);
        setErrorMsg("Invalid response from server.");
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setNFTs([]);
      setErrorMsg("Error occurred while fetching NFTs.");
    }
  };
  
  const handleMyNFTClick = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
  
    try {
      // 获取钱包地址
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0]?.toLowerCase();
  
      // 获取当前链 ID
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
  
      // 判断网络类型
      let selectedNetwork;
      if (chainId === "0x1") {
        selectedNetwork = "mainnet";
      } else if (chainId === "0xaa36a7") {
        selectedNetwork = "sepolia";
      } else {
        alert("Unsupported network. Please switch to Ethereum Mainnet or Sepolia.");
        return;
      }
  
      // 设置状态，自动填入
      setSearchType("wallet");
      setNetwork(selectedNetwork);
      setInputValue(walletAddress);

      // 触发查询
      fetchNFT({
        searchType: "wallet",
        network: selectedNetwork,
        inputValue: walletAddress,
      });
    } catch (error) {
      console.error("Failed to connect wallet or fetch NFTs:", error);
      alert("Something went wrong, please try again.");
    }
  };
  

  const handleVerifyFromUpload = async ({ contract, tokenId, preview }) => {
    setShowUpload(false);

    try {
      const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      const fetchURL = `https://eth-sepolia.g.alchemy.com/nft/v3/${apiKey}/getNFTMetadata?contractAddress=${contract.address}&tokenId=${tokenId}&refreshCache=false`;

      const res = await fetch(fetchURL, {
        method: 'GET',
        headers: { accept: 'application/json' }
      });
      const data = await res.json();

      const nft = {
        contract: { address: data.contract.address },
        tokenId: data.tokenId,
        image: { cachedUrl: data.image?.cachedUrl || preview },
      };

      handleVerification({
        nft,
        setSteps,
        setModalOpen,
      });

    } catch (err) {
      console.error("Failed to fetch NFT metadata:", err);
    }
  };

  

  return (
    <div className="relative min-h-screen">
      {/* MyNFT 按钮*/}
      <button 
        onClick={handleMyNFTClick} 
        className="absolute top-10 right-15 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition z-50"
      >
        MyNFT
      </button>

      {/* 页面主体内容 */}
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

        {/* 错误展示 */}
        {searched && errorMsg && (
          <div className="text-red-500 font-medium mt-2 text-lg">
            {errorMsg}
          </div>
        )}

        {/* NFT 展示区域 */}
          {Array.isArray(NFTs) && NFTs.length > 0 ? (
            <div className="grid gap-y-12 gap-x-5 mt-4 mx-auto w-2/3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {NFTs.filter(nft => nft.image?.cachedUrl).map((nft, index) => (
                <NFTCard key={index} nft={nft} onTestnet={network === "sepolia"} />
              ))}
            </div>
          ) : (
            <div className="mt-6 w-1/2 mx-auto text-center">
              <p className="text-gray-700 text-2xl font-semibold">Try these test addresses:</p>

              {/* Contract Addresses */}
              <div className="mt-3 bg-gray-100 p-4 rounded-md shadow-sm">
                <h3 className="text-md font-bold text-gray-700 mb-2">🎨 Search by Collections - Ethereum</h3>
                <ul className="text-gray-600 text-sm">
                  <li>Bored Ape: 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D</li>
                  <li>Nakadoodles: 0xbD56d7197AADdfa3a06D8773B5337975941F1258</li>
                  <li>Other collection with Description: 0x495f947276749Ce646f68AC8c248420045cb7b5e</li>
                </ul>
              </div>

              {/* Wallet Addresses */}
              <div className="mt-3 bg-gray-100 p-4 rounded-md shadow-sm">
                <h3 className="text-md font-bold text-gray-700 mb-2">👛Search by Wallet - Ethereum</h3>
                <ul className="text-gray-600 text-sm">
                  <li>Doodles Holder: 0x2B3Ab8e7BB14988616359B78709538b10900AB7D</li>
                  <li>RM_ART Collection: 0xc9b6321dc216D91E626E9BAA61b06B0E4d55bdb1</li>
                </ul>
              </div>

              {/* Sepolia Wallet */}
              <div className="mt-3 bg-gray-100 p-4 rounded-md shadow-sm">
                <h3 className="text-md font-bold text-gray-700 mb-2">🛠️ Search by Wallet - Sepolia</h3>
                <ul className="text-gray-600 text-sm">
                  <li>My Wallet: 0x8B6B7a67f310E867cBE08c3Ffa94327CDD18b005</li>
                </ul>
              </div>
            </div>
          )}

        {/* 悬浮 Plus 按钮 */}
        <button 
          className="fixed bottom-12 right-12 bg-blue-500 shadow-lg p-3 rounded-full hover:bg-blue-600 transition duration-300 hover:scale-110"
          onClick={() => setShowUpload(true)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" height="32" 
            viewBox="0 0 24 24" 
            fill="white"  
            className="w-12 h-12"
          >
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"/>
          </svg>
        </button>

        {/* 上传弹窗 */}
        {showUpload && (
          <UploadNFT
            onClose={() => setShowUpload(false)}
            onGoVerify={handleVerifyFromUpload}
          />
        )}

        {/* 验证弹窗 */}
        <VerificationInfoPopUp
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSteps([]);
          }}
          steps={steps}
        />
      </div>
    </div>
  );
}
