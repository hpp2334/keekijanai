import { Observable } from "rxjs/internal/Observable";
import { ajax } from 'rxjs/ajax';
import { Client } from "./client";
import { auth } from "../services/auth";
import * as _ from 'lodash';

interface RequestParam {
  route: string;
  query?: {};
  method?: string;
  body?: any;
}

export class Requester {
  constructor(private client: Client) {}

  getURI(params: RequestParam) {
    const unfilteredQueryObject = {
      ...params.query || {},
      __route__: params.route,
    };
    const queryObject = _.pickBy(unfilteredQueryObject, x => x !== undefined);

    return this.client.config.route.root
      + '?'
      + new URLSearchParams(queryObject);
  }
  
  request(params: RequestParam) {
    const jwt = auth.jwt;
    const headers = Object.assign(
      {},
      jwt === null ? {} : { Authorization: jwt },
    );

    return ajax({
      method: params.method || 'GET',
      headers,
      url: this.getURI(params),
      body: params.body
    });
  }
}