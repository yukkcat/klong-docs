# Klong API Docs

A Next.js and Fumadocs documentation site for 小恐龙 API（Klong API）.

## Development

Run the development server:

```bash
corepack pnpm install

corepack pnpm dev
```

Open http://localhost:3000 with your browser to see the result.

## Build

Build the application for production:

```bash
corepack pnpm build
```

## Docker Compose

Run the prebuilt production image in the background:

```bash
docker compose pull
docker compose up -d
```

Open http://localhost:3000 after the container starts.

On a server, point your reverse proxy to `http://127.0.0.1:3000`.

Useful commands:

```bash
docker compose logs -f
docker compose restart
docker compose down
```

Build locally instead of pulling from GHCR:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

If port `3000` is already used, change the left side of `ports` in
`docker-compose.yml`, for example:

```yaml
ports:
  - "3001:3000"
```

## Project Structure

| Path                      | Description                  |
| ------------------------- | ---------------------------- |
| `app/(home)`              | Landing page and home pages  |
| `app/[lang]/docs`         | Documentation pages (i18n)   |
| `app/api/search/route.ts` | Search API endpoint          |
| `content/docs/`           | Documentation content (MDX)  |
| `lib/source.ts`           | Content source configuration |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
