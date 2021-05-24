import * as jwtwebtoken from 'jsonwebtoken';
import { promisify } from 'util';

const sign = promisify(jwtwebtoken.sign);
const decode = promisify(jwtwebtoken.decode);
const verify = promisify<string, string, any>(jwtwebtoken.verify);

export {
  sign,
  decode,
  verify,
}
