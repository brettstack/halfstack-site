---
title: Gracefully handling Lambda SQS partial batch failures
cover: photo-1490474418585-ba9bad8fd0ea.jpg
author: Brett Andrews
category: "serverless"
---

[AWS SQS](aws) is a message queueing service that is critical for creating microservices and distributed systems. [Lambda](aws) is AWS' Function as a Service (FAAS) offering that can be configured to run in response to messages being added to the queue. By default, the function will be invoked with a maximum of 10 messages in a single batch, and the function should be written in a way to process all of the messages it receives.

If the function returns successfully, Lambda takes care of deleting messages off the queue for you, and if the function instead throws an error, the messages will remain on the queue ready to be processed again or sent to a Dead Letter Queue (DLQ). But what if some of the messages in the batch can be successfully processed by the function, and others cannot? That is, what if there is a partial batch failure? Ideally, the successfully processed messages will be deleted and the "bad" messages will get left on the queue. Unfortunately, Lambda doesn't handle that scenario for us.

## What happens if I don't handle partial batch failures?

If you don't handle partial batch failures, one of three things will happen:

If your Lambda function resolves successfully (i.e., it doesn't throw an error), all messages in the batch will be deleted from the queue, never to be heard of again. Of course, if one of those messages failed to be processed correctly, this probably isn't what you wanted.

If your Lambda function throws an error, all of the messages in the batch will remain on the queue, including those that were successfully processed. These messages will then be invoked by another Lambda function, with the successfull messages running the risk of being processed a second time (potentially causing other issues), and the bad messages causing another partial batch failure (unless the previous failure was due to a transient error). That batch of messages will once again be returned to the queue and bad messages will continue to cause partial batch failures, which brings us to our third scenario.

If you configure your SQS Queue with a Dead Letter Queue (DLQ), your messages will end up on this quarantined queue instead, and from there you can choose to handle these messages in any way you like. Maybe you have another Lambda function to process them in a different way, or maybe you leave them there for engineers to manually diagnose them. Whatever it is you decide to do with these "dead letters" you probably don't want the queue to be littered with messages that were actually successfully processed, which is a possibility if successfully processed message continues to end up in a batch with partial failures.

## Best practices masking the issue

SQS guarantees "at least once delivery". That is, they guarantee this message will be delivered at least once, but it's possible for it to get delivered multiple times. To prevent the message from being **processed** multiple times, it's a best practice to check the message id against your 

• where infinitum is the maximum message age you've defined for the queue

## Middy and the sqs-partial-batch-failure middleware

Enter [Middy](npm), the popular middleware framework for Lambda, and the recently launched [sqs-partial-batch-failure middleware](npm) that handles partial SQS batch failures for you.

```javascript
```

:thumbsup: :smile: :sparkler:

> Proin ornare ligula eu tellus tempus elementum. Aenean bibendum iaculis mi, nec blandit lacus interdum vitae. Vestibulum non nibh risus, a scelerisque purus. Ut vel arcu ac tortor adipiscing hendrerit vel sed massa. Fusce sem libero, lacinia vulputate interdum non, porttitor non quam. Aliquam sed felis ligula. Duis non nulla magna.

![unsplash.com](./photo-1490474418585-ba9bad8fd0ea.jpg)
