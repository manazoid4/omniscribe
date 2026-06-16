"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OmniJob } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Queued...",
  transcribing: "Transcribing audio with Whisper...",
  translating: "Translating to all languages...",
  dubbing: "Generating dubbed audio...",
  stylizing: "Applying artistic style...",
  done: "Complete!",
  error: "Processing failed",
};

export default function ProcessPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<OmniJob | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function poll() {
      try {
        const res = await fetch(`/api/status/${id}`);
        if (!res.ok) { setError("Job not found"); return; }
        const data: OmniJob = await res.json();
        setJob(data);
        if (data.status === "done" || data.status === "error") {
          clearInterval(interval);
        }
      } catch {
        setError("Failed to fetch status");
      }
    }

    poll();
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <p style={{ color: "#f87171" }}>{error}</p>
          <a href="/" className="mt-4 inline-block text-sm" style={{ color: "#7c3aed" }}>← Back</a>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f", color: "#6b7280" }}>
        Loading...
      </div>
    );
  }

  const isDone = job.status === "done";
  const isError = job.status === "error";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <a href="/" className="text-sm mb-8 inline-block" style={{ color: "#7c3aed" }}>← New video</a>

        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: "#e2e8f0" }}>
              {isDone ? "✅ Done" : isError ? "❌ Error" : "⚡ Processing"}
            </h1>
            <span className="text-sm" style={{ color: "#6b7280" }}>{job.progress}%</span>
          </div>

          <div className="w-full rounded-full h-2 mb-4" style={{ background: "#1e1e2e" }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${job.progress}%`,
                background: isError ? "#ef4444" : "linear-gradient(90deg, #7c3aed, #3b82f6)",
              }}
            />
          </div>

          <p className="text-sm" style={{ color: "#9ca3af" }}>
            {isError ? job.error : STATUS_LABELS[job.status]}
          </p>

          {job.sourceLanguage && job.sourceLanguage !== "auto" && (
            <p className="text-xs mt-2" style={{ color: "#6b7280" }}>
              Detected: <span style={{ color: "#a855f7" }}>{job.sourceLanguage}</span>
            </p>
          )}
        </div>

        {job.stylizedVideoUrl && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#e2e8f0" }}>🎨 Stylized Video</h2>
            <video src={job.stylizedVideoUrl} controls className="w-full rounded-xl" style={{ background: "#000" }} />
            <a
              href={job.stylizedVideoUrl}
              download="omniscribe-stylized.mp4"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed", color: "#c4b5fd" }}
            >
              ↓ Download Stylized Video
            </a>
          </div>
        )}

        {job.outputs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: "#e2e8f0" }}>🌍 Language Outputs</h2>
            {job.outputs.map((output) => (
              <div key={output.code} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold" style={{ color: "#e2e8f0" }}>{output.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {output.srtUrl && (
                      <a
                        href={output.srtUrl}
                        download={`omniscribe-${output.code}.srt`}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: "rgba(59,130,246,0.2)", border: "1px solid #3b82f6", color: "#93c5fd" }}
                      >
                        ↓ SRT
                      </a>
                    )}
                    {output.dubUrl && (
                      <a
                        href={output.dubUrl}
                        download={`omniscribe-${output.code}-dub.mp3`}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed", color: "#c4b5fd" }}
                      >
                        ↓ Dub
                      </a>
                    )}
                  </div>
                </div>
                {output.dubUrl && <audio controls src={output.dubUrl} className="w-full mt-2" />}
                {output.transcript && (
                  <p className="text-sm leading-relaxed mt-2" style={{ color: "#6b7280" }}>
                    {output.transcript.slice(0, 300)}{output.transcript.length > 300 ? "..." : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
