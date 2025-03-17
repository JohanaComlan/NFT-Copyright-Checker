import { ethers } from "ethers";
import { useState } from "react";

export const NFTCard = ({ nft, onTestnet} ) => {
    const contractDomain = onTestnet? 'sepolia.': ''
    const openseaDomain  = onTestnet? 'testnets.':''
    const opensea_networkType = onTestnet? 'sepolia':'ethereum'
    const alchemy_networkType = onTestnet? 'sepolia':'mainnet'

    const [verificationStatus, setVerificationStatus] = useState(null);

    // 检查NFT所有者
    const checkOwnership = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask for verification!");
            return;
        }

        try {
            // 获取当前连接的钱包地址
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const userAddress = accounts[0].toLowerCase();

            // 发送请求获取 NFT 的真正所有者
            const apiKey = "yEVTo2V-shPzg-qzxazhog4MHDX2FxEh";
            const baseURL = `https://eth-${alchemy_networkType}.g.alchemy.com/nft/v3/${apiKey}/getOwnersForNFT`;
            const fetchURL = `${baseURL}?contractAddress=${nft.contract.address}&tokenId=${nft.tokenId}`;

            const response = await fetch(fetchURL, { method: "GET", headers: { accept: "application/json" } });
            const data = await response.json();

            if (data.owners && data.owners.length > 0) {
                const ownerAddress = data.owners[0].toLowerCase();
                console.log("NFT owner:", ownerAddress);

                // 比对当前用户的钱包地址和 NFT 所有者
                if (userAddress === ownerAddress) {
                    setVerificationStatus("verified");
                    alert("✅ You can go verify");
                } else {
                    setVerificationStatus("not-owner");
                    alert("❌ You are not the owner of this NFT and cannot be authenticated!");
                }
            } else {
                alert("⚠️ Can not get full information of this NFT");
            }
        } catch (error) {
            console.error("Error checking ownership:", error);
            alert("⚠️ Verification failed, please try again later!");
        }
    };


    return (
        <div className="w-1/4 max-w-sm flex flex-col border border-gray-300 bg-slate-100 shadow-lg rounded-md overflow-hidden transition-transform duration-300 ease-in-out group">
            <img 
                className="object-cover h-64 w-full rounded-t-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                src={nft.image.cachedUrl} 
                alt={nft.name} 
            />
            
            <div className="flex flex-col gap-2 px-4 py-4 rounded-b-md flex-grow">
                <h2 className="text-xl font-semibold text-gray-800">{nft?.name || "Unnamed NFT"}</h2>
                <p className="text-gray-600 text-sm">ID: {String(nft.tokenId).slice(-4)}</p>
                <p className="text-gray-600 text-sm">
                    {nft.contract.address
                        ? `${String(nft.contract.address).slice(0, 5)}...${String(nft.contract.address).slice(-4)}`
                        : "No Address"
                    }
                </p>
                <p className="text-gray-600 text-sm mb-4">
                    {nft.description ? nft.description.slice(0, 100) + "..." : "No description available"}
                </p>

                {/* 认证按钮 + 链接区域 */}
                <div className="flex flex-row mt-auto gap-2">
                    {/* 链接部分 */}
                    <div className="flex flex-col">
                        <a 
                            target="_blank" 
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                            href={`https://${contractDomain}etherscan.io/address/${nft.contract.address}`}
                        >
                            Check Contract
                        </a>
                        <a 
                            target="_blank" 
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                            href={`https://${openseaDomain}opensea.io/assets/${opensea_networkType}/${nft.contract.address}/${nft.tokenId}`}
                        >
                            View On Opensea
                        </a>
                    </div>

                    {/* Go Verify 按钮 */}
                    {/* <button 
                        className="border border-green-500 text-green-500 bg-green-100/30 hover:bg-green-500 hover:text-white font-semibold ml-auto px-2 py-1 rounded-md transition duration-200"
                        // 别删！是verified的绿色！
                        // className="text-white bg-green-500 hover:bg-green-600 font-semibold ml-auto px-2 py-1 rounded-md transition duration-200"
                    >
                        Go Verify
                    </button> */}
                    {/* Go Verify 按钮 */}
                    <button
                        onClick={checkOwnership} // 绑定点击事件
                        className={`border font-semibold ml-auto px-2 py-1 rounded-md transition duration-200 ${
                            verificationStatus === "verified"
                                ? "border-green-500 text-white bg-green-500"
                                : "border-green-500 text-green-500 bg-green-100/30 hover:bg-green-500 hover:text-white"
                        }`}
                    >
                        {verificationStatus === "verified" ? "Verified" : "Go Verify"}
                    </button>
                </div>
            </div>
        </div>
    );
};
