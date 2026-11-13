# T3 Code enhancement patches

Adds `t3_usage_limits` to T3 Code's built-in MCP server. It reports the last known usage limits for each provider instance and usage hub in the current environment; `usedPercent` means consumed quota. `checkedAt` indicates freshness and `no_snapshot` means unknown, not 0% usage. It does not refresh limits or reach other environments.

The daily GitHub Actions workflow checks the latest published stable release at 07:00 UTC (10:00 Moscow). It checks out that release's tag, compares SHA-256 hashes of the upstream files listed in `patches/base.json`, applies the patch, runs tests and typechecking, then builds and publishes an unsigned Windows x64 installer and updater metadata. The first build must be installed manually. The desktop update feed points to this repository. The installer and automatic update must be tested before relying on them; Windows may warn about unsigned binaries. No official signing certificate is used.

## Maintenance

If an upstream file changes, the workflow fails before applying the patch. Review the changes, update and test the patch, then update the hashes and base commit in `patches/base.json`. Never update hashes without reviewing the relevant upstream changes. Hash guards cannot detect every upstream behavior change, so retain the tests. This workflow builds once per upstream version; a patched re-release of the same version requires a separate increasing version strategy.

For native Windows builds, the patch bounds prepared compile-cache files separately (64 files) from T3's 80-file application payload limit; the upstream Linux cross-build does not generate that Windows cache.

The Windows build does not bundle a Linux WSL CLI runtime. T3 Connect may require upstream build configuration not included here. Windows x64 is the only build target configured. Scheduled jobs can be delayed or disabled after repository inactivity.

To check a local release checkout, run `node scripts/apply-patch.mjs <path-to-clean-t3-checkout>`; this changes that checkout. To test, run `vp test run apps/server/src/mcp/toolkits/orchestrator/usageLimitsPatch.test.ts` within it.
