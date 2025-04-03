import { NextResponse } from 'next/server'
import { getClient } from '../lib/w3client'

export async function POST(req) {
  const { ipfsImageURL, name, description } = await req.json()

  if (!ipfsImageURL || !name || !description) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (!ipfsImageURL.startsWith('ipfs://')) {
    return NextResponse.json({ error: 'Invalid IPFS URL format' }, { status: 400 })
  }  

  try {
    const client = await getClient()

    const metadata = {
      name,
      description,
      image: ipfsImageURL,
    }

    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    const metadataFile = new File([blob], 'metadata.json', { type: 'application/json' })

    const metadataCID = await client.uploadFile(metadataFile)

    return NextResponse.json({ metadataURL: `ipfs://${metadataCID}` })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
