// src/app/api/upload-image/route.js
import { NextResponse } from 'next/server'
import { getClient } from '../lib/w3client'

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  console.log('[API] file =', file)
  console.log('[API] file name =', file?.name)


  try {
    const client = await getClient()
    const cid = await client.uploadFile(file)
    console.log('[API] uploaded CID:', cid)

    const imageCID = cid.toString?.() || cid["/"] || String(cid)
    console.log('[API] return imageCID:', cid)
    return NextResponse.json({ imageCID })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
