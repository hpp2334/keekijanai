require("dotenv").config();
const { Router } = require("express");
const express = require("express");
const { processEntireRequest: _processEntireRequest } = require("keekijanai-serve-node-wrapper");

const chunk = (list, size) => {
  const res = [];
  for (let i = 0; i < list.length; i += size) {
    const cur = [];
    for (let j = i; j < i + size; j++) {
      cur.push(list[j]);
    }
    res.push(cur);
  }
  return res;
};

const payloadStringify = (payload) => {
  if (payload && typeof payload === "object") {
    return JSON.stringify(payload);
  }
  return String(payload);
};

function processEntireRequest(req, res, next) {
  const headers = chunk(req.rawHeaders, 2);
  const entireRequest = {
    uri: req.url,
    method: req.method ?? "GET",
    headers,
    body: req.body ? payloadStringify(req.body) : null,
  };
  const rawRes = _processEntireRequest(entireRequest);
  res = res.status(rawRes.statusCode);
  rawRes.headers.forEach(([key, value]) => {
    res = res.set(key, value);
  });
  res = res.send(rawRes.body);
}

const app = express();

const router = express.Router();

router.all("/api/keekijanai/*", express.json(), processEntireRequest);

app.use(router);

app.listen(3001, () => {
  console.log("listen on http://127.0.0.1:3001");
});
