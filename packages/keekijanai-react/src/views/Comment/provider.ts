import { CommentService } from "@keekijanai/frontend-core";
import { createServiceProvider } from "@/common/service";

const { useProvider, Provider } = createServiceProvider(CommentService);

export { useProvider as useCommentService, Provider as CommentProvider };
