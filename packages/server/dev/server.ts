import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';

let server: any;

export function runServer(requestHandler: (req: Request, res: Response) => any) {
  const app = express();
  app.use(express.static(__dirname + '/static'));
  app.use(cookieParser());
  app.use(express.json());
  app.all('/api/keekijanai', async (req, res) => {
    console.log('[Express receive /api/keekijanai]', req.url);
    await requestHandler(req, res);
  });
  server = app.listen(3000, function () {
    console.log('listen at http://localhost:3000');
  });
}

export function closeServer() {
  if (server) {
    server.close();
  }
}

export const serverUrl = 'http://localhost:3000';
export const apiUrl = serverUrl + '/api/keekijanai';
