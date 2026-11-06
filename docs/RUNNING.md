# Running the OPDIS prototype

These commands exercise the trusted-peer prototype. Start in the repository root. You can run the automated tests without a GPU. The hardware experiment requires Ollama and a compatible model on each participating machine.

## Run the tests

Install Node.js 22 or later. Run the following command from the repository root.

    node --test test.mjs

The prototype uses Node's standard library. The tests inject simulated inference responses. Live runs use local Ollama installations with a model installed on each host. Model licenses apply separately.

## Run a GPU experiment

1. Have each participating operator run Ollama on a GPU machine under their control. Use an explicit model tag available on every peer. Verify that GPU acceleration works on each host.
2. Connect over an authenticated SSH tunnel to each remote host. These examples use SSH configuration aliases. Leave both tunnels open in separate terminals. A local GPU may instead use its existing Ollama endpoint on loopback.

       ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:11435:127.0.0.1:11434 gpu-a
       ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:11436:127.0.0.1:11434 gpu-b

3. Look up the model's exact name and 64-character digest in the models list on each forwarded endpoint. Use the same digest for the comparison. Set OPDIS_MODEL and OPDIS_DIGEST in the terminal that will run the coordinator. On PowerShell, read the installed models and set the two variables.

       Invoke-RestMethod http://127.0.0.1:11435/api/tags | Select-Object -ExpandProperty models | Select-Object name,digest
       $env:OPDIS_MODEL = 'your-model:tag'
       $env:OPDIS_DIGEST = 'paste-the-64-character-digest'

   On a POSIX shell, use curl against the same endpoint, then export the two variables.
4. Run the same batch with one peer and then two. The included cases are a smoke test. Use a larger suite for timings.

       node run.mjs examples/heldout.json recipes/baseline.json http://127.0.0.1:11435
       node run.mjs examples/heldout.json recipes/baseline.json http://127.0.0.1:11435 http://127.0.0.1:11436

5. Inspect total, solved, errors, activePeers, per-case model digests, GPU residency, and wall time. Two endpoint names may refer to one machine. A two-GPU claim requires separate physical devices verified by their operators and independent utilization measurements during the run.

## Run one capability round

    node evolve.mjs examples/train.json examples/heldout.json recipes/baseline.json http://127.0.0.1:11435 http://127.0.0.1:11436

One peer proposes a text instruction from the training examples. The coordinator compares the baseline and candidate on the same held-out inputs. Each peer receives the input and current instruction. The answer key stays with the scorer. The report identifies gains and regressions by case ID. A candidate qualifies for review only with a complete run, at least one gain, and zero regressions. A maintainer can inspect the proposed text, give it a versioned id, and submit it as a new JSON recipe. The accepted recipe can seed the next round.

The public examples exercise the protocol. For evidence of transfer, use a fresh, blinded suite each round and an untouched final evaluation set. See [EXPERIMENTS.md](../EXPERIMENTS.md).

## Stopping a run

Stop the coordinator locally to end dispatch. Peers may finish requests already in progress.
