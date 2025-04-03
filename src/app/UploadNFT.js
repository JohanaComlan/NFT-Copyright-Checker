"use client";
import { useEffect, useState } from "react";
import { uploadToWeb3Storage, uploadWithIPFSImageURL } from '@/lib/web3Uploader';
import { mintNFTWithMetaMask } from '@/lib/useMintNFT';
import UploadForm from './UploadForm';
import MintSuccess from './MintSuccess';
import VerifyPage from './VerifyPage';

export default function UploadNFT({ onClose }) {
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [metadataURL, setMetadataURL] = useState("");
  const [ipfsImageURL, setIpfsImageURL] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ipfsError, setIpfsError] = useState("");
  const [metaError, setMetaError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mintSuccessData, setMintSuccessData] = useState(null);
  const [showVerify, setShowVerify] = useState(false);

  // ipfs格式检测
  useEffect(() => {
    if (!ipfsImageURL) setIpfsError("");
    else if (!/^ipfs:\/\/[a-zA-Z0-9]+$/.test(ipfsImageURL))
      setIpfsError("The IPFS URL format is incorrect, it should be ipfs://CID");
    else setIpfsError("");
  }, [ipfsImageURL]);

  // metadataURL格式检测
  useEffect(() => {
    if (!metadataURL) setMetaError("");
    else if (!/^ipfs:\/\/[a-zA-Z0-9]+$/.test(metadataURL))
      setMetaError("The IPFS URL format is incorrect, it should be ipfs://CID");
    else setMetaError("");
  }, [metadataURL]);

  // 用户选择图片+自动填充NFT name
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
      const rawName = selected.name.replace(/\.[^/.]+$/, "");
      setName(rawName);
    } else {
      setPreview(null);
    }
  };

  // 上传data到IPFS
  const handleUpload = async () => {
    if (uploadMethod === "metadata") {
      if (!metadataURL) return alert("Please complete all fields.");
      if (!/^ipfs:\/\/[a-zA-Z0-9]+$/.test(metadataURL)) return alert("❌ Invalid IPFS format.");
      setIsLoading(true);
      handleMint(metadataURL);
    } else if (uploadMethod === "ipfs") {
      if (!ipfsImageURL || !name || !description) return alert("Please complete all fields.");
      if (!/^ipfs:\/\/[a-zA-Z0-9]+$/.test(ipfsImageURL)) return alert("❌ Invalid IPFS format.");
      try {
        setIsLoading(true);
        const metadataURL = await uploadWithIPFSImageURL(ipfsImageURL, name, description);
        handleMint(metadataURL);
      } catch (err) {
        alert("Upload failed: " + err.message);
        setIsLoading(false);
      }
    } else if (uploadMethod === "upload") {
      if (!file || !name || !description) return alert("Please complete all fields.");
      try {
        setIsLoading(true);
        const metadataURL = await uploadToWeb3Storage(file, name, description);
        handleMint(metadataURL);
      } catch (err) {
        alert("❌ Failed to upload: " + err.message);
        setIsLoading(false);
      }
    }
  };

  // Mint NFT
  const handleMint = async (metaURL) => {
    if (!metaURL) {
      alert("Invalid Metadata URL");
      setIsLoading(false);
      return;
    }
    try {
      const { tokenId, contractAddress } = await mintNFTWithMetaMask(metaURL);

      resetForm();
      
      // const contractAddress = "0xB9E7Ae08Cc4f587549f240a5062fa96f0f78D534";
      // const tokenId = 3;
      setMintSuccessData({ tokenId, contractAddress });

    } catch (err) {
      alert("❌ Mint failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 清空所有输入
  const resetForm = () => {
    setUploadMethod("upload");
    setMetadataURL("");
    setIpfsImageURL("");
    setName("");
    setDescription("");
    setFile(null);
    setPreview(null);
    setIpfsError("");
    setMetaError("");
  };

  // 点击空白处关闭弹窗
  const handleBackdropClick = () => {
    if (!isLoading) onClose();
  };

  // MintSuccess中返回按钮的处理逻辑，返回UploadNFT界面
  const handleMaybeLater = () => {
    resetForm();
    setMintSuccessData(null);
  };

  // 传入MintSuccess的映射
  const handleFieldChange = (field, value) => {
    const setters = {
      uploadMethod: setUploadMethod,
      metadataURL: setMetadataURL,
      ipfsImageURL: setIpfsImageURL,
      name: setName,
      description: setDescription,
    };
    if (setters[field]) setters[field](value);
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white p-15 rounded-lg shadow-xl w-full max-w-4xl min-h-[520px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {showVerify ? (
          <VerifyPage />
        ) : 
        mintSuccessData ? (
          <MintSuccess
            tokenId={mintSuccessData.tokenId}
            contractAddress={mintSuccessData.contractAddress}
            onMaybeLater={handleMaybeLater}
            onGoVerify={() => setShowVerify(true)}
          />
        ) : (
          <UploadForm
            uploadMethod={uploadMethod}
            metadataURL={metadataURL}
            ipfsImageURL={ipfsImageURL}
            name={name}
            description={description}
            file={file}
            preview={preview}
            ipfsError={ipfsError}
            metaError={metaError}
            isLoading={isLoading}
            onChange={handleFieldChange}
            onFileChange={handleFileChange}
            onUpload={handleUpload}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
}
