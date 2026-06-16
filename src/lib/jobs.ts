import { OmniJob } from "./types";

// MVP in-memory store — swap for Supabase/Redis for multi-instance production
const jobs = new Map<string, OmniJob>();

export function createJob(id: string, data: Partial<OmniJob>): OmniJob {
  const job: OmniJob = {
    id,
    createdAt: new Date().toISOString(),
    status: "pending",
    progress: 0,
    sourceVideoUrl: "",
    sourceLanguage: "auto",
    targetLanguages: [],
    outputs: [],
    ...data,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): OmniJob | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, patch: Partial<OmniJob>): OmniJob | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  const updated = { ...job, ...patch };
  jobs.set(id, updated);
  return updated;
}

export function getAllJobs(): OmniJob[] {
  return Array.from(jobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
