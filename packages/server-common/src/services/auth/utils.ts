export function getUserIDfromOAuth2(provider: string, id: string) {
  return `$$${provider}____${id}`;
}
