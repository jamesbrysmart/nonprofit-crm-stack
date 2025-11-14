# Twenty AI Integration

**Disclaimer:** These instructions are based on current testing in our dev
stack. Please report any issues so we can refine the runbook.

This document explains how to enable the AI features in Twenty and documents the
related prerequisites we discovered while enabling the Applications UI.

## 1. Prerequisites – enable DB-backed config

Twenty only honours feature flags stored in `core."featureFlag"` when the
containers are configured to read configuration from the database.

1. Ensure `IS_CONFIG_VARIABLES_IN_DB_ENABLED` is set to `"true"` for both
   `server` and `worker` in `docker-compose.yml`.
2. Restart the containers so the new environment variables are picked up:

   ```bash
   docker compose up -d --force-recreate server worker
   ```

3. Flush the cache so the processes reload configuration. Either run
   `npx nx run twenty-server:command cache:flush` from
   `services/twenty-core`, or flush Redis directly:

   ```bash
   docker compose exec redis redis-cli FLUSHALL
   ```

With those prerequisites in place, any feature flags inserted into the database
take effect on the next restart/flush.

## 2. Enable the AI feature flag

The recommended path is to set the flag in the database.

```bash
docker compose exec -T db psql -U postgres -c \
  "UPDATE core.\"featureFlag\" SET value = true WHERE key = 'IS_AI_ENABLED';"

docker compose exec -T db psql -U postgres -c \
  "INSERT INTO core.\"featureFlag\" (key, value)
   SELECT 'IS_AI_ENABLED', true
   WHERE NOT EXISTS (
     SELECT 1 FROM core.\"featureFlag\" WHERE key = 'IS_AI_ENABLED'
   );"
```

Re-run the cache flush from step 1 after inserting/updating the flag.

> You may see references to enabling the flag via environment variables in older
> docs. Using the database flag has proven more reliable.

## 3. Configure an AI provider

Once the flag is active:

1. Log in to the workspace as an administrator.
2. In the Admin Panel, click **Options → Show hidden groups**.
3. An **AI** section should appear.
4. Select **OpenAI** or **Anthropic** and provide the corresponding API key.

Store the keys securely (for local dev, add them to `.env`):

```
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"
```

## 4. (Optional) Enable the Applications UI

The Applications settings screen is gated by the `IS_APPLICATION_ENABLED` flag.
You can enable it using the same pattern:

```bash
docker compose exec -T db psql -U postgres -c \
  "UPDATE core.\"featureFlag\" SET value = true WHERE key = 'IS_APPLICATION_ENABLED';"

docker compose exec -T db psql -U postgres -c \
  "INSERT INTO core.\"featureFlag\" (key, value)
   SELECT 'IS_APPLICATION_ENABLED', true
   WHERE NOT EXISTS (
     SELECT 1 FROM core.\"featureFlag\" WHERE key = 'IS_APPLICATION_ENABLED'
   );"
```

Flush the cache afterwards. At the time of writing our stack is running a
pre-1.8 image, so the Applications UI is still hidden even though the flag is
set—the backend endpoints will be ready once we upgrade.

## 5. Testing

With the flags active and a provider configured, create a workflow that includes
an AI node to verify the integration end-to-end.

## 6. Ask AI chat + default agents

Even before you configure anything in **Settings → Workspace → AI**, Twenty
ships a set of standard agents (Helper/Data Navigator, etc.) and exposes
an **Ask AI** entry in the left navigation whenever `IS_AI_ENABLED` is true.

1. Click **Ask AI** in the nav (or press `@`) to open the chat surface.
2. Click the **New chat** button if no thread exists yet.
3. Type a prompt and watch the live routing message as the workspace
   selects the best built-in agent.

If you want to change which models those agents use, open **Settings →
Workspace → AI → Settings** and switch the **Router Model** (or edit each
agent under the **Agents** tab). Setting both to `gpt-4o-mini` keeps token
usage low while you are on the default OpenAI quota.

## 7. Troubleshooting: OpenAI TPM limits

During local testing we hit OpenAI’s per-minute token limit with the default
`gpt-4o` model. When that happens you’ll see the chat bubble show
`Failed to get response [object Object]` and the server log records:

```
Request too large for gpt-4o … Limit 30000, Requested ~57k tokens per min.
```

To work around this while your OpenAI account is still on the entry tier
(< $50 spend and < 7 days since first payment):

1. Use lighter models such as `gpt-4o-mini` for both the router and any
   workspace agents (see section 6).
2. Keep prompts/tools lean—each standard agent loads a rich system prompt
   and a long list of tools (Data Navigator, etc.), so trimming custom
   additions helps stay under the quota.
3. Retry the chat once you’ve made the change; the limit resets quickly.

If you need higher TPM headroom, upgrade your OpenAI account (or add an
Anthropic key and switch models in the same settings screen).
