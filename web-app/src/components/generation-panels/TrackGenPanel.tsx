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
  "Driving rock anthem",
  "Summer beach vibe",
];

const musicStyles = [
  "Industrial rave",
  "Heavy bass",
  "Orchestral",
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

  // Audio duration slider TSX
  const durationSlider = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Duration</label>
        <span className="text-muted-foreground text-sm tabular-nums">
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

  // Advanced options (Variation Key / seed) TSX
  const advancedOptions = (idSuffix: string) => (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced((prev) => !prev)}
        className="text-xs"
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
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`variation-key-${idSuffix}`}
            className="text-sm font-medium"
          >
            Variation Key
          </label>

          <p className="text-muted-foreground text-xs">
            Enter any number to reproduce the exact same result. Leave blank for
            a random generation.
          </p>

          <Input
            id={`variation-key-${idSuffix}`}
            type="number"
            value={seed}
            onChange={(e) =>
              setSeed(e.target.value === "" ? "" : parseInt(e.target.value, 10))
            }
            step={1}
            placeholder="e.g. 42"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-muted/30 flex w-full flex-col lg:h-full lg:w-80 lg:border-r">
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
            <div className="flex flex-col gap-3">
              <label htmlFor="vibe" className="text-sm font-medium">
                Describe the vibe of your song
              </label>

              <Textarea
                id="vibe"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="placeholder:text-muted-foreground/70 min-h-30 resize-none"
                placeholder="A dreamy lo-fi hip-hop song, perfect for studying or relaxing..."
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode("custom")}
                className="text-sm"
              >
                <Plus className="size-4" />
                Lyrics
              </Button>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="instrumental-simple"
                  className="text-sm font-medium"
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

            {/* Inspiration chips */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Inspirations</p>

              <div className="w-full overflow-x-auto whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  {inspirations.map((inspiration) => (
                    <Button
                      key={inspiration}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInspirationChipClick(inspiration)}
                      className="text-sm"
                    >
                      <Plus className="size-4" />
                      {inspiration}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration slider */}
            {durationSlider}

            {/* Advanced options — variation key */}
            {advancedOptions("simple")}
          </TabsContent>

          {/* ─── Custom mode ──────────────────────────────────────────────── */}
          <TabsContent value="custom">
            <div className="mt-6 flex flex-col gap-5">
              {/* Vibe description — same field, re-used across modes */}
              <div className="flex flex-col gap-3">
                <label htmlFor="custom-desc" className="text-sm font-medium">
                  Describe the vibe of your song
                </label>

                <Textarea
                  id="custom-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="placeholder:text-muted-foreground/70 min-h-20 resize-none"
                  placeholder="A dreamy lo-fi hip-hop song, perfect for studying or relaxing..."
                />
              </div>

              {/* Lyrics section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="custom-lyrics"
                    className="text-sm font-medium"
                  >
                    Lyrics
                  </label>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant={
                        customModeType === "auto" ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() => {
                        setCustomModeType("auto");
                        setLyrics("");
                      }}
                      className="text-sm"
                    >
                      Auto
                    </Button>

                    <Button
                      type="button"
                      variant={
                        customModeType === "manual" ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() => {
                        setCustomModeType("manual");
                        setLyrics("");
                      }}
                      className="text-sm"
                    >
                      Manual
                    </Button>
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
                  className="placeholder:text-muted-foreground/70 min-h-30 resize-none"
                />
              </div>

              {/* Instrumental toggle */}
              <div className="flex items-center justify-end gap-2">
                <label
                  htmlFor="instrumental-custom"
                  className="text-sm font-medium"
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
              <div className="flex flex-col gap-3">
                <label htmlFor="genres" className="text-sm font-medium">
                  Genres
                </label>

                <Textarea
                  id="genres"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="Pop, Rock, Hip-Hop, Jazz, Classical, R&B, Country, EDM..."
                  className="placeholder:text-muted-foreground/70 min-h-20 resize-none"
                />

                <div className="w-full overflow-x-auto whitespace-nowrap">
                  <div className="flex items-center gap-2 pb-2">
                    {musicStyles.map((style) => (
                      <Button
                        key={style}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStyleChipClick(style)}
                        className="text-sm"
                      >
                        <Plus className="size-4" />
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duration slider */}
              {durationSlider}

              {/* Advanced options — variation key */}
              {advancedOptions("custom")}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Footer: Generate button ──────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-t p-4">
        <Button
          type="button"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full font-medium"
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

        {/* Credit cost hint */}
        <p className="text-muted-foreground text-center text-xs">
          Each generation costs <span className="font-semibold">2 credits</span>
        </p>

        {error && (
          <p className="text-destructive text-center text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}

export default TrackGenPanel;
