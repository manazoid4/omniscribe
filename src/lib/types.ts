export type JobStatus = "pending" | "transcribing" | "translating" | "dubbing" | "stylizing" | "done" | "error";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface LanguageOutput {
  code: string;
  name: string;
  srtUrl?: string;
  dubUrl?: string;
  transcript: string;
}

export interface OmniJob {
  id: string;
  createdAt: string;
  status: JobStatus;
  progress: number;
  sourceVideoUrl: string;
  referenceVideoUrl?: string;
  sourceLanguage: string;
  targetLanguages: string[];
  styleId?: string;
  transcript?: TranscriptSegment[];
  outputs: LanguageOutput[];
  stylizedVideoUrl?: string;
  error?: string;
}

export const SUPPORTED_LANGUAGES: { code: string; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
];

export const ART_STYLES = [
  { id: "anime", label: "Anime", description: "Studio Ghibli-inspired animation style" },
  { id: "cinematic", label: "Cinematic", description: "Hollywood blockbuster colour grading" },
  { id: "vintage", label: "Vintage Film", description: "Aged film grain, warm tones" },
  { id: "neon", label: "Neon Noir", description: "Cyberpunk neon-drenched aesthetic" },
  { id: "watercolor", label: "Watercolour", description: "Hand-painted watercolour effect" },
  { id: "claymation", label: "Claymation", description: "Stop-motion clay look" },
  { id: "custom", label: "Reference Video", description: "Match style of your uploaded reference" },
];
