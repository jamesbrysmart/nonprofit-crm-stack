# Twenty AI Integration

**Disclaimer:** These instructions are based on code analysis and have not been fully tested. They may not be 100% accurate. Please use with caution and report any issues.

This document explains how to enable and configure the AI features in Twenty.

## 1. Enabling AI Features

There are two potential methods to enable the AI features. The recommended and most reliable method is to set the feature flag in the database.

### Method 1: Database (Recommended)

The AI features are controlled by a feature flag in the database. To enable them, you need to insert a record into the `core."featureFlag"` table.

**Steps:**

1.  Connect to the PostgreSQL database. You can do this by executing the following command from the root of the `dev-stack` project:

    ```bash
    docker compose --profile fast exec -T db psql -U postgres
    ```

2.  Once connected, run the following SQL command to insert the feature flag:

    ```sql
    INSERT INTO core."featureFlag" (key, value) VALUES ('IS_AI_ENABLED', true);
    ```

3.  To verify that the flag has been set, you can run:

    ```sql
    SELECT * FROM core."featureFlag" WHERE key = 'IS_AI_ENABLED';
    ```

### Method 2: Environment Variable (Alternative)

It may also be possible to enable the AI features by setting an environment variable in your `.env` file. This method is not as well-documented as the database method, but it is worth trying if you prefer to manage configuration through environment variables.

**Steps:**

1.  Add the following line to your `.env` file:

    ```
    IS_AI_ENABLED=true
    ```

2.  Restart the Twenty server and worker containers to apply the changes:

    ```bash
    docker compose --profile fast up -d --force-recreate server worker
    ```

## 2. Configuring the AI Model

Once you have enabled the AI features, you need to configure an AI model in the Twenty Admin Panel.

**Steps:**

1.  Log in to your Twenty workspace as an administrator.
2.  In the Admin Panel, click on **Options** in the top right corner and select **Show hidden groups**.
3.  A new "AI" or similarly named section should appear in the settings.
4.  Select either **OpenAI** or **Anthropic** as the model provider.
5.  Enter your API key for the selected provider.

## 3. Required API Keys

You will need API keys for the AI models you want to use.

*   **OpenAI:** You can get an API key from the [OpenAI Platform](https://platform.openai.com/).
*   **Anthropic:** You can get an API key from [Anthropic](https://www.anthropic.com/).

Make sure to store these API keys securely. You can add them to your `.env` file:

```
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"
```

## 4. Testing the AI Features

Once you have enabled and configured the AI features, you can test them by creating a workflow that uses an AI node.

*(This section can be expanded with a more detailed example once we have a better understanding of how to use the AI nodes in workflows.)*
