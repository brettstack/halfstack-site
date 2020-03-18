---
title: 'Configuring Serverless Framework for multi-stage deployment'
category: "serverless"
cover: jj-ying-4XvAZN8_WHo-unsplash.jpg
author: Brett Andrews
---

One of my favorite features of <a href>Serverless Framework</a> is its `custom` section that lets you specify variables. With vanilla <a href>AWS CloudFormation</a> you could achieve this with `Parameters`, but there's a little more cruft needed and while you can provide `DefaultValue`s they can't be dynamic based on stage values or other inputs.

Serverless Framework isn't perfect either. In order to access a stage-specific value, I use `${{self:custom.stages.${{self:provider.stage}}.amplifyStage}}` which is quite wordy. To make this more accessible, I often duplicate the value into a second variable `amplifyStage: ${{self:custom.stages.${{self:provider.stage}}.amplifyStage}}` so I can then access it via `${{self:custom.amplifyStage}}`. Annoying, but manageable.

This is what the relevant parts of a serverless.yaml file looks like for configuring environment-specific values:

```yaml
provider:
  stage: ${{opt:stage, self:custom.defaultStage}}
  profile: ${{self:custom.stages.${{self:provider.stage}}.profile}}

custom:
  defaultStage: dev
  stages:
    dev:
      domainEnabled: false
      profile: halfstack_software_dev
    staging:
      domain: staging.halfstack.software
      domainEnabled: true
      profile: halfstack_software_staging
    prod:
      domain: halfstack.software
      domainEnabled: true
      profile: halfstack_software_prod
  domainName: ${{self:custom.stages.${{self:provider.stage}}.domain}}
  domainEnabled: ${{self:custom.stages.${{self:provider.stage}}.domainEnabled}}

resources:
  Conditions:
    UseDomainName:
      !Equals
        - ${{self:custom.domainEnabled}}
        - true
```

One alternative for stage-specific values is to use <a href="https://www.npmjs.com/package/serverless-dotenv-plugin" target="_blank">serverless-dotenv-plugin</a>. This plugin even allows you to create files like `.env.development` and `.env.production` and the appropriate file is used when running `NODE_ENV=production sls deploy`.

My personal preference is to store my non-secret values in serverless.yaml and resort to `.env` for secrets only. This makes it easier for developers to set up the project on their machine (they don't need to create a `.env` file), and simpler to modify these values since -- unlike `.env` files -- they're checked into your source code repository.