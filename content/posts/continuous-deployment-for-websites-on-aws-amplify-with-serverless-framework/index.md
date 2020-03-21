---
title: 'Continuous Deployment for websites on AWS Amplify with Serverless Framework'
category: "serverless"
cover: jj-ying-4XvAZN8_WHo-unsplash.jpg
author: Brett Andrews
---

In November 2018 AWS launched <a href="https://aws.amazon.com/amplify/console/" target="_blank">AWS Amplify Console</a>, a service that provides "Hosting for fullstack serverless web apps with continuous deployment". The naming is a little confusing because a) it's hard to distinguish from <a href="https://aws-amplify.github.io/" target="_blank">AWS Amplify Framework</a>, and b) it's not *just* a console.

Prior to Amplify Console, I'd write the 100+ lines of YAML needed to set up a static website with <a href="https://aws.amazon.com/s3/" target="_blank">S3</a>, <a href="https://aws.amazon.com/cloudfront/" target="_blank">CloudFront</a>, and <a href="https://aws.amazon.com/route53/" target="_blank">Route53</a>. Now I'm able to achieve that same setup on top of the other great features of Amplify Console (continuous deployments and PR previews!) in less than 40 LOC.

```yaml
service: my-website
provider:
  name: aws
  region: us-east-1
  variableSyntax: "\\${{([ ~:a-zA-Z0-9._@\\'\",\\-\\/\\(\\)]+?)}}"

plugins:
  - serverless-dotenv-plugin

custom:
  # 👇 Modify these
  repository: https://github.com/example/website
  domainName: example.com
  domainEnabled: true
  branch: master
  amplifyStage: PRODUCTION

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
        # 👇 You'll likely need to modify this also
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

After deploying this service, a new Amplify App will be created in your account that's configured to automatically build and deploy any changes to your master branch. If you're using a custom domain, you may need to perform some additional DNS steps (based on your provider), and approve the SSL Certificate as well.

> I noticed Amplify doesn't kick off the first build for you even with `EnableAutoBuild: true` set. Simply log into the AWS console, navigate to your app in AWS Amplify, and initiate that first build. If you figure out how to solve this, let me know! Also, consider <a href="https://aws.amazon.com/secrets-manager/" target="_blank">using AWS Secrets Manager</a> instead of `.env` for `GITHUB_PERSONAL_ACCESS_TOKEN` 🔒.

While AWS Amplify does a great job of setting up basic Continuous Deployment, it leaves much to be desired for business-critical apps. There's no multi-stage pipeline, no alarm/time blockers, and no auto-rollbacks (or even manual rollback for that matter). I'd wager deep integration with <a href="https://aws.amazon.com/codepipeline/" target="_blank">AWS CodePipeline</a> is already on the roadmap.

For now, you should be able to setup AWS CodePipeline yourself. I haven't tried this yet, but it looks like <a href="https://docs.aws.amazon.com/cli/latest/reference/amplify/start-job.html" target="_blank">start-job</a> is the action you'll need for the build step, and then you can add in all the custom pipeline bells and whistles you desire. Rollbacks might be a challenge still, but maybe you can leverge the `start-job --commit-id` parameter. If you try this out (or any other method of advanced CD with Amplify Console) let me know how it goes!