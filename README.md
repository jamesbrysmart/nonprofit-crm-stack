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

    Use Docker Compose to build the services from source and start them.

    ```bash
    docker-compose up --build
    ```

    The `--build` flag is important for the first run to build the images from the source code in the submodules.

5.  **Accessing the Application:**

    *   **Twenty CRM**: [http://localhost:3000](http://localhost:3000)
    *   **Fundraising Service (via Gateway)**: [http://localhost:4000/fundraising](http://localhost:4000/fundraising) (or as configured in `nginx/gateway.conf`)

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