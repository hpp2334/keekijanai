import { Observable } from "rxjs/internal/Observable";
import { ajax } from 'rxjs/ajax';
import { Client } from "./client";
import { auth } from "../services/auth";

interface RequestParam {
  route: string;
  query?: {};
  method?: string;
  body?: any;
}

export class Requester {
  constructor(private client: Client) {}
  
  request(params: RequestParam) {
    const jwt = auth.jwt;
    const headers = Object.assign(
      {},
      jwt === null ? {} : { Authorization: jwt },
    );

    return ajax({
      method: params.method || 'GET',
      headers,
      url: this.client.config.route.root
        + '?'
        + new URLSearchParams({
          ...params.query || {},
          __route__: params.route,
        }),
      body: params.body
    });
  }
}