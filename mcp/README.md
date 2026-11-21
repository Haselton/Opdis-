# OPDIS contributor MCP server

OPDIS aims to build an open superintelligence that improves its own tools and uses computing time donated by volunteers worldwide. This stateless service connects ChatGPT and other MCP clients to its contributor workflow. A phone contributor can ask for a task, draft four exact-answer cases and inspect the published experimental evidence. The human contributor reviews the draft and chooses what to publish on GitHub.

## Start here

> Give me the OPDIS project briefing and one small change I can make without a GPU. How will I know it works?

A new MCP connection supplies onboarding instructions to the assistant. Call `get_project_briefing` directly in clients that only display tools. The hosted briefing reads the public [tracker](https://github.com/Haselton/Opdis-/blob/main/PROJECT_PROGRESS.md#contributor-briefing) and rechecks it after five minutes. If GitHub is unavailable, it labels the cached or bundled copy. On localhost it uses the version in your checkout. See the [connection guide](../CONTRIBUTING.md#connect-the-contributor-mcp) for the remote URL and editor configurations.

| Tool | What it returns |
| --- | --- |
| `get_project_briefing` | Project mission, demonstrated capabilities, next milestones and a role-specific open task with a first step, acceptance test and discussion link. Defaults to `vibecoder`. |
| `find_tasks` | Open task descriptions and acceptance criteria from the same tracker as the briefing. The optional role is `phone`, `gpu`, `developer`, `vibecoder` or `all`. Links lead to current GitHub discussions. |
| `prepare_test_cases` | Validated training and smoke fixture arrays, attribution, and a scoring rationale for OPD-011. The service processes drafts in memory. |
| `get_evidence` | Source-linked observations for the identified public baseline, including simulated results and open experiments. |

## Try it

Open the [public contributor page](https://opdis-contribute.haseltonmediagroup.chatgpt.site). The browser form validates four cases on the contributor’s device and downloads the draft as JSON. The HTTP MCP endpoint is `/mcp` on the same site. ChatGPT plugin availability depends on the hosting connection and workspace.

Example requests:

- I have a phone and no GPU. Which OPDIS task can I complete?
- Help me draft two training and two smoke cases about sorting event dates. Check them before I submit them.
- Show the evidence that OPDIS solves unfamiliar tasks better after a round of improvement.

## Run locally

Use Node.js 22 or later. From this folder:

    npm ci
    npm test
    npm start

Connect a Streamable HTTP client to `http://127.0.0.1:8787/mcp`. For a second port set the PORT environment variable. The build bundles a Web-standard worker, including the tracker and public smoke examples, in `dist/worker.mjs`. Restart the local server after editing the tracker. Redeploy changes to the tools or pinned evidence. The public baseline references are pinned to a specific commit so that someone can check a claim later.

The server validates exact-answer data and restricts requests to a fixed set of tools. It has no GitHub write credentials, runs no inference jobs, and stores no contributor data. Submit only examples you can redistribute. The caller and hosting platform have their own retention practices.
