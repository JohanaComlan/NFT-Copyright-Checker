// /src/app/api/update-sha256/route.js
// 仅用于测试，已弃用
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { contract, tokenId, sha256 } = await req.json();

    if (!contract || !tokenId || !sha256) {
      return Response.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nft_verification");
    const collection = db.collection("images");

    const result = await collection.updateOne(
      { contract, tokenId },
      { $set: { sha256 } }
    );

    if (result.modifiedCount === 0) {
      return Response.json({ success: false, error: "Record not found or not updated" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ Error in /api/update-sha256:", err);
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
