# Non-Profit CRM Stack

This repository is the central orchestrator for the AI-first non-profit CRM solution. It uses Docker Compose to manage and run all the necessary services.

The project is composed of multiple repositories linked via Git submodules:
- **nonprofit-crm-stack** (this repository): The main superproject containing Docker Compose configuration and documentation.
- **nonprofit-crm-fundraising-service**: A custom service for fundraising functionalities.
- **nonprofit-crm-twenty-fork**: Our fork of the Twenty CRM core application.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Git
- Docker & Docker Compose
- A GitHub account with access to the project repositories.

### Installation

1.  **Clone the repository with submodules:**

    It is crucial to clone the repository with the `--recurse-submodules` flag to ensure all the component services are downloaded at the correct version.

    ```bash
    git clone --recurse-submodules https://github.com/jamesbrysmart/nonprofit-crm-stack.git
    ```

    If you have already cloned the repository without the flag, you can initialize the submodules by running:
    ```bash
    git submodule update --init --recursive
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd nonprofit-crm-stack
    ```

3.  **Configure Environment Variables:**

    Copy the example environment files to create your own local configuration.

    ```bash
    cp .env.example .env
    cp services/fundraising-service/.env.example services/fundraising-service/.env
    ```
    Review the newly created `.env` files and fill in any missing values (e.g., `TOKEN`, `TWENTY_API_KEY`).

4.  **Build and Run the Stack:**

    Use Docker Compose to build and start the services.

    ```bash
    docker compose up --build -d
    ```

    The `--build` flag is necessary on the first run to build the `fundraising-service` image. The `-d` flag starts the services in detached mode.

5.  **Accessing the Application:**

    *   **Gateway entrypoint (Twenty + Fundraising)**: [http://localhost:4000](http://localhost:4000)
    *   **Fundraising UI**: [http://localhost:4000/fundraising](http://localhost:4000/fundraising) (or as configured in `nginx/gateway.conf`)

## Upgrading

To upgrade the version of Twenty CRM, follow these steps:

1.  **Shut down the running services:**
    ```bash
    docker compose down
    ```

2.  **Update the version tag:**
    Open the `.env` file and change the `TAG` variable to the desired version (e.g., `TAG=v1.5.0`).

3.  **Bring the stack back up:**
    ```bash
    docker compose up --build -d
    ```
    *   Note: `docker compose up` will pull the new `twentycrm/twenty:${TAG}` image automatically if it’s not already present. Use `docker compose pull` first only if you prefer pulling explicitly.

5.  **Accessing the Application:**

    *   **Gateway entrypoint (Twenty + Fundraising)**: [http://localhost:4000](http://localhost:4000)
    *   **Fundraising UI**: [http://localhost:4000/fundraising](http://localhost:4000/fundraising) (or as configured in `nginx/gateway.conf`)

### Optional local ports

By default, only the gateway is published on the host. If you need local access to internal services (Postgres, Redis, MinIO, or direct server/fundraising ports), opt in with the local Compose file:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Note: when using the gateway-only setup, set `SERVER_URL=http://localhost:4000` so the Twenty UI points API calls at the gateway rather than `:3000`.
If you plan to run metadata scripts locally (e.g. `setup-schema.mjs`), ensure the Twenty server can resolve its own `SERVER_URL` inside Docker. The local compose file sets `SERVER_URL=http://server:3000` so REST metadata calls can loop back correctly while the gateway stays on `:4000`.

### Optional n8n profile

The stack supports n8n as an optional companion service. Enable it with:

```bash
docker compose --profile n8n up -d
```

Configure n8n-related environment variables in `.env` (see `.env.example`) and review `automations/n8n/runbook.md` for hosting and security guidance.

## Development Workflow

### Pulling Updates

To get the latest changes for the entire project, including all submodules:

```bash
git pull
git submodule update --remote --merge
```

### Making Changes in a Submodule

1.  Navigate to the submodule directory (e.g., `cd services/fundraising-service`).
2.  Make your changes and commit them as you would in any normal repository.
3.  Push the changes to the submodule's remote repository.
4.  Navigate back to the root `nonprofit-crm-stack` directory.
5.  You will see that Git has detected a new commit in the submodule. Add, commit, and push this change to update the "pointer" in the superproject.

    ```bash
    git add services/fundraising-service
    git commit -m "Update fundraising-service to latest version"
    git push
    ```
