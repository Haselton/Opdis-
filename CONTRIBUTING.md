# Contributing to OPDIS

Use a pseudonym if you like. A GitHub account is needed to open issues and pull requests on GitHub. Public bylines, reviews and discussions can use contributor handles. There is no real-name sign-off or contributor agreement. Check the author and committer identity your Git client uses before sending a patch.

## Pick a task

Check [PROJECT_PROGRESS.md](PROJECT_PROGRESS.md) for available work. Search existing issues and pull requests for the task ID before opening a claim. Use the issue thread to tell others which part you are taking. Submit the acceptance evidence with the change. Coding assistants should also read [AGENTS.md](AGENTS.md).

### Bring your own assistant

You can use your own ChatGPT session or another assistant to work on an open task. Paste this prompt with the relevant repository files or give your assistant access to your own checkout.

> Read AGENTS.md and PROJECT_PROGRESS.md. Help me choose one open task that fits my equipment and time. Show me its ID, dependencies, acceptance criteria and the smallest useful change. Check for an existing claim. Implement only the task I choose. Run its tests if you have a checkout. Return a patch or a reproducible result, the actual test output, and a proposed progress update. Label anything you could not verify.

Review the proposed change before submitting it under your handle. Public submissions should contain the result and enough evidence to reproduce it. Keep chat transcripts, account credentials and private inputs on your own device.

Eligible subscribers can also authorize certain locally hosted open-source tools to use their ChatGPT plan for individual requests. A possible OPDIS client for explicitly selected contributor tasks is on the roadmap. The current prototype runs GPU jobs through Ollama. [OpenAI integration guide](https://developers.openai.com/siwc/token-sharing-open-source)

## Submit a change

Open an issue describing a reproducible problem or measurable improvement. Scope each pull request to one change, run node --test test.mjs, and include the test result. AI-assisted submissions follow the same checks. Include the origin and permissible license of third-party material. Submit original contributions under the project's MIT terms.

## Stewardship

Discuss design decisions in public issues. A maintainer other than the author should review code and benchmark claims before merge. Adding a learned instruction requires a readable recipe, the evaluation procedure, results for both arms, and a regression review. If an independent reviewer is unavailable, keep the proposal open. Document maintainer appointments and changes to governance in reviewed pull requests. Contributors may participate under stable handles.

The reference connector is for operators who already trust one another. Use loopback binding and authenticated private tunnels. Coordinate disclosure of security issues through GitHub's private vulnerability reporting after it is enabled. Until then, open a general issue requesting a private reporting channel and omit exploit details and credentials.
