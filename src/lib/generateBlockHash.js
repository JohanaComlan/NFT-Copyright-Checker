import blockhash from "blockhash-core";

// 加载远程图片并返回 ImageData（用于 blockhash）
async function loadImageData(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // 避免 CORS 错误
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// 计算 blockhash（返回 hex 格式）
export async function generateBlockHash(imageUrl) {
  const imageData = await loadImageData(imageUrl);
  const hash = blockhash.bmvbhash(imageData, 16); // 16x16 blocks = 256-bit hash
  return hash;
}
