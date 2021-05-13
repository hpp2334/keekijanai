import { AuthController } from "./controllers/auth";
import { CommentController } from "./controllers/comment";
import { StarController } from "./controllers/star";
import { UserController } from "./controllers/user";
import { ViewController } from "./controllers/view";
import { controllerFactory } from "./core/controller";
import { Manager } from "./core/manager";
import { Context, Core } from "./type";
import { Router } from "./_framework";

export function setupRoutes(router: Router, manager: Manager) {
  const
    authController = controllerFactory(AuthController, manager),
    viewController = controllerFactory(ViewController, manager),
    starController = controllerFactory(StarController, manager),
    commentController = controllerFactory(CommentController, manager),
    userController = controllerFactory(UserController, manager)

  router.add('/auth/current', authController.getCurrent);
  router.add('/auth/login', authController.auth)
  router.add('/auth/accessToken', authController.oauth2GetAccessToken);

  router.add('/user/get', userController.get);

  router.add('/view/put', viewController.get);

  router.add('/star/clear', starController.clear);
  router.add('/star/post', starController.post);
  router.add('/star/get', starController.get);

  router.add('/comment/get', commentController.get);
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
