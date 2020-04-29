---
title: 'Continuous Deployment of Serverless applications to AWS using GitHub Actions'
category: "serverless"
cover: ankush-minda-TLBplYQvqn0-unsplash.jpg
author: Brett Andrews
---

In my previous article I covered how to use Semantic Release and GitHub Actions to automate the build, test, and release workflow of a software package. It's an awesome setup if you're building a tool or library to be released to a package repository like NPM, but it falls short for deploying applications to the cloud.

In this post, we'll build on that foundation to deploy the immutable, versioned artifacts to the cloud. I'll be using AWS, the Serverless Framework and a Monorepo in this example, but the core GitHub Actions workflows can be applied to most projects.

## Let's review

```txt
/package.json
/packages/
  |ui/
    serverless.yaml
    package.json
  |db/
    serverless.yaml
    package.json
  |api/
    serverless.yaml
    package.json
```

Install semantic-release and its core plugins to the root package.json:

```bash
npm i -D semantic-release \
@semantic-release/commit-analyzer \
@semantic-release/release-notes-generator \
@semantic-release/changelog \
@semantic-release/npm \
@semantic-release/github \
@semantic-release/git
```

Create `release.config.js`:

```js
module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    ['@semantic-release/github', {
      assets: [
        'CHANGELOG.md',
        'release/db.zip',
        'release/api.zip',
        'release/ui.zip',
      ],
    }],
    '@semantic-release/git',
  ],
  preset: 'angular',
}
```

Add a package command to each service:

```json
"scripts": {
  "package": "serverless package && zip -r api.zip .serverless serverless.yaml package.json package-lock.json"
}
```

Create `.github/workflows/test-release.yaml`:

```yaml
name: Test and release

on:
  push:
    branches: [ master ]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [db, api, ui]
    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v1
      with:
        node-version: 12.x
    
    - name: Install root
      run: npm ci

    - name: Install package
      working-directory: "./packages/${{ matrix.package }}"
      run: npm ci

    - name: Test
      working-directory: "./packages/${{ matrix.package }}"
      run: npm test

    - name: Package
      working-directory: "./packages/${{ matrix.package }}"
      if: github.event_name == 'push' && github.ref == 'refs/heads/master'
      run: npm run package
    
    - name: Upload package artifact
      if: github.event_name == 'push' && github.ref == 'refs/heads/master'
      uses: actions/upload-artifact@v1
      with:
        name: release
        path: "./packages/${{ matrix.package }}/${{ matrix.package }}.zip"

  release:
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    needs: [test]
    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v1
      with:
        node-version: 12.x

    - name: Install root dependencies
      run: npm ci
      
    - name: Download package artifact
      uses: actions/download-artifact@v1
      with:
        name: release
        path: release
      
    - name: Release
      run: npx semantic-release
      env:
        # NOTE: GitHub Actions won't trigger on release when using the default GITHUB_TOKEN
        GITHUB_TOKEN: ${{ secrets.GH_PERSONAL_ACCESS_TOKEN }}
```

Unfortunately, you can't use the default `secrets.GITHUB_TOKEN` secret as it doesn't trigger a release event. 🤷‍♂️ Create a new GitHub Personal Access Token with `repo` scope and store the token as a new secret in the repository called `GH_PERSONAL_ACCESS_TOKEN`.

## Create an 'on release' GitHub Action Workflow

Thankfully, one of the event triggers that GitHub Actions provides for us is on `release`. Let's use that.

```yaml
name: Deploy on release published

on:
  release:
    types:
    - published

jobs:
  deploy_prod:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [db, api, ui]
    steps:
    - name: Download release
      uses: Legion2/download-release-action@v2.1.0
      with:
        repository: ${{ github.repository }}
        token: ${{ secrets.GH_PERSONAL_ACCESS_TOKEN }}
        tag: latest
        file: ${{ matrix.package }}.zip

    - name: Unzip release package
      run: unzip ${{ matrix.package }}.zip

    - name: Setup AWS Credentials
      run: |
        mkdir ~/.aws
        echo "[civ6_prod]
        aws_access_key_id = ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws_secret_access_key = ${{ secrets.AWS_SECRET_ACCESS_KEY }}" > ~/.aws/credentials
    
    - name: Setup Node.js
      uses: actions/setup-node@v1
      with:
        node-version: 12.x

    - name: Install package
      run: npm i
    
    - name: Deploy package
      run: npx serverless deploy --package .serverless
```