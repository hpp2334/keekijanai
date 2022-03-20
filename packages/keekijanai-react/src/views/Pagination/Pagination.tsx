import React, { useCallback } from "react";

import { Pagination as NativePagination } from "@/components";
import { withCSSBaseline } from "@/common/hoc/withCSSBaseline";

export const Pagination = withCSSBaseline(NativePagination);
