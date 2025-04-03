export default function MintSuccess({ tokenId, contractAddress, onMaybeLater, onGoVerify }) {
    return (
      <div className="text-center space-y-6 max-w-md mx-auto text-lg">
        <h2 className="text-4xl font-extrabold pt-16">
          🎉 Your NFT was minted successfully!
        </h2>
  
        <p className="text-gray-400 font-semibold">
          You can check it in your wallet, or view it directly on{" "}
          <a
            href={`https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 font-semibold"
          >
            OpenSea
          </a>.
        </p>
  
        <div className="flex justify-center gap-16 pt-2">
          <button
            className="border font-semibold px-5 py-2 text-base rounded-md border-green-500 text-green-500 bg-green-100/30 hover:border-green-600 hover:bg-green-100/50 hover:text-green-600"
            onClick={onMaybeLater}
          >
            Maybe Later
          </button>
          <button
            className="border font-semibold px-5 py-2 text-base rounded-md border-green-500 text-white bg-green-500 hover:border-green-600 hover:bg-green-600"
            onClick={onGoVerify}
          >
            Go Verify
          </button>
        </div>
      </div>
    );
  }
  