---
title: 'Base Serverless Framework template'
category: "serverless"
cover: jj-ying-4XvAZN8_WHo-unsplash.jpg
author: Brett Andrews
---


```yaml
service: my-service
provider:
  name: aws
  stage: ${{opt:stage, self:custom.defaultStage}}
  profile: ${{self:custom.stages.${{self:provider.stage}}.profile}}
  region: us-east-1
  # NOTE: I use this variableSyntax across all of my Serverless Framework
  # services that so it doesn't mess with vanilla CloudFormation Fn::Sub
  variableSyntax: "\\${{([ ~:a-zA-Z0-9._@\\'\",\\-\\/\\(\\)]+?)}}"

plugins:
  - serverless-dotenv-plugin

custom:
  defaultStage: dev
  stages:
    dev:
      domainEnabled: false
      profile: halfstack_software_dev
      amplifyStage: DEVELOPMENT
    staging:
      domain: staging.halfstack.software
      domainEnabled: true
      profile: halfstack_software_staging
      amplifyStage: BETA
    prod:
      domain: a.halfstack.software
      domainEnabled: true
      profile: halfstack_software_prod
      amplifyStage: PRODUCTION
  repository: https://github.com/brettstack/halfstack-site
  branch: master
  amplifyStage: ${{self:custom.stages.${{self:provider.stage}}.amplifyStage}}
  customDomain:
    domainName: ${{self:custom.stages.${{self:provider.stage}}.domain}}
    enabled: ${{self:custom.stages.${{self:provider.stage}}.domainEnabled}}

resources:
  Conditions:
    UseDomainName:
      !Equals
        - ${{self:custom.customDomain.enabled}}
        - true
  
  Resources:
    AmplifyApp:
      Type: "AWS::Amplify::App"
      Properties:
        Name: ${{self:service}}
        Repository: ${{self:custom.repository}}
        AccessToken: ${{env:GITHUB_PERSONAL_ACCESS_TOKEN}}
        BuildSpec: |-
          version: 0.1
          frontend:
            phases:
              preBuild:
                commands:
                  - npm ci
              build:
                commands:
                  - npm run build
            artifacts:
              baseDirectory: public
              files:
                - '**/*'
            cache:
              paths:
                - node_modules/**/*

    AmplifyBranch:
      Type: AWS::Amplify::Branch
      Properties:
        AppId: !GetAtt AmplifyApp.AppId
        BranchName: ${{self:custom.branch}}
        EnableAutoBuild: true
        Stage: ${{self:custom.amplifyStage}}

    AmplifyDomain:
      Type: AWS::Amplify::Domain
      Condition: UseDomainName
      Properties:
        DomainName: ${{self:custom.customDomain.domainName}}
        AppId: !GetAtt AmplifyApp.AppId
        SubDomainSettings:
          - Prefix: ${{self:custom.branch}}
            BranchName: !GetAtt AmplifyBranch.BranchName

  Outputs:
    DefaultDomain:
      Value: !GetAtt AmplifyApp.DefaultDomain

    BranchUrl:
      Condition: UseDomainName
      Value: !Sub ${AmplifyBranch.BranchName}.${AmplifyDomain.DomainName}
```