import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const STYLE_PROMPTS: Record<string, string> = {
  anime: "anime style, studio ghibli, vibrant colors, hand-drawn animation, detailed backgrounds",
  cinematic: "cinematic film, dramatic lighting, anamorphic lens, hollywood color grading, 4k",
  vintage: "vintage film, 35mm grain, warm sepia tones, light leaks, 1970s aesthetic",
  neon: "cyberpunk neon noir, electric blue and pink neons, rain-soaked streets, dark atmosphere",
  watercolor: "watercolor painting, soft brushstrokes, translucent washes, artistic, dreamy",
  claymation: "claymation stop-motion, clay texture, warm lighting, handcrafted look",
};

export async function stylizeVideo(
  videoUrl: string,
  styleId: string,
  referenceVideoUrl?: string
): Promise<string> {
  const prompt = STYLE_PROMPTS[styleId] ?? STYLE_PROMPTS.cinematic;

  const input: Record<string, unknown> = {
    video_url: videoUrl,
    prompt,
    num_inference_steps: 25,
    guidance_scale: 7.5,
    fps: 8,
  };

  if (styleId === "custom" && referenceVideoUrl) {
    input.style_reference = referenceVideoUrl;
  }

  const output = await replicate.run(
    "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f",
    { input }
  );

  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];

  throw new Error(`Unexpected Replicate output: ${JSON.stringify(output)}`);
}
