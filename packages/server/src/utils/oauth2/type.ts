export interface OAuth2UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  email?: string;
}

export interface OAuth2Serivice {
  getCode: (params: {
    appID: string;
    [key: string]: any;
  }) => Promise<string>;
  getAccessToken: (params: {
    appID: string;
    appSecret: string;
    code: string;
  }) => Promise<{
    accessToken: string;
    [field: string]: any;
  }>;
  getUserProfile: (params: {
    accessToken: string;
  }) => Promise<OAuth2UserProfile>;
}

export interface OAuth2ServiceConstructor {
  new (): OAuth2Serivice;
}
