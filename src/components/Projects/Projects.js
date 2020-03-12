import PropTypes from "prop-types";
import React from "react";
import { ThemeContext } from "../../layouts";
import ApiGatewayImage from './Amazon-API-Gateway@4x.png'
import SqsPartialBatchFailureImage from './Amazon-Simple-Queue-Service-SQS@4x.png'
import HalfstackSoftwareImage from './AWS-Amplify_light-bg@4x.png'
import ServerlessExpressImage from './AWS-Lambda@4x.png'
import SamImage from './aws-sam.png'
import SarImage from './AWS-Serverless-Application-Repository_light-bg@4x.png'
import CsnetImage from './csnet.png'

const projects = [
  {
    backgroundColor: '#FF0088',
    fontColor: '#FFFFFF',
    image: SamImage,
    title: 'AWS SAM',
    role: 'Engineering lead',
    Description: () => (
      <React.Fragment>
        <p>
          <a href="https://aws.amazon.com/serverless/sam/" target="_blank">SAM</a> is an open-source framework and AWS service for defining Cloud-Native Serverless applications as infrastructure as code (IAC). I led the engineering team responsible for designing and implementing new features, responding to customers’ GitHub Issues and Pull Requests, and deploying and operating the service. I designed and implemented the CD pipeline, metrics, and team processes to improve the operational excellency and performance of the team and product.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#8800FF',
    fontColor: '#FFFFFF',
    image: ServerlessExpressImage,
    title: 'aws-serverless-express',
    role: 'Creator and maintainer',
    Description: () => (
      <React.Fragment>
        <p>
          [aws-serverless-express](https://github.com/awslabs/aws-serverless-express) is a library for running [Express](https://expressjs.com/) and other Node.js web frameworks on [Serverless AWS](https://aws.amazon.com/serverless/) using [Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/). The project is used by thousands of [AWS](https://aws.amazon.com/) customers for running production applications of all scales, has over 3k stars on [GitHub](https://github.com/awslabs/aws-serverless-express), and is downloaded over 800k times a month on [NPM](https://www.npmjs.com/package/aws-serverless-express).

  I was responsible for the inception, implementation, maintenance, support, documentation, releases, and growth for this product. You can see [my blog post on the AWS Compute Blog](https://aws.amazon.com/blogs/compute/going-serverless-migrating-an-express-application-to-amazon-api-gateway-and-aws-lambda/) as well as [a blog post by Jeff Barr](https://aws.amazon.com/blogs/aws/running-express-applications-on-aws-lambda-and-amazon-api-gateway/).
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#88FF00',
    fontColor: '#FFFFFF',
    image: SarImage,
    title: 'Serverless Application Repository',
    role: 'Founding member; senior engineer',
    Description: () => (
      <React.Fragment>
        <p>
          The [​Serverless Application Repository​](https://aws.amazon.com/serverless/serverlessrepo/) is an AWS service enabling customers to publish serverless applications, tools, and plugins that can then be deployed into other AWS accounts. As a founding and senior member of the team, I had significant input on defining team processes and the design of the service.

  As Scrum Master for this Agile team, I organized sprints, prioritized roadmaps/backlog, ran sprint planning and retrospective meetings, and was responsible for the overall success of each sprint. I worked with Product Managers to design new features for the service based on customer feedback and was the engineering lead for the UI.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#FF8800',
    fontColor: '#FFFFFF',
    image: ApiGatewayImage,
    title: 'Amazon API Gateway',
    role: 'UI engineering lead; launch member',
    Description: () => (
      <React.Fragment>
        <p>
          [Amazon API Gateway](https://aws.amazon.com/api-gateway/) allows customers to define HTTP/REST APIs to interface with various integrations (primarily, [Lambda](https://aws.amazon.com/lambda)). I led the development of the UI for this service and helped modernize UI development within the organization by providing guidance on modern web development techniques (ECMAScript 6+, Webpack, automated testing, etc.) to teams such as Lambda and Cognito.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#00FF88',
    fontColor: '#FFFFFF',
    image: SqsPartialBatchFailureImage,
    title: '@middy/sqs-partial-batch-failure',
    role: 'Creator',
    Description: () => (
      <React.Fragment>
        <p>
          [@middy/sqs-partial-batch-failure](https://www.npmjs.com/package/@middy/sqs-partial-batch-failure) is a Lambda middleware for [handling SQS partial batch failures in AWS Lambda](/gracefully-handling-lambda-sqs-partial-batch-failures/).
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#0088FF',
    fontColor: '#FFFFFF',
    image: CsnetImage,
    title: 'Community Services .NET',
    role: 'Engineering lead',
    Description: () => (
      <React.Fragment>
        <p>
          Community Services .NET (CSnet) is a startup focused on delivering Case Management Software to Human Services organizations. I assisted with the overall design and architecture of the system, led the development of the UI, and worked with customers to define their product requirements.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#336699',
    fontColor: '#FFFFFF',
    image: HalfstackSoftwareImage,
    title: 'halfstack.software',
    // role: 'Founder',
    Description: () => (
      <React.Fragment>
        <p>
          Based on [gatsby-starter-hero-blog](https://github.com/greglobinski/gatsby-starter-hero-blog) by [Greg Lobinski](https://www.greglobinski.com/). Powered by [Gatsby](https://www.gatsbyjs.org/) and deployed and hosted on AWS using [Amplify](https://aws.amazon.com/amplify/).
        </p>
      </React.Fragment>
    )
  },
]

const Projects = props => {
  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {theme => (
          <div className="projects">
            {projects.map((p, i) => <Project project={p} i={i} />)}
            {/* --- STYLES --- */}
            <style jsx>{`
              
            `}</style>
          </div>
        )}
      </ThemeContext.Consumer>
    </React.Fragment>
  );
};

Projects.propTypes = {
};

const Project = ({ project, i }) => {
  const { Description } = project
  const isOddIterator = i % 2 !== 0
  const oddProjectEntryModifier = isOddIterator ? 'project--odd' : ''
  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {theme => (
          <section className={`project ${oddProjectEntryModifier}`} style={{ backgroundColor: project.backgroundColor, color: project.fontColor }}>
            <div className="project__image">
              <img src={project.image} />
            </div>
            <div className="project__description">
              <h2>{project.title}</h2>
              {project.role ? <h3>{project.role}</h3> : null}
              <Description />
            </div>

            {/* --- STYLES --- */}
            <style jsx>{`
              .project {
                display: flex;
              }
              .project--odd {
                flex-direction: row-reverse;
              }
            `}</style>
          </section>
        )}
      </ThemeContext.Consumer>
    </React.Fragment>
  )
}

export default Projects;
