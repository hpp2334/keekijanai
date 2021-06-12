import { ProviderDecoratorParams } from "./type";

const providerBase = {};

export function ProviderDecorator(params: ProviderDecoratorParams) {
  return function (ctor: any) {
    Object.setPrototypeOf(ctor.prototype, providerBase);
    ctor.prototype.options = {
      transformCamel: !!params.transformCamel,
    }
  }
}
