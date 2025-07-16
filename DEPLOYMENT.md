# 🚀 AWS Deployment Guide with SST

This guide will help you deploy your HopperFlix application to AWS using SST (Serverless Stack).

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI**: Install and configure AWS CLI
3. **Node.js**: Version 18 or higher
4. **SST CLI**: Install SST globally

## Setup Instructions

### 1. Install SST CLI

```bash
npm install -g sst
```

### 2. Configure AWS Credentials

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, default region, and output format.

### 3. Set Up Environment Variables

Create a `.env` file in your project root:

```bash
cp env.example .env
```

Edit `.env` and add your actual values:

```env
OPENAI_API_KEY=your_actual_openai_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Deploy to Development

```bash
# Deploy to development stage
npm run deploy
# or
yarn deploy
```

### 5. Deploy to Production

```bash
# Deploy to production stage
npm run deploy:prod
# or
yarn deploy:prod
```

## Environment Variables Management

### Development

- Use `.env` for local development
- Variables are loaded automatically by Next.js

### Production (SST)

- Environment variables are managed through SST configuration
- Sensitive variables (like API keys) are stored securely in AWS Systems Manager Parameter Store
- Public variables are available at build time

### Required Environment Variables

| Variable               | Description          | Required      | Example                   |
| ---------------------- | -------------------- | ------------- | ------------------------- |
| `OPENAI_API_KEY`       | Your OpenAI API key  | Yes           | `sk-...`                  |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the app | No (auto-set) | `https://your-domain.com` |

## Deployment Stages

### Development Stage

- **Purpose**: Testing and development
- **Command**: `sst deploy`
- **Resources**: Can be removed after testing

### Production Stage

- **Purpose**: Live production environment
- **Command**: `sst deploy --stage production`
- **Resources**: Protected from accidental deletion

## Useful Commands

```bash
# Deploy to development
npm run deploy

# Deploy to production
npm run deploy:prod

# Remove development resources
npm run remove

# Open SST console
npm run console

# Start SST development mode
npm run dev:sst
```

## Post-Deployment

After successful deployment:

1. **Get the URL**: SST will output the deployment URL
2. **Test the Application**: Visit the URL and test all features
3. **Monitor Logs**: Use AWS CloudWatch for monitoring
4. **Set Up Custom Domain** (Optional): Configure Route 53 for custom domain

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   - Ensure `.env` exists with required variables
   - Check that `OPENAI_API_KEY` is set correctly

2. **AWS Permissions**

   - Ensure your AWS credentials have sufficient permissions
   - Required services: CloudFormation, Lambda, API Gateway, S3, CloudFront

3. **Build Failures**
   - Check for TypeScript errors: `npm run lint`
   - Ensure all dependencies are installed: `npm install`

### Getting Help

- Check SST documentation: https://docs.sst.dev/
- View deployment logs in AWS CloudWatch
- Use `sst console` to inspect deployed resources

## Security Notes

- Never commit `.env` to version control
- API keys are automatically encrypted by SST
- Production deployments use secure parameter storage
- All sensitive data is handled server-side

## Cost Optimization

- Development stage resources are removed after testing
- Production resources are optimized for cost
- Monitor AWS billing dashboard for usage
- Consider using AWS Cost Explorer for detailed analysis
