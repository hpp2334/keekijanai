import { ResponseError } from 'keekijanai-server-core';

export const core = {
  notExists: new Error('article core not exists'),
} 

export const notExists = new ResponseError('article not exists');
export const insufficientPriviledge = new ResponseError('user has insufficent priviledge');
