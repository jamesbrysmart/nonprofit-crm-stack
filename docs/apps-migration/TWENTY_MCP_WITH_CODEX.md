# Twenty MCP With Codex

This note captures a working capability we have confirmed during migration exploration, not a stable platform contract.

## Purpose

We verified that Codex CLI can use Twenty's MCP server from this `dev-stack` repo to interact with live workspace data.

This is interesting because it gives us a practical way to:

- inspect real workspace state while planning migration work
- test assumptions against live Twenty data
- ask targeted questions about campaigns, appeals, gifts, views, and related workspace objects

## Confirmed Setup

The currently confirmed path is:

- work from the `dev-stack` repo root so Codex can see the broader docs and code context
- run against the local Twenty app-dev MCP endpoint at `http://localhost:2020/mcp`
- load `TWENTY_API_KEY` only inside this repo via repo-scoped env setup
- use Codex MCP config for the `twenty-local` server
- use interactive Codex CLI sessions for the main workflow

This setup was confirmed to reach live workspace data, not just MCP tool discovery.

## Confirmed Capability

We confirmed that Codex can:

- connect to the Twenty MCP server from this repo
- discover the available Twenty MCP tools
- learn tool usage for a targeted read flow
- execute read-oriented workspace queries and return live data

One concrete example was asking how `Spring Appeal 2026` was going. Codex found the exact appeal record and pulled linked gift data from the live workspace.

## Working Posture

Treat this as an exploratory working pattern that may change as:

- Codex CLI MCP support evolves
- Twenty's MCP surface evolves
- local setup and auth conventions change

The useful takeaway is the capability itself: using Codex CLI plus Twenty MCP as a live workspace analysis aid appears viable.

## Notes For Future Sessions

- Prefer keeping this note short and current rather than turning it into a full debug log.
- If the flow regresses, first re-check local Codex MCP config and repo-scoped env loading before assuming a Twenty-side problem.
- If this becomes a routine workflow, we can later promote the stable parts into a more formal setup or runbook note.
