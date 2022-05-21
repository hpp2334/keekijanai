import { createServiceHook } from "@/common/service";
import { CommentServiceFactory, createService } from "@keekijanai/frontend-core";
import { useMemo } from "react";

export const useCommentService = createServiceHook(CommentServiceFactory);
