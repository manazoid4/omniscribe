import OpenAI from "openai";
import { TranscriptSegment } from "./types";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function translateSegments(
  segments: TranscriptSegment[],
  sourceLang: string,
  targetLangName: string
): Promise<TranscriptSegment[]> {
  const batch = segments.map((s) => s.text).join("\n---SEG---\n");

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a professional subtitle translator. Translate from ${sourceLang} to ${targetLangName}.
Preserve "---SEG---" separators exactly. Match original rhythm — each translated segment must fit spoken timing.
Return ONLY translated text with ---SEG--- separators. No commentary.`,
      },
      { role: "user", content: batch },
    ],
    temperature: 0.2,
  });

  const translated = response.choices[0].message.content ?? "";
  const parts = translated.split("---SEG---");

  return segments.map((seg, i) => ({
    ...seg,
    text: (parts[i] ?? seg.text).trim(),
  }));
}

export async function translateFullText(
  text: string,
  sourceLang: string,
  targetLangName: string
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Translate from ${sourceLang} to ${targetLangName}. Return only the translated text.`,
      },
      { role: "user", content: text },
    ],
    temperature: 0.2,
  });
  return response.choices[0].message.content ?? text;
}
