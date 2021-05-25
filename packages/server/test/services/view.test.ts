import { requester } from "../utils/requester";

jest.setTimeout(50 * 1000);

beforeAll(async () => {
  await requester.init();
});

beforeEach(async () => {
  const scopes = ['a', 'b']
  for (const scope of scopes) {
    await clear(scope);
  }
});

test('sym', async () => {
  const [u1, u2] = [Symbol(), Symbol()];

  await viewAndExpect('a', u1, 1);
  await viewAndExpect('a', u2, 2);
  await viewAndExpect('b', u2, 1);
  await viewAndExpect('a', u1, 2);
  await viewAndExpect('b', u1, 2);
  await viewAndExpect('a', u2, 2);
});

// helpers
const clear = (scope: string) => {
  return requester.request('admin1', '/view/clear', {
    method: 'POST',
    query: { scope }
  });
}
const viewAndExpect = (scope: string, id: symbol, count: number) => {
  return requester.request(id, '/view/get', {
    query: { scope }
  }).then(rsp => {
    expect(rsp.ok).toBeTruthy();
    return rsp.json().then(data => {
      expect(data.view).toBe(count);
    })
  })
}