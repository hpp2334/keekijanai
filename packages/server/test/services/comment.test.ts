import fetch from "node-fetch";
import { appRequest } from "../../dev/request";

jest.setTimeout(50 * 1000);

let scopes = ['/page1', '/page2'];

const reqFactory = (userId: string) => {
  const sessionIdentiter: object = {};
  return (path: string, query?: any, body?: any, method: 'GET' | 'POST' | 'DELETE' = 'GET') => {
    return appRequest(path, {
      method,
      query,
      body,
      headers: {
        Authorization: 'test:' + userId,
      },
      sessionIdentity: sessionIdentiter,
    });
  }
}
const reqs = [reqFactory('userA'), reqFactory('userB')];
const userIdMap = ['test__userA', 'test__userB'];
const crComment = (scopeIndex: number, content: string) => ({ scope: scopes[scopeIndex], content });
const crAndExpect = (userIndex: number, scopeIndex: number, comment: any) =>
  reqs[userIndex]('/comment/create', { scope: scopes[scopeIndex] }, { comment }, 'POST')
    .then(rsp => {
      expect(rsp.ok).toBeTruthy();
      return rsp.json()
    })
    .then(rsp => rsp.json())
    .then(result => {
      expect(result.content).toBe(comment.content);
      expect(result.userId).toBe(userIdMap[userIndex]);
    })
type Comment = any;
type UserIndex = number;
const listAndExpect = (userIndex: number, scopeIndex: number, target: { total: number; list: Array<[Comment, UserIndex]> }, grouping: string = '0,999') =>
  reqs[userIndex]('/comment/list', { scope: scopes[scopeIndex], grouping })
    .then(rsp => {
      expect(rsp.ok).toBeTruthy();
      return rsp.json()
    })
    .then(result => {
      expect(result.total).toBe(target.total);
      expect(result.comments.length).toBe(target.list.length);
      expect(Array.isArray(result.comments)).toBeTruthy();
      result.comments.forEach((element: any, i: number) => {
        expect(element.content).toBe(target.list[i][0].content);
        expect(element.userId).toBe(userIdMap[target.list[i][1]]);
        target.list[i][0].id = element.id;
      });
    })
const delAndExpect = (userIndex: number, scopeIndex: number, comment: any) =>
  reqs[userIndex]('/comment/delete', { scope: scopes[scopeIndex], commentId: comment.id }, undefined, 'DELETE')
    .then(rsp => {
      expect(rsp.ok).toBeTruthy();
      return rsp.json()
    })
    .then(rsp => rsp.json())
    .then(result => {
      expect(result.id).toBe(comment.id);
    })


beforeEach(async () => {
  await reqs[0]('/comment/test__clear')
});

it('reject when not login', async () => {
  await appRequest('/comment/create', {
    method: 'POST',
    body: {
      comment: {
        scope: 'A',
        content: 'A',
      }
    }
  })
  .then(
    rsp => expect(rsp.status).toBe(401),
  );
})

it('post for each user', async () => {
  for (const scope of scopes) {
    for (const [i, req] of reqs.entries()) {
      const content = Math.random().toString();
      const comment = {
        scope,
        content,
      }
      const result = await req('/comment/create', { scope }, { comment }, 'POST')
        .then(rsp => {
          expect(rsp.ok).toBeTruthy();
          return rsp.json()
        });
      expect(result.content).toBe(content);
      expect(result.userId).toBe(userIdMap[i]);
    }
  }
});

it('post, delete, get on scope[0], without pagination', async () => {
  const comments = [
    crComment(0, Math.random().toString()),
    crComment(0, Math.random().toString()),
    crComment(0, Math.random().toString()),
    crComment(0, Math.random().toString()),
  ];

  await crAndExpect(0, 0, comments[0]);
  await crAndExpect(0, 0, comments[1]);
  await crAndExpect(1, 0, comments[2]);
  await listAndExpect(0, 0, {
    total: 3,
    list: [
      [comments[2], 1],
      [comments[1], 0],
      [comments[0], 0],
    ],
  }, '0,999');
  await delAndExpect(0, 0, comments[1]);
  await listAndExpect(0, 0, {
    total: 2,
    list: [
      [comments[2], 1],
      [comments[0], 0],
    ],
  }, '0,999');
  await crAndExpect(0, 0, comments[3]);
  await listAndExpect(0, 0, {
    total: 3,
    list: [
      [comments[3], 0],
      [comments[2], 1],
      [comments[0], 0],
    ],
  }, '0,999');
});


it('post, delete, get on scope[0], with pagination', async () => {
  const comments = [
    crComment(0, Math.random().toString()),
    crComment(0, Math.random().toString()),
    crComment(0, Math.random().toString()),
  ];

  await crAndExpect(0, 0, comments[0]);
  await crAndExpect(0, 0, comments[1]);
  await crAndExpect(1, 0, comments[2]);
  await listAndExpect(0, 0, {
    total: 3,
    list: [
      [comments[2], 1],
      [comments[1], 0],
    ],
  }, '0,2');
  await listAndExpect(1, 0, {
    total: 3,
    list: [
      [comments[0], 0],
    ],
  }, '1,2');
  await delAndExpect(0, 0, comments[1]);
  await listAndExpect(0, 0, {
    total: 2,
    list: [
      [comments[2], 1],
      [comments[0], 0],
    ],
  }, '0,2');
});


it('post, delete, get on scope[0], scope[1], without pagination', async () => {
  const comments0 = [
    crComment(0, Math.random().toString()),
    crComment(0, Math.random().toString()),
    crComment(0, Math.random().toString()),
    crComment(0, Math.random().toString()),
  ];
  const comments1 = [
    crComment(0, Math.random().toString()),
  ];

  await crAndExpect(0, 0, comments0[0]);
  await crAndExpect(0, 0, comments0[1]);
  await crAndExpect(1, 0, comments0[2]);
  await crAndExpect(0, 1, comments1[0]);
  await listAndExpect(0, 0, {
    total: 3,
    list: [
      [comments0[2], 1],
      [comments0[1], 0],
      [comments0[0], 0],
    ],
  });
  await listAndExpect(1, 1, {
    total: 1,
    list: [
      [comments1[0], 0]
    ],
  });

  await delAndExpect(0, 0, comments0[1]);
  await delAndExpect(0, 1, comments1[0]);
  await listAndExpect(0, 0, {
    total: 2,
    list: [
      [comments0[2], 1],
      [comments0[0], 0],
    ],
  });
  await listAndExpect(0, 1, {
    total: 0,
    list: [],
  });
  
  await crAndExpect(0, 0, comments0[3]);
  await listAndExpect(0, 0, {
    total: 3,
    list: [
      [comments0[3], 0],
      [comments0[2], 1],
      [comments0[0], 0],
    ],
  });
});
