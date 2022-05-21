import { VercelRequest, VercelResponse } from "@vercel/node";
import { EntireRequest, processEntireRequest as _processEntireRequest } from "keekijanai-serve-node-wrapper";
import qs from "qs";

const API_PREFIX = "/api/keekijanai";

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

function createUri(req: VercelRequest) {
  const query = { ...req.query };
  const path = query.query_route as string;
  delete query.query_route;

  let ret = API_PREFIX + path;
  if (Object.keys(query).length > 0) {
    ret += "?" + qs.stringify(query);
  }
  return ret;
}

const payloadStringify = (payload: any) => {
  if (payload && typeof payload === "object") {
    return JSON.stringify(payload);
  }
  return String(payload);
};

export async function processEntireRequest(req: VercelRequest, res: VercelResponse) {
  const headers = chunk(req.rawHeaders, 2) as Array<[string, string]>;
  const entireRequest: EntireRequest = {
    uri: createUri(req),
    method: req.method ?? "GET",
    headers,
    body: req.body ? payloadStringify(req.body) : null,
  };
  await _processEntireRequest(entireRequest)
    .then((rawRes) => {
      res = res.status(rawRes.statusCode);
      rawRes.headers.forEach(([key, value]) => {
        res = res.setHeader(key, value);
      });
      res = res.send(rawRes.body);
      res.end();
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
}
