import { VercelRequest, VercelResponse } from "@vercel/node";
import { processEntireRequest } from "@keekijanai/vercel-adapter";

export default async function (req: VercelRequest, res: VercelResponse) {
  await processEntireRequest(req, res);
}
