# FTP Deployment Setup Guide

This guide will help you set up automatic FTP deployment using GitHub Actions.

## Prerequisites

You need:
- A web hosting account with FTP access
- FTP credentials (server, username, password)
- GitHub repository access

## Step-by-Step Setup

### 1. Get Your FTP Credentials

Contact your web hosting provider or check your hosting control panel (cPanel, Plesk, etc.) for:

- **FTP Server**: e.g., `ftp.yourwebsite.com` or `123.45.67.89`
- **FTP Username**: e.g., `username@yourwebsite.com` or `user123`
- **FTP Password**: Your FTP password
- **FTP Port**: Usually `21` (default) or `22` for SFTP
- **Server Directory**: Where files should go, e.g., `/public_html/` or `/www/` or `/httpdocs/`

### 2. Add Secrets to GitHub

**IMPORTANT: Never commit FTP credentials directly to your code!**

1. Go to your GitHub repository: `https://github.com/jasonlaw8/familyfriendlyrestaraunts`

2. Click **Settings** (top navigation)

3. In the left sidebar, click **Secrets and variables** → **Actions**

4. Click **New repository secret**

5. Add these three secrets one by one:

   **Secret 1:**
   - Name: `FTP_SERVER`
   - Value: Your FTP server address (e.g., `ftp.yourwebsite.com`)
   - Click **Add secret**

   **Secret 2:**
   - Name: `FTP_USERNAME`
   - Value: Your FTP username
   - Click **Add secret**

   **Secret 3:**
   - Name: `FTP_PASSWORD`
   - Value: Your FTP password
   - Click **Add secret**

### 3. Configure the Deployment File (if needed)

Open `.github/workflows/deploy-ftp.yml` and adjust these settings if necessary:

```yaml
protocol: ftps    # Change to 'ftp' if your host doesn't support FTPS
port: 21          # Change to 22 for SFTP, or your custom port
server-dir: /     # Change to /public_html/ or /www/ based on your host
```

Common hosting configurations:

**cPanel/Bluehost/HostGator:**
```yaml
protocol: ftps
port: 21
server-dir: /public_html/
```

**GoDaddy:**
```yaml
protocol: ftp
port: 21
server-dir: /
```

**SiteGround:**
```yaml
protocol: ftps
port: 21
server-dir: /public_html/
```

**DreamHost:**
```yaml
protocol: ftps
port: 21
server-dir: /
```

### 4. Push to Main Branch

Once secrets are added, any push to the `main` branch will trigger automatic deployment:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### 5. Monitor Deployment

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You'll see the "Deploy to FTP" workflow running
4. Click on it to see the deployment progress
5. Green checkmark = successful deployment!

## Troubleshooting

### Connection Issues

If deployment fails with connection errors:

1. **Try changing the protocol:**
   - Change `ftps` to `ftp` or `sftp`

2. **Check the port:**
   - Standard FTP: port `21`
   - SFTP: port `22`
   - Ask your host if they use a custom port

3. **Verify credentials:**
   - Double-check username and password in GitHub Secrets
   - Test credentials using FileZilla or another FTP client

### Wrong Directory

If files upload but website doesn't show:

1. Check your hosting's directory structure
2. Common paths:
   - `/public_html/`
   - `/www/`
   - `/httpdocs/`
   - `/html/`
3. Update `server-dir` in the workflow file

### Permission Denied

If you get permission errors:
- Contact your host to ensure FTP uploads are allowed
- Check file permissions in your hosting control panel

## Testing FTP Credentials

Before setting up GitHub Actions, test your FTP credentials using an FTP client like:

- **FileZilla** (Free): https://filezilla-project.org/
- **Cyberduck** (Mac): https://cyberduck.io/
- **WinSCP** (Windows): https://winscp.net/

If you can upload files successfully with the client, the GitHub Action will work too!

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Use an FTP client (FileZilla, etc.)
2. Connect using your credentials
3. Upload all files from your local project folder
4. Make sure to upload to the correct directory

## Security Notes

- ✅ FTP credentials are stored securely in GitHub Secrets
- ✅ They are never exposed in logs or code
- ✅ Only repository admins can view/edit secrets
- ❌ Never commit `.env` files or credentials to git

## Need Help?

Common hosting providers and their FTP documentation:

- **Bluehost**: https://www.bluehost.com/help/article/ftp-access
- **HostGator**: https://www.hostgator.com/help/article/ftp-how-to
- **GoDaddy**: https://www.godaddy.com/help/connect-to-my-ftp-server-16063
- **SiteGround**: https://www.siteground.com/kb/ftp/
- **DreamHost**: https://help.dreamhost.com/hc/en-us/articles/115000675027-FTP-overview-and-credentials

If you're still having issues, check your hosting provider's support documentation or contact their support team for FTP setup assistance.
