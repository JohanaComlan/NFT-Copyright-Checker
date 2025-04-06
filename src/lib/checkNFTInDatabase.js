import { generateBlockHash } from "@/lib/generateBlockHash";

export async function checkNFTInDatabase({ imageUrl, contract, tokenId, owner }) {
  try {
    const phash = await generateBlockHash(imageUrl);

    // 计算 SHA256
    const resImage = await fetch(imageUrl);
    const buffer = await resImage.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const sha256 =
      "0x" +
      [...new Uint8Array(hashBuffer)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    // 发给后端
    const res = await fetch("/api/verify-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contract, tokenId, owner, phash, sha256 }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("checkNFTInDatabase Error:", err);
    return { success: false };
  }
}


// 之后配合服务器可用
// /**
//  * 从远程 URL 加载图片并转为 ImageBitmap
//  */
// async function loadImageFromUrl(imageUrl) {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.crossOrigin = "anonymous"; 
//       img.src = imageUrl;
//       img.onload = () => resolve(img);
//       img.onerror = () => reject(new Error("❌ Unable to load image (maybe cross-domain)"));
//     });
//   }
  
//   /**
//    * 压缩远程图片为 128x128，并转为 JPEG Blob
//    */
//   async function compressImageFromUrl(imageUrl) {
//     const img = await loadImageFromUrl(imageUrl);
//     const canvas = document.createElement("canvas");
//     canvas.width = 128;
//     canvas.height = 128;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(img, 0, 0, 128, 128);
  
//     return new Promise((resolve) => {
//       canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
//     });
//   }
  
//   /**
//    * 上传图片 Blob 到后端，获取经典 pHash
//    */
//   async function getPhashFromBackend({ imageBlob, contract, tokenId, owner }) {
//     const formData = new FormData();
//     formData.append("image", imageBlob, "compressed.jpg");
//     formData.append("contract", contract);
//     formData.append("tokenId", tokenId);
//     formData.append("owner", owner);
  
//     const res = await fetch("/api/phash", {
//       method: "POST",
//       body: formData,
//     });
  
//     const data = await res.json();

//     // ⬇️ 先用 text 拿原始内容，不管是不是 JSON
//     const raw = await res.text();
//     console.log("🔍 raw response from /api/phash:", raw);

//     try {
//     const data = JSON.parse(raw); // 尝试解析成 JSON
//     return data;
//     } catch (err) {
//     console.error("❌ phash response is not JSON:", err);
//     return { success: false, error: "Invalid JSON response", raw };
//     }
//     // if (!data.success) throw new Error(data.error || "Server pHash calculation failed");
//     // return data.phash;
//   }
  
//   /**
//    * 用 pHash 向数据库发起查重验证
//    */
//   async function verifyPhashInDatabase({ contract, tokenId, owner, phash }) {
//     const res = await fetch("/api/verify-image", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ contract, tokenId, owner, phash }),
//     });
  
//     return await res.json();
//   }
  
//   /**
//    * 主函数：从远程图像 URL 加载、压缩、上传、验证
//    */
//   export async function checkNFTInDatabase({ imageUrl, contract, tokenId, owner }) {
//     try {
//       const imageBlob = await compressImageFromUrl(imageUrl);
//       const phash = await getPhashFromBackend({ imageBlob, contract, tokenId, owner });
//       const result = await verifyPhashInDatabase({ contract, tokenId, owner, phash });
//       return result;
//     } catch (err) {
//       console.error("❌ checkNFTInDatabase Error:", err);
//       return { success: false, error: err.message };
//     }
//   }
  