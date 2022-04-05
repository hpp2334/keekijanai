import { VercelRequest, VercelResponse } from "@vercel/node";
import { EntireRequest, processEntireRequest as _processEntireRequest } from "keekijanai-serve-node-wrapper";

const chunk = <T>(list: T[], size: number): T[][] => {
  const res: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    const cur: T[] = [];
    for (let j = i; j < i + size; j++) {
      cur.push(list[j]);
    }
    res.push(cur);
  }
  return res;
};

export function processEntireRequest(req: VercelRequest, res: VercelResponse) {
  const headers = chunk(req.rawHeaders, 2) as Array<[string, string]>;
  const entireRequest: EntireRequest = {
    uri: req.query.query_route as string,
    headers,
    body: req.body,
  };
  const rawRes = _processEntireRequest(entireRequest);
  res.status(rawRes.statusCode);
  rawRes.headers.forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.send(rawRes.body);
  res.end();
}
