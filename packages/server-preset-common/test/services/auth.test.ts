/// <reference types="../../node_modules/@types/jest" />
import { requester, ValidUser } from "../utils/requester";

jest.setTimeout(50 * 1000);

beforeAll(async () => {
  await requester.init();
})

beforeEach(async () => {
  const uid = Symbol();
  await requester.request(uid, '/user/test__clear', {
    method: 'DELETE'
  })
});

test.each([
  { username: 'user123', password: '123456' },
  { userID: 'user123', },
  { password: '123456' },
])(
  'register: invalid property name or lack of property name (%o)',
  (body) => {
    return registerAndExpect(body, false);
  }
)

test.each([
  { userID: 'abc', password: '123456' },
  { userID: '1234567890123456', password: '123456' },
  { userID: 'user1', password: ''.padStart(5, 'b') },
  { userID: 'user1', password: ''.padStart(21, 'a') },
  { userID: 'user1', password: 123456 },
])(
  'register: invalid userID or password (%o)',
  body => {
    return registerAndExpect(body, false);
  }
)

test.each([
  { userID: 'user1', password: '123456' },
  { userID: '1user2__11q', password: '123456aa' },
])(
  'login: %o',
  async body => {
    await registerAndExpect(body);
    await loginAndExpect(body);
  }
)

async function registerAndExpect(body: any, ok = true) {
  const uid = Symbol();
  const rsp = await requester.request(uid, '/auth/legacyRegister', {
    method: 'POST',
    body
  });
  expect(rsp.ok).toBe(ok);
}

async function loginAndExpect(body: any, ok = true) {
  const uid = Symbol();
  const rsp = await requester.request(uid, '/auth/legacyAuth', {
    method: 'POST',
    body
  });
  expect(rsp.ok).toBe(ok);
}