import { NextResponse } from 'next/server'
import { getClient } from '../lib/w3client'

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')
  const name = formData.get('name')
  const description = formData.get('description')

  if (!file || !name || !description) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const client = await getClient()

    const imageCID = await client.uploadFile(file)
    const imageURL = `ipfs://${imageCID}`

    const metadata = {
      name,
      description,
      image: imageURL,
    }

    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    const metadataFile = new File([blob], 'metadata.json', { type: 'application/json' })

    const metadataCID = await client.uploadFile(metadataFile)

    return NextResponse.json({ metadataURL: `ipfs://${metadataCID}` })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
