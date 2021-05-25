import { runServer, closeServer } from "../dev/server";
import { requestHandler } from "../dev/requestHandler";
import { requester } from './utils/requester';

export default async () => {
  runServer(requestHandler);
};

