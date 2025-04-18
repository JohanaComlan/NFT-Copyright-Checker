# NFT Copyright Checker

A decentralized copyright verification platform for NFTs, built on Ethereum and IPFS. This system allows users to upload digital works, mint them as NFTs, and verify originality using perceptual hashing and blockchain records.


## Live Demo

URL: https://nft-copyright-checker.vercel.app/

> Note: While the system has been tested extensively on Windows, some functions (such as file uploads or MetaMask signature requests) may behave inconsistently on macOS or other operating systems due to differences in SSL/HTTPS certificate enforcement across browsers.



## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/nft-copyright-checker.git
cd nft-copyright-checker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory and define the following variables:

```env
NEXT_PUBLIC_METAMASK_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_W3_PROOF=your_web3storage_proof
NEXT_PUBLIC_W3_KEY=your_web3storage_api_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
MONGODB_URI=your_mongodb_atlas_uri
```

#### Reference links for setup:
- MetaMask Private Key: https://metamask.io/
- Web3.Storage Keys: https://docs.storacha.network/how-to/upload/
- Alchemy API Key: https://www.alchemy.com/support/how-to-create-a-new-alchemy-api-key
- MongoDB URI: https://www.mongodb.com/it-it/cloud/atlas/register

> Important: Do not commit your `.env.local` file or expose private keys in public repositories.



### 4. Run the project locally

```bash
npm run dev
```

The application will be available at http://localhost:3000


## Project Structure

The project is built using the Next.js framework and follows a modular file structure. Below is a high-level overview of key directories and files:

### `src/app`
Contains all frontend pages, components, and API routes:
- `/api/` – API endpoints for image upload, verification, metadata generation, and DB access
  - `/upload-image/` – Handles image uploads to Web3.Storage
  - `/verify-image/` – Performs hash computation and duplicate detection
  - `/verified-info/` – Retrieves existing verification info from MongoDB
  - `/create-metadata-from-ipfs/` – (Optional) Generates and uploads metadata JSON to IPFS
- Frontend components:
  - `NFTCard.js`, `UploadForm.js`, `VerificationInfoPopUp.js` – Main UI modules
  - `UploadNFT.js`, `MintSuccess.js`, `VerifyPage.js` – Page-level views
  - `globals.css` – Global styling

### `src/lib`
Includes utility logic and helper functions:
- `web3Uploader.js` – Handles Web3.Storage upload logic
- `verifyNFT.js`, `checkNFTInDatabase.js`, `handleVerification.js` – Verification logic
- `useMintNFT.js` – Frontend hook to interact with the minting contract
- `generateBlockHash.js`, `updateAllSHA256Hashes.js` – Cryptographic utilities
- `mongodb.js` – MongoDB connection and access
- `/abi/`, `/contract/` – Store deployed contract addresses and ABI files (not source code)

### Root files
- `next.config.mjs`, `package.json` – Next.js configuration and dependencies
- `.env.local` – Environment variables (not included in repo)
- `README.md` – This documentation file

This structure ensures separation of concerns between frontend views, backend APIs, and blockchain integration logic, making the codebase more maintainable and extensible.

> Note:This repository contains the frontend and API routes used in deployment. For full architectural details, smart contract logic, image hashing algorithms, and verification design, please refer to the accompanying project report.

