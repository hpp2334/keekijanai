import React from 'react';
import { Comment as TypeComment, User } from 'keekijanai-type';
import { mergeStylesLeft, StylesProps } from '../../../util/style';
import CommentItem from './CommentItem';
import InfiniteScroll from 'react-infinite-scroller';

import './CommentList.scss';
import { useMemo } from 'react';
import { Button } from '../../../ui';

interface CommentListProps extends StylesProps {
  data: TypeComment.Get[];
  total: number;
  renderItem: (params: {
    comment: TypeComment.Get;
    index: number
  }) => React.ReactNode;
  children?: React.ReactNode;
  maxHeight: number;
}

export default function CommentList(props: CommentListProps) {
  const {
    maxHeight,
    data,
    renderItem,

    total,
  } = props;

  const styleCommentList = useMemo(() => {
    const style: React.CSSProperties = {
      maxHeight,
    };
    return style;
  }, [maxHeight]);

  return (
    <div {...mergeStylesLeft("kkjn__comment-list", styleCommentList, props)}>
      {data.map((comment, index) => renderItem({ comment, index }))}
      {props.children}
    </div>
  )
}
