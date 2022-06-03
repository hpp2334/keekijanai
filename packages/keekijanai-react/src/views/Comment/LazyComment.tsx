import { createLazyComponent } from "@/common/lazy-component";

export const LazyComment = createLazyComponent({
  import: () => import("./Comment").then(({ Comment }) => Comment),
  fallback: () => <div>Loading...</div>,
});
