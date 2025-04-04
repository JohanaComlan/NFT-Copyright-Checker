import clientPromise from "@/lib/mongodb";

// 海明距离计算：用 BigInt 异或统计二进制位差异
function hammingDistanceBigInt(ph1, ph2) {
  const a = BigInt("0x" + ph1);
  const b = BigInt("0x" + ph2);
  let x = a ^ b;
  let dist = 0n;
  while (x) {
    dist += x & 1n;
    x >>= 1n;
  }
  return Number(dist);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { phash, contract, tokenId, owner } = body;

    // 字段检查
    if (!phash || !contract || !tokenId || !owner) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields"
      }), { status: 400 });
    }

    // 连接数据库
    const client = await clientPromise;
    const db = client.db("nft_verification");
    const collection = db.collection("images");

    // 读取所有记录（包含 timestamp）
    const docs = await collection.find({}).toArray();
    const threshold = 10;

    // 如果数据库为空，直接插入并返回
    if (docs.length === 0) {
      await collection.insertOne({
        contract,
        tokenId,
        owner,
        phash,
        timestamp: new Date()
      });

      return new Response(JSON.stringify({
        success: true,
        matched: false,
        message: "First record inserted"
      }), { status: 200 });
    }

    // 查找第一个相似度小于等于阈值的匹配图
    const match = docs.find(doc => hammingDistanceBigInt(doc.phash, phash) <= threshold);

    if (match) {
      return new Response(JSON.stringify({
        success: true,
        matched: true,
        match: {
          contract: match.contract,
          tokenId: match.tokenId,
          owner: match.owner,
          timestamp: match.timestamp,
          distance: hammingDistanceBigInt(match.phash, phash),
        }
      }), { status: 200 });
    }

    // 没有匹配, 插入新记录
    await collection.insertOne({
      contract,
      tokenId,
      owner,
      phash,
      timestamp: new Date()
    });

    return new Response(JSON.stringify({
      success: true,
      matched: false,
      message: "New image inserted"
    }), { status: 200 });

  } catch (err) {
    console.error("❌ Error in /api/verify-image:", err);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), { status: 500 });
  }
}
