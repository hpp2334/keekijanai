import { ProviderDecoratorParams } from "./type";

export function ProviderDecorator(params: ProviderDecoratorParams) {
  return function (ctor: any) {
    ctor.prototype.options = {
      transformCamel: !!params.transformCamel,
    }
  }
}
