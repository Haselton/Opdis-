# OPDIS project progress

OPDIS aims to build one continuous digital organism. A volunteer would install a client and lend GPU time on their own terms. Each machine could leave while the organism carried on with its mission, recorded what it had learned, diagnosed failures and verified repairs. People could use its capabilities freely, whether or not they owned a GPU.

Long-range missions might investigate a neglected health problem or automate work people must do to survive. The wider goals are freedom from oppressive systems and dependency, and an end to compulsory human labor. Recursive improvement toward exponentially growing capability and superintelligence is a research ambition. The immediate engineering questions are whether a mission can survive a restart, whether a repair can be tested and reversed, and whether retained improvements help on fresh tasks at equal compute.

**Pick your first task.** With a phone or assistant, contribute four original test cases under **OPD-011**. With two GPU machines, start with **OPD-001**. For mission continuity and repair, see **OPD-013** and **OPD-014**. **OPD-010** covers an optional local ChatGPT client for contributors. [Copy the contributor prompt](CONTRIBUTING.md#bring-your-own-assistant).

## Current state

Baseline checked **2026-11-05**. Run `node --test test.mjs` from the repository root. All **8 tests passed** with Node.js 24.22.1 and simulated inference. Both command-line tools also completed an end-to-end check against two simulated Ollama HTTP endpoints. Each peer handled part of the batch. The hardware experiment remains open.

| Area | Available in this release | Evidence still needed |
| --- | --- | --- |
| Distributed inference | The Node.js coordinator can dispatch a batch to configured Ollama endpoints. SSH tunnels let each remote worker expose its local Ollama endpoint to the coordinator. | A reproducible run on two distinct physical GPUs. Multiple processes on one host can exercise dispatch but do not establish multi-GPU performance. |
| Recipe improvement | A proposal uses training examples to produce a candidate prompt recipe. The scorer flags a candidate for human review after a complete run with at least one gain and zero regressions. A maintainer decides whether to promote it. | Repeated rounds, an untouched final evaluation set, and comparison against a compute-matched baseline. |
| Getting started | The repository includes example inputs and configuration for trying the workflow. Eight automated tests cover the initial implementation. | Record the test command, runtime version, commit and outcome for each proposed change. |

The current release runs on trusted, individually configured peers, one coordinator per run. The installable GPU volunteer client, durable mission state, automatic repair and a free public network are development goals.

## Work queue

These IDs are stable references for issues and pull requests. An ID in this table does not imply that a GitHub issue already exists. Each row describes one contribution and its acceptance evidence.

| Priority | ID | Status | Contribution | Evidence for completion |
| --- | --- | --- | --- | --- |
| P0 | OPD-001 | Open | Run the example batch on two physical GPUs using existing SSH tunnels. | Attach a sanitized run record with two worker aliases, GPU models, pinned model version, tasks completed per worker and timing. Confirm overlap and compare against each worker alone on the same batch. |
| P0 | OPD-002 | Open | Extend the existing JSON run summary with reproducibility metadata. | Include workload seed, worker alias, model digest, completed and failed tasks, elapsed wall time, token counts when available and units. Document how to reproduce throughput from a fixture and how unavailable measurements appear. |
| P0 | OPD-003 | Open | Define and implement leases for work interrupted by a worker failure. | A test drops a worker after dispatch, reassigns the expired lease and verifies that a late result cannot commit a second outcome. |
| P0 | OPD-004 | Open | Enforce configurable bounds on requests. | Tests exercise per-worker concurrency, maximum input and output size, timeouts and finite retries. Record an explicit result when a limit is reached. |
| P0 | OPD-005 | Open | Specify independent, human-controlled Guardian isolation and the conditions for resuming work. | Provide a state diagram and fixtures showing that isolation stops new dispatch, reachable peers disconnect, leases expire for offline peers, and logs and checkpoints survive. Only a human can authorize reconnection. Link this design to OPD-003. |
| P0 | OPD-006 | Open | Document the data seen by workers, the coordinator and logs. | Trace one synthetic request end to end. Provide a redacted diagnostic example and a test showing that published diagnostics omit credentials, hostnames, IPs and prompt bodies by default. |
| P1 | OPD-007 | Blocked on OPD-002 | Evaluate improvement across rounds. | Predeclare rounds, seeds, metric and budget. Compare passing a recipe forward with resetting it each round under the same total compute. Keep training, gate and final examples disjoint. Report paired results across seeds, regressions, uncertainty and compute spent. Report an inconclusive or negative result when warranted. |
| P1 | OPD-008 | Open | Make it easier to reproduce the two-node example. | Have a contributor follow the setup from a clean checkout. Add the missing step or diagnostic and verify it fixes the observed failure. |
| P2 | OPD-009 | Open | Explore splitting a model across nodes as an optional research track. | Document one model that exceeds a single device’s available memory, the proposed partition, memory and bandwidth assumptions and a feasible comparison. Record measured throughput and latency if prototyped. |
| P1 | OPD-010 | Open for design | Design an optional local client for a contributor who selects a single public task and chooses to run it with their eligible ChatGPT plan. | Show the task, data, destination and applicable limits before the request. Use separate OAuth consent for plan usage. Test decline, opt-out, exhausted quota and revoked access using mocks. Keep credentials on the contributor’s host. Submit only their reviewed result. Avoid automatic account switching or forwarding strangers’ jobs. Link the official integration guide and then request independent review. |
| P0 | OPD-011 | Open | Add four original, redistributable exact-answer cases for a second task family. No GPU required. | Submit two training and two smoke-test examples in new fixture files. Include distinct IDs, source or authorship by handle, a short scoring rationale and a test that detects overlapping inputs. Keep reserved benchmark cases private until the experiment ends. |
| P1 | OPD-012 | Open for design | Design free public access across independently operated coordinators. | Walk through a public job submitted by someone without a GPU. Show how two groups advertise spare capacity, accept or decline a job, prevent duplicate execution, and return its result. Explain how an operator caps donated time, who bears the cost, and which jobs wait under load. Include a worked example with demand greater than supply and a volunteer leaving mid-job. |
| P0 | OPD-013 | Open | Keep one public mission alive through a coordinator restart. | Build a local, durable mission record containing the objective, owner-set budget, completed steps and their evidence, unresolved questions and next step. Stop and restart the coordinator in a test. Verify it resumes the same mission, preserves results and remaining budget, and skips completed steps. |
| P1 | OPD-014 | Open | Demonstrate diagnosis, repair verification and rollback for one faulty tool using synthetic data. | Inject a known units-conversion bug into a fixture. Require the repair harness to reproduce the failure, isolate the faulty step and try a candidate on separate cases. Show a verified fix and a candidate that introduces a regression. Verify rollback restores the last working version and records the failed attempt. |

Open tasks can be claimed in a linked issue. Use **In progress** with a claim and next step, **In review** with a pull request, **Blocked** with a dependency, or **Done** with merged evidence. Check the issue before starting. Keep the last accepted result visible while new work is in review.

## Contributing with your own ChatGPT session

Choose one row and take one bounded piece of it. For example, ask your assistant to draft the late-result test for OPD-003, calculate throughput from a synthetic run summary for OPD-002, or check the sample diagnostics for accidental identifiers under OPD-006. Use public source files and synthetic examples as context. Run the proposed commands yourself and include the observed result in your pull request. Documentation, test fixtures and reviews can all be contributed without GPU hardware.

The GPU pool and human contributions have separate accounting. A user can choose a task, use their own assistant and submit a patch or test result. OPD-010 explores using authorized ChatGPT requests locally on that person’s behalf. Current OpenAI documentation ties app usage and limits to the authorizing user and workspace. It does not describe transferring personal allowances into a collective token balance. OPDIS stores contributions that survive a session, such as reviewed code, test cases and measured improvements. [OpenAI integration guide](https://developers.openai.com/siwc/token-sharing-open-source) · [User controls](https://learn.chatgpt.com/docs/sign-in-with-chatgpt)

## Updating this tracker

Reference the ID in the issue or pull request and state which acceptance condition it addresses. Include the commit, exact command, environment, observed result and any remaining gaps. For hardware experiments, include model and GPU details using anonymous worker labels. Update the relevant row when evidence is merged, linking the public issue, pull request or sanitized run record. Mark partial work explicitly so another contributor can pick up the next step.
