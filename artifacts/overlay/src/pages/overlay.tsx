import { useEffect, useState } from "react";
import LZString from "lz-string";
import { Layer } from "@/hooks/use-layers";

type OverlayConfig = {
  layers: Layer[];
  background?: string;
};

export default function OverlayPage() {
  const [config, setConfig] = useState<OverlayConfig>({ layers: [] });
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
      const parsed = JSON.parse(decompressed);
      // Backward compat: old links encoded just an array of layers.
      if (Array.isArray(parsed)) {
        setConfig({ layers: parsed as Layer[] });
      } else {
        setConfig({
          layers: (parsed.layers ?? []) as Layer[],
          background: typeof parsed.background === "string" ? parsed.background : undefined,
        });
      }
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
      {config.background && (
        <img
          src={config.background}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      {config.layers.filter((l) => l.visible).map((layer) => (
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
