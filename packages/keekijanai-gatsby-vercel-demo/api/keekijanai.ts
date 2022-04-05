import { VercelRequest, VercelResponse } from "@vercel/node";
import { processEntireRequest } from "@keekijanai/vercel-adapter";

export default function (req: VercelRequest, res: VercelResponse) {
  processEntireRequest(req, res);
}
