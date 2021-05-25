import fetch from "node-fetch";
import { appRequest } from "../../dev/request";
import { requester, ValidUser } from "../utils/requester";
import { Response } from "node-fetch";

jest.setTimeout(100 * 1000);

let scopes = ['/page1', '/page2'];

beforeAll(async () => {
  await requester.init();
});

beforeEach(async () => {
  for (const scope of scopes) {
    await clear(scope, 'admin1');
  }
});

test('reject post when not login', async () => {
  await postAndExpect('123', undefined, 0, 0, false);
});

test('single', async () => {
  for (const scope of scopes) {
    for (const user of ['admin1', 'user2'] as const) {
      for (const star of [1, 0, -1, null] as const) {
        await postAndExpect(scope, user, star, star || 0);
      }
    }
  }
});

test('sym', async () => {
  await postAndExpect(scopes[0], 'admin1', 1, 1)
  await postAndExpect(scopes[1], 'admin1', 1, 1)
  await postAndExpect(scopes[1], 'user2', 1, 2)
  await getAndExpect(scopes[0], 'admin1', 1, 1);
  await getAndExpect(scopes[0], 'user2', null, 1);
  await postAndExpect(scopes[0], 'user2', -1, 0)
  await postAndExpect(scopes[0], 'admin1', null, -1)
});



// Helpers ====
const expectGet = (star: 1 | 0 | -1 | null, total: number, rsp: Response) => {
  expect(rsp.ok).toBeTruthy();
  return rsp.json().then(data => {
    expect(data.current).toBe(star);
    expect(data.total).toBe(total);
  });
}
const clear = (scope: string, user: ValidUser) => {
  return requester.request(user, '/star/clear', {
    method: 'POST',
    query: { scope }
  })
};
const postAndExpect = (scope: string, user: ValidUser | undefined, star: 1 | 0 | -1 | null, total: number, expectTruthy = true) => {
  return requester.request(user, '/star/post', {
    method: 'POST',
    query: { scope },
    body: { current: star }
  }).then(
    expectTruthy
      ? (rsp: Response) => {
        expectGet(star, total, rsp);
      }
      : (rsp: Response) => {
        expect(rsp.ok).toBeFalsy()
      }
  )
}
const getAndExpect = (scope: string, user: ValidUser | undefined, star: 1 | 0 | -1 | null, total: number) => {
  return requester.request(user, '/star/get', {
    query: { scope }
  }).then(expectGet.bind(null, star, total))
}