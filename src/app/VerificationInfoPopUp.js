import {
    CheckCircle,
    Loader2,
    AlertTriangle,
    Circle
  } from "lucide-react";

import { useState, useEffect } from "react";
import CopyableText from "@/lib/CopyableText";


export default function VerificationInfoPopUp({ open, onClose, steps }) {
    const [showDetail, setShowDetail] = useState(false);
    const [nftDetail, setNftDetail] = useState(null);
    
    const isComplete = steps.every(step => step.status === "success");

    useEffect(() => {
        if (open && (!steps[1] || steps[1].status === "idle")) {
            setShowDetail(false);
            setNftDetail(null);
        }
    }, [open, steps]);

    if (!open) return null;
  
    const isLoading = steps.some((step) => step.status === "loading");
  
    const StepStatusIcon = ({ status }) => {
      if (status === "loading")
        return <Loader2 className="animate-spin text-green-500 w-6 h-6 mt-1" />;
      if (status === "success")
        return <CheckCircle className="text-green-500 w-6 h-6 mt-1" />;
      if (status === "error")
        return <AlertTriangle className="text-red-500 w-6 h-6 mt-1" />;
      return <Circle className="text-gray-400 w-6 h-6 mt-1" />; // idle or unknown
    };
  
    const handleBackgroundClick = () => {
      if (!isLoading) {
        onClose();
      }
    };
      

    const fetchNFTDetail = async (contract, tokenId, network = "sepolia") => {
        const api_key = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
        const baseURL = `https://eth-${network}.g.alchemy.com/nft/v3/${api_key}/`;
        const fetchURL = `${baseURL}getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&refreshCache=false`;
      
        try {
          const res = await fetch(fetchURL, {
            method: 'GET',
            headers: { accept: 'application/json' }
          });
          const data = await res.json();
          setNftDetail(data);
        } catch (err) {
          console.error("Failed to fetch NFT detail:", err);
        }
    };
      
    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
        onClick={handleBackgroundClick}
      >
        <div
          className="bg-white p-12 pt-22 rounded-lg shadow-xl w-full max-w-3xl min-h-[520px] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {!isLoading && (
            <button
              className="absolute top-4 right-4 text-gray-500 text-xl font-bold hover:text-gray-700"
              onClick={onClose}
            >
              ✕
            </button>
          )}
  
          {/* Title */}
          <h2 className="text-4xl font-bold text-center mb-10">Verification Status</h2>
  
          {/* Content Container */}
          <div className="w-fit mx-auto space-y-8">
            {showDetail && nftDetail ? (
                <div className="flex flex-col items-center gap-6">
                <div className="flex flex-row gap-6 items-start">
                    <img
                    src={nftDetail?.image?.cachedUrl}
                    alt={nftDetail?.name || "NFT Image"}
                    className="w-48 h-48 object-cover rounded"
                    />
                    <div className="text-left space-y-2 text-base text-gray-700">
                        <p><strong>Name:</strong> {nftDetail?.name || "Unknown"}</p>
                        <p><strong>Owner:</strong>{" "}
                        <CopyableText
                            shortText={
                            typeof steps[1]?.owner === "string"
                                ? `${steps[1].owner.slice(0, 6)}...${steps[1].owner.slice(-4)}`
                                : "N/A"
                            }
                            fullText={steps[1]?.owner || ""}
                        />
                        </p>

                        <p><strong>Contract:</strong>{" "}
                        <CopyableText
                            shortText={
                            typeof steps[1]?.contract === "string"
                                ? `${steps[1].contract.slice(0, 6)}...${steps[1].contract.slice(-4)}`
                                : "N/A"
                            }
                            fullText={steps[1]?.contract || ""}
                        />
                        </p>

                        <p><strong>Token ID:</strong>{" "}
                        <CopyableText
                            shortText={
                            typeof steps[1]?.tokenId === "string" && steps[1].tokenId.length > 8
                                ? `${steps[1].tokenId.slice(0, 4)}...${steps[1].tokenId.slice(-4)}`
                                : steps[1]?.tokenId || "N/A"
                            }
                            fullText={steps[1]?.tokenId || ""}
                        />
                        </p>

                        <p><strong>Verified Time:</strong> {steps[1]?.timestamp || "N/A"}</p>

                    </div>
                </div>

                {/* Optional: Back button */}
                <button
                    onClick={() => setShowDetail(false)}
                    className="text-blue-600 hover:underline ml-2"
                >
                    ← Back to steps
                </button>
                </div>
                ) : (
                steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                    <StepStatusIcon status={step.status} />
                    <div>
                    <p className="text-lg font-medium">{step.title}</p>

                    {step.status === "error" && step.message?.includes("already been verified") && !showDetail ? (
                        <p className="text-red-500 text-base mt-1 whitespace-pre-line">
                        {step.message}{" "}
                        <button
                            className="text-blue-600 hover:underline ml-2"
                            onClick={() => {
                            setShowDetail(true);
                            fetchNFTDetail(step.contract, step.tokenId);
                            }}
                        >
                            See details
                        </button>
                        </p>
                    ) : step.status === "error" ? (
                        <p className="text-red-500 text-base mt-1 whitespace-pre-line">
                        {step.message}
                        </p>
                    ) : null}

                    {step.status === "success" && step.image && (
                        <div className="mt-2">
                        <img
                            src={step.image}
                            alt="Duplicate NFT"
                            className="w-32 h-32 object-cover rounded"
                        />
                        <p className="text-base text-gray-600 mt-2">
                            <strong>Owner:</strong> {step.owner}
                        </p>
                        <p className="text-base text-gray-600">
                            <strong>Contract:</strong> {step.contract}
                        </p>
                        <p className="text-base text-gray-600">
                            <strong>Token ID:</strong> {step.tokenId}
                        </p>
                        <p className="text-base text-gray-600">
                            <strong>Time:</strong> {step.timestamp}
                        </p>
                        </div>
                    )}
                    </div>
                </div>
                ))
            )}
            </div>

            {/* 成功提示 */}
            {isComplete && (
            <p className="text-green-600 font-semibold text-center text-lg mt-8">
                ✅ Verification completed!
            </p>
            )}
  
          {/* Footer Close Button */}
          {!isLoading && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={onClose}
                className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
}
  