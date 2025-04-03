import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  const client = await clientPromise;
  const db = client.db("nft_verification");  // 对应你前面创建的 DB 名
  const collections = await db.listCollections().toArray();

  return Response.json({ collections });
}
