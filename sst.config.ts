/// <reference path="./.sst/platform/config.d.ts" />
require('dotenv').config({ path: '.env' });

export default $config({
  app(input) {
    return {
      name: 'hopper',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  async run() {
    new sst.aws.Nextjs('MyWeb', {
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '', // this line is critical
      },
    });
  },
});
