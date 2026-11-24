import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { cmsEnabled } from "@/lib/cms";

// Only build the handler when the editor is set up: Keystatic throws at
// startup if its GitHub credentials are missing, which would fail the build.
const handler = cmsEnabled ? makeRouteHandler({ config }) : null;
const notFound = () => new Response("Not found", { status: 404 });

export const GET = handler?.GET ?? notFound;
export const POST = handler?.POST ?? notFound;
