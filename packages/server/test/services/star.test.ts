import fetch from "node-fetch";
import { appRequest } from "../../dev/request";

jest.setTimeout(50 * 1000);

let scopes = ['/page1', '/page2', '/page' + Date.now()];

const reqFactory = (userId: string) => {
  const sessionIdentiter: object = {};
  return (path: string, query?: any, body?: any, method: 'GET' | 'POST' = 'GET') => {
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

describe('init', () => {
  for (const scope of scopes) {
    it (`clear - ${scope}`, async () => {
      await reqs[0]('/star/clear', { scope }, undefined, 'POST');
    });
  }

  for (const scope of scopes) {
    for (const [i, req] of reqs.entries()) {
      it (`get - user${i} - ${scope}`, async () => {
        const result = await req('/star/get', { scope }).then(rsp => {
          expect(rsp.ok).toBeTruthy();
          return rsp.json()
        });
        expect(result.current).toBeNull();
        expect(result.total).toBe(0);
      })
    }
  }
});

describe('error', () => {
  it('reject post when not login', async () => {
    await appRequest('/star/post', {
      method: 'POST',
      query: {
        scope: '123'
      },
      body: {
        current: 1,
      }
    }).then(
      rsp => expect(rsp.status).toBe(401),
    );
  });
})

describe('single', () => {
  for (const scope of scopes) {
    for (const [i, req] of reqs.entries()) {
      for (const star of [1, 0, -1, null]) {
        it (`get - user${i} - ${scope} - star:${star}`, async () => {
          const result = await req('/star/post', { scope }, { current: star }, 'POST').then(rsp => {
            expect(rsp.ok).toBeTruthy();
            return rsp.json()
          });
          expect(result.current).toBe(star)
          expect(result.total).toBe(star || 0);
        });
      }
    }
  }
});

describe('sym', () => {
  const post = (req: (...args: any[]) => Promise<any>, scope: string, current: 1 | 0 | -1 | null) => {
    return req('/star/post', { scope }, { current }, 'POST').then(rsp => {
      expect(rsp.ok).toBeTruthy();
      return rsp.json()
    });
  };
  const get = (req: (...args: any[]) => Promise<any>, scope: string) => {
    return req('/star/get', { scope }).then(rsp => {
      expect(rsp.ok).toBeTruthy();
      return rsp.json()
    });
  };

  it('user[0] post 1 on scopes[0]', async () => {
    const result = await post(reqs[0], scopes[0], 1);
    expect(result.current).toBe(1);
    expect(result.total).toBe(1);
  });

  it('user[0] post 1 on scopes[1], again', async () => {
    const result = await post(reqs[0], scopes[1], 1);
    expect(result.current).toBe(1);
    expect(result.total).toBe(1);
  });

  it('user[1] post 1 on scopes[1]', async () => {
    const result = await post(reqs[1], scopes[1], 1);
    expect(result.current).toBe(1);
    expect(result.total).toBe(2);
  });

  it('scopes[0] should keep total 1, user[0]: 1, user[1]: null', async () => {
    let result = await get(reqs[0], scopes[0]);
    expect(result.current).toBe(1);
    expect(result.total).toBe(1);

    result = await get(reqs[1], scopes[0]);
    expect(result.current).toBeNull();
    expect(result.total).toBe(1);
  });

  it('user[1] post -1 on scopes[0]', async () => {
    const result = await post(reqs[1], scopes[0], -1);
    expect(result.current).toBe(-1);
    expect(result.total).toBe(0);
  });

  it('user[0] post null on scopes[0]', async () => {
    const result = await post(reqs[0], scopes[0], null);
    expect(result.current).toBeNull();
    expect(result.total).toBe(-1);
  });
});