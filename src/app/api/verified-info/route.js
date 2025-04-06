import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { contract, tokenId } = body;

    if (!contract || !tokenId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing contract or tokenId"
      }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nft_verification");
    const collection = db.collection("images");

    const result = await collection.findOne({ contract, tokenId });

    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        error: "No record found"
      }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        owner: result.owner,
        contract: result.contract,
        tokenId: result.tokenId,
        sha256: result.sha256,
        timestamp: result.timestamp
      }
    }), { status: 200 });

  } catch (err) {
    console.error("❌ Error in /api/verified-info:", err);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), { status: 500 });
  }
}
