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


## Notes

This repository contains the frontend and API routes used in deployment. For full architectural details, smart contract logic, image hashing algorithms, and verification design, please refer to the accompanying project report.

---

## License

MIT License
```
