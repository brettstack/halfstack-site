---
title: 'Migrating REST APIs to AWS Serverless'
category: "serverless"
cover: ankush-minda-TLBplYQvqn0-unsplash.jpg
author: Brett Andrews
---

One of the most common use cases of Serverless architecture is serving REST APIs with Amazon API Gateway and Lambda. In this article we'll cover how to migrate your existing REST APIs to AWS, resulting in saved costs, reduced operational overhead, "infinite" scaling, and more. We'll then go a step further and see how we can evolve our application over time to be more cloud-native and take advantage of the entire AWS and Serverless ecosystem.

AWS provides tools such as https://github.com/awslabs/aws-serverless-express and https://github.com/awslabs/aws-serverless-java-container that make migrating Node.js and Java REST APIs a breeze. aws-serverless-express is framework agnostic (you'd be forgiven for thinking otherwise), which means it works not only for Express, Koa, Hapi, and Sails, but also vanilla Node.js HTTP servers also. aws-serverless-java-container also boasts a large number of framework support, such as Spring, Spring Boot, Apache Struts, Jersey, Spark, and Micronaut.

Let's take a basic Express application:

```js
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const usersRouter = require('./routes/users')

const app = express()
const router = express.Router()

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.get('/', (req, res) => {
  res.json({})
})

app.use('/', router)
app.use('/users', usersRouter)
app.listen(3000)
```

Now, your application is likely to be significantly more complex than this contrived example, but the migration process will be similar for applications of any size. However, there are limitations to consider. If your application isn't stateless (that is, you store state/data on the server), you'll need to move that state elsewhere (thankfully, AWS offers plenty of services that take care of this for you).

To prepare our application for Lambda, we need to do two things. First, replace the `app.listen(3000)` line with `module.exports = app` (Lambda doesn't let you run on ports like this). Next, we need to create our Lambda handler, which is a thin wrapper like this:

```js
// lambda.js
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')

const ase = awsServerlessExpress.configure({
  app,
  respondWithErrors: process.env.NODE_ENV !== 'production',
  loggerConfig: {
    level: 'debug'
  }
})

exports.handler = ase.handler
```

This is all we need to do to get our code Serverless-ready. Now let's get it online. We'll use the Serverless Framework tool to define our infrastructure as code and deploy to AWS. Create a `serverless.yaml` file in your project with the following:

```yaml
# serverless.yaml
service: MyExpressApp
provider:
  name: aws
  memorySize: 256
  environment:
    MY_ENV_VAR: my-value # if your Express application needs environment variables, you can set them here

functions:
  express:
    handler: lambda.handler
    events:
    - http:
        method: ANY
        path: /
        cors: true
    - http:
        method: ANY 
        path: '{proxy+}'
        cors: true
```

> Make sure you've set up your AWS credentials before continuing

Now simply run `npx sls deploy` to deploy your Express app to Lambda. Once complete, the command will output some HTTP endpoints that allow you to take your new Serverless Express app for a spin! With just these few steps we're able to take advantage of some of what AWS has to offer, including worry-free infrastructure, auto-scaling, and pay-for-what-you-use.

We could just leave it there and be happy with the improvements we've gained, however, there's so much more to take advantage of in the AWS ecosystem. Let's look at how API Gateway enables us to use the strangler pattern to migrate pieces of our application away from a single monolithic Express application into their own Lambda Functions.

Let's say we've noticed that our `/admin` endpoint requires elevated permissions that the rest of our application doesn't need and that our logic for creating users requires more CPU or memory than the rest of our application. Because we're security, cost, and performance-focused people, we can split these into separate Lambda Functions: one that handles all of the `/admin` operations, and the other that deals only with creating users. First, let's update our API Gateway endpoints in `serverless.yaml`:

```yaml
# serverless.yaml
...
package:
  individually: true

plugins:
  - serverless-iam-roles-per-function

functions:
  ...
  createUser:
    handler: create-user/lambda.handler
    memorySize: 3008
    events:
    - http:
        method: POST 
        path: /users
        cors: true
  admin:
    handler: lambda.handler
    events:
    - http:
        method: ANY 
        path: /admin
        cors: true
    iamRoleStatements:
    - Effect: "Allow"
      Action:
        - dynamodb:*
      Resource:
        - *
```

Since we'll now have multiple Lambda Functions, it's a good idea to package them individually for performance reasons, so we've instructed Serverless to do so with `package.individually: true`. We've also added our first Serverless Framework plugin. By default, all Lambda Functions defined in a Serverless template share a common IAM role, which isn't ideal for security. This particular plugin allows us to define IAM permissions at the individual function level. Finally, we've added our two new Lambda Functions, connected them via API Gateway. Let's take a closer look at each:

For the `createUser` function, we've specified a handler of `create-user/lambda.handler` and told it to listen on the `POST /users` endpoint that takes priority over the generic `{proxy+}` endpoint we defined earlier.

We've also increased the `memorySize` from the default we set of `256` to the maximum Lambda allows of `3008`. Lambda doesn't have an option for increasing processing power directly, rather (from the [Lambda docs](https://docs.aws.amazon.com/lambda/latest/dg/configuration-console.html)), "Lambda allocates CPU power linearly in proportion to the amount of memory configured. At 1,792 MB, a function has the equivalent of one full vCPU (one vCPU-second of credits per second)."

Now we need to create our new Lambda function logic dedicated to creating a user. We'll assume we have the core of this logic defined in a controller as is best practice in Express:

```js
// create-user/lambda.js
const { createUser } = require('./controllers/user')

async function handler(event) {
  try {
    const user = await createUser(eventTODO)

    return {
      statusCode,
      body,
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: error
    }
  }
}

exports.handler = handler
```

For the `admin` function, we've added our elevated permissions that grant it complete access to DynamoDB. You should always scope your roles down as tightly as possible (it's unlikely even an admin panel needs the ability to drop tables), but in this scenario, we would be able to remove those elevated permissions from our main `express` function, which I consider a win. I'm a huge fan of iterative improvements; we can always scope down our `admin` function's permissions further in the future.

You may notice we're reusing the same `lambda.handler` for our `admin` function that we're using with our main `express` function. This enables us to use the same code deployed to a new function with a different configuration. In the future, we could iterate on this by extracting the admin panel into its own Express app (reducing code and improving performance and security) or even refactor it to a lightweight framework built specifically for Lambda such as [Jeremy Daly](https://twitter.com/jeremy_daly)'s [lambda-api](https://github.com/jeremydaly/lambda-api).

There are plenty of other offerings from AWS for your migration needs. Here are just a few that cover common needs:

Using MongoDB? Try out [Amazon DocumentDB](https://aws.amazon.com/blogs/aws/new-amazon-documentdb-with-mongodb-compatibility-fast-scalable-and-highly-available/) which includes MongoDB compatibility.

Don't have a preferred key-value or document database yet? I highly recommend checking out [DynamoDB](https://aws.amazon.com/dynamodb/). You'll be hard-pressed to find a database that scales as effectively and cost-efficiently as this.

Running relational (SQL) databases? RDS has you covered. They even help with migrating existing databases using Database Migration Service with zero-downtime.

Have some compute workloads that just won't work with the Lambda model? Check out LightSail for a simple cloud server, or Elastic Beanstalk for a step up from that which includes autoscaling. If you're a little more adventurous you can use EC2, which is the underlying service used by LightSail and Elastic Beanstalk.

Want some containerization with your compute? If you're using Kubernetes, there's their managed Kubernetes service EKS. If you're not yet married to Kubernetes, ECS might be the better containerization option. They also have ECR for storing container images (similar to DockerHub, but with better integration with ECS and the rest of AWS). Similar to migrating databases, you can use the Server Migration Service to help with server migrations.

Hosting a static website? Check out Amplify Console. Again, if you're a little more adventurous, you can use the underlying services, namely S3 and CloudFront to host a static website.

This is just a tiny subset of what AWS has to offer. If you need help with your cloud migration, Wizeline is an AWS Advanced Partner and we're ready to help!