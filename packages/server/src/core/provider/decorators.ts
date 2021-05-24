import { ProviderDecoratorParams } from "./type";

const providerBase = {};

export function ProviderDecorator(params: ProviderDecoratorParams) {
  return function (ctor: any) {
    ctor.prototype = Object.create(providerBase);
    ctor.prototype.options = {
      transformCamel: !!params.transformCamel,
    }
  }
}
