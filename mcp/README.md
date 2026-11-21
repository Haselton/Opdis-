# OPDIS contributor MCP server

This stateless service connects ChatGPT and other MCP clients to the OPDIS project. A phone contributor can ask for a task, draft four exact-answer cases and inspect the published experimental evidence. The human contributor reviews the draft and chooses what to publish on GitHub.

| Tool | What it returns |
| --- | --- |
| `find_tasks` | Open task descriptions and acceptance criteria from the project tracker bundled at build time. The optional role is `phone`, `gpu`, `developer` or `all`. Links lead to current GitHub discussions. |
| `prepare_test_cases` | Validated training and smoke fixture arrays, attribution, and a scoring rationale for OPD-011. The service processes drafts in memory. |
| `get_evidence` | Source-linked observations for the identified public baseline, including simulated results and open experiments. |

## Try it

Open the [public contributor page](https://opdis-contribute.haseltonmediagroup.chatgpt.site). The HTTP MCP endpoint is `/mcp` on the same site. ChatGPT plugin availability depends on the hosting connection and workspace.

Example requests:

- I have a phone and no GPU. Which OPDIS task can I complete?
- Help me draft two training and two smoke cases about sorting event dates. Check them before I submit them.
- Show the evidence that OPDIS solves unfamiliar tasks better after a round of improvement.

## Run locally

Use Node.js 22 or later. From this folder:

    npm ci
    npm test
    npm start

Connect a Streamable HTTP client to `http://127.0.0.1:8787/mcp`. For a second port set the PORT environment variable. The build bundles a Web-standard worker, including the tracker and public smoke examples, in `dist/worker.mjs`. Rebuild and redeploy when the project tracker or evidence changes. The public baseline references are pinned to a specific commit so that someone can check a claim later.

The server validates exact-answer data and restricts requests to a fixed set of tools. It has no GitHub write credentials, runs no inference jobs, and stores no contributor data. Submit only examples you can redistribute. The caller and hosting platform have their own retention practices.
