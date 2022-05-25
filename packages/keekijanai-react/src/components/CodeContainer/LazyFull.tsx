import { createLazyComponent } from "@/common/lazy-component";
import { FallbackCodeContainer } from "./Fallback";

export const LazyFullCodeContainer = createLazyComponent({
  import: () => import("./Full").then(({ FullCodeContainer }) => FullCodeContainer),
  fallback: FallbackCodeContainer,
});
