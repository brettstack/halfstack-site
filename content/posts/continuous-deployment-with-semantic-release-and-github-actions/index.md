---
title: 'Continuous Deployment with Semantic Release and GitHub Actions'
category: "serverless"
cover: ankush-minda-TLBplYQvqn0-unsplash.jpg
author: Brett Andrews
---

At <a href="https://www.wizeline.com/" target="_blank">Wizeline</a>, we strive for operational excellence when developing software for all of our clients, from startups to enterprise. This includes test and release automation as a core pillar of DevOps. In this article, we'll cover how to use <a href="https://github.com/features/actions" target="_blank">GitHub Actions</a> and <a href="https://semantic-release.gitbook.io/semantic-release/" target="_blank">Semantic Release</a> to automatically test, build, version, tag and release software packages on <a href="https://github.com/" target="_blank">GitHub</a> and <a href="npmjs.com" target="_blank">NPM</a>. We'll then explore how we can expand on this foundation to continuously deploy software services to the cloud.

## Semantic Release

Semantic Release is an Open-Source Software tool for automatically versioning your software with <a href="https://semver.org/" target="_blank">Semantic Versions</a> based on your Git commit messages. It then releases/deploys the new version to the channel(s) you specify, for example GitHub Release, NPM, PyPI, etc.

By default, Semantic Release expects commits to be in the Conventional Commit format. In its simplest form, this looks like `feat: add feature X` or `fix: fix bug Y` that perform `Minor` and `Patch` version bumps respectively.

Since Semantic Release also generates release notes and maintains a `CHANGELOG.md` for you, adding quality git commit messages -- including a detailed body -- becomes increasingly valuable.

> Check out the <a href="https://www.conventionalcommits.org" target="_blank">Conventional Commit</a> website for additional details such as marking a commit as a breaking change (resulting in a `Major` version bump).

To set up Semantic Release in your project, you'll first need to install semantic-release and its core plugins:

```bash
npm i -D semantic-release \
@semantic-release/commit-analyzer \
@semantic-release/release-notes-generator \
@semantic-release/changelog \
@semantic-release/npm \
@semantic-release/github \
@semantic-release/git
```

Next, inside your `package.json` specify the list of `files` that should be bundled up and distributed as part of the release. **If you don't want the package to be published to NPM** make sure you also add `"private": true`.

```json
"private": true,
"files": [
  "index.js",
  "CHANGELOG.md",
  "package.json",
  "package-lock.json"
]
```

Finally, create a `release.config.js` in your repository root to instruct Semantic Release on how to release our software.

```javascript
module.exports = {
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      "tarballDir": "release"
    }],
    ["@semantic-release/github", {
      "assets": "release/*.tgz"
    }],
    "@semantic-release/git"
  ],
  "preset": "angular"
}
```

Based on this configuration, Semantic Release performs the following steps:

1. <a href="https://github.com/semantic-release/commit-analyzer" target="_blank">@semantic-release/commit-analyzer</a> analyzes your commit messages to determine the next semantic version.
2. <a href="https://github.com/semantic-release/release-notes-generator" target="_blank">@semantic-release/release-notes-generator</a> generates release notes based on the commit messages since the last release.
3. <a href="https://github.com/semantic-release/changelog" target="_blank">@semantic-release/changelog</a> creates and updates a `CHANGELOG.md` file based on the release notes generated.
4. <a href="https://github.com/semantic-release/npm" target="_blank">@semantic-release/npm</a> Updates the `version` in `package.json` and creates a tarball in the `release` directory based on the `files` specified in `package.json`. If the package isn't marked as `private` in `package.json`, the new version of the package is published to NPM.
5. <a href="https://github.com/semantic-release/github" target="_blank">@semantic-release/github</a> creates a GitHub release titled and tagged with the new version. The release notes are used in the description and the tarball created in the previous step is included as the release binary. It also adds a comment to any <a href="https://help.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword" target="_blank">Issues and Pull Requests linked in the commit message</a>.
6. <a href="https://github.com/semantic-release/git" target="_blank">@semantic-release/git</a> commits the files modified in the previous steps (`CHANGELOG.md`, `package.json`, and `package-lock.json`) back to the repository. The commit is tagged with `vMAJOR.MINOR.PATCH` and the commit message body includes the generated release notes. Perform a `git pull --rebase` to get that commit locally.

The base Conventional Commit spec allows for `feat` and `fix` commit types, but the configuration above is using the <a href="https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/index.js#L14" target="_blank">angular preset</a>. The <a href="https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines" target="_blank">Angular flavor of Conventional Commit</a> adds support for additional commit types: build, chore, ci, docs, style, refactor, perf, and test. If you prefer not to use those additional commit types, simply remove that final line in the config.

> If you want to test your configuration, <a href="https://github.com/settings/tokens" target="_blank">create a GitHub personal access token</a> and run `GITHUB_TOKEN=your-token npx semantic-release --dry-run`.

You now have Semantic Release set up for your project, but it's not yet running in response to changes to your repository -- let's do that now.

## GitHub Actions

GitHub Actions allows software developers to run actions in response to events in a GitHub repository. While there are plenty of useful events for automating your GitHub projects, the most common use case is running tests when commits are pushed to the repository or when Pull Requests are opened. Now that we have Semantic Release set up we can take it a step further and perform automated releases.

I've annotated the GitHub Actions workflow file below with code comments that hopefully provide enough explanation. Store this file in `.github/workflows/test-release.yaml` from your root directory.

```yaml
name: Test and release

# Run the workflow when a Pull Request is opened or when changes are pushed to master
on:
  pull_request:
  push:
    branches: [ master ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        # Run the steps below with the following versions of Node.js
        node-version: [8.x, 10.x, 12.x]
    steps:
    # Fetch the latest commit
    - name: Checkout
      uses: actions/checkout@v2

   # Setup Node.js using the appropriate version
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}

    # Install package dependencies
    - name: Install
      run: npm ci

    # Run tests
    - name: Test
      run: npm test

  release:
    # Only release on push to master
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    # Waits for test jobs for each Node.js version to complete
    needs: [test]
    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v1
      with:
        node-version: 12.x

    - name: Install
      run: npm ci

    - name: Release
      run: npm run release
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

After pushing this file to your repository, GitHub will automatically create the Actions for you.

That's it! Your GitHub project is now set up to automatically run tests on every Pull Request and release changes pushed to the `master` branch.

## Let's review

We installed Semantic Release and its plugins, updated our `package.json`, and added `release.config.js` to get our project ready for automated release versioning based on Conventional Commits. We then added automation by defining our GitHub Action in `.github/workflows/test-release.yaml`.

Now, all Pull Requests have tests run against them to ensure changes don't break our package. When changes are pushed to our `master` branch or when Pull Requests are merged, we get versioned releases published to GitHub and NPM with release notes and a changelog. All Issues and PRs referenced in commit messages are automatically commented on to announce they've been addressed in a release. Not bad considering the minimal effort involved.

## Deploying services to the cloud

What we've walked through so far is great for releasing software packages such as libraries and frameworks to GitHub and NPM, but what about deploying services and applications to the cloud? In Part 2, we'll build on the foundation we've established to do just that. We'll create a new GitHub Action workflow that:

1. Is triggered when a new GitHub release is published.
2. Downloads the assets of the latest release.
3. And deploys the build artifacts to AWS.

## Let us help!

Looking for a partner to help build your software or expand your existing team with veteran engineers, project managers, technical writers and more? Reach out to us at Wizeline.