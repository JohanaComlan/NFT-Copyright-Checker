'use client'

export async function uploadToWeb3Storage(file, name, description) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', name)
  formData.append('description', description)

  const res = await fetch('/api/upload-to-web3', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error || 'Upload failed')
  }

  const { metadataURL } = await res.json()
  return metadataURL
}

// export async function uploadWithIPFSImageURL(ipfsImageURL, name, description) {
//   const res = await fetch('/api/create-metadata-from-ipfs', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ ipfsImageURL, name, description }),
//   })

//   if (!res.ok) {
//     const { error } = await res.json()
//     throw new Error(error || 'Upload failed')
//   }

//   const { metadataURL } = await res.json()
//   return metadataURL
// }

export async function uploadWithIPFSImageURL(ipfsImageURL, name, description) {
  // 1. 构造 metadata 对象
  const metadata = {
    name,
    description,
    image: ipfsImageURL,
  }

  // 2. 转为 JSON Blob → File（必须带 filename 才能上传）
  const metadataBlob = new Blob([JSON.stringify(metadata)], {
    type: 'application/json',
  })

  const metadataFile = new File([metadataBlob], 'metadata.json', {
    type: 'application/json',
  })

  // 3. 上传
  const { getClient } = await import('@/app/api/lib/w3client')
  const client = await getClient()
  const cid = await client.uploadFile(metadataFile)

  return `ipfs://${cid.toString()}`
}

// export async function uploadImageToIPFS(file) {
//   const formData = new FormData()
//   formData.append('file', file)

//   const res = await fetch('/api/upload-image', {
//     method: 'POST',
//     body: formData,
//   })

//   const text = await res.text()

//   try {
//     const json = JSON.parse(text)
//     if (!res.ok) throw new Error(json.error || 'Image upload failed')
//     if (!json.imageCID || typeof json.imageCID !== 'string') {
//       throw new Error('Invalid image CID')
//     }
//     return json.imageCID
//   } catch (e) {
//     throw new Error(`Upload failed: ${text.slice(0, 100)}...`)
//   }
// }

export async function uploadImageToIPFS(file) {
  if (!file) throw new Error("No file provided")

  // 动态引入 w3client（避免构建打包进前端）
  const { getClient } = await import('@/app/api/lib/w3client')
  const client = await getClient()

  const cid = await client.uploadFile(file)

  const imageCID = cid.toString?.() || cid['/'] || cid
  if (!imageCID || typeof imageCID !== 'string') {
    throw new Error('Invalid image CID')
  }

  return imageCID
}
