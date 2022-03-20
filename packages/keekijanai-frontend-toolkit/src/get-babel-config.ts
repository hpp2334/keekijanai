export function getBabelConfig({ isProd, isTSX }: { isProd: boolean; isTSX: boolean }) {
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "12",
          },
        },
      ],
      [
        "@babel/preset-react",
        {
          runtime: "automatic",
        },
      ],
      [
        "@babel/preset-typescript",
        {
          isTSX,
          allExtensions: true,
        },
      ],
    ],
    plugins: [
      [
        require.resolve("babel-plugin-module-resolver"),
        {
          root: ["./src"],
          alias: {
            "@": "./src",
          },
        },
      ],
      "babel-plugin-transform-typescript-metadata",
      [
        "babel-plugin-import",
        {
          libraryName: "@material-ui/core",
          libraryDirectory: "",
          camel2DashComponentName: false,
        },
        "core",
      ],
      [
        "babel-plugin-import",
        {
          libraryName: "@material-ui/icons",
          libraryDirectory: "",
          camel2DashComponentName: false,
        },
        "icons",
      ],
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      isProd && ["transform-remove-console", { exclude: ["error", "warn"] }],
    ].filter(Boolean) as any[],
  };
}
