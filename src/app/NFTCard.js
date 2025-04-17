import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Image from "next/image";
import { verifyNFT, isNFTVerified } from '@/lib/verifyNFT';
import { checkNFTInDatabase } from '@/lib/checkNFTInDatabase';
import VerificationInfoPopUp from './VerificationInfoPopUp';
import CopyableText from "@/lib/CopyableText";
import { handleVerification } from "@/lib/handleVerification";
import VerificationDetailsPopUp from "@/app/VerificationDetailsPopUp"


export const NFTCard = ({ nft, onTestnet} ) => {
    const contractDomain = onTestnet? 'sepolia.': ''
    const openseaDomain  = onTestnet? 'testnets.':''
    const opensea_networkType = onTestnet? 'sepolia':'ethereum'
    const alchemy_networkType = onTestnet? 'sepolia':'mainnet'

    const [verificationStatus, setVerificationStatus] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [verifyInfo, setVerifyInfo] = useState(null);

    const [steps, setSteps] = useState([
        { title: "Ownership Verification", status: "idle" },
        { title: "Duplication Check", status: "idle" },
        { title: "Blockchain Recording", status: "idle" }
    ]);

      
    // 验证NFT
    const handleVerify = () => {
      handleVerification({
        nft,
        setSteps,
        setModalOpen,
        setVerificationStatus
      });
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


    const showVerifyDetails = async () => {
      try {
        const res = await fetch("/api/verified-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract: nft.contract.address,
            tokenId: nft.tokenId
          })
        });
    
        const result = await res.json();
        if (result.success && result.data) {
          setVerifyInfo(result.data);
          setShowDetailsModal(true);
        } else {
          alert("Verification info not found.");
        }
      } catch (err) {
        console.error("Failed to fetch verification details:", err);
        alert("Error loading verification info.");
      }
    };

    const handleCloseModal = () => {
        setModalOpen(false); // 控制弹窗关闭
        setSteps([]);        // 重置 steps
    };

    useEffect(() => {
      const url = nft.image.cachedUrl;
      console.log("NFT Image URL:", url);
      if (url.includes("ipfs.io")) {
      console.warn("⚠️ Using ipfs.io gateway, may fail on macOS. Consider switching.");
      }
    }, [nft]);

    
    <VerificationInfoPopUp
        open={modalOpen}
        onClose={handleCloseModal}
        steps={steps}
    />

    return (
        <>
            {/* 点击未验证的NFT出来的弹窗 */}
            <VerificationInfoPopUp
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                steps={steps}
            />

            {/* 点击已验证的NFT出来的弹窗 */}
            <VerificationDetailsPopUp
              open={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
              data={verifyInfo}
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
                                    ? "border-green-500 text-white bg-green-500 hover:bg-green-600 hover:border-green-600"
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
