/// <reference types="../../node_modules/@types/jest" />
import { requester, ValidUser } from "../utils/requester";

jest.setTimeout(50 * 1000);

beforeAll(async () => {
  await requester.init();
})

beforeEach(async () => {
  await requester.request('admin1', '/comment/test__clear', {
    method: 'DELETE'
  })
});

test('reject when not login', async () => {
  await requester.request(undefined, '/comment/create', {
    method: 'POST',
    query: {
      scope: 'A',
    },
    body: {
      comment: createComment(),
    }
  })
  .then(
    rsp => expect(rsp.status).toBe(401),
  );
})

test('post for each user', async () => {
  for (const scope of ['A', 'B']) {
    for (const user of ['admin1', 'user2'] as ValidUser[]) {
      await createAndExpect(scope, user)
    }
  }
});

test('post, delete, get on scope \'cc\', without pagination', async () => {
  const comments = [
    await createAndExpect('cc', 'admin1'),
    await createAndExpect('cc', 'admin1'),
    await createAndExpect('cc', 'user2'),
    createComment(),
  ]

  await listAndExpect(
    'cc',
    'admin1',
    {
      total: 3,
      list: [
        [comments[2], 'user2'],
        [comments[1], 'admin1'],
        [comments[0], 'admin1'],
      ],
    }
  )

  comments[3] = await createAndExpect('cc', 'admin1');

  await listAndExpect(
    'cc', 'admin1', {
      total: 4,
      list: [
        [comments[3], 'admin1'],
        [comments[2], 'user2'],
        [comments[1], 'admin1'],
        [comments[0], 'admin1']
      ],
    }
  )
});


test('post, delete, get on scope \'A\', with pagination', async () => {
  const comments = [
    createComment(),
    createComment(),
    createComment(),
  ];

  await createAndExpect('A', 'user2', comments[0]);
  await createAndExpect('A', 'admin1', comments[1]);
  await createAndExpect('A', 'user2', comments[2]);

  await listAndExpect(
    'A', 'admin1', {
      total: 3,
      list: [
        [comments[2], 'user2'],
        [comments[1], 'admin1'],
      ],
    }, {
      grouping: '0,2'
    }
  )
  await listAndExpect(
    'A', 'admin1', {
      total: 3,
      list: [
        [comments[0], 'user2'],
      ],
    }, {
      grouping: '1,2'
    }
  )
  await deleteAndExpect('A', 'admin1', comments[1]);
  
  await listAndExpect(
    'A', 'admin1', {
      total: 2,
      list: [
        [comments[2], 'user2'],
        [comments[0], 'user2'],
      ],
    }, {
      grouping: '0,2'
    }
  )
});


test('post, post in parent', async () => {
  const commentPar = await createAndExpect('C', 'user2');
  const commentChild = await createAndExpect('C', 'user2', createComment(undefined, commentPar.id, undefined));
  
  await listAndExpect(
    'C', 'admin1', {
      total: 1,
      list: [
        [commentPar, 'user2'],
      ],
    }
  );

  await listAndExpect(
    'C', 'admin1', {
      total: 1,
      list: [
        [commentChild, 'user2'],
      ],
    }, {
      parentId: commentPar.id,
    }
  );
});

test('post, post and ref', async () => {
  const commentPar = await createAndExpect('C', 'user2');
  const commentChild = await createAndExpect('C', 'user2', createComment(undefined, undefined, commentPar.id));
});

test('del owner comment', async () => {
  const comment = await createAndExpect('D', 'user2');
  await deleteAndExpect('D', 'user2', comment);
});

test("del other user's comment, expect error", async () => {
  const comment = await createAndExpect('D', 'admin1');
  await deleteAndExpect('D', 'user2', comment, false);
});

test('admin del other user\'s comment, expect success', async () => {
  const comment = await createAndExpect('D', 'user2');
  await deleteAndExpect('D', 'admin1', comment);
});





// Helpers ====


const createComment = (content?: string | undefined, par?: number, ref?: number) => {
  const c = content ?? Math.random().toString();
  return {
    content: c,
    plainText: c,
    referenceId: ref,
    parentId: par,
  }
};
const expectCreate = (scope: string, user: ValidUser, comment: any, rsp: Response) => {
  expect(rsp.ok).toBeTruthy();
  return rsp.json().then(result => {
    expect(result.content).toBe(comment.content);
    expect(result.referenceId).toBe(comment.referenceId ?? null);
    expect(result.parentId).toBe(comment.parentId ?? null);
    expect(result.scope).toBe(scope);
    expect(result.userId).toBe(user);
    return result;
  })
}
const createAndExpect = (scope: string, user: ValidUser, comment?: any): Promise<any> => {
  comment = comment ?? createComment();
  return requester.request(user, '/comment/create', {
    method: 'POST',
    query: { scope },
    body: {
      comment,
    }
  }).then(expectCreate.bind(null, scope, user, comment));
}

const expectList = (
  target: { total: number; list: Array<[any, ValidUser]> },
  rsp: Response,
) => {
  expect(rsp.ok).toBeTruthy();
  return rsp.json().then(result => {
    expect(result.total).toBe(target.total);
    expect(result.comments.length).toBe(target.list.length);
    expect(Array.isArray(result.comments)).toBeTruthy();
    result.comments.forEach((element: any, i: number) => {
      expect(element.content).toBe(target.list[i][0].content);
      expect(element.userId).toBe(target.list[i][1]);
      target.list[i][0].id = element.id;
    });
    return result;
  })
}

const listAndExpect = (
  scope: string,
  user: ValidUser,
  target: { total: number; list: Array<[any, ValidUser]> },
  opts?: {
    parentId?: number;
    grouping?: string;
  }
) => {
  return requester.request(user, '/comment/list', {
    method: 'GET',
    query: {
      scope,
      parentId: opts?.parentId,
      grouping: opts?.grouping ?? '0,999',
    },
  }).then(expectList.bind(null, target))
}

const expectDeleteTruthy = (comment: any, rsp: Response) => {
  expect(rsp.ok).toBeTruthy();
  return rsp.json().then(result => {
    expect(result.id).toBe(comment.id);
  });
};
const expectDeleteFalsy = (rsp: Response) => {
  expect(rsp.ok).toBeFalsy();
}
const deleteAndExpect = (
  scope: string,
  user: ValidUser,
  comment: any,
  expectTruthy = true,
) => {
  return requester.request(user, '/comment/delete', {
    method: 'DELETE',
    query: {
      scope,
      commentId: comment.id,
    },
  }).then(
    expectTruthy ? expectDeleteTruthy.bind(null, comment) : expectDeleteFalsy
  );
}