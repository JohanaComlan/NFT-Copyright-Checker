import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CopyableText({ shortText, fullText }) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <span
      onClick={handleCopy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer hover:bg-gray-100 transition"
      title={copied ? "Copied!" : "Click to copy"}
    >
      <span className="text-gray-700 break-all">{shortText}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-500 hover:text-gray-800" />
      )}
    </span>
  );
}
