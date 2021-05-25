require('module-alias/register')
import { requestHandler } from "./requestHandler";
import { runServer } from "./server";

runServer(requestHandler);
