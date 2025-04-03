export async function GET(request){
    return new Response(JSON.stringify({ msg: "Hello" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
}