import styles from "./pagination.module.scss";
import React, { useCallback } from "react";
import { Stack } from "@/components";
import { withCSSBaseline } from "@/common/hoc/withCSSBaseline";
import { MdChevronLeft, MdChevronRight, MdMoreHoriz } from "react-icons/md";
import { range } from "@/common/helper";
import clsx from "clsx";

export interface PaginationProps {
  /** total page number */
  count: number;
  /** current page, start from 1 */
  page: number;
  onChange: (nextPage: number) => void;
}

interface PaginationButtonProps {
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const DEFAULT_SHOW_NEIGHBOR_PAGE_BUTTON = 2;

function PaginationButton({ disabled, active, children, onClick }: PaginationButtonProps) {
  return (
    <button disabled={disabled} className={clsx(styles.paginationButton, active && styles.active)} onClick={onClick}>
      {children}
    </button>
  );
}

function PaginationMore() {
  return (
    <div>
      <MdMoreHoriz />
    </div>
  );
}

function PaginationRoot({ count, page, onChange }: PaginationProps) {
  const includeFirstPage = page - DEFAULT_SHOW_NEIGHBOR_PAGE_BUTTON <= 1;
  const includeLastPage = page + DEFAULT_SHOW_NEIGHBOR_PAGE_BUTTON >= count;
  const startPage = Math.max(page - DEFAULT_SHOW_NEIGHBOR_PAGE_BUTTON, 1);
  const endPage = Math.min(page + DEFAULT_SHOW_NEIGHBOR_PAGE_BUTTON, count);

  return (
    <div className={styles.paginationRoot}>
      <Stack direction="row" alignItems="center" spacing={3}>
        <PaginationButton
          disabled={page === 1}
          onClick={() => {
            onChange(page - 1);
          }}
        >
          <MdChevronLeft />
        </PaginationButton>
        {!includeFirstPage && (
          <PaginationButton
            onClick={() => {
              onChange(1);
            }}
            active={page === 1}
          >
            1
          </PaginationButton>
        )}
        {startPage > 2 && (
          <PaginationButton disabled>
            <PaginationMore />
          </PaginationButton>
        )}
        {range(startPage, endPage + 1).map((iterPage: number) => (
          <PaginationButton
            key={iterPage}
            active={iterPage === page}
            onClick={() => {
              onChange(iterPage);
            }}
          >
            {iterPage}
          </PaginationButton>
        ))}
        {endPage < count - 1 && (
          <PaginationButton disabled>
            <PaginationMore />
          </PaginationButton>
        )}
        {!includeLastPage && (
          <PaginationButton
            active={page === count}
            onClick={() => {
              onChange(count);
            }}
          >
            {count}
          </PaginationButton>
        )}
        <PaginationButton
          disabled={page === count}
          onClick={() => {
            onChange(page + 1);
          }}
        >
          <MdChevronRight />
        </PaginationButton>
      </Stack>
    </div>
  );
}

const withFeature = withCSSBaseline;

export const Pagination = withFeature(PaginationRoot);
