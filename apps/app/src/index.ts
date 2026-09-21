import { Probot, ProbotOctokit } from 'probot';
import { crawlQueue } from '@clipcode/queue/queues';
import { generateId } from '@clipcode/core/utils/helpers';

export default (app: Probot) => {
  app.log.info('ClipCode GitHub App loaded');

  app.on('installation.created', async (context) => {
    for (const repo of context.payload.repositories) {
      app.log.info(`ClipCode installed on ${repo.full_name}`);
    }
  });

  app.on('issue_comment.created', async (context) => {
    const { body, issue, repository, sender, installation } = context.payload;

    if (!body.trim().startsWith('/clipcode')) return;

    if (issue.pull_request) {
      return context.octokit.issues.createComment(context.repo({
        issue_number: issue.number,
        body: '❌ ClipCode commands only work on issues, not pull requests.',
      }));
    }

    const hasWriteAccess = await checkWriteAccess(context.octokit, context.repo(), sender.login);
    if (!hasWriteAccess) {
      return context.octokit.issues.createComment(context.repo({
        issue_number: issue.number,
        body: '❌ You need write access to this repository to use ClipCode.',
      }));
    }

    await context.octokit.reactions.createForIssueComment({
      ...context.repo(),
      comment_id: context.payload.comment.id,
      content: 'eyes',
    });

    const args = parseSlashCommand(body);
    const jobId = generateId('job-');

    await crawlQueue.add('generate', {
      jobId,
      repo: repository.full_name,
      installationId: installation?.id,
      issueNumber: issue.number,
      ...args,
    });

    await context.octokit.issues.createComment(context.repo({
      issue_number: issue.number,
      body: `🎬 **ClipCode queued!**\n\nJob ID: \`${jobId}\`\nTemplate: \`${args.template || 'social-30s'}\`\n${args.liveUrl ? `Live URL: ${args.liveUrl}` : ''}\n\nI'll post the video when it's ready.`,
    }));
  });

  app.on('issue_comment.deleted', async (context) => {
    // Handle cleanup if needed
  });
};

async function checkWriteAccess(octokit: ProbotOctokit, repo: { owner: string; repo: string }, username: string): Promise<boolean> {
  try {
    const { data: permission } = await octokit.rest.repos.getCollaboratorPermissionLevel({
      ...repo,
      username,
    });
    return ['admin', 'write', 'maintain'].includes(permission);
  } catch {
    return false;
  }
}

function parseSlashCommand(body: string): Record<string, any> {
  const args: Record<string, any> = { template: 'social-30s' };
  const parts = body.trim().split(/\s+/).slice(1);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('--')) {
      const key = part.slice(2);
      const value = parts[i + 1]?.startsWith('--') ? true : parts[i + 1];
      if (value !== undefined && value !== true) i++;
      args[key.replace(/-/g, '_')] = value === true ? true : value;
    }
  }

  return args;
}