import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { releaseArchive } from "./release-archive";

const run = promisify(execFile);
const repository = "https://github.com/mattmatt-mm/Matt-Matt-Design";
const checkpoint = releaseArchive[0];
const calendar = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type Release = {
  patch: number;
  date: string;
  title: string;
  summary?: string;
  branch?: string;
  pullRequest?: number;
  commit: string;
};

export function releaseVersion(patch: number) {
  return `v0.1.${patch}`;
}

export function releaseSource({ pullRequest, commit }: Release) {
  return pullRequest ? `${repository}/pull/${pullRequest}` : `${repository}/commit/${commit}`;
}

async function git(cwd: string, args: string[]) {
  const result = await run("git", args, {
    cwd,
    encoding: "utf8",
    timeout: 25000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  return result.stdout;
}

async function revisionsSinceArchive(directory: string, revision: string) {
  const entries = (await git(directory, [
    "log", "--first-parent", "--format=%H%x1f%ct%x1f%s%x1f%b%x1e", revision, "--",
  ])).split("\x1e").map((entry) => entry.trim()).filter(Boolean);
  const boundary = entries.findIndex((entry) => entry.startsWith(checkpoint.commit + "\x1f"));
  if (boundary === -1) throw new Error("Release checkpoint is missing from the first-parent history");

  return entries.slice(0, boundary).reverse().map((entry, index): Release => {
    const [commit, timestamp, subject, body] = entry.split("\x1f");
    const merge = subject.match(/^Merge pull request #(\d+) from [^/]+\/(.+)$/);
    const squash = subject.match(/ \(#(\d+)\)$/);
    return {
      patch: checkpoint.patch + index + 1,
      date: calendar.format(Number(timestamp) * 1000),
      title: merge
        ? body?.split("\n").find((line) => line.trim())?.trim() || `Pull request #${merge[1]}`
        : subject.replace(/ \(#\d+\)$/, ""),
      branch: merge?.[2],
      pullRequest: Number(merge?.[1] ?? squash?.[1]) || undefined,
      commit,
    };
  }).reverse();
}

async function recoverBuildHistory(source: string) {
  // Hosted builds may only have the checkout's tip. Fetch commit history into
  // a disposable repository and keep the app checkout and its .git untouched.
  const directory = await mkdtemp(path.join(tmpdir(), "mmd-release-history-"));
  try {
    await git(directory, ["init", "--bare", "--quiet"]);
    await git(directory, ["-c", "protocol.version=2", "fetch", "--quiet", "--no-tags", "--filter=blob:none", `${repository}.git`, source]);
    return await revisionsSinceArchive(directory, "FETCH_HEAD");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

// Called only while prerendering the Releases page.
export async function getReleases() {
  const production = process.env.VERCEL_ENV === "production";
  const buildSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const hasBuildSha = buildSha && /^[a-f0-9]{40}$/.test(buildSha);
  const revision = production ? (hasBuildSha ? buildSha : "HEAD") : "refs/remotes/origin/main";
  let builds: Release[];
  try {
    builds = await revisionsSinceArchive(process.cwd(), revision);
  } catch {
    if (production && hasBuildSha) {
      try {
        builds = await recoverBuildHistory(buildSha);
      } catch {
        console.warn("Releases: unable to recover production Git history");
        return { releases: [...releaseArchive] as Release[], historyUnavailable: true };
      }
    } else {
      return { releases: [...releaseArchive] as Release[], historyUnavailable: production };
    }
  }
  return { releases: [...builds, ...releaseArchive], historyUnavailable: false };
}
