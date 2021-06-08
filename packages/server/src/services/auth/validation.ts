import joi from 'joi';

export const userID = joi.string().token().min(4).max(15).required();
export const password = joi.string().min(6).max(20).required();
