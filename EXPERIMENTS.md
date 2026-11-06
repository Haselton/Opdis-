# Measuring GPU scaling and capability growth

## Experiment A. Throughput

Pin the model digest, quantization, application version, sampling settings and case manifest. Record the hardware class for each independently operated GPU. Keep one inference request in flight per peer. Warm both endpoints, then alternate the run order and repeat at least five paired trials per configuration. Use substantially more cases than workers. Report the median verified cases per second, total correct, errors, latency distribution if instrumented, and per-host GPU utilization over the timed interval. The supplied CLI records aggregate wall time and model residency in VRAM. Operators supply hardware telemetry. Save configuration and anonymized result files.

Compute speedup as median one-worker elapsed time divided by median two-worker elapsed time for the same completed work. Include failed tasks and explain quality changes. Report the accelerator classes if workers differ.

## Experiment B. Compounding

Start with a fixed model and a reviewed baseline recipe. Generate a single candidate using training examples. Screen it on held-out inputs and preserve the baseline, candidate, score reports and review decision. The supplied scorer performs trimmed exact string matching. Use another independently reviewed deterministic scorer for a different task family.

For a multi-round study, preregister the task family, budget, stopping rule and number of rounds. Keep a frozen baseline arm and a history-enabled arm whose accepted recipe seeds the next round. Give both arms equal total measured GPU time, including proposal and evaluation costs, and use identical sampling limits. Count fresh unseen tasks solved per GPU-hour, regressions, and the fraction solved. Alternate execution order, repeat independent runs, and finish on a reserved test set. Never publish private prompts in benchmark reports.

Increasing throughput by adding hardware answers Experiment A. Evidence for compounding requires gains on new work from prior verified improvements. To evaluate an exponential-growth claim, declare a positive quantity with room to grow, such as verified solves per GPU-hour, a fixed range of rounds, and an expected multiplier. Compare a log-linear fit against constant and linear alternatives, with uncertainty across runs. A short run or a bounded accuracy percentage cannot establish indefinite growth.

## Longer-term architecture

A persistent objective should survive individual node failures. Leases, checkpoints and replay-safe completion come before open peer enrollment. Future work includes heterogeneous scheduling, sandboxed and signed capabilities, independent result validation, and experiments with partitioning one model across accelerators. Guardian is a proposed human-controlled service that can revoke network leases while preserving logs and checkpoints.
