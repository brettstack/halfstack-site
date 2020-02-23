---
title: 'Building a Civilization VI "Play by Cloud" Webhook Turn Notifier Service'
category: "serverless"
cover: architecture-diagram.png
author: Brett Andrews
---

Back in the 90s, my Grandma purchased a used PC that came loaded with a few games for us kids. One of those games was [Police Quest](https://en.wikipedia.org/wiki/Police_Quest), which was my first introduction to typing commands into a computer. But the game which stood the test of time was Civilization. Admittedly, I had no idea how to play Civ at that young age, and I mostly played it as a city builder. I loved seeing those 8-bit animations whenever I completed a World Wonder.

I've played every Civilization release since, and recently claimed victory on the hardest difficulty -- Deity -- for the first time. I got lucky and spawned right next to another Civ and took their Settler before they could found a city... Sorry Australia. Still counts.

> You can find [the source code for the entire service on GitHub](https://github.com/brettstack/civ6-play-by-cloud-turn-notifier).

## Civilization VI, Play by Cloud, and Webhooks

Civilization VI comes with a new way to play online called Play by Cloud. PBC lets you play with multiple people without requiring them to all be online at the same time. Simply take your turn, and log off. This is great for those of us who have difficulty finding the time to sit down and play hours of video games (and Civ takes many, many hours).

Instead of a single epic session (or even several multi-hour sessions), the game can now be broken up into hundreds of micro-sessions taking just a few minutes each. Certainly the game may take a year to complete, but there's also something unique about having a long-running experience like that with friends.

To help Play by Cloud games move along at a steady pace, Civilization VI comes with a Webhook feature. If you configure this webhook, Civ VI will send a request to the specified URL every time a player ends their turn. This allows you to write some software to then notify players that it's their turn, for example via Email, [Discord](https://discordapp.com/), [Slack](https://slack.com/), or [carrier pigeon](https://flypigeon.co/).

When I was looking into how players were using this, I found some were using [If This Then That](https://ifttt.com/) to pipe the notification through to Discord. I love IFTTT, however, it doesn't have the lowest barrier of entry. We can do better.

## Defining an MVP; Start with the customer, and work backwards

I decided to keep the MVP focused on solving the barrier of entry problem, and limiting notifications to Discord only. While working at Amazon, one of my favorite processes was [Start with the customer, and work backwards](https://www.forbes.com/sites/innovatorsdna/2017/08/08/how-does-amazon-stay-at-day-one), so I started by thinking through what the ideal customer journey would look like.

First, we need a way to programatically send messages to a Discord channel. Discord provides its own Webhook feature for just this purpose, so the player needs to [create a Discord Channel Webhook](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks). Thankfully, this is accomplished in a few clicks and results in the Discord UI presenting you with a Webhook URL.

To configure the Play by Cloud Webhook, the player needs to enter a URL into the Civ VI game settings. Ideally, we would simply paste in a Discord Channel Webhook URL and be done with it, but as these two systems weren't set up to talk to eachother directly, we need an intermediary service.

Since lowering the barrier of entry is a requirement, players shouldn't be forced to register and sign in to use this service, so the intermediary service needs a public interface (specifically, a public URL/endpoint). I decided to create the `civ.halfstack.software` subdomain, reusing an existing domain for this project, and I started crafting the URL that the player would need to enter into the Civ VI game settings.

Inspecting the Discord Channel Webhook URL (example: `https://discordapp.com/api/webhooks/658762929466762255/tR_-O9REJ4mwE4XGlNvFuZ3JnsE-JKePKtuhXlMb3DVG1rkh004Y5--87ArBtEWR77ys`), we can see it includes two variables - an ID and a Token. The player would need to copy the ID and Token from the Discord Channel Webhook, and paste them into this URL template `https://civ.halfstack.software?discordWebhookId=DISCORD_WEBHOOK_ID&discordWebhookToken=DISCORD_WEBHOOK_TOKEN`. Simple, right?

While I'm sure most people would be able to accomplish this incredible feat, a better customer experience would let them simply copy and paste the whole URL. The engineer in me told me to parameterize those values, but there's no value in doing this other than having a shorter, prettier, URL. Users won't care about that. So the final URL looks like `https://civ.halfstack.software?discordWebhook=DISCORD_WEBHOOK_URL`.

To recap, the player needs to:

1. Create a Discord Channel and invite players (optional if they're using an existing one)
2. Open the Discord Channel Settings and create a Webhook
3. Copy the Discord Channel Webhook URL and paste it to the end of this URL `https://civ.halfstack.software?discordWebhook=DISCORD_WEBHOOK_URL`, and paste that final URL into the Civ VI game settings

This would satisfy the MVP requirements of a low barrier of entry and notifying a Discord channel when a player ends their turn.

> A note on security: The Discord Webhook URL contains "sensitive data". That is, if someone obtained it they'd be able to use it to send messages to the channel. A future version could improve this.

## Creating a Serverless Asynchronous HTTP API

Now that we have our MVP outlined and interface defined, it's time to put the plan to action. I decided to implement this service as an Asynchornous API, since Civilization VI doesn't care about the response from the webhook request. If you're not familiar with this term, it's an API that logs a job in a system and responds to the client before the processing of that job is complete.

Here's the complete service architecture for the MVP:

![civ-6-play-by-cloud-architecture-diagram](./architecture-diagram.png)

This is what that looks like defined in [Serverless Framework](https://serverless.com/) (you can find [the source on Github](https://github.com/brettstack/civ6-play-by-cloud-turn-notifier/blob/master/packages/webhook/serverless.yml)):

```yaml
service: civ6-pbc
provider:
  name: aws
  runtime: nodejs12.x
  memorySize: 128
  timeout: 6
  stage: ${{opt:stage, self:custom.defaultStage}}
  profile: ${{self:custom.profiles.${{self:provider.stage}}}}
  region: us-east-1
  variableSyntax: "\\${{([ ~:a-zA-Z0-9._@\\'\",\\-\\/\\(\\)]+?)}}"
  iamRoleStatements:
    - Effect: Allow
      Action:
        - sqs:SendMessage
      Resource: !GetAtt WebhookSqsQueueDlq.Arn

plugins:
  - serverless-offline
  - serverless-apigateway-service-proxy
  - serverless-domain-manager

custom:
  defaultStage: prod
  profiles:
    dev: civ6_dev
    stage: civ6_stage
    prod: civ6_prod
  apiGatewayServiceProxies:
    - sqs:
        path: /
        method: post
        queueName: !GetAtt WebhookSqsQueue.QueueName
        requestParameters:
          integration.request.querystring.MessageAttribute.1.Name: "'discordWebhook'"
          integration.request.querystring.MessageAttribute.1.Value.StringValue: method.request.querystring.discordWebhook
          integration.request.querystring.MessageAttribute.1.Value.DataType: "'String'"
  domain:
    dev:
      domain: civ.halfstack.software
      validationDomain: halfstack.software
      enabled: false
    stage:
      domain: staging.civ.halfstack.software
      validationDomain: halfstack.software
      enabled: true
    prod:
      domain: civ.halfstack.software
      validationDomain: halfstack.software
      enabled: true
  customDomain:
    domainName: ${{self:custom.domain.${{opt:stage, self:provider.stage}}.domain}}
    certificateName: '*.civ.halfstack.software'
    enabled: ${{self:custom.domain.${{opt:stage, self:provider.stage}}.enabled}}
    createRoute53Record: false

functions:
  webhook:
    reservedConcurrency: 1
    handler: handler.webhookHandler
    events:
      - sqs:
          arn: !GetAtt WebhookSqsQueue.Arn

resources:
  Conditions:
    UseDomainName:
      !Equals
        - ${{self:custom.customDomain.enabled}}
        - true
  
  Resources:
    # NOTE: Following guidance here to reduce the chance of Lambda throttling
    # https://medium.com/@zaccharles/lambda-concurrency-limits-and-sqs-triggers-dont-mix-well-sometimes-eb23d90122e0
    WebhookSqsQueue:
      Type: AWS::SQS::Queue
      Properties:
        VisibilityTimeout: 36 # functions.webhook.timeout * 6
        RedrivePolicy:
          deadLetterTargetArn: !GetAtt WebhookSqsQueueDlq.Arn
          maxReceiveCount: 5

    WebhookSqsQueueDlq:
      Type: AWS::SQS::Queue
    
    ApiGatewayMethodPost:
      Type: AWS::ApiGateway::Method
      Properties:
        RequestParameters:
          method.request.querystring.discordWebhook: true
        Integration:
          IntegrationResponses:
            - StatusCode: 200
              ResponseTemplates:
                application/json: '{}'

    AcmCertificate:
      Type: AWS::CertificateManager::Certificate
      Condition: UseDomainName
      Properties:
        DomainName: '*.${{self:custom.customDomain.domainName}}'
        SubjectAlternativeNames:
          - ${{self:custom.customDomain.domainName}}
        DomainValidationOptions:
          - DomainName: '*.${{self:custom.customDomain.domainName}}'
            ValidationDomain: ${{self:custom.domain.${{self:provider.stage}}.validationDomain}}
          - DomainName: ${{self:custom.customDomain.domainName}}
            ValidationDomain: ${{self:custom.domain.${{self:provider.stage}}.validationDomain}}
```

Civilization VI makes a request to our [Amazon API Gateway](https://aws.amazon.com/api-gateway/) endpoint, which performs some transformations on the request and sends a message to an [SQS Queue](https://aws.amazon.com/sqs/). That queue is configured to send messages to a DLQ if a message failes to be processed for the 5th time.

> Adding SQS brings additional control and resiliency over going directly from API Gateway to Lambda. Another alternative solution is going directly from API Gateway to the Discord Webhook (the "no code" approach) using API Gateway's HTTP integration endpoint with VTL transformation, but [this approach isn't flexible for when requirements change](https://twitter.com/AWSbrett/status/1231260929825787905).

A [Lambda Function](https://aws.amazon.com/lambda/) is configured to pull messages off the queue and send requests to the Discord Webhook. It receives batches of up to 10 messages at once, and it's configured with the [@middy/sqs-partial-batch-failure](https://www.npmjs.com/package/@middy/sqs-partial-batch-failure) middleware package to easily [handle partial batch failures](./gracefully-handling-lambda-sqs-partial-batch-failures). The [reserved concurrency]() is set to one to add [backpressure](https://medium.com/@jayphelps/backpressure-explained-the-flow-of-data-through-software-2350b3e77ce7) to the public API, which will help protect the rest of our system as it grows.

You can find [the source code for the entire service on GitHub](https://github.com/brettstack/civ6-play-by-cloud-turn-notifier).

```javascript
async function processMessage(record, index) {
  const {
    messageId,
    body,
    messageAttributes,
  } = record

  const bodyJson = JSON.parse(body)

  const {
    discordWebhook,
    botUsername,
    avatarUrl,
    messageTemplate,
  } = getMessageAttributeStringValues({ messageAttributes })

  const {
    value1: gameName,
    value2: playerName,
    value3: turnNumber,
  } = bodyJson

  const message = getMessageFromTemplate({
    messageTemplate,
    gameName,
    playerName,
    turnNumber,
  })

  const targetWebhookBody = {
    username: botUsername,
    avatar_url: avatarUrl,
    content: message,
  }

  const response = await fetch(discordWebhook, {
    body: JSON.stringify(targetWebhookBody),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`HTTP response not ok: ${response.status} ${responseText}`)
  }

  return responseText
}
```

![civ-6-play-by-cloud-webhook-discord-notification](./civ-vi-play-by-cloud-webhook-discord.png)

> You can find [the source code for the entire service on GitHub](https://github.com/brettstack/civ6-play-by-cloud-turn-notifier).

## Future enhancements
