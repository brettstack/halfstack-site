---
title: Handling SQS partial batch failures in AWS Lambda
cover: diana-akhmetianova-s358rpxEALI-unsplash.jpg
author: Brett Andrews
category: "serverless"
---

When using [SQS](https://aws.amazon.com/sqs/) as an event source for [Lambda](https://aws.amazon.com/lambda/), the default configuration is to send batches of up to 10 messages in a single invocation. The Lambda service will even take care of deleting the messages from the queue for you, so long as your function doesn't throw an error.

However, in the event of a partial batch failure (when a subset of messages aren't able to be processed successfully), Lambda doesn't provide a way to define which messages were successfully processed and should be deleted, and which messages failed and should remain on the queue.

## What happens if I don't handle partial batch failures?

If you don't handle partial batch failures, one of three things will happen:

If your Lambda function resolves successfully (i.e., it doesn't throw an error), all messages in the batch will be deleted from the queue, never to be heard of again. Of course, if one of those messages failed to be processed correctly, this probably isn't what you wanted.

Instead, you should probably throw an error. All of the messages in the batch will remain on the queue, including those that were successfully processed. These messages will then be invoked by another Lambda function, with the successful messages running the risk of being processed a second time (potentially causing other issues), and the bad messages likely causing another partial batch failure (unless the previous failure was due to a transient error). That batch of messages will once again be returned to the queue, and bad messages will continue to cause partial batch failures, which brings us to our third scenario.

If you configure your SQS Queue with a Dead Letter Queue (DLQ), your messages will end up on this quarantined queue instead, and from there, you can choose to handle these messages in any way you like. Maybe you have another Lambda function to process them differently, or maybe you leave them there for engineers to perform analysis. Whatever it is you decide to do with these "dead letters" you probably don't want the queue to be littered with messages that were actually successfully processed, which is a possibility if a successfully processed message continues to end up in a batch with partial failures.

## Handling partial batch failures (the hard way)

To handle partial batch failures, you need to delete successfully processed messages within your handler, and then throw an error if any of the messages fail. Here's a simple example:

```javascript
// highlight-start
const SQS = require('aws-sdk/clients/sqs')

const sqs = new SQS()
// highlight-end

async function handler (event) {
  const messageProcessingPromises = event.Records.map(async (record, index) => {
      const messageResult = await processMessage(record)
      // highlight-start
      await sqs.deleteMessage({
        QueueUrl: getQueueUrl({ sqs, eventSourceARN: record.eventSourceARN })
        ReceiptHandle: record.receiptHandle
      }).promise()
      // highlight-end

      return messageResult
  })

  const processedMessages = await Promise.allSettled(messageProcessingPromises)
  // highlight-start
  const failedMessages = processedMessages.filter((r) => r.status === 'rejected')

  // At least one message failed to be processed; throw an error to keep the failed messages on the queue
  if (failedMessages.length) throw new Error('Partial batch failure')
  // highlight-end
  
  // All messages were processed successfully
  return null
}

async function processMessage(record) {
  ...
}

// highlight-start
function getQueueUrl ({ sqs, eventSourceARN }) {
  const [, , , , accountId, queueName] = eventSourceARN.split(':')
  return `${sqs.endpoint.href}${accountId}/${queueName}`
}
// highlight-end

module.exports.handler = handler
```

Having to do this for a single Lambda function might not be a big deal, but if you have multiple Lambda functions processing various SQS queues, you might want to start extracting that core logic somewhere else.

## Middy and the sqs-partial-batch-failure middleware

Enter [Middy](http://npmjs.com/package/@middy/core), the popular middleware framework for Lambda, and the recently launched [sqs-partial-batch-failure middleware](https://www.npmjs.com/package/@middy/sqs-partial-batch-failure) that handles partial SQS batch failures for you. Simply `npm install @middy/core @middy/sqs-partial-batch-failure` and integrate it like so:

```javascript
// highlight-start
const middy = require('@middy/core')
const sqsPartialBatchFailureMiddleware = require('@middy/sqs-partial-batch-failure')
// highlight-end

async function handler (event) {
  const messageProcessingPromises = event.Records.map(processMessage)

  // highlight-start
  return Promise.allSettled(messageProcessingPromises)
  // highlight-end
}

async function processMessage(record) {
  ...
}

// highlight-start
const middyHandler = middy(handler)

middyHandler
  .use(sqsPartialBatchFailureMiddleware())
// highlight-end

module.exports.handler = middyHandler
```

By returning a [`Promise.allSettled()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) value from your handler, this middleware identifies if a partial batch failure occurred, deletes the successfully processed messages off the queue using [SQS.deleteMessageBatch](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#deleteMessageBatch-property), and throws an error to keep the failed messages on the queue.

Not only is it simpler to add this middleware than writing the code yourself, it's also an improvement over the example above. Firstly, it deletes the messages in a single batch (rather than individually), and secondly, if the entire batch was successful, this middleware doesn't do anything! It leaves the deleting of messages to the Lambda service, saving you compute time and 💵.

## End

Until Lambda adds support for handling partial batch failulres, it's up to you to clean up successfully processed messages. This is now as simple as adding a few lines of code with [Middy](http://npmjs.com/package/@middy/core) and [sqs-partial-batch-failure middleware](https://www.npmjs.com/package/@middy/sqs-partial-batch-failure).

If you found this middleware useful or need help with your AWS Serverless setup, let me know! You can find me on [Twitter](https://twitter.com/AWSbrett) (DMs open) and of course [email](mailto:brett@halfstack.software).