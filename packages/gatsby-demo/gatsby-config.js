
module.exports = {
  flags: {
    DEV_SSR: true,
    PRESERVE_WEBPACK_CACHE: true,
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-keekijanai',
      options: {
        core: {
          route: {
            root: process.env.USE_SUPABASE
              ? '/api/blog-common'
              : '/api/local-dev',
          },
        },
        authModal: {
          enableLegacyAuth: true,
        },
      }
    },
  ],
}