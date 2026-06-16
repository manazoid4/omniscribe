import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createJob, updateJob } from "@/lib/jobs";
import { transcribeVideo, buildSRT } from "@/lib/whisper";
import { translateSegments } from "@/lib/translate";
import { dubText } from "@/lib/elevenlabs";
import { stylizeVideo } from "@/lib/stylize";
import { SUPPORTED_LANGUAGES } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const videoFile = formData.get("video") as File | null;
  const targetLanguages = JSON.parse((formData.get("targetLanguages") as string) ?? "[]") as string[];
  const styleId = (formData.get("styleId") as string) ?? "";
  const referenceVideo = formData.get("referenceVideo") as File | null;

  if (!videoFile) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 });
  }

  const jobId = uuidv4();
  const job = createJob(jobId, {
    sourceVideoUrl: videoFile.name,
    targetLanguages,
    styleId,
    status: "transcribing",
    progress: 5,
  });

  processJob(jobId, videoFile, targetLanguages, styleId, referenceVideo).catch((err) => {
    updateJob(jobId, { status: "error", error: String(err) });
  });

  return NextResponse.json({ jobId: job.id });
}

async function processJob(
  jobId: string,
  videoFile: File,
  targetLanguages: string[],
  styleId: string,
  referenceVideo: File | null
) {
  updateJob(jobId, { status: "transcribing", progress: 10 });
  const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
  const { segments, detectedLanguage } = await transcribeVideo(videoBuffer, videoFile.name);

  updateJob(jobId, { transcript: segments, sourceLanguage: detectedLanguage, progress: 30 });

  updateJob(jobId, { status: "translating", progress: 35 });
  const langDetails = SUPPORTED_LANGUAGES.filter((l) => targetLanguages.includes(l.code));
  const outputs = [];
  const progressPerLang = 30 / Math.max(langDetails.length, 1);

  for (let i = 0; i < langDetails.length; i++) {
    const lang = langDetails[i];
    const translatedSegs = await translateSegments(segments, detectedLanguage, lang.name);
    const srtContent = buildSRT(translatedSegs);
    const transcript = translatedSegs.map((s) => s.text).join(" ");
    const srtDataUrl = `data:text/plain;base64,${Buffer.from(srtContent).toString("base64")}`;

    outputs.push({ code: lang.code, name: lang.name, srtUrl: srtDataUrl, transcript });
    updateJob(jobId, { outputs: [...outputs], progress: 35 + Math.round((i + 1) * progressPerLang) });
  }

  updateJob(jobId, { status: "dubbing", progress: 65 });
  for (let i = 0; i < outputs.length; i++) {
    const out: (typeof outputs)[number] = outputs[i];
    try {
      const audioBuffer = await dubText(out.transcript.slice(0, 5000), out.code);
      const audioDataUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
      outputs[i] = { ...out, dubUrl: audioDataUrl };
      updateJob(jobId, { outputs: [...outputs], progress: 65 + Math.round(((i + 1) / outputs.length) * 15) });
    } catch {
      // dub failure non-fatal — SRT still delivered
    }
  }

  if (styleId && styleId !== "none") {
    updateJob(jobId, { status: "stylizing", progress: 80 });
    try {
      const sourceUrl = `https://placeholder.omniscribe.io/${jobId}/source.mp4`;
      const refUrl = referenceVideo ? `https://placeholder.omniscribe.io/${jobId}/ref.mp4` : undefined;
      const stylizedUrl = await stylizeVideo(sourceUrl, styleId, refUrl);
      updateJob(jobId, { stylizedVideoUrl: stylizedUrl, progress: 95 });
    } catch {
      // stylize failure non-fatal
    }
  }

  updateJob(jobId, { status: "done", progress: 100, outputs });
}
