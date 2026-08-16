import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "@/keystatic.config";

export const dynamic = "force-dynamic";

/**
 * Built on first request rather than at module load.
 *
 * In GitHub storage mode Keystatic throws immediately if the three
 * KEYSTATIC_* variables are missing. At module scope that throw happens while
 * Next collects page data, which fails the whole build — so a site with no CMS
 * credentials yet could not deploy at all. Deferring it keeps the public site
 * building and deploying; only the admin route is affected, and it reports the
 * missing configuration instead of taking everything else down with it.
 */
let handler: ReturnType<typeof makeRouteHandler> | null = null;

function getHandler() {
  if (!handler) handler = makeRouteHandler({ config });
  return handler;
}

function unconfigured(error: unknown) {
  return new Response(
    `Keystatic is not configured yet.\n\n${
      error instanceof Error ? error.message : String(error)
    }`,
    { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}

export async function GET(request: Request) {
  try {
    return await getHandler().GET(request);
  } catch (error) {
    return unconfigured(error);
  }
}

export async function POST(request: Request) {
  try {
    return await getHandler().POST(request);
  } catch (error) {
    return unconfigured(error);
  }
}
