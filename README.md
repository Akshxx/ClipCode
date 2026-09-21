# ClipCode

> Turn any repo into a launch video. One command. 30 seconds. Free forever.

## Features

- 🎬 **One command** — `npx clipcode generate` creates a 30s vertical video
- 🔍 **Smart analysis** — AST parsing + optional live site crawl
- 📱 **Real footage** — Screenshots, recordings, Lighthouse scores from your deployed app
- ⚡ **Local-first** — Runs on your machine or CI, no cloud required
- 🔧 **Multiple interfaces** — CLI, GitHub Action, GitHub App (`/clipcode`)
- 🆓 **Completely free** — No watermarks, no limits, no accounts needed

## Quick Start

```bash
# Run locally (no install needed)
npx clipcode generate

# With live URL for real app footage
npx clipcode generate --live-url=https://myapp.com
```

## Interfaces

### CLI
```bash
npx clipcode generate
npx clipcode generate --live-url=https://myapp.com
npx clipcode generate --output=./dist/video.mp4 --json
```

### GitHub Action
```yaml
# .github/workflows/clipcode.yml
name: ClipCode
on:
  release:
    types: [published]
jobs:
  video:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: clipcode/action@v1
        with:
          live-url: 'https://myapp.com'
      - uses: actions/upload-artifact@v4
        with:
          name: launch-video
          path: clipcode-output/*.mp4
```

### GitHub App
Install the [ClipCode GitHub App](https://github.com/apps/clipcode) on your repo, then comment:
```
/clipcode generate
/clipcode generate --live-url=https://myapp.com
```

## Output

- **Local**: `./clipcode-output/{repo-name}-30s.mp4`
- **Hosted** (optional): `https://clipcode.dev/r/{id}` — shareable link with player

## Requirements

- Node.js 20+
- FFmpeg (for video rendering)
- Ollama (optional, for AI brief generation) — `ollama serve` then `ollama pull llama3.2:3b`

## Architecture

```
clipcode/
├── apps/
│   ├── cli/          # @clipcode/cli - Commander + Ink TUI
│   ├── action/       # @clipcode/action - GitHub Action
│   └── app/          # @clipcode/app - GitHub App (Probot)
├── packages/
│   ├── core/         # Shared types, schemas, utilities
│   ├── analyzer/     # AST analysis + LLM brief generation
│   ├── crawler/      # Playwright quick crawl engine
│   ├── templates/    # social-30s Remotion template
│   ├── queue/        # BullMQ + Redis queue
│   └── db/           # Prisma + SQLite
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run typecheck
pnpm typecheck

# Run lint
pnpm lint

# Run tests
pnpm test

# Start database
pnpm db:push
pnpm db:studio
```

## License

MIT © ClipCode Contributors