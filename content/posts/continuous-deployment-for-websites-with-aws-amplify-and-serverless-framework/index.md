---
title: 'Continuous Deployment for websites with AWS Amplify and Serverless Framework'
category: "serverless"
cover: jj-ying-4XvAZN8_WHo-unsplash.jpg
author: Brett Andrews
---

It's easier than ever to create a website and present it to the world, especially for non-technical people with the rise of online Website Builders. For more advanced websites, software engineers and web developers have also been spoilt with recent tools such as Zeit, Netlify, GitHub Pages, and the more recent AWS Amplify Console.

<a href="https://aws.amazon.com/amplify/console/" target="_blank">AWS Amplify Console</a> is an AWS service launched in November 2018 that provides "Hosting for fullstack serverless web apps with continuous deployment". Despite what the name implies, AWS Amplify "Console" includes CloudFormation support, allowing you to configure the resources using Infrastructure as Code (IAC).

Prior to Amplify Console, I had to write over 100 lines of complex CloudFormation to set up a static website with <a href="https://aws.amazon.com/s3/" target="_blank">S3</a>, <a href="https://aws.amazon.com/cloudfront/" target="_blank">CloudFront</a>, and <a href="https://aws.amazon.com/route53/" target="_blank">Route53</a>. There's no doubt that behind the scenes these are the fundamental building blocks Amplify Console is using, but not only does it provide a simple abstraction over those AWS Services, it includes a lot of other great features like Continuous Deployment, Pull Request Previews, Cypress tests and more.

Let's take a look at what's required to stand up a basic website with AWS Amplify using the Serverless Framework:

> While this example uses Serverless Framework, it's really just using native CloudFormation Resources. I use Serverless Framework here primarily because I prefer defining my parameters/variables using its `custom` section instead of the more verbose CloudFormation Parameters. Stay tuned for a Serverless Framework Plugin that simplifies this further.

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
  repository: https://github.com/USER/REPO
  domainName: example.com
  domainEnabled: true
  # 👆 set to false if you just want to try this out without a custom domain
  branch: master
  amplifyStage: PRODUCTION
  accessToken: ${{env:GITHUB_PERSONAL_ACCESS_TOKEN}}

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
        AccessToken: 
        # 👇 You'll likely need to modify BuildSpec also, especially `baseDirectory` which is commonly called dist or build
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
    AmplifyAppId:
      Value: !Ref AmplifyApp

    DefaultDomain:
      Value: !Sub ${{self:custom.branch}}.${AmplifyApp.DefaultDomain}

    BranchUrl:
      Condition: UseDomainName
      Value: !Sub ${AmplifyBranch.BranchName}.${AmplifyDomain.DomainName}
```

## Running the example

Before you can deploy this service, you'll need to create a GitHub Personal Access Token and store it in a `.env` file with `GITHUB_PERSONAL_ACCESS_TOKEN=your-token-here`.

> **Important:** Your access token will be displayed in plain text in logs and CloudFormation. Check out the **🔒 Secrets and security** section below for the correct way to do this.

After deploying this service, a new Amplify App is created in your account that's configured to automatically build and deploy any changes to your master branch. Amplify won't kick off the first build until you push something to your branch or manually trigger a build. You can do this by simply logging into the AWS console and navigating to your app in AWS Amplify, or running `aws amplify start-deployment --app-id=AMPLIFY_APP_ID --branch-name=master`.

If you're using a custom domain that's registered Route53, you should be good to go! AWS Amplify Console takes care of everything for you. Otherwise, you'll need to perform some additional DNS steps to approve the SSL Certificate and point your domain at the endpoint. The Amplify Console Console (see why this name is hard?) provides great instructions on how to do this. Remember, DNS takes time to propagate, so don't expect it to work immediately. In the meantime, you can use the domain provided by Amplify that we've defined in the `Outputs.DefaultDomain` of the template.

## 🔒 Secrets and security

An astute reader might recognize the template uses `${{env:GITHUB_PERSONAL_ACCESS_TOKEN}}`. It's important to note that **this isn't a secure way of using secrets inside a template** as they'll show up in logs and the generated CloudFormation template as plain text.

The secure way is to use <a href="https://aws.amazon.com/secrets-manager/" target="_blank">AWS Secrets Manager</a> instead. Simply store your secret either via the AWS Secrets Manager console or by running:

```shell
aws secretsmanager create-secret --name AmplifyGithub --secret-string '[{"accessToken":"YOUR_ACCESS_TOKEN"}]' --profile=YOUR_CLI_PROFILE --region=YOUR_REGION`
```

And replace `AccessToken` in the Serverless Framework template with:

```yaml
AccessToken: '{{resolve:secretsmanager:AmplifyGithub:SecretString:accessToken}}'
```

## Continuous Deployment

While AWS Amplify does a great job of setting up basic Continuous Deployment, it leaves much to be desired for business-critical apps. There's no multi-stage pipeline, no alarm/time blockers, and no auto-rollbacks (or even manual rollback for that matter). I'd wager deep integration with <a href="https://aws.amazon.com/codepipeline/" target="_blank">AWS CodePipeline</a> is already on the roadmap.

For now, you should be able to setup AWS CodePipeline yourself (or the CI/CD pipeline of your choice), though I haven't tried this yet -- maybe an article for another day. You can trigger builds manually with the <a href="https://docs.aws.amazon.com/cli/latest/reference/amplify/start-job.html" target="_blank">start-job</a> if your build environment already has the AWS CLI set up. Alternatively, AWS Amplify Console allows you to create Webhooks for triggering builds, though there's currently no CloudFormation support documented. Remember to turn off `EnableAutoBuild` on your `Amplify::Branch` to disable the built-in Continuous Deployment.

Rollbacks might be a challenge still, but maybe you can leverge the `start-job --commit-id` parameter. If you try this out (or any other method of advanced CD with Amplify Console) let me know how it goes!

## Simplifying further - a Serverless Framework Plugin

Wizeline is currently developing a Serverless Framework Plugin that reduces the above example to:

```yaml
plugins:
  - serverless-amplify-plugin

custom:
  amplify:
    repository: https://github.com/USER/REPO
```

## About Wizeline

Wizeline is a software development and design services company with operations in the U.S., Mexico, Vietnam, Thailand, Australia, and Spain. Wizeline partners with global enterprises and scaling startups to build end-to-end digital products.