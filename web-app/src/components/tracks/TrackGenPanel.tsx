"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import {
  Loader2,
  Plus,
  Sparkles,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Switch } from "../ui/switch";
import { formatTime } from "~/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

type GenerationMode = "simple" | "custom";
type CustomMode = "auto" | "manual";

interface GenerateErrorResponse {
  error: string | Record<string, unknown>;
}

// Match the Zod schema in /api/generate/route.ts
const DURATION_MIN = 15;
const DURATION_MAX = 180;
const DURATION_DEFAULT = 60;

const inspirations = [
  "80s synth-pop",
  "Acoustic ballad",
  "Epic movie score",
  "Lo-fi hip-hop",
  "Ghazal lo-fi",
  "Sufi rock anthem",
  "Bollywood romantic",
  "Driving rock anthem",
  "Summer beach vibe",
];

const musicStyles = [
  "Industrial rave",
  "Heavy bass",
  "Orchestral",
  "Desi hip-hop",
  "Sitar ambient",
  "Tabla beats",
  "Qawwali vocals",
  "Electronic beats",
  "Funky guitar",
  "Soulful vocals",
  "Ambient pads",
];

function TrackGenPanel() {
  const [mode, setMode] = useState<GenerationMode>("simple");
  const [customModeType, setCustomModeType] = useState<CustomMode>("manual");
  const [description, setDescription] = useState("");
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [genres, setGenres] = useState("");
  const [audioDuration, setAudioDuration] = useState(DURATION_DEFAULT);
  const [seed, setSeed] = useState<number | "">("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleInspirationChipClick = (inspiration: string) => {
    const parts = description
      .split(", ")
      .map((w) => w.trim())
      .filter(Boolean);

    if (parts.includes(inspiration)) return;

    setDescription(
      description.trim() ? `${description}, ${inspiration}` : inspiration,
    );
  };

  const handleStyleChipClick = (style: string) => {
    const parts = genres
      .split(", ")
      .map((w) => w.trim())
      .filter(Boolean);

    if (parts.includes(style)) return;

    setGenres(genres.trim() ? `${genres}, ${style}` : style);
  };

  const handleInstrumentalToggle = () => {
    const next = !isInstrumental;
    setIsInstrumental(next);

    if (next && mode === "custom" && customModeType === "manual") {
      toast.info("Lyrics will be ignored during generation.");
    }
  };

  const buildDescription = (): string => {
    if (mode === "custom" && genres.trim()) {
      return `${description.trim()}. Style: ${genres.trim()}`;
    }

    return description.trim();
  };

  const getApiMode = (): "simple" | "custom-auto" | "custom-manual" => {
    if (mode === "simple") return "simple";

    return customModeType === "auto" ? "custom-auto" : "custom-manual";
  };

  const handleGenerate = async () => {
    setError("");

    if (!description.trim()) {
      setError("Please describe the vibe of your song first.");
      return;
    }

    if (
      mode === "custom" &&
      customModeType === "manual" &&
      !isInstrumental &&
      !lyrics.trim()
    ) {
      setError(
        "Please enter your lyrics, switch to Auto, or enable Instrumental.",
      );
      return;
    }

    setIsGenerating(true);

    try {
      const apiMode = getApiMode();

      const body: Record<string, unknown> = {
        mode: apiMode,
        description: buildDescription(),
        isInstrumental,
        audioDuration,
        seed: seed === "" ? -1 : seed,
        ...(apiMode === "custom-manual" && { lyrics }),
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json()) as GenerateErrorResponse;
        const msg =
          typeof data.error === "string"
            ? data.error
            : "Generation failed. Please try again.";
        throw new Error(msg);
      }

      // After a successful generate, calling router.refresh() so that the
      // TracksFetcher server component re-runs immediately and shows
      // the new "queued" song. The polling useEffect in Tracks.tsx
      // then picks it up automatically.
      router.refresh();

      setDescription("");
      setLyrics("");
      setGenres("");
      setIsInstrumental(false);
      setAudioDuration(DURATION_DEFAULT);
      setSeed("");
      toast.success("Your track is being generated!", {
        description: "We'll update you when it's ready.",
      });
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Something went wrong!";
      setError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Shared sub-components ────────────────────────────────────────────────

  const durationSlider = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Duration</label>
        <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs tabular-nums">
          {formatTime(audioDuration)}
        </span>
      </div>

      <Slider
        min={DURATION_MIN}
        max={DURATION_MAX}
        step={15}
        value={[audioDuration]}
        onValueChange={([val]) => setAudioDuration(val ?? DURATION_DEFAULT)}
      />
    </div>
  );

  const advancedOptions = (idSuffix: string) => (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced((prev) => !prev)}
        className="text-muted-foreground hover:text-foreground w-fit text-xs"
      >
        <Settings2 className="size-3" />
        Advanced options
        {showAdvanced ? (
          <ChevronUp className="size-3" />
        ) : (
          <ChevronDown className="size-3" />
        )}
      </Button>

      {showAdvanced && (
        <div className="bg-muted/40 border-border flex flex-col gap-3 rounded-lg border p-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`variation-key-${idSuffix}`}
              className="text-sm font-medium"
            >
              Variation Key
            </label>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Enter any number to reproduce the exact same result. Leave blank
              for a random generation.
            </p>

            <Input
              id={`variation-key-${idSuffix}`}
              type="number"
              value={seed}
              onChange={(e) =>
                setSeed(
                  e.target.value === "" ? "" : parseInt(e.target.value, 10),
                )
              }
              step={1}
              placeholder="e.g. 42"
            />
          </div>
        </div>
      )}
    </div>
  );

  // ── Chip row helper ──────────────────────────────────────────────────────
  const chipRow = (items: string[], onClick: (item: string) => void) => (
    <div className="w-full overflow-x-auto whitespace-nowrap">
      <div className="flex gap-1.5 pb-2">
        {items.map((item) => (
          <Button
            key={item}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onClick(item)}
            className="text-muted-foreground hover:text-foreground border-border/70 h-7 shrink-0 rounded-full px-2.5 text-xs"
          >
            <Plus className="size-3" />
            {item}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-muted/20 flex w-full flex-col lg:h-full lg:w-80 lg:border-r">
      {/* ── Scrollable form area ──────────────────────────────────────────── */}
      <div className="overflow-y-auto p-4 lg:flex-1">
        <Tabs
          defaultValue="simple"
          value={mode}
          onValueChange={(value) => setMode(value as GenerationMode)}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger type="button" value="simple">
              Simple
            </TabsTrigger>

            <TabsTrigger type="button" value="custom">
              Custom
            </TabsTrigger>
          </TabsList>

          {/* ─── Simple mode ─────────────────────────────────────────────── */}
          <TabsContent value="simple" className="mt-6 space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="vibe" className="text-sm font-medium">
                Describe the vibe
              </label>

              <Textarea
                id="vibe"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="placeholder:text-muted-foreground/60 min-h-28 resize-none text-sm"
                placeholder="A dreamy lo-fi hip-hop song, perfect for studying or relaxing..."
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode("custom")}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <Plus className="size-3.5" />
                Add lyrics
              </Button>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="instrumental-simple"
                  className="text-muted-foreground text-xs font-medium"
                >
                  Instrumental
                </label>

                <Switch
                  id="instrumental-simple"
                  checked={isInstrumental}
                  onCheckedChange={handleInstrumentalToggle}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                Inspirations
              </p>

              {chipRow(inspirations, handleInspirationChipClick)}
            </div>

            {durationSlider}

            {advancedOptions("simple")}
          </TabsContent>

          {/* ─── Custom mode ──────────────────────────────────────────────── */}
          <TabsContent value="custom">
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="custom-desc" className="text-sm font-medium">
                  Describe the vibe
                </label>

                <Textarea
                  id="custom-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="placeholder:text-muted-foreground/60 min-h-20 resize-none text-sm"
                  placeholder="A dreamy lo-fi hip-hop song, perfect for studying or relaxing..."
                />
              </div>

              {/* Lyrics section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="custom-lyrics"
                    className="text-sm font-medium"
                  >
                    Lyrics
                  </label>

                  {/* Auto / Manual toggle pills */}
                  <div className="bg-muted flex items-center gap-0.5 rounded-md p-0.5">
                    {(["auto", "manual"] as CustomMode[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setCustomModeType(type);
                          setLyrics("");
                        }}
                        className={cn(
                          "focus-visible:ring-ring focus-visible:ring-offset-muted rounded px-2.5 py-0.5 text-xs font-medium capitalize transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
                          customModeType === type
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  id="custom-lyrics"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  disabled={customModeType === "manual" && isInstrumental}
                  placeholder={
                    customModeType === "manual"
                      ? isInstrumental
                        ? "Lyrics are disabled in instrumental mode"
                        : "Craft your own lyrics..."
                      : "Describe your lyrics, e.g., a sad song about lost love"
                  }
                  className="placeholder:text-muted-foreground/60 min-h-28 resize-none text-sm"
                />
              </div>

              {/* Instrumental toggle */}
              <div className="flex items-center justify-end gap-2">
                <label
                  htmlFor="instrumental-custom"
                  className="text-muted-foreground text-xs font-medium"
                >
                  Instrumental
                </label>

                <Switch
                  id="instrumental-custom"
                  checked={isInstrumental}
                  onCheckedChange={handleInstrumentalToggle}
                />
              </div>

              {/* Genres */}
              <div className="flex flex-col gap-2">
                <label htmlFor="genres" className="text-sm font-medium">
                  Genres
                </label>

                <Textarea
                  id="genres"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="Pop, Rock, Hip-Hop, Jazz, Classical, R&B..."
                  className="placeholder:text-muted-foreground/60 min-h-16 resize-none text-sm"
                />

                {chipRow(musicStyles, handleStyleChipClick)}
              </div>

              {durationSlider}

              {advancedOptions("custom")}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Sticky footer: Generate button ──────────────────────────────── */}
      <div className="border-t p-4">
        <Button
          type="button"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            "w-full font-semibold",
            "from-primary via-primary/90 to-accent bg-linear-to-r",
            "text-primary-foreground",
            "shadow-sm",
            "transition-all duration-200",
            "hover:shadow-primary/25 hover:shadow-md hover:brightness-110",
            "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            "active:scale-[0.98]",
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate
              <Sparkles className="size-4" />
            </>
          )}
        </Button>

        <p className="text-muted-foreground mt-2 text-center text-xs">
          Each generation costs{" "}
          <span className="text-foreground font-semibold">2 credits</span>
        </p>

        {error && (
          <p className="text-destructive mt-2 text-center text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}

export default TrackGenPanel;
