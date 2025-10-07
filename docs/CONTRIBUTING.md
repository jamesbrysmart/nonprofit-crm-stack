# Contributing to the Non-Profit CRM Stack

First off, thank you for considering contributing! This project is a collection of services, and this document provides guidelines for a smooth development workflow.

## Development Workflow

A general workflow for adding a feature or fixing a bug would be:

1.  Create a new feature branch in the relevant repository (e.g., `feature/my-new-feature` in `services/fundraising-service`).
2.  Make your changes and commit them.
3.  Push your branch to the remote repository (`origin`).
4.  Open a Pull Request for review.
5.  Once merged, update the submodule pointer in the main `nonprofit-crm-stack` repository.

## Maintaining the `twenty-core` Fork

Our `twenty-core` repository is a fork of the official Twenty CRM. It's important to periodically update it to pull in the latest features and security patches from the original project.

Here is the repeatable pattern for updating the fork:

### Step 1: Navigate to the Submodule Directory

All Git operations for the fork must be run from within its directory.

```bash
cd services/twenty-core
```

### Step 2: Ensure the `upstream` Remote is Configured

The `upstream` remote should point to the original repository. You can verify this by running `git remote -v`. You should see something like this:

```
origin    https://github.com/jamesbrysmart/nonprofit-crm-twenty-fork.git (fetch)
origin    https://github.com/jamesbrysmart/nonprofit-crm-twenty-fork.git (push)
upstream  https://github.com/twentyhq/twenty.git (fetch)
upstream  https://github.com/twentyhq/twenty.git (push)
```

If the `upstream` remote is missing, you can add it with this one-time command:
```bash
git remote add upstream https://github.com/twentyhq/twenty.git
```

### Step 3: Fetch Changes from Upstream

This command downloads the latest code from the original `twentyhq/twenty` repository but does not apply it to your code yet.

```bash
git fetch upstream
```

### Step 4: Merge the Upstream Changes

This step integrates the fetched changes into your local `main` branch.

```bash
git checkout main
git merge upstream/main
```

If you have not made any custom commits to your fork, this should be a clean "fast-forward" merge. If you have made your own changes, Git may ask you to resolve conflicts.

### Step 5: Push the Updated Fork to GitHub

Push the newly merged code to your `origin` remote.

```bash
git push origin main
```

### Step 6: Update the Main Project

Finally, navigate back to the root of the `nonprofit-crm-stack` project and commit the updated submodule pointer. This tells the main project to use the new version of `twenty-core`.

```bash
cd ../..
git add services/twenty-core
git commit -m "chore(deps): Update twenty-core to latest upstream version"
git push
```