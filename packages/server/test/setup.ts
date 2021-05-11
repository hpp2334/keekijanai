import { runServer, closeServer } from "../dev/server";
import { requestHandler } from "../dev/requestHandler";

export default async () => {
  runServer(requestHandler);
};

