# 🚀 PWA Deployment Guide - AWS S3 + CloudFront + GitHub Actions

This guide will walk you through setting up automatic deployment of your Expense Split PWA to AWS S3 with CloudFront CDN using GitHub Actions.

## 📋 Prerequisites

- ✅ AWS Account with programmatic access
- ✅ GitHub repository for your project
- ✅ AWS CLI installed locally (for setup)
- ✅ Domain name (optional, for custom domain)

## 🏗️ Step 1: AWS Infrastructure Setup

### Option A: Automated Setup (Recommended)

Use the provided script to automatically create all AWS resources:

```bash
# Run the setup script
./scripts/setup-aws-infrastructure.sh [bucket-name] [aws-region]

# Example:
./scripts/setup-aws-infrastructure.sh expense-split-pwa-prod us-east-1
```

### Option B: Manual Setup

#### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-pwa-bucket-name --region us-east-1

# Enable static website hosting
aws s3 website s3://your-pwa-bucket-name \
  --index-document index.html \
  --error-document index.html
```

#### 2. Set Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-pwa-bucket-name/*"
    }
  ]
}
```

#### 3. Create CloudFront Distribution

- Origin: Your S3 bucket website endpoint
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Custom Error Pages: 404 and 403 redirect to `/index.html`
- Compression: Enabled
- Price Class: Use Only US, Canada and Europe (cheaper)

## 🔐 Step 2: GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

### Required Secrets

1. **Go to GitHub Repository → Settings → Secrets and variables → Actions**

2. **Add the following secrets:**

| Secret Name                     | Description                | Example                                    |
| ------------------------------- | -------------------------- | ------------------------------------------ |
| `AWS_ACCESS_KEY_ID`             | AWS IAM user access key    | `AKIAIOSFODNN7EXAMPLE`                     |
| `AWS_SECRET_ACCESS_KEY`         | AWS IAM user secret key    | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `S3_BUCKET_NAME`                | Your S3 bucket name        | `expense-split-pwa-prod`                   |
| `CLOUDFRONT_DISTRIBUTION_ID`    | CloudFront distribution ID | `E1PA6795UKMFR9`                           |
| `EXPO_PUBLIC_SUPABASE_URL`      | Your Supabase project URL  | `https://xyz.supabase.co`                  |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key     | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  |

### AWS IAM Policy

Create an IAM user with the following policy for deployment:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-pwa-bucket-name",
        "arn:aws:s3:::your-pwa-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    }
  ]
}
```

## ⚙️ Step 3: GitHub Actions Workflow

The workflow is already configured in `.github/workflows/deploy-pwa.yml`. Here's what it does:

### Workflow Features

- 🔄 **Automatic Deployment**: Deploys on push to main/master
- 🧪 **Testing**: Runs linting before deployment
- 📦 **Optimized Caching**: Different cache strategies for different file types
- 🚀 **CloudFront Invalidation**: Clears CDN cache for instant updates
- 🎯 **Manual Trigger**: Can be triggered manually from GitHub UI

### Caching Strategy

| File Type      | Cache Duration | Strategy                     |
| -------------- | -------------- | ---------------------------- |
| HTML files     | No cache       | `max-age=0,must-revalidate`  |
| Service Worker | No cache       | `max-age=0,must-revalidate`  |
| Static Assets  | 1 year         | `max-age=31536000,immutable` |
| Manifest       | 1 day          | `max-age=86400`              |

## 🚀 Step 4: Deploy Your PWA

### Automatic Deployment

1. **Push to main branch:**

   ```bash
   git add .
   git commit -m "feat: deploy PWA"
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to GitHub → Actions tab
   - Watch the deployment progress
   - Check for any errors in the logs

### Manual Deployment

1. **Go to GitHub Repository → Actions**
2. **Select "Deploy PWA to AWS S3" workflow**
3. **Click "Run workflow" → "Run workflow"**

## 🌐 Step 5: Custom Domain (Optional)

### Using Route 53 + ACM

1. **Request SSL Certificate:**

   ```bash
   aws acm request-certificate \
     --domain-name yourdomain.com \
     --domain-name www.yourdomain.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Update CloudFront Distribution:**
   - Add your domain to "Alternate Domain Names"
   - Select your SSL certificate
   - Update Route 53 records to point to CloudFront

### Using Custom Domain Provider

1. **Add CNAME record:**
   ```
   CNAME: www → your-cloudfront-domain.cloudfront.net
   CNAME: @ → your-cloudfront-domain.cloudfront.net
   ```

## 📊 Step 6: Monitoring & Analytics

### CloudWatch Monitoring

Monitor your deployment with AWS CloudWatch:

- S3 bucket metrics
- CloudFront access patterns
- Error rates and response times

### GitHub Actions Monitoring

- Deployment success/failure rates
- Build times and performance
- Cost tracking for AWS resources

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Deployment Fails with 403 Error**

```bash
# Check bucket policy and IAM permissions
aws s3api get-bucket-policy --bucket your-bucket-name
```

#### 2. **CloudFront Not Updating**

```bash
# Manual invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### 3. **Build Fails**

- Check environment variables are set correctly
- Verify all dependencies are in package.json
- Check for TypeScript errors

#### 4. **PWA Not Installing**

- Ensure HTTPS is enabled
- Check service worker registration
- Verify manifest.json is accessible

### Debug Commands

```bash
# Check S3 bucket contents
aws s3 ls s3://your-bucket-name --recursive

# Check CloudFront distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Test PWA locally
npm run pwa:build && npm run pwa:serve
```

## 💰 Cost Estimation

### AWS Costs (Monthly)

| Service     | Usage         | Estimated Cost   |
| ----------- | ------------- | ---------------- |
| S3 Storage  | 1GB           | $0.023           |
| S3 Requests | 10K requests  | $0.004           |
| CloudFront  | 10GB transfer | $0.85            |
| Route 53    | 1 hosted zone | $0.50            |
| **Total**   |               | **~$1.38/month** |

### GitHub Actions

- Free tier: 2,000 minutes/month
- Typical deployment: ~5 minutes
- Can handle ~400 deployments/month for free

## 🔄 Step 7: Continuous Integration Enhancements

### Branch Protection Rules

1. **Require status checks:**

   - Lint check must pass
   - Build must succeed

2. **Require pull request reviews:**
   - At least 1 reviewer for production deployments

### Environment-Specific Deployments

Create separate workflows for different environments:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [develop]

env:
  S3_BUCKET_NAME: expense-split-pwa-staging
```

### Slack/Discord Notifications

Add notification steps to your workflow:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 📈 Performance Optimization

### Build Optimization

- Bundle analysis with `webpack-bundle-analyzer`
- Tree shaking for unused code
- Code splitting for route-based chunks

### CDN Optimization

- Enable Brotli compression
- HTTP/2 server push for critical resources
- Proper cache headers for different content types

## 🔐 Security Best Practices

### AWS Security

- Use least-privilege IAM policies
- Enable S3 bucket logging
- Set up CloudTrail for API monitoring
- Regular access key rotation

### Application Security

- Content Security Policy (CSP) headers
- Subresource Integrity (SRI) for external resources
- HTTPS-only cookies and storage
- Regular dependency updates

## 📋 Deployment Checklist

### Pre-deployment

- [ ] AWS infrastructure set up
- [ ] GitHub secrets configured
- [ ] Domain and SSL configured (if using custom domain)
- [ ] Environment variables set
- [ ] Build process tested locally

### Post-deployment

- [ ] PWA installation works on mobile devices
- [ ] Service worker caching functions correctly
- [ ] Offline functionality tested
- [ ] Performance metrics acceptable
- [ ] Error monitoring in place

## 🎯 Next Steps

After successful deployment:

1. **Set up monitoring and alerting**
2. **Configure performance tracking**
3. **Set up user analytics**
4. **Plan for blue-green deployments**
5. **Implement feature flags**

---

## 📞 Support

If you encounter issues:

1. Check the GitHub Actions logs
2. Review AWS CloudWatch logs
3. Test locally with `npm run pwa:serve`
4. Verify all secrets are correctly set
5. Check AWS service status

Your PWA is now ready for production deployment! 🎉
