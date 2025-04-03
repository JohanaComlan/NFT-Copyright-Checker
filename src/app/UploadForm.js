export default function UploadForm({
    uploadMethod,
    metadataURL,
    ipfsImageURL,
    name,
    description,
    file,
    preview,
    ipfsError,
    metaError,
    isLoading,
    onChange,
    onFileChange,
    onUpload,
    onCancel
  }) {
    return (
      <div className="text-left">、
        {/* 标题 */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        🎨 Mint Your NFT
        </h2>
        {/* Upload method selection */}
        <label className="block mb-2 text-xl font-bold text-gray-700">Choose Method:</label>
        <select
          value={uploadMethod}
          onChange={(e) => onChange("uploadMethod", e.target.value)}
          disabled={isLoading}
          className="border border-gray-300 mb-6 p-2 rounded-lg shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer"
        >
          <option value="metadata">🌐 I already have Metadata URL</option>
          <option value="ipfs">🧬 I have IPFS Image URL</option>
          <option value="upload">🖼️ Upload Local Image</option>
        </select>
  
        {/* Metadata mode */}
        {uploadMethod === "metadata" && (
          <>
            <p className="text-xl font-bold text-gray-600 mb-1">Metadata URL</p>
            <input
              type="text"
              value={metadataURL}
              disabled={isLoading}
              onChange={(e) => onChange("metadataURL", e.target.value)}
              placeholder="e.g. ipfs://baf..."
              className="border w-full border-gray-300 p-2 rounded-lg mb-6"
            />
            {metaError && <p className="text-red-500 mb-4">{metaError}</p>}
          </>
        )}
  
        {/* IPFS image mode */}
        {uploadMethod === "ipfs" && (
          <>
            <p className="text-xl font-bold text-gray-600 mb-1">Image IPFS URL</p>
            <input
              type="text"
              value={ipfsImageURL}
              disabled={isLoading}
              onChange={(e) => onChange("ipfsImageURL", e.target.value)}
              placeholder="e.g. ipfs://baf..."
              className="border w-full border-gray-300 p-2 rounded-lg mb-6"
            />
            {ipfsError && <p className="text-red-500 mb-4">{ipfsError}</p>}
  
            <p className="text-xl font-bold text-gray-600 mb-1">NFT Name</p>
            <input
              type="text"
              value={name}
              disabled={isLoading}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. Cool Cat #123"
              className="border w-full border-gray-300 p-2 rounded-lg mb-6"
            />
  
            <p className="text-xl font-bold text-gray-600 mb-1">NFT Description</p>
            <textarea
              value={description}
              disabled={isLoading}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="e.g. This is a rare Cool Cat NFT..."
              className="border w-full border-gray-300 p-2 rounded-lg mb-6"
            />
          </>
        )}
  
        {/* Local upload mode */}
        {uploadMethod === "upload" && (
          <>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mb-4 rounded-md max-h-40 border object-contain"
              />
            )}
  
            <p className="text-xl font-bold text-gray-600 mb-1">Select Image</p>
            <label className="cursor-pointer inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium text-gray-700 mb-4">
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                disabled={isLoading}
              />
            </label>
  
            <p className="text-xl font-bold text-gray-600 mb-1">NFT Name</p>
            <input
              type="text"
              value={name}
              disabled={isLoading}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. CryptoKitty #567"
              className="border w-full border-gray-300 p-2 rounded-lg mb-6"
            />
  
            <p className="text-xl font-bold text-gray-600 mb-1">NFT Description</p>
            <textarea
              value={description}
              disabled={isLoading}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="e.g. A cute kitty with rare traits."
              className="border w-full border-gray-300 p-2 rounded-lg mb-6"
            />
          </>
        )}
  
        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded ${isLoading
              ? "bg-blue-200 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Processing..." : "Mint"}
          </button>
        </div>
  
        {isLoading && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Processing, may take about 1 minute...
          </p>
        )}
      </div>
    );
  }
  