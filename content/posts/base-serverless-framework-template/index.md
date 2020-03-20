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
  # services so that it doesn't mess with vanilla CloudFormation Fn::Sub syntax
  variableSyntax: "\\${{([ ~:a-zA-Z0-9._@\\'\",\\-\\/\\(\\)]+?)}}"

plugins:
  - serverless-dotenv-plugin

custom:
  defaultStage: dev
  stages:
    dev:
      profile: halfstack_software_dev
      domainEnabled: false
      amplifyStage: DEVELOPMENT
    staging:
      profile: halfstack_software_staging
      domainEnabled: true
      domain: staging.halfstack.software
      amplifyStage: BETA
    prod:
      profile: halfstack_software_prod
      domainEnabled: true
      domain: halfstack.software
      amplifyStage: PRODUCTION
  repository: https://github.com/brettstack/halfstack-site
  branch: master
  amplifyStage: ${{self:custom.stages.${{self:provider.stage}}.amplifyStage}}
  domainName: ${{self:custom.stages.${{self:provider.stage}}.domain}}
  domainEnabled: ${{self:custom.stages.${{self:provider.stage}}.domainEnabled}}

resources:
  Conditions:
    UseDomainName:
      !Equals
        - ${{self:custom.domainEnabled}}
        - true
  
  Resources:
    ...
    AmplifyDomain:
      Type: AWS::Amplify::Domain
      Condition: UseDomainName
      Properties:
        DomainName: ${{self:custom.domainName}}
        AppId: !GetAtt AmplifyApp.AppId
        SubDomainSettings:
          - Prefix: ${{self:custom.branch}}
            BranchName: !GetAtt AmplifyBranch.BranchName

  Outputs:
    BranchUrl:
      Condition: UseDomainName
      Value: !Sub ${AmplifyBranch.BranchName}.${AmplifyDomain.DomainName}
```