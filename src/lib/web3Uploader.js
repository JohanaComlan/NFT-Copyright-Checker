'use client'

import { getClient } from './w3client'

export async function uploadToWeb3Storage(file, name, description) {
  const client = await getClient()

  // 上传图片
  const imageCID = await client.uploadFile(file)
  const imageURL = `ipfs://${imageCID}`

  // 构建 metadata
  const metadata = {
    name,
    description,
    image: imageURL
  }

  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' })

  // 上传 metadata 文件
  const metadataCID = await client.uploadFile(metadataFile)
  return `ipfs://${metadataCID}`
}


export async function uploadWithIPFSImageURL(ipfsImageURL, name, description) {
  const client = await getClient()

  if (!/^ipfs:\/\/[a-zA-Z0-9]+$/.test(ipfsImageURL)) {
    throw new Error("Invalid IPFS URL format. It should start with ipfs:// and follow with a CID.")
  }

  const metadata = {
    name,
    description,
    image: ipfsImageURL,
  }

  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' })

  const metadataCID = await client.uploadFile(metadataFile)
  return `ipfs://${metadataCID}`
}
