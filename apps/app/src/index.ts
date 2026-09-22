import { Probot, ProbotOctokit } from 'probot';
import { crawlQueue } from '@clipcode/queue/queues';
import { generateId } from '@clipcode/core/utils/helpers';

interface CrawlJobData {
  jobId: string;
  repo: string;
  installationId?: number;
  issueNumber: number;
  template?: string;
  liveUrl?: string;
  crawlDepth?: string;
}

interface IssueCommentPayload {
  body: string;
  issue: {
    number: number;
    pull_request?: { url: string; html_url: string; };
  };
  repository: {
    full_name: string;
    owner: { login: string };
    name: string;
  };
  sender: {
    login: string;
  };
  installation?: {
    id: number;
  };
  comment?: {
    id: number;
  };
}

export default (app: Probot) => {
  app.log.info('ClipCode GitHub App loaded');

  app.on('installation.created', async (context) => {
    const repositories = context.payload.repositories || [];
    for (const repo of repositories) {
      app.log.info(`ClipCode installed on ${repo.full_name}`);
    }
  });

  app.on('issue_comment.created', async (context) => {
    const payload = context.payload as unknown as {
      body?: string;
      issue: {
        number: number;
        pull_request?: { url: string; html_url: string; };
      };
      repository: {
        full_name: string;
        owner: { login: string };
        name: string;
      };
      sender: {
        login: string;
      };
      installation?: {
        id: number;
      };
      comment?: {
        id: number;
      };
    };
    const { body, issue, repository, sender, installation } = context.payload as any;

    if (!body?.trim().startsWith('/clipcode')) return;

    if (issue.pull_request) {
      return context.octokit.issues.createComment(context.repo({
        issue_number: issue.number,
        body: '[Error] ClipCode commands only work on issues, not pull requests.',
      }));
    }

    const hasWriteAccess = await checkWriteAccess(context.octokit, context.repo(), sender.login);
    if (!hasWriteAccess) {
      return context.octokit.issues.createComment(context.repo({
        issue_number: issue.number,
        body: '[Error] You need write access to this repository to use ClipCode.',
      }));
    }

    const commentId = (context.payload as any).comment?.id;
    if (commentId) {
      await context.octokit.reactions.createForIssueComment({
        ...context.repo(),
        comment_id: commentId,
        content: 'eyes',
      });
    }

    const args = parseSlashCommand(payload.body || '');
    const jobId = generateId('job-');

    const jobData = {
      jobId,
      repo: repository.full_name,
      installationId: installation?.id,
      issueNumber: issue.number,
      template: args.template,
      liveUrl: args.liveUrl,
      crawlDepth: args.crawlDepth,
    };

    await crawlQueue.add('generate', jobData as any);

    await context.octokit.issues.createComment(context.repo({
      issue_number: issue.number,
      body: `ClipCode queued!\n\nJob ID: \`${jobId}\`\nTemplate: \`${args.template || 'social-30s'}\`\n${args.liveUrl ? `Live URL: ${args.liveUrl}` : ''}\n\nI'll post the video when it's ready.`,
    }));
  });

  app.on('issue_comment.deleted', async (context) => {
    // Handle cleanup if needed
  });
};

async function checkWriteAccess(octokit: any, repo: { owner: string; repo: string }, username: string): Promise<boolean> {
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