import { createLazyComponent } from "@/common/lazy-component";
import { FallbackCodeContainer } from "./Fallback";

export const LazyTinyCodeContainer = createLazyComponent({
  import: () => import("./Tiny").then(({ TinyCodeContainer }) => TinyCodeContainer),
  fallback: FallbackCodeContainer,
});
