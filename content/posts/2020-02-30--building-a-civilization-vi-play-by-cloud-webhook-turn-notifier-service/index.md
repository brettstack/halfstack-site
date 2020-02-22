---
title: 'Building a Civilization VI "Play by Cloud" Webhook Turn Notifier Service'
category: "serverless"
cover: architecture-diagram.png
author: Brett Andrews
---

Ever since I was a child, Civilization has been one of my favourite video game series. Back in the 90s, my Grandma purchased a used PC that came loaded with a few games for us kids. Some that I remember include a racing game where the cars have weapons, a police game where you typed in commands (I especially remember giggling with my brother and sister after typing in crude commands), and Civilization. Admittedly, I had no idea how to play Civ at that young age; I mostly played it as a city builder and I loved seeing those 8-bit animations whenever I completed a World Wonder. Civilization was the only one that stood the test of time.

Fast-forward to today. I've played every release of Civilization, and while I don't claim to be good at the game, I recently claimed victory on the hardest difficulty -- Deity -- for the first time (I got lucky and spawned right next to another Civ and took their Settler before they could found a city... Sorry Australia. Still counts.). Civilization VI comes with a new way to play online called **Play by Cloud**. PBC lets you play with multiple people without requiring them to all be online at the same time. Simply take your turn, and log off. This is great for those of us who find it difficult to find the time to sit down and play hours of video games (and Civ takes many, many hours). Instead of a single epic session, or even several multi-hour sessions, the game can now be broken up into hundreds of micro-sessions taking just a few minutes each. Certainly the game may take a year to complete, but there's also something unique about having a long-running experience like that with friends.

To help Play by Cloud games move along at a steady pace, Civilization VI comes with a Webhook feature. If you configure this webhook, Civ VI will send a request to the specified URL every time a player ends their turn. This allows you to write some software to then notify players that it's their turn, for example via Email, [Discord](https://discordapp.com/), [Slack](https://slack.com/), or [carrier pigeon](https://flypigeon.co/). When I was looking into how players were using this, I found some were using [If This Then That](https://ifttt.com/) to pipe the notification through to Discord. I love IFTTT, but it doesn't have the lowest barrier of entry. We can do better.

## Start with the customer, and work backwards

I decided to keep the MVP focused on solving the barrier of entry problem, and limited sending notifications to Discord only. While working at Amazon, one of my favorite processes was [Start with the customer, and work backwards](https://www.forbes.com/sites/innovatorsdna/2017/08/08/how-does-amazon-stay-at-day-one), so I started by thinking through what the ideal customer journey would look like. I knew the player needed to enter a URL into the Civ VI game settings, and since lowering the barrier of entry is a requirement, I didn't want players to have to sign up to use this service. We need a public endpoint. I decided to create the `civ.halfstack.software` subdomain, reusing an existing domain for this project.

The next thing we know is that the player needed a Discord Channel, so I started looking into [how to create a Discord Webhook](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks). Thankfully, this was a simple process and resulted in the Discord UI presenting the user with a Webhook URL. Inspecting the URL format, I identified it includes two variables - an ID and a Token. I started crafting the URL that the user would need to enter into the Civ VI game settings - `https://civ.halfstack.software?discordWebhookId=DISCORD_WEBHOOK_ID&discordWebhookToken=DISCORD_WEBHOOK_TOKEN`. The player would need to copy those values out of the URL in the Discord client, and slap them into the URL template above. Simple, right?

While I'm sure most people would be able to accomplish this incredible feat, a better customer experience would let them simply copy and paste the whole URL. The engineer in me told me to parameterize those values, but there's no value in doing this other than having a shorter, prettier, URL. Users won't care about that. So the final URL now looks like `https://civ.halfstack.software?discordWebhookUrl=DISCORD_WEBHOOK_URL`.

To recap, the user needs to:

1. Create a Discord Channel and invite players (optional if they're using an existing one)
2. Open the Discord Channel Settings and create a Webhook
3. Copy the Discord Channel Webhook URL and paste it to the end of this URL `https://civ.halfstack.software?discordWebhookUrl=DISCORD_WEBHOOK_URL`, and paste that final URL into the Civ VI game settings

This would satisfy the MVP requirements of a low barrier of entry and notifying a Discord channel when a player ends their turn.

| A note on security: The Discord Webhook URL contains "sensitive data". That is, if others obtained it they'd be able to use it to send messages to the channel. If a future version all

## Creating a Serverless Asynchronous HTTP API

Civilization VI doesn't care about the response from the webhook request, making this an ideal scenario for implementing an asynchronous API. If you're not familiar with this term, it's an API that logs a job in a system and responds to the client before the processing of that job is complete. Here's the complete service architecture for the MVP:

![civ-6-play-by-cloud-architecture-diagram](./architecture-diagram.png)

Civilization VI makes a request to our [Amazon API Gateway](https://aws.amazon.com/api-gateway/) endpoint, which performs some transformations on the request and sends a message to an [SQS Queue](https://aws.amazon.com/sqs/) that's configured to send messages to a DLQ after the 5th failure to process a message. Adding SQS brings additional control and resiliency over going directly from API Gateway to Lambda (going directly from API Gateway to the Discord Webhook using the HTTP integration endpoint with VTL transformation is also an option for the brave).

A [Lambda Function](https://aws.amazon.com/lambda/) is configured to pull messages off the queue and send requests to the Discord Webhook. It receives batches of up to 10 messages at once, and it's configured with the [@middy/sqs-partial-batch-failure](https://www.npmjs.com/package/@middy/sqs-partial-batch-failure) middleware package to easily [handle partial batch failures](./gracefully-handling-lambda-sqs-partial-batch-failures). The [reserved concurrency]() is set to one to add [backpressure](https://medium.com/@jayphelps/backpressure-explained-the-flow-of-data-through-software-2350b3e77ce7) to the public API, which will help protect the rest of our system as it grows.

## Future enhancements
