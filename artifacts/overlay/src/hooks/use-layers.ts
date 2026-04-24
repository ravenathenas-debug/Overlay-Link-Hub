import { useState, useEffect } from "react";
const nanoid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export type Layer = {
  id: string;
  url: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
};

const STORAGE_KEY = "stack-overlay:layers";

export function useLayers() {
  const [layers, setLayers] = useState<Layer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored layers", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
  }, [layers]);

  const addLayer = (url: string, label: string) => {
    setLayers((prev) => [
      ...prev,
      {
        id: nanoid(),
        url,
        label,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        visible: true,
      },
    ]);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.map(l => l).filter((layer) => layer.id !== id));
  };

  const moveLayerUp = (index: number) => {
    if (index === 0) return;
    setLayers((prev) => {
      const newLayers = [...prev];
      const temp = newLayers[index - 1];
      newLayers[index - 1] = newLayers[index];
      newLayers[index] = temp;
      return newLayers;
    });
  };

  const moveLayerDown = (index: number) => {
    if (index === layers.length - 1) return;
    setLayers((prev) => {
      const newLayers = [...prev];
      const temp = newLayers[index + 1];
      newLayers[index + 1] = newLayers[index];
      newLayers[index] = temp;
      return newLayers;
    });
  };

  return {
    layers,
    addLayer,
    updateLayer,
    removeLayer,
    moveLayerUp,
    moveLayerDown,
  };
}
