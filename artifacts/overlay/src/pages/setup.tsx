import { useState, useMemo } from "react";
import { useLayers, Layer } from "@/hooks/use-layers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Trash2, Copy, Plus, ArrowUp, ArrowDown, ExternalLink, Settings2, LayoutTemplate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LZString from "lz-string";

export default function SetupPage() {
  const { layers, addLayer, updateLayer, removeLayer, moveLayerUp, moveLayerDown } = useLayers();
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const { toast } = useToast();

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  const isTikFinityUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.includes("tikfinity.com") || hostname.includes("tikfinitylinks.com");
    } catch {
      return false;
    }
  };

  const handleAddLayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newLabel) return;
    if (!isValidUrl(newUrl)) {
      toast({ title: "Invalid URL", description: "Please enter a valid HTTP/HTTPS URL.", variant: "destructive" });
      return;
    }
    
    addLayer(newUrl, newLabel);
    setNewUrl("");
    setNewLabel("");
  };

  const generatedUrl = useMemo(() => {
    if (layers.length === 0) return "";
    const payload = JSON.stringify(layers);
    const compressed = LZString.compressToEncodedURIComponent(payload);
    
    // Construct the absolute URL manually as per instructions
    const origin = window.location.origin;
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    return `${origin}${base}/overlay?c=${compressed}`;
  }, [layers]);

  const copyToClipboard = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast({ title: "Copied!", description: "Overlay URL copied to clipboard." });
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col md:flex-row">
      {/* Left Sidebar - Configuration */}
      <div className="w-full md:w-[450px] flex-shrink-0 border-r border-border bg-card/50 flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center text-primary">
              <LayoutTemplate size={18} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Stack Overlay</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Combine multiple TikFinity widgets into a single OBS browser source.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleAddLayer} className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
            <div>
              <Label htmlFor="url">Browser Source URL</Label>
              <Input
                id="url"
                placeholder="https://tikfinitylinks.com/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="mt-1.5"
              />
              {newUrl && !isTikFinityUrl(newUrl) && isValidUrl(newUrl) && (
                <p className="text-xs text-yellow-500 mt-1">Warning: URL does not appear to be a TikFinity link.</p>
              )}
            </div>
            <div>
              <Label htmlFor="label">Layer Name</Label>
              <Input
                id="label"
                placeholder="e.g. Gift Alerts"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full" disabled={!newUrl || !newLabel}>
              <Plus className="w-4 h-4 mr-2" /> Add Layer
            </Button>
          </form>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Settings2 size={18} /> Layers
            </h2>
            
            {layers.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground">
                <p className="text-sm">No layers added yet.</p>
                <p className="text-xs mt-2">Add your first layer above to start building your overlay.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {layers.map((layer, index) => (
                  <Card key={layer.id} className={`transition-opacity ${!layer.visible ? 'opacity-60' : ''}`}>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Switch
                          checked={layer.visible}
                          onCheckedChange={(checked) => updateLayer(layer.id, { visible: checked })}
                        />
                        <div className="truncate">
                          <CardTitle className="text-sm font-medium truncate">{layer.label}</CardTitle>
                          <CardDescription className="text-xs truncate">{new URL(layer.url).hostname}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveLayerUp(index)} disabled={index === 0}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveLayerDown(index)} disabled={index === layers.length - 1}>
                          <ArrowDown size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/90" onClick={() => {
                          if (confirm('Remove this layer?')) removeLayer(layer.id);
                        }}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="space-y-3 pt-2 border-t border-border/50">
                        <div className="grid grid-cols-[auto_1fr_40px] items-center gap-3">
                          <Label className="w-12 text-xs">X Pos</Label>
                          <Slider 
                            value={[layer.x]} 
                            max={100} 
                            step={1}
                            onValueChange={([val]) => updateLayer(layer.id, { x: val })}
                          />
                          <span className="text-xs text-right tabular-nums">{layer.x}%</span>
                        </div>
                        <div className="grid grid-cols-[auto_1fr_40px] items-center gap-3">
                          <Label className="w-12 text-xs">Y Pos</Label>
                          <Slider 
                            value={[layer.y]} 
                            max={100} 
                            step={1}
                            onValueChange={([val]) => updateLayer(layer.id, { y: val })}
                          />
                          <span className="text-xs text-right tabular-nums">{layer.y}%</span>
                        </div>
                        <div className="grid grid-cols-[auto_1fr_40px] items-center gap-3">
                          <Label className="w-12 text-xs">Width</Label>
                          <Slider 
                            value={[layer.width]} 
                            max={100} 
                            step={1}
                            onValueChange={([val]) => updateLayer(layer.id, { width: val })}
                          />
                          <span className="text-xs text-right tabular-nums">{layer.width}%</span>
                        </div>
                        <div className="grid grid-cols-[auto_1fr_40px] items-center gap-3">
                          <Label className="w-12 text-xs">Height</Label>
                          <Slider 
                            value={[layer.height]} 
                            max={100} 
                            step={1}
                            onValueChange={([val]) => updateLayer(layer.id, { height: val })}
                          />
                          <span className="text-xs text-right tabular-nums">{layer.height}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Output Panel at bottom of sidebar */}
        <div className="p-6 border-t border-border bg-card">
          <Label>Generated OBS Output URL</Label>
          <div className="flex mt-2 gap-2">
            <Input readOnly value={generatedUrl || "Add layers to generate URL"} className="font-mono text-xs" />
            <Button onClick={copyToClipboard} disabled={!generatedUrl} variant="secondary">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Copy this URL and add it as a <strong>Browser Source</strong> in OBS. Set width to 1920 and height to 1080.
          </p>
        </div>
      </div>

      {/* Right Content - Preview */}
      <div className="flex-1 bg-background flex items-center justify-center p-8 overflow-hidden relative">
        <div className="absolute inset-0 checkered-pattern opacity-50 z-0"></div>
        
        <div className="relative w-full max-w-5xl aspect-video bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10 ring-1 ring-white/5">
          {layers.filter(l => l.visible).map(layer => (
            <div
              key={layer.id}
              className="absolute border-2 border-primary/40 bg-primary/10 transition-all duration-200"
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                width: `${layer.width}%`,
                height: `${layer.height}%`,
              }}
            >
              <div className="absolute -top-6 left-[-2px] bg-primary/80 text-white text-[10px] px-2 py-0.5 rounded-t font-medium truncate max-w-full">
                {layer.label}
              </div>
              <iframe
                src={layer.url}
                className="w-full h-full pointer-events-none opacity-80"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ))}
          
          {layers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 font-medium">
              16:9 OBS Canvas Preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
