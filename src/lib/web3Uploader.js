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

export async function uploadWithIPFSImageURL(ipfsImageURL, name, description) {
  const res = await fetch('/api/create-metadata-from-ipfs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ipfsImageURL, name, description }),
  })

  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error || 'Upload failed')
  }

  const { metadataURL } = await res.json()
  return metadataURL
}
