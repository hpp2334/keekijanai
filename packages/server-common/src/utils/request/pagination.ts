import joi from 'joi';

export const strValidation = joi.string().pattern(/^\w+,\w+$/).required();

export const validation = joi.object({
  skip: joi.number().integer().min(0).required(),
  take: joi.number().integer().min(0).required(),
}).required();

/** Assume that "groupingString" is valid grouping string,
 * so you should validate it first. */
export function parse(groupingString: string) {
  const [_skip, _take] = groupingString.split(',');
  const skip = parseInt(_skip);
  const take = parseInt(_take);

  return {
    skip,
    take,
  }
}

/** Assume that "grouping" is valid grouping object,
 * so you should validate it first. */
export function stringify(grouping: any) {
  return `${grouping.skip},${grouping.take}`;
}