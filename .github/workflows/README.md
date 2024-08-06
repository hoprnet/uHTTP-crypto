# GitHub Workflows

This document describes the GitHub workflows used in this project.

## Build

Builds, Lint, Test and publish every commit on a pull request

The published artifact will have the version x.y.z-pr.<PR_NUMBER>+<BUILD_DATE>
The artifact will be published as well in the release channel `next` so it can be used as `@hoprnet/uhttp-crypto@next`

## Merge PR

Exclusively publish the closure of a pull request in the alpha release channel so it can be used as `@hoprnet/uhttp-crypto@alpha`

The published artifact will have the version x.y.z-pr.<PR_NUMBER>

## Close release

Closes the release by publish the version in the latest release channel so it can be used as `@hoprnet/uhttp-crypto@latest`

The published artifact will have the version x.y.z