import { AuthController } from "./controllers/auth";
import { CommentController } from "./controllers/comment";
import { StarController } from "./controllers/star";
import { ViewController } from "./controllers/view";
import { controllerFactory } from "./core/controller";
import { Manager } from "./core/manager";
import { Context, Core } from "./type";
import { Router } from "./_framework";

// const app = new App();

// const scopeAssertion = middlewareFactory.assertMiddlewareFactory(
//   (ctx) => { return typeof ctx.req.query?.scope === 'string' },
//   '"scope" is not a string',
//   TypeError
// );

// router.add('/comment/get', scopeAssertion, async (ctx, next) => {
//   const client = ctx.state.client;
//   const scope = ctx.req.query['scope'] as string;
//   const rsp = await client.listComment(scope);
//   ctx.res.body = rsp;
// });

// router.add('/comment/post', scopeAssertion, async (ctx) => {
//   const client = ctx.state.client;

//   const scope = ctx.req.query['scope'] as string;
//   const comment = ctx.req.body['comment'];

//   if (!comment) {
//     throw TypeError('comment should be an object');
//   }

//   const rsp = await client.addComment(scope, comment);
//   ctx.res.body = rsp;
// });

// router.add('/comment/delete', scopeAssertion, async (ctx) => {
//   const client = ctx.state.client;
//   const scope = ctx.req.query['scope'] as string;
//   const commentId = ctx.req.query['commentId'];

//   if (typeof commentId !== 'string') {
//     throw TypeError(`commentId is not string "${commentId}".`);
//   }

//   const rsp = await client.removeComment(scope, commentId);
//   ctx.res.body = rsp;
// });

// router.add('/pv', scopeAssertion, async (ctx) => {
//   const client = ctx.state.client;
//   const scope = ctx.req.query['scope'] as string;
//   const rsp = await client.increasePV(scope);
//   ctx.res.body = rsp;
// });

// router.add('/star/get', scopeAssertion, async (ctx) => {
//   const client = ctx.state.client;
//   const scope = ctx.req.query['scope'] as string;
//   const rsp = await client.getStar(scope);
//   ctx.res.body = rsp;
// });

// router.add('/star/put', scopeAssertion, async (ctx) => {
//   const client = ctx.state.client;
//   const scope = ctx.req.query['scope'] as string;
//   const star = ctx.req.body['star'];

//   if (star !== null && star !== -1 && star !== 0 && star !== 1) {
//     throw TypeError(`star is not number. "${star}"`);
//   }

//   const rsp = await client.updateStar(scope, star);
//   ctx.res.body = rsp;
// });

export function setupRoutes(router: Router, manager: Manager) {
  const
    authController = controllerFactory(AuthController, manager),
    viewController = controllerFactory(ViewController, manager),
    starController = controllerFactory(StarController, manager),
    commentController = controllerFactory(CommentController, manager)

  router.add('/auth/current', authController.getCurrent);
  router.add('/auth/login', authController.auth)
  router.add('/auth/accessToken', authController.oauth2GetAccessToken);

  router.add('/view/put', viewController.get);

  router.add('/star/clear', starController.clear);
  router.add('/star/post', starController.post);
  router.add('/star/get', starController.get);

  router.add('/comment/create', commentController.create);
  router.add('/comment/list', commentController.list);
  router.add('/comment/delete', commentController.delete);

  if (process.env.NODE_ENV === 'test') {
    router.add('/comment/test__clear', commentController.TEST__clear);
  }
  if (process.env.DEBUG?.startsWith('keekijanai')) {
    router.add('/notify/test__send', async (ctx: Context) => {
      const query = ctx.req.query;
      if (!query) {
        throw Error('should config query');
      }
      const { msg } = query;

      const service = await ctx.getService('notify');
      await service.notify(msg);
    });
  }
}
