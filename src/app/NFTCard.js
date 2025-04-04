import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Image from "next/image";
import { verifyNFT, isNFTVerified } from '@/lib/verifyNFT';
import { checkNFTInDatabase } from '@/lib/checkNFTInDatabase';
import VerificationInfoPopUp from './VerificationInfoPopUp';
import CopyableText from "@/lib/CopyableText";


export const NFTCard = ({ nft, onTestnet} ) => {
    const contractDomain = onTestnet? 'sepolia.': ''
    const openseaDomain  = onTestnet? 'testnets.':''
    const opensea_networkType = onTestnet? 'sepolia':'ethereum'
    const alchemy_networkType = onTestnet? 'sepolia':'mainnet'

    const [verificationStatus, setVerificationStatus] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [steps, setSteps] = useState([
        { title: "Ownership Verification", status: "idle" },
        { title: "Duplication Check", status: "idle" },
        { title: "Blockchain Recording", status: "idle" }
    ]);


    // 检查NFT所有者
    // const handleVerify = async () => {
    //     if (!window.ethereum) {
    //         alert("Please install MetaMask for verification!");
    //         return;
    //     }

    //     try {
    //         // 获取当前连接的钱包地址
    //         const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    //         const userAddress = accounts[0].toLowerCase();

    //         // 发送请求获取 NFT 的真正所有者
    //         const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    //         const baseURL = `https://eth-${alchemy_networkType}.g.alchemy.com/nft/v3/${apiKey}/getOwnersForNFT`;
    //         const fetchURL = `${baseURL}?contractAddress=${nft.contract.address}&tokenId=${nft.tokenId}`;

    //         const response = await fetch(fetchURL, { method: "GET", headers: { accept: "application/json" } });
    //         const data = await response.json();

    //         if (data.owners && data.owners.length > 0) {
    //             const ownerAddress = data.owners[0].toLowerCase();
    //             console.log("NFT owner:", ownerAddress);

    //             // 比对当前用户的钱包地址和 NFT 所有者
    //             if (userAddress === ownerAddress) {
    //                 alert("✅ You can go verify");

    //                 // 数据库验证
    //                 const db_result = await checkNFTInDatabase({
    //                     imageUrl: nft.image.cachedUrl,
    //                     contract: nft.contract.address,
    //                     tokenId: nft.tokenId,
    //                     owner: ownerAddress,
    //                   });
                      
    //                   if (!db_result || db_result.success === false) {
    //                     alert("❌ Verification failed: " + (db_result?.error || "Unknown error"));
    //                     return;
    //                   }
                      
    //                   if (db_result.matched) {
    //                     const match = db_result.match;
    //                     alert(`⚠️ This image is already verified:
    //                   - Contract: ${match.contract}
    //                   - Token ID: ${match.tokenId}
    //                   - Owner: ${match.owner}
    //                   - Time: ${new Date(match.timestamp).toLocaleString()}
    //                   - Distance: ${match.distance}`);
    //                     return;
    //                   }
                      
    //                   alert("✅ Successfully verified and added to the database!");

    //                 // 合约验证
    //                 const contract_result = await verifyNFT(nft.contract.address, nft.tokenId);
    //                 if (contract_result.success) {
    //                     alert("✅ Successfully verified!");
    //                     setVerificationStatus("verified"); // 直接设置为已验证，不重复查合约
    //                 } else {
    //                     alert("⚠️ Verification failed: " + contract_result.error);
    //                 }

    //             } else {
    //                 setVerificationStatus("not-owner");
    //                 alert("❌ You are not the owner of this NFT and cannot be authenticated!");
    //             }
    //         } else {
    //             alert("⚠️ Can not get full information of this NFT");
    //         }
    //     } catch (error) {
    //         console.error("Error checking ownership:", error);
    //         alert("⚠️ Verification failed, please try again later!");
    //     }
    // };

    const handleVerify = async () => {
        if (!window.ethereum) {
          alert("Please install MetaMask to proceed with verification.");
          return;
        }
      
        setModalOpen(true);
        setSteps([
          { title: "Ownership Verification", status: "loading" },
          { title: "Duplication Check", status: "idle" },
          { title: "Blockchain Recording", status: "idle" }
        ]);
      
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          const userAddress = accounts[0].toLowerCase();
      
          const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
          const baseURL = `https://eth-${alchemy_networkType}.g.alchemy.com/nft/v3/${apiKey}/getOwnersForNFT`;
          const fetchURL = `${baseURL}?contractAddress=${nft.contract.address}&tokenId=${nft.tokenId}`;
      
          const response = await fetch(fetchURL, { method: "GET", headers: { accept: "application/json" } });
          const data = await response.json();
      
          if (data.owners && data.owners.length > 0) {
            const ownerAddress = data.owners[0].toLowerCase();
      
            if (userAddress !== ownerAddress) {
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
      
            setSteps(prev => {
              const updated = [...prev];
              updated[0].status = "success";
              updated[1].status = "loading";
              return updated;
            });
      
            const db_result = await checkNFTInDatabase({
              imageUrl: nft.image.cachedUrl,
              contract: nft.contract.address,
              tokenId: nft.tokenId,
              owner: ownerAddress,
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
      
            setSteps(prev => {
              const updated = [...prev];
              updated[1].status = "success";
              updated[2].status = "loading";
              return updated;
            });
      
            const contract_result = await verifyNFT(nft.contract.address, nft.tokenId);
            if (contract_result.success) {
              setSteps(prev => {
                const updated = [...prev];
                updated[2].status = "success";
                return updated;
              });
              setVerificationStatus("verified");
            } else {
              setSteps(prev => {
                const updated = [...prev];
                updated[2] = {
                  ...updated[2],
                  status: "error",
                  message: "Blockchain recording failed. Please try again later."
                };
                return updated;
              });
            }
      
          } else {
            setSteps([
              {
                title: "Ownership Verification",
                status: "error",
                message: "Unable to retrieve ownership information for this NFT."
              },
              { title: "Duplication Check", status: "idle" },
              { title: "Blockchain Recording", status: "idle" }
            ]);
          }
        } catch (error) {
          console.error("Verification error:", error);
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
      };
      
       

   useEffect(() => {
        const checkVerificationStatus = async () => {
            const verified = await isNFTVerified(nft.contract.address, nft.tokenId);
            if (verified) {
                setVerificationStatus("verified");
            } else {
                setVerificationStatus("not-verified");
            }
        };
        checkVerificationStatus();
    }, [nft.contract.address, nft.tokenId]);


    const showVerifyDetails = () =>{
        alert("Show detail!");
    }

    const handleCloseModal = () => {
        setModalOpen(false); // 控制弹窗关闭
        setSteps([]);        // 重置 steps
    };
    
    <VerificationInfoPopUp
        open={modalOpen}
        onClose={handleCloseModal}
        steps={steps}
    />

    return (
        <>
            <VerificationInfoPopUp
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                steps={steps}
            />
            <div className="w-full max-w-sm flex flex-col border border-gray-300 bg-slate-100 shadow-lg rounded-md overflow-hidden transition-transform duration-300 ease-in-out group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    className="object-cover h-64 w-full rounded-t-md transition-transform duration-300 ease-in-out group-hover:scale-105"
                    src={nft.image.cachedUrl} 
                    alt={nft.name} 
                />
                
                <div className="flex flex-col gap-2 px-4 py-4 rounded-b-md flex-grow">
                    <h2 className="text-xl font-semibold text-gray-800">{nft?.name || "Unnamed NFT"}</h2>
                    <p className="text-gray-600 text-sm">
                        ID:{" "}
                        <CopyableText
                            shortText={
                            String(nft.tokenId).length > 8
                                ? `${String(nft.tokenId).slice(0, 4)}...${String(nft.tokenId).slice(-4)}`
                                : String(nft.tokenId)
                            }
                            fullText={String(nft.tokenId)}
                    />
                    </p>

                    <p className="text-gray-600 text-sm">
                        Contract:{" "}<CopyableText
                            shortText={
                            nft.contract.address
                                ? `${String(nft.contract.address).slice(0, 6)}...${String(nft.contract.address).slice(-4)}`
                                : "No Address"
                            }
                            fullText={nft.contract.address || ""}
                    />
                    </p>

                    <p className="text-gray-600 text-sm mb-4">
                        {nft.description
                        ? nft.description.length > 100
                            ? nft.description.slice(0, 100) + "..."
                            : nft.description
                        : "No description available"}
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
                        <button
                            onClick={
                                verificationStatus === "verified"
                                ? showVerifyDetails
                                : handleVerify
                            }
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
        </>
    );
};
