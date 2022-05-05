// https://www.npmjs.com/package/typescript-plugin-css-modules

declare module "*.module.css" {
  export const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  export const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.less" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.styl" {
  const classes: { [key: string]: string };
  export default classes;
}
