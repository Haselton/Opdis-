# OPDIS

**OPDIS aims to build a self-improving digital organism capable of superintelligence. Its missions could run for years.** A volunteer would install a client, choose how much of their computer’s graphics processor (GPU) to lend, and become one node in the organism. Machines could join for an evening or leave for good. The organism would remember its objective, the evidence gathered so far and what to try next.

The Open Distribution Intelligence System is an open-source research project. The proposed organism would draw its computing power from many owners and make its capabilities freely available, including to people with no GPU or subscription.

[Read the white paper](docs/OPDIS-White-Paper.pdf) · [See the project tracker](PROJECT_PROGRESS.md) · [Run the prototype](docs/RUNNING.md)

## What could it spend years doing?

A community might ask why research into a neglected health problem has stalled. Tonight’s nodes could search public studies and record conflicting findings. Next month, a new group of nodes could pick up an unresolved question, check an earlier result against new evidence and offer researchers an experiment worth trying. People with the relevant expertise would judge the findings.

The wider ambition is for people to gain freedom from oppressive government systems and dependence on institutions they cannot influence. A community should be able to set its own missions, inspect how its computing resources are used and keep the results freely available. The long-term social goal is to end the need for compulsory human labor so people can choose which work to do.

## How could the organism improve itself?

Suppose a tool loses the units attached to measurements in a research table. The proposed organism would trace the error to that tool, reproduce it on an example, try a repair in isolation and run independent checks. It would retain a verified repair for future missions and roll back a change that broke earlier work. The same process could eventually improve the tools it uses to diagnose the *next* problem.

The ambition is that repeated improvements might compound exponentially and lead to superintelligence. An early test asks a smaller, measurable question. Given the same GPU time, does a system that keeps its verified improvements solve more unfamiliar problems than one that starts over each round?

## What works today?

One coordinator assigns independent questions to trusted machines running the same model through Ollama. It can ask one worker to propose a better instruction, compare both instructions on the same cases kept apart from training, and flag improvements and regressions for human review. Eight automated tests passed. In a separate run, two simulated workers both received tasks and returned answers the coordinator could score.

The next hardware milestone is a measured run on two physical GPUs. The installable volunteer client, persistent missions, autonomous repair and a free public service are proposed work. Volunteers would keep control of their machines and set limits on donated time. When demand exceeds supply, communities would need public rules for which missions receive time. [Experiment protocols](EXPERIMENTS.md) · [Engineering tasks](PROJECT_PROGRESS.md)

## Help build it

- **With a GPU**, help measure the same workload on two physical machines and on each machine alone under OPD-001. [Hardware setup](docs/RUNNING.md)
- **With a phone or coding assistant**, contribute four checkable test cases under OPD-011. [Contributor instructions](CONTRIBUTING.md#bring-your-own-assistant)
- **With distributed systems experience**, help a mission survive the loss of its coordinator under OPD-013, or build a test that verifies and rolls back a proposed repair under OPD-014. [Tasks and acceptance criteria](PROJECT_PROGRESS.md)

Contributors can use a pseudonym. [Guidance for coding assistants](AGENTS.md) · [Share OPDIS](docs/SHARE.md) · [White paper source](docs/OPDIS-White-Paper.md) · [MIT License](LICENSE)
