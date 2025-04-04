import { useEffect, useState } from "react";
import CopyableText from "@/lib/CopyableText";
import dayjs from "dayjs";

export default function VerificationDetailsPopUp({ open, onClose, data, network = "sepolia" }) {
  const [nftDetail, setNftDetail] = useState(null);

  useEffect(() => {
    if (open && data?.contract && data?.tokenId) {
      fetchNFTDetail(data.contract, data.tokenId);
    }
  }, [open, data]);

  const fetchNFTDetail = async (contract, tokenId) => {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-12 rounded-lg shadow-xl w-full max-w-2xl min-h-[400px] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 text-xl font-bold hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-4xl font-bold text-center mb-8">Verification Details</h2>

        {nftDetail ? (
            <div className="flex justify-center">
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
                        typeof data?.owner === "string"
                            ? `${data.owner.slice(0, 6)}...${data.owner.slice(-4)}`
                            : "N/A"
                        }
                        fullText={data?.owner || ""}
                    />
                    </p>
                    <p><strong>Contract:</strong>{" "}
                    <CopyableText
                        shortText={
                        typeof data?.contract === "string"
                            ? `${data.contract.slice(0, 6)}...${data.contract.slice(-4)}`
                            : "N/A"
                        }
                        fullText={data?.contract || ""}
                    />
                    </p>
                    <p><strong>Token ID:</strong>{" "}
                    <CopyableText
                        shortText={
                        typeof data?.tokenId === "string" && data.tokenId.length > 8
                            ? `${data.tokenId.slice(0, 4)}...${data.tokenId.slice(-4)}`
                            : data?.tokenId || "N/A"
                        }
                        fullText={data?.tokenId || ""}
                    />
                    </p>
                    <p><strong>Verified Time:</strong> {dayjs(data?.timestamp).format("YYYY-MM-DD HH:mm")}</p>
                </div>
                </div>
            </div>
            ) : (
            <p className="text-gray-500 text-center">Loading NFT details...</p>
        )}


        {/* Footer Close */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
