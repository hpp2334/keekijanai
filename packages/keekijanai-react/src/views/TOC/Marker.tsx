import { useInternalTOCContext } from "./Context";

export function TOCClearMarker() {
  const { tocService } = useInternalTOCContext();

  tocService.clearHeadings();

  return null;
}
