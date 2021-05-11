import type { SelfClient } from "..";
import { Service } from "../../../core/service";
import { TimeService } from "../../../type";

export class TimeImpl extends Service<SelfClient> implements TimeService {
  async getTime() {
    return Date.now();
  }
}
