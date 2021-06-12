import fetch, { Request } from "node-fetch";
import { URLSearchParams } from "url";
import { OAuth2Serivice } from "./type";
import qs from 'querystring';
import { getProxyAgent } from "../fns";

export class GithubOAuth2 implements OAuth2Serivice {
  constructor() {}

  getCode: OAuth2Serivice['getCode'] = async (params) => {
    const query = {
      ...params,
      appID: undefined,
      client_id: params.appID,
    };
    delete query.appID;

    const remoteUrl = 'https://github.com/login/oauth/authorize?' + new URLSearchParams(query);
    return remoteUrl;
  }

  getAccessToken: OAuth2Serivice['getAccessToken'] = async (params) => {
    const query = {
      ...params,
      client_id: params.appID,
      client_secret: params.appSecret,
      appID: undefined,
      appSecret: undefined,
    };
    delete query.appID;
    delete query.appSecret;

    const remoteUrl = 'https://github.com/login/oauth/access_token?' + new URLSearchParams(query);
    const result = await fetch(remoteUrl, {
      method: 'POST',
      agent: getProxyAgent(),
    });
    const str = await result.text();
    const payload = qs.parse(str);

    if (!payload || typeof payload.access_token !== 'string') {
      throw Error(`getAccessToken fail. result is "${str}"`)
    }

    return {
      accessToken: payload.access_token,
    };
  }

  getUserProfile: OAuth2Serivice['getUserProfile'] = async (params) => {
    const { accessToken } = params;

    const response = await fetch(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        }
      }
    );

    if (response.status !== 200) {
      throw Error('"getUserProfile" error');
    }

    const nativeRes = await response.json();
    return {
      avatarUrl: nativeRes.avatar_url,
      id: nativeRes.login,
      name: nativeRes.login,
      email: nativeRes.email || undefined,
    }
  }
}