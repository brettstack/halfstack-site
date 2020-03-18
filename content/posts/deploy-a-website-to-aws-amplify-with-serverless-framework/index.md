---
title: 'Deploy a website to AWS Amplify with Serverless Framework'
category: "serverless"
cover: jj-ying-4XvAZN8_WHo-unsplash.jpg
author: Brett Andrews
---

In November 2018 AWS launched <a href="https://aws.amazon.com/amplify/console/" target="_blank">AWS Amplify Console</a>, a service that provides "Hosting for fullstack serverless web apps with continuous deployment". The naming is a little confusing because a) it's hard to distinguish from <a href="https://aws-amplify.github.io/" target="_blank">AWS Amplify Framework</a>, and b) it's not *just* a console.

Prior to Amplify Console, I'd write the 100+ lines of YAML to set up a static website with <a href="" target="_blank">S3</a>, <a href="" target="_blank">CloudFront</a>, and <a href="" target="_blank">Route53</a>. Now I'm able to achieve that same setup on top of the other great features of Amplify Console in less than 40 LOC.

```yaml
service: my-website
provider:
  name: aws
  profile: ${{self:custom.stages.${{self:provider.stage}}.profile}}
  region: us-east-1
  variableSyntax: "\\${{([ ~:a-zA-Z0-9._@\\'\",\\-\\/\\(\\)]+?)}}"

plugins:
  - serverless-dotenv-plugin

custom:
  repository: https://github.com/example/website
  branch: master
  amplifyStage: PRODUCTION
  domainName: example.com
  enabled: true

resources:
  Conditions:
    UseDomainName:
      !Equals
        - ${{self:custom.domainEnabled}}
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
        DomainName: ${{self:custom.domainName}}
        AppId: !GetAtt AmplifyApp.AppId
        SubDomainSettings:
          - Prefix: ${{self:custom.branch}}
            BranchName: !GetAtt AmplifyBranch.BranchName

  Outputs:
    DefaultDomain:
      Value: !Sub ${{self:custom.branch}}.${AmplifyApp.DefaultDomain}

    BranchUrl:
      Condition: UseDomainName
      Value: !Sub ${AmplifyBranch.BranchName}.${AmplifyDomain.DomainName}
```