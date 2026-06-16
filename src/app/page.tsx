"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_LANGUAGES, ART_STYLES } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["en", "es", "fr"]);
  const [styleId, setStyleId] = useState("cinematic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  function toggleLang(code: string) {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!videoFile) { setError("Upload a video first"); return; }
    if (selectedLangs.length === 0) { setError("Select at least one language"); return; }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("targetLanguages", JSON.stringify(selectedLangs));
    formData.append("styleId", styleId);
    if (referenceFile) formData.append("referenceVideo", referenceFile);

    try {
      const res = await fetch("/api/process", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Processing failed");
      router.push(`/process/${data.jobId}`);
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-6"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", color: "#a855f7" }}
        >
          ✦ AI-Powered Video Translation
        </div>
        <h1 className="text-5xl font-black mb-4 gradient-text">OmniScribe</h1>
        <p className="text-xl mb-2" style={{ color: "#9ca3af" }}>
          Any video. Any language. Any artistic style.
        </p>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Whisper transcription → GPT-4o translation → ElevenLabs dubbing → AI style transfer
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video upload */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#e2e8f0" }}>
              1. Upload Your Video
            </h2>
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
              style={{
                borderColor: videoFile ? "#7c3aed" : "#2a2a3a",
                background: videoFile ? "rgba(124,58,237,0.05)" : "transparent",
              }}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              />
              {videoFile ? (
                <div>
                  <div className="text-3xl mb-2">🎬</div>
                  <p className="font-medium" style={{ color: "#a855f7" }}>{videoFile.name}</p>
                  <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                    {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📹</div>
                  <p style={{ color: "#9ca3af" }}>Click to upload video (any language)</p>
                  <p className="text-sm mt-1" style={{ color: "#6b7280" }}>MP4, MOV, AVI, MKV supported</p>
                </div>
              )}
            </div>
          </div>

          {/* Language selection */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#e2e8f0" }}>
              2. Output Languages ({selectedLangs.length} selected)
            </h2>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleLang(lang.code)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: selectedLangs.includes(lang.code) ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
                    border: selectedLangs.includes(lang.code) ? "1px solid #7c3aed" : "1px solid #2a2a3a",
                    color: selectedLangs.includes(lang.code) ? "#c4b5fd" : "#9ca3af",
                  }}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Art style */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ color: "#e2e8f0" }}>
              3. Artistic Style
            </h2>
            <p className="text-sm mb-4" style={{ color: "#6b7280" }}>
              Transform your video with AI-generated aesthetics
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ART_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setStyleId(style.id)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: styleId === style.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                    border: styleId === style.id ? "1px solid #7c3aed" : "1px solid #2a2a3a",
                  }}
                >
                  <div className="font-medium text-sm" style={{ color: styleId === style.id ? "#c4b5fd" : "#e2e8f0" }}>
                    {style.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                    {style.description}
                  </div>
                </button>
              ))}
            </div>

            {styleId === "custom" && (
              <div className="mt-4">
                <div
                  onClick={() => refInputRef.current?.click()}
                  className="border border-dashed rounded-xl p-4 text-center cursor-pointer"
                  style={{ borderColor: "#2a2a3a" }}
                >
                  <input
                    ref={refInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setReferenceFile(e.target.files?.[0] ?? null)}
                  />
                  {referenceFile ? (
                    <p className="text-sm" style={{ color: "#a855f7" }}>🎨 {referenceFile.name}</p>
                  ) : (
                    <p className="text-sm" style={{ color: "#6b7280" }}>Upload reference video for style matching</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !videoFile}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all"
            style={{
              background: loading || !videoFile ? "#2a2a3a" : "linear-gradient(135deg, #7c3aed, #3b82f6)",
              color: loading || !videoFile ? "#6b7280" : "white",
              cursor: loading || !videoFile ? "not-allowed" : "pointer",
              boxShadow: loading || !videoFile ? "none" : "0 0 30px rgba(124,58,237,0.4)",
            }}
          >
            {loading ? "Starting pipeline..." : "⚡ Process Video"}
          </button>
        </form>
      </div>
    </div>
  );
}
