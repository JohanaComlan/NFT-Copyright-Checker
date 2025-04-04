import imghash from 'imghash';

export async function POST(req) {
  try {
    const formData = await req.formData();

    const imageBlob = formData.get("image");
    const contract = formData.get("contract");
    const tokenId = formData.get("tokenId");
    const owner = formData.get("owner");

    if (!imageBlob || typeof imageBlob === "string") {
      return Response.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await imageBlob.arrayBuffer());

    // Use imghash to calculate phash
    const hash = await imghash.hash(buffer, 8, 'phash'); // 8x8 = 64-bit hash

    return Response.json({
      success: true,
      phash: hash,
      contract,
      tokenId,
      owner,
    });
  } catch (err) {
    console.error("phash error:", err);
    return Response.json({ success: false, error: "Failed to calculate pHash" }, { status: 500 });
  }
}
