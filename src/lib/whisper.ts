import OpenAI from "openai";
import { TranscriptSegment } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeVideo(
  audioBuffer: Buffer,
  filename: string
): Promise<{ segments: TranscriptSegment[]; detectedLanguage: string; fullText: string }> {
  const file = new File([new Uint8Array(audioBuffer)], filename, { type: "audio/mp4" });

  const response = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments: TranscriptSegment[] = (response.segments ?? []).map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.trim(),
  }));

  return {
    segments,
    detectedLanguage: response.language ?? "en",
    fullText: response.text,
  };
}

export function buildSRT(segments: TranscriptSegment[]): string {
  return segments
    .map((seg, i) => {
      const start = formatTimestamp(seg.start);
      const end = formatTimestamp(seg.end);
      return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
    })
    .join("\n");
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${ms.toString().padStart(3, "0")}`;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
