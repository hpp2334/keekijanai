/// <reference types="../../node_modules/@types/jest" />
import _ from "lodash";
import { requester, ValidUser } from "../utils/requester";

jest.setTimeout(50 * 1000);

beforeAll(async () => {
  await requester.init();
})

beforeEach(async () => {
  const uid = Symbol();
  await requester.request(uid, '/article/dev__clear', {
    method: 'DELETE'
  })
});

test.each([
  { scope: 'add', article: { type: 0, title: 't1' } },
  { scope: 'ab', article: { type: 0, title: 't1', abstract: 't2' } },
  { scope: 'ac', article: { type: 0, title: 't1', content: 't3' } },
  { scope: 'aee', article: { type: 0, content: 't1' } },
])(
  'create article (%o)',
  async (body) => {
    await createAndExpect('admin1', body);
  }
)

test.each([
  [
    { scope: 'add', article: { type: 0, title: 't1' } },
    { title: 't2', abstract: 't3' },
    { scope: 'add', article: { type: 0, title: 't2', abstract: 't3' } },
  ],
])(
  'update article (%o)',
  async (toCreate, toUpdate, target) => {
    const created = await createAndExpect('admin1', toCreate);
    await updateArticleCoreAndExpect(
      'admin1',
      { query: { id: created.id }, body: toUpdate },
      { cTime: created.cTime, ...target },
    );
  }
)

test('list with where', async () => {
  const data: [ValidUser, any][] = [
    ['admin1', { scope: 'add',   article: { type: 0, title: 't1' } }],
    ['admin1', { scope: 'ad',    article: { type: 1, title: 't133' } }],
    ['admin1', { scope: 'ad',    article: { type: 1, title: 't12' } }],
    ['admin1', { scope: 'addcc', article: { type: 0, title: 't1' } }],
    ['admin1', { scope: 'add',   article: { type: 0, title: '2t1' } }],
    ['admin1', { scope: 'addbc', article: { type: 0, title: 't51' } }],
  ];

  await Promise.all(data.map(async ([user, item], i) => {
    data[i][1] = await createAndExpect(user, item);
  }));

  await listAndExpect('user2', { pagination: { skip: 0, take: 999 }, where: { scope: 'add' } }, _.at(data, [4, 0]));
  await listAndExpect('user2', { pagination: { skip: 0, take: 999 }, where: { scope: 'ad' } }, _.at(data, [2, 1]));

  // NOTICE: will update m_time
  await updateArticleCore('admin1', { query: { id: data[1][1].id }, body: { title: 'aaa' } });
  await listAndExpect('user2', { pagination: { skip: 0, take: 999 }, where: { scope: 'ad' } }, _.at(data, [1, 2]));
})


// ===== helpers ======

async function createAndExpect(user: ValidUser, body: any, ok = true) {
  const rsp = await requester.request(user, '/article/create', {
    method: 'POST',
    body
  });
  expect(rsp.ok).toBe(ok);
  if (ok) {
    const value = await rsp.json();
    expect(value.scope).toBe(body.scope);
    expect(value.article).toMatchObject(body.article);

    await getAndExpect('user2', { id: value.id }, value);

    return value;
  }
}

async function getAndExpect(user: ValidUser, query: any, target: any) {
  const rsp = await requester.request(user, '/article/get', {
    method: 'GET',
    query,
  });
  const ok = !!target;
  expect(rsp.ok).toBe(ok);
  if (ok) {
    const value = await rsp.json();
    expect(value).toStrictEqual(target);
    return value;
  }
}

async function listAndExpect(user: ValidUser, body: any, targets: any) {
  const rsp = await requester.request(user, '/article/list', {
    method: 'POST',
    body,
  });
  const ok = !!targets;
  expect(rsp.ok).toBe(ok);
  if (ok) {
    const value = await rsp.json();
    expect(value.total).toBe(targets.length);
    for (let i of _.range(0, value.length - 1)) {
      expect(value[i]).toMatchObject(targets[i]);
    }
    return value;
  }
}

async function updateArticleCore(user: ValidUser, params: any) {
  const rsp = await requester.request(user, '/article/update-article-core', {
    method: 'PUT',
    query: params.query,
    body: params.body,
  });
  return rsp;
}

async function updateArticleCoreAndExpect(user: ValidUser, params: any, target: any) {
  const rsp = await updateArticleCore(user, params);
  const ok = !!target;
  expect(rsp.ok).toBe(ok);
  if (ok) {
    const value = await rsp.json();
    expect(value).toMatchObject(target);
    return value;
  }
}
