module.exports = {
  extends: ["../../.eslintrc", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  parserOptions: { tsconfigRootDir: __dirname, project: ["./tsconfig.json"] },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/prop-types": "off",
  },
};
