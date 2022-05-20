export function getBabelConfig({
  isProd,
  isTSX,
  importReplacers = [],
}: {
  isProd: boolean;
  isTSX: boolean;
  importReplacers?: Array<{ test: RegExp; replacer: (value: string) => string }>;
}) {
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "14",
          },
          modules: false,
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
      ...importReplacers.map((replacer, index) => [
        require.resolve("babel-plugin-replace-imports"),
        replacer,
        `babel-plugin-replace-imports:${index + 1}`,
      ]),
      isProd && ["transform-remove-console", { exclude: ["error", "warn"] }],
    ].filter(Boolean) as any[],
  };
}
