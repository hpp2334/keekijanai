
import fetch from "node-fetch";
import { appRequest } from "../../dev/request";

jest.setTimeout(50 * 1000);

const routeView = '/view/put';


describe('view', () => {
  const ClientA = {};
  const ClientB = {};

  function params(scope: string, sessionIdentitier: object): [any, any] {
    return [
      routeView,
      {
        query: {
          scope,
        },
        sessionIdentity: sessionIdentitier,
      },
    ];
  }

  const scopes = ['/page1', '/page2', '/page' + Date.now()];

  for (const scope of scopes) {
    let pageViewCount: any;

    test(`use clientA visit scope "${scope}" twice, view count keep same in the second request`, async () => {
      const preData = await appRequest(...params(scope, ClientA)).then(rsp => rsp.json());
      expect(typeof preData?.view === 'number').toBeTruthy();
  
      const nextData = await appRequest(...params(scope, ClientA)).then(rsp => rsp.json());
      expect(nextData).toEqual({ view: preData.view });
      pageViewCount = preData.view;
    });
  
    test(`use clientB visit scope "${scope}", view count increase`, async () => {
      const nextData = await appRequest(...params(scope, ClientB)).then(rsp => rsp.json());
      expect(nextData).toEqual({ view: pageViewCount + 1 });
    });
  }
});

