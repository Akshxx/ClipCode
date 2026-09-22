# ClipCode GitHub App Setup Guide

## Overview

The ClipCode GitHub App allows you to generate launch videos directly from GitHub issues using slash commands.

## Installation

1. **Install the App**: Visit [GitHub App Installation](https://github.com/apps/clipcode) and install on your organization or personal account.

2. **Select Repositories**: Choose which repositories the app should have access to.

3. **Configure Webhook** (optional): If self-hosting, set the webhook URL to `https://your-domain.com/api/github-webhook`.

## Usage

After installation, go to any issue in a repository where ClipCode is installed and comment:

```
/clipcode generate
```

### Options

```
/clipcode generate --template=social-30s
/clipcode generate --live-url=https://your-app.com
/clipcode generate --template=social-30s --live-url=https://your-app.com
```

### Options Reference

| Option | Description | Default |
|--------|-------------|---------|
| `--template` | Template to use (currently only `social-30s`) | `social-30s` |
| `--live-url` | Live URL to crawl for screenshots/recordings | (optional) |
| `--crawl-depth` | Crawl depth: `quick` or `full` | `quick` |

## How It Works

1. User comments `/clipcode generate` on an issue
2. ClipCode bot reacts with 👀 to acknowledge
3. Bot analyzes the repository (AST, framework, git stats)
4. Optionally crawls the live URL for screenshots/recordings
5. Generates AI-powered product brief
6. Renders 30s vertical video using Remotion
7. Posts video link as a comment on the issue

## Required Permissions

The app requests minimal permissions:
- **Contents: Read** - To analyze repository code
- **Issues: Write** - To post video links as comments
- **Metadata: Read** - For repository info
- **Pull Requests: Read** - To detect PR context

## Self-Hosting

If you want to self-host the GitHub App:

1. **Create a GitHub App**: Go to Settings > Developer settings > GitHub Apps > New GitHub App
2. **Configure**: Use the manifest from `apps/app/.github/app.yml`
3. **Generate Private Key**: Download the private key from the app settings
4. **Set Environment Variables**:
   ```bash
   GH_APP_ID=your_app_id
   GH_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
   GH_WEBHOOK_SECRET=your_webhook_secret
   ```
5. **Deploy**: Run the app worker (`apps/worker`) on your infrastructure

## Webhook Events

The app listens for:
- `installation.created` - When installed on new repos
- `issue_comment.created` - For `/clipcode` commands
- `issue_comment.deleted` - For cleanup (future)

## Troubleshooting

### Bot doesn't respond
- Check if app is installed on the repository
- Verify the comment starts with `/clipcode`
- Check app logs for errors

### Video not generated
- Check if Ollama is running (`ollama serve`)
- Verify Redis is running for queue
- Check worker logs for render errors

### Permissions issues
- Ensure app has "Issues: Write" permission
- Verify user has write access to the repository