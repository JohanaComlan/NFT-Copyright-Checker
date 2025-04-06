// /src/app/api/image-list/route.js
// 获取数据库中全部图片，目前没用到
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nft_verification");
    const collection = db.collection("images");

    const docs = await collection.find(
      { sha256: { $exists: false } },
      { projection: { contract: 1, tokenId: 1, imageUrl: 1 } }
    ).toArray();

    return Response.json({ success: true, data: docs });
  } catch (err) {
    console.error("❌ Error in /api/image-list:", err);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
