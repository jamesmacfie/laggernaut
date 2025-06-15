const getEnv = key => {
  const value = process.env[key];
  if (!value) throw Error(`Missing environment variable: ${key}`);
  return value;
};

// TODO: refactor to use the exported envs. Used now as a check
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['ui', 'tailwind-config'],
  experimental: {
    typedRoutes: true,
  },
  publicRuntimeConfig: {
    NEXT_APP_URL: getEnv('NEXT_APP_URL'),
    SUPABASE_URL: getEnv('SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY'),
  },
};
