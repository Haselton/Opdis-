# Contributor and coding-assistant instructions

- Read `README.md` and `PROJECT_PROGRESS.md`. Choose one work item and cite its ID in the pull request.
- Keep changes small enough to review against one acceptance condition. Reuse the existing implementation and follow its conventions.
- Use synthetic inputs, anonymous worker labels and neutral project attribution in examples, logs and commit metadata. Review exported configuration and diagnostics for machine identifiers, credentials and private paths.
- Keep training examples, review cases and final evaluation data separate. Record model versions, seeds and compute budgets for experiments.
- Run the relevant tests and examples. Report the command, environment and observed outcome. Identify simulated workers and physical GPU runs accurately.
- Update `PROJECT_PROGRESS.md` when a change supplies new evidence or alters what remains open. Make performance claims only to the extent supported by reproducible measurements.
