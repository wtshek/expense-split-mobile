# 🔍 Finding AWS Credentials - Step-by-Step Guide

## 🔑 AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY

### Method 1: Create New IAM User (Recommended)

1. **Login to AWS Console**

   - Go to: https://console.aws.amazon.com/

2. **Navigate to IAM**

   - Search for "IAM" in the top search bar
   - Click on "IAM" service

3. **Create New User**

   - Click "Users" in the left sidebar
   - Click "Add users" (or "Create user")
   - Enter username: `expense-split-deployer`

4. **Set Access Type**

   - ✅ Select "Programmatic access"
   - ❌ Uncheck "AWS Management Console access" (not needed)

5. **Set Permissions**

   - Click "Attach existing policies directly"
   - Search and select:
     - `AmazonS3FullAccess`
     - `CloudFrontFullAccess`
   - Click "Next"

6. **Review and Create**

   - Review settings
   - Click "Create user"

7. **Download Credentials** ⚠️ **IMPORTANT**
   - **Access Key ID**: Copy this (starts with `AKIA...`)
   - **Secret Access Key**: Copy this (long string)
   - Click "Download .csv" to save a backup
   - **You cannot view the secret key again after closing this page**

### Method 2: Use Existing IAM User

1. **Go to IAM → Users**

   - Find your existing user
   - Click on the username

2. **Security Credentials Tab**

   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next"

3. **Download Keys**
   - Copy both keys immediately
   - Download CSV file as backup

## 🌐 CLOUDFRONT_DISTRIBUTION_ID

### Method 1: From Setup Script (Easiest)

When you run the infrastructure setup script:

```bash
./scripts/setup-aws-infrastructure.sh your-bucket-name us-east-1
```

Look for this output:

```
✅ AWS Infrastructure setup complete!

📝 Configuration Summary:
  S3 Bucket: your-bucket-name
  CloudFront Distribution ID: E1PA6795UKMFR9  ← This is what you need
  CloudFront Domain: xyz123.cloudfront.net
```

### Method 2: Find in AWS Console

1. **Go to CloudFront Console**

   - URL: https://console.aws.amazon.com/cloudfront/home

2. **Find Your Distribution**
   - Look for the distribution with your S3 bucket name
   - The **ID** column shows the distribution ID
   - Example: `E1PA6795UKMFR9`

## 📝 Adding to GitHub Secrets

Once you have all the values:

1. **Go to your GitHub repository**
2. **Click Settings → Secrets and variables → Actions**
3. **Click "New repository secret"**
4. **Add each secret:**

| Secret Name                  | Example Value                              | Where to Find                      |
| ---------------------------- | ------------------------------------------ | ---------------------------------- |
| `AWS_ACCESS_KEY_ID`          | `AKIAIOSFODNN7EXAMPLE`                     | IAM User → Security credentials    |
| `AWS_SECRET_ACCESS_KEY`      | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | IAM User → Create access key       |
| `S3_BUCKET_NAME`             | `expense-split-pwa-prod`                   | Your chosen bucket name            |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1PA6795UKMFR9`                           | CloudFront console or setup script |

## 🛡️ Security Best Practices

### IAM User Permissions (Minimal Policy)

Instead of full access, use this minimal policy:

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
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "*"
    }
  ]
}
```

### Access Key Security

- ✅ Only use access keys for programmatic access
- ✅ Rotate keys regularly (every 90 days)
- ✅ Never commit keys to version control
- ✅ Use GitHub secrets for storage
- ❌ Don't share keys in plain text

## 🚨 Troubleshooting

### "Access Denied" Errors

- Check IAM user has correct permissions
- Verify bucket name matches exactly
- Ensure user has S3 and CloudFront permissions

### "Invalid Access Key" Errors

- Regenerate access keys
- Copy keys exactly (no extra spaces)
- Ensure you're using the latest keys

### Can't Find CloudFront Distribution

- Run the setup script first
- Check you're in the correct AWS region
- Look for distributions with your bucket as origin

## 🔄 Quick Setup Commands

```bash
# 1. Run infrastructure setup
./scripts/setup-aws-infrastructure.sh my-pwa-bucket us-east-1

# 2. The script will output all the values you need:
#    - S3_BUCKET_NAME
#    - CLOUDFRONT_DISTRIBUTION_ID
#    - Plus instructions for GitHub secrets

# 3. Create IAM user manually (see steps above)

# 4. Add all secrets to GitHub

# 5. Deploy!
git push origin main
```

## 📞 Still Need Help?

If you're still having trouble:

1. **Check AWS Console URLs:**

   - IAM: https://console.aws.amazon.com/iam/home#/users
   - CloudFront: https://console.aws.amazon.com/cloudfront/home
   - S3: https://console.aws.amazon.com/s3/home

2. **Run the interactive setup:**

   ```bash
   ./scripts/deploy-setup.sh
   ```

3. **Check the comprehensive guide:**
   - See `DEPLOYMENT_GUIDE.md` for full details
