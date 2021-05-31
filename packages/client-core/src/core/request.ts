import { ajax, AjaxResponse } from 'rxjs/ajax';
import { Client } from "./client";
import { auth } from "../services/auth";
import _ from 'lodash';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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
    const { method = 'GET', body } = params;

    const jwt = auth.jwt;
    const headers = Object.assign(
      {},
      jwt === null ? {} : { Authorization: jwt },
    );

    return ajax<any>({
      method,
      headers,
      url: this.getURI(params),
      body
    }).pipe(
      map(value => value.response),
    );
  }
}