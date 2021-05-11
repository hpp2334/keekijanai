import { OAuth2Serivice, OAuth2ServiceConstructor } from "./type";
import { GithubOAuth2 } from './github';

export const oauth2ServiceFactory = (
  ServiceConstructor: OAuth2ServiceConstructor,
) => {
  return new ServiceConstructor();
}

export const oauth2ServiceConstructors: Record<string, OAuth2ServiceConstructor | undefined> = {
  'github': GithubOAuth2,
};
