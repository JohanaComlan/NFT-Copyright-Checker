import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CopyableText({ shortText, fullText }) {
  const [copied, setCopied] = useState(false);

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
    <span className="inline-flex items-center gap-2 ml-1 flex-wrap break-all">
      <span>{shortText}</span>
      <button
        onClick={handleCopy}
        className="text-gray-500 hover:text-gray-800 transition"
        title="Copy"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </span>
  );
}
