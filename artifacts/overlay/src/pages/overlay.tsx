import { useEffect, useState } from "react";
import LZString from "lz-string";
import { useLocation } from "wouter";
import { Layer } from "@/hooks/use-layers";

export default function OverlayPage() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("overlay-mode");
    document.body.classList.add("overlay-mode");
    return () => {
      document.documentElement.classList.remove("overlay-mode");
      document.body.classList.remove("overlay-mode");
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const compressed = searchParams.get("c");
    
    if (!compressed) {
      setError("No configuration found. Generate a URL from Stack Overlay.");
      return;
    }

    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
      if (!decompressed) throw new Error("Invalid format");
      const parsed = JSON.parse(decompressed) as Layer[];
      setLayers(parsed);
    } catch (err) {
      setError("Failed to parse configuration.");
      console.error(err);
    }
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-white/50 text-sm font-mono pointer-events-none">
        {error}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {layers.filter(l => l.visible).map((layer) => (
        <iframe
          key={layer.id}
          src={layer.url}
          className="absolute border-none pointer-events-none"
          style={{
            left: `${layer.x}%`,
            top: `${layer.y}%`,
            width: `${layer.width}%`,
            height: `${layer.height}%`,
            background: "transparent",
          }}
          allow="autoplay"
          allowTransparency
        />
      ))}
    </div>
  );
}
