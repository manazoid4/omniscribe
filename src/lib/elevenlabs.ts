const VOICE_MAP: Record<string, string> = {
  en: "21m00Tcm4TlvDq8ikWAM",
  es: "AZnzlk1XvdvUeBnXmlld",
  fr: "MF3mGyEYCl7XYWbV9V6O",
  de: "TxGEqnHWrfWFTfGW9XjX",
  it: "IKne3meq5aSn9XLyUdCD",
  pt: "pNInz6obpgDQGcFmaJgB",
  ru: "yoZ06aMxZJJ28mfd3POQ",
  ja: "onwK4e9ZLuTAKqWW03F9",
  ko: "uyVNoMrnFMovkA8XZwgL",
  zh: "flq6f7yk4E4fJM5XTYuZ",
  ar: "g5CIjZEefAph4nQFvHAz",
  hi: "SOYHLrjzK2X1ezoPC6cr",
  tr: "D38z5RcWu1voky8WS1ja",
  nl: "Yko7PKHZNXotIFUBG7I9",
  pl: "5Q0t7uMcjvnagumLfvZi",
};

export async function dubText(text: string, languageCode: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

  const voiceId = VOICE_MAP[languageCode] ?? VOICE_MAP.en;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err}`);
  }

  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}
