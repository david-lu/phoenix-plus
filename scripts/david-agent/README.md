# David's leetspeak agent

A minimal AI SDK v7 `ToolLoopAgent` with one local, deterministic tool,
`convertToLeetspeak`. Adapted from the [Phoenix AI SDK tracing guide](https://arize.com/docs/phoenix/integrations/typescript/vercel/vercel-ai-sdk-tracing-js)
and the repo's [`ai-sdk-agent` example](../../js/examples/apps/ai-sdk-agent).

The tool replaces `a/e/i/l/o/s/t` (either case) with `4/3/1/1/0/5/7`.
Other characters, punctuation, and whitespace stay unchanged. For example:
`Hello Phoenix! This is a test.` becomes `H3110 Ph03n1x! 7h15 15 4 7357.`
The tool runs locally; the agent uses OpenAI for its two model steps.

## Run

Prerequisites: Node.js 22.12+, pnpm, GNU Make, uv, and an OpenAI API key.

1. From the repo root, run `cd scripts/david-agent` and `make install`.
2. Set `OPENAI_API_KEY` in the repo-root `.env`, or copy `.env.example` to
   `scripts/david-agent/.env` and fill it in there. Both locations are loaded;
   the agent's file takes precedence. The `.env` files are gitignored.
   The default model is `gpt-4o-mini`; change `OPENAI_MODEL` if needed.
3. Start Phoenix in a separate terminal with `make phoenix` (skip if it is
   already running at `http://localhost:6006`). This binds to localhost and
   stores the database in the gitignored `.phoenix/` directory. The launcher
   loads the root `.env` and then the agent's `.env` when present, so Phoenix's
   own model features can use the same key. Restart Phoenix after changing it.
4. Run `make run`, or `make run TEXT="Hello world!"` for custom text.
5. Open [the david-agent project](http://localhost:6006/redirects/projects/david-agent).
   Inspect the agent run, two model steps, and `convertToLeetspeak` tool span.

`make check` runs TypeScript checking. On Windows, if PowerShell blocks the
pnpm script, pass `PNPM=pnpm.cmd` to Make. If GNU Make is unavailable, the
equivalent commands are `pnpm.cmd install --frozen-lockfile`,
`pnpm.cmd start "Hello world!"`, and `pnpm.cmd run typecheck`. To start Phoenix
without Make in PowerShell, preserving the same local database:

```powershell
$env:PHOENIX_WORKING_DIR = "$PWD/.phoenix"
$env:PHOENIX_HOST = "127.0.0.1"
uvx --env-file ../../.env --from arize-phoenix phoenix serve
```

If the key is in this directory's `.env` instead, use `--env-file .env`.
Phoenix does not automatically load `.env`; its process must receive the
variables at startup. The TypeScript agent loads its environment separately.

Tracing uses `register()` from `@arizeai/phoenix-otel` and
`registerTelemetry(new OpenTelemetry({ headers: false }))` from the AI SDK
guide. `provider.shutdown()` flushes spans before the script exits, including
on errors. Request headers are excluded from telemetry.

See [EVIDENCE.md](./EVIDENCE.md) for the verified run's trace ID, spans, and
recorded tool input/output.
