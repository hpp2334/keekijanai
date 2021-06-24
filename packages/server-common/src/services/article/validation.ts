import { paginationUtil } from '@/utils/request';
import joi from 'joi';

const id = joi.string().pattern(/^[0-9]+$/, 'numbers').required();
const fields = joi.array().items(joi.string());
const payload = joi.object().unknown().required();

export const list = {
  body: joi.object({
    where: joi.object({
      scope: joi.string(),
      creatorId: joi.string(),
    }).or('scope', 'creatorId'),
    pagination: paginationUtil.validation,
    fields,
  }).unknown(),
};

export const get = {
  query: joi.object({
    id,
    fields,
  }).unknown(),
};

export const create = {
  body: payload,
};

export const updateArticleCore = {
  query: joi.object({
    id,
  }).unknown(),
  body: payload,
}

export const remove = {
  query: joi.object({
    id
  }).unknown(),
}
