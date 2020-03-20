---
title: 'Configuring Serverless Framework for multiple stages'
category: "serverless"
cover: rawfilm-ihMzQV3lleo-unsplash.jpg
author: Brett Andrews
---

<a href="https://aws.amazon.com/cloudformation/" target="_blank">AWS CloudFormation</a> lets you define "variables" in your templates by specifying <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html" target="_blank">Parameters</a> along with a `Default` value. However, they're limited to static values. That is, you can't provide dynamic values based on stage values or other inputs

> You *can* <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/dynamic-references.html" target="_blank">use dynamic values stored in other AWS services within your CloudFormation template</a>, but that's a little different.

One of my favorite <a href="https://serverless.com/" target="_blank">Serverless Framework</a> features is its `custom` section. Not only does it let you specify static values and values based on inputs, but it also lets you compose variables and even create maps so that we can have different values based on stage/environment.

Here's a simplified serverless.yaml showing how I configure and use environment-specific values:

```yaml
provider:
  profile: ${self:custom.stages.${self:provider.stage}.profile}

custom:
  stages:
    dev:
      profile: halfstack_software_dev
      domainEnabled: false
    staging:
      profile: halfstack_software_staging
      domainEnabled: true
      domain: staging.halfstack.software
    prod:
      profile: halfstack_software_prod
      domainEnabled: true
      domain: halfstack.software
  domainName: ${self:custom.stages.${self:provider.stage}.domain}
  domainEnabled: ${self:custom.stages.${self:provider.stage}.domainEnabled}

resources:
  Conditions:
    UseDomainName:
      !Equals
        - ${self:custom.domainEnabled}
        - true
```

In order to access a stage-specific value, I use `${self:custom.stages.${self:provider.stage}.domainName}` -- quite wordy. To make this more accessible throughout the template, I often duplicate the value into a second variable so that I can access it via `${self:custom.domainName}`. Annoying, but manageable.

You can see the example above also includes a `profile` config for each stage. These all have an accompanying profile entry in `~/.aws/credentials` that lets me easily <a href="https://aws.amazon.com/answers/account-management/aws-multi-account-billing-strategy/" target="_blank">deploy to different AWS accounts based on stage</a>. Keep in mind that for any production system that's receiving traffic, **it's dangerous to have production profiles on your local development machines** lest you accidentally deploy to production (plus, I hear it's a security risk? 🤷‍♂️).

```txt
# ~/.aws/credentials
[halfstack_software_dev]
aws_access_key_id = ABC123DEF456GHI789JK
aws_secret_access_key = aB1Cd2aB1Cd2aB1Cd2aB1Cd2+73f8+nWFQ
```

One alternative for stage-specific values is the <a href="https://www.npmjs.com/package/serverless-dotenv-plugin" target="_blank">serverless-dotenv-plugin</a> package. This plugin even allows you to create files like `.env.development` and `.env.production` and it automatically uses the appropriate file when running `NODE_ENV=production sls deploy`. 👍

My personal preference is to store my non-secret values in serverless.yaml and resort to `.env` for secrets only (even better, <a href="https://aws.amazon.com/secrets-manager/" target="_blank">Use AWS Secrets Manager</a> 🔒). This approach makes it easier for developers to set up the project on their machine (they don't need to create a `.env` file), and grants you version control over these values since they're checked into your source code repository.


Have any other tips for multi-stage deployments? Comment below or @ me on <a href="https://twitter.com/AWSbrett" target="_blank">Twitter</a>.