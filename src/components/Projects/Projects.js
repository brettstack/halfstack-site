import PropTypes from "prop-types";
import React from "react";
import { ThemeContext } from "../../layouts";
import ApiGatewayImage from './Amazon-API-Gateway@4x.png'
import SqsPartialBatchFailureImage from './Amazon-Simple-Queue-Service-SQS@4x.png'
import HalfstackSoftwareImage from './AWS-Amplify_light-bg@4x.png'
import ServerlessExpressImage from './AWS-Lambda@4x.png'
import SamImage from './aws-sam.png'
import CodeGenieLogoImage from './code-genie-logo.png'
import SarImage from './AWS-Serverless-Application-Repository_light-bg@4x.png'
import CsnetImage from './csnet.png'

const projects = [
  {
    backgroundColor: '#FF0088',
    fontColor: '#FFFFFF',
    image: CodeGenieLogoImage,
    title: 'Code Genie - Full Stack App Generator',
    titleLink: 'https://codegenie.codes/',
    role: 'Founder',
    Description: () => (
      <React.Fragment>
        <p>Starting a new software project? Check out Code Genie - a <a href="https://codegenie.codes">Full Stack App Generator</a> that generates source code based on your project's data model. Including:</p>
        <ol>
          <li>A React Next.js Web App hosted on Amplify Hosting</li>
          <li>Serverless Express REST API running on API Gateway and Lambda</li>
          <li>Cognito User Pools for Identity/Authentication</li>
          <li>DynamoDB Database</li>
          <li>Cloud Development Kit (CDK) for Infrastructure as Code (IAC)</li>
          <li>Continuous Integration/Delivery (CI/CD) with GitHub Actions</li>
          <li>And more!</li>
        </ol>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#FF0088',
    fontColor: '#FFFFFF',
    image: SamImage,
    title: 'AWS SAM - Serverless Application Model',
    titleLink: 'https://aws.amazon.com/serverless/sam/',
    titleLink: 'https://aws.amazon.com/serverless/sam/',
    role: 'Engineering lead',
    Description: () => (
      <React.Fragment>
        <p>
          <a href="https://aws.amazon.com/serverless/sam/" target="_blank">SAM</a> is an open-source framework and AWS
          service for defining Cloud-Native Serverless applications as infrastructure as code (IAC). I led the engineering
          team responsible for designing and implementing new features, responding to customers’ GitHub Issues and Pull Requests,
          and deploying and operating the service. I designed and implemented the CD pipeline, metrics, and team processes to improve
          the operational excellency and performance of the team and product.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#8800FF',
    fontColor: '#FFFFFF',
    image: ServerlessExpressImage,
    title: 'aws-serverless-express',
    titleLink: 'https://github.com/brettstack/serverless-express',
    role: 'Creator, maintainer, engineering and product lead',
    Description: () => (
      <React.Fragment>
        <p>
          <a href="https://github.com/brettstack/serverless-express" target="_blank">aws-serverless-express</a> is a library for
          running [Express](https://expressjs.com/) and other Node.js web frameworks on
          <a href="https://aws.amazon.com/serverless/" target="_blank">Serverless AWS</a> using
          <a href="https://aws.amazon.com/lambda/" target="_blank">Lambda</a> and
          <a href="https://aws.amazon.com/api-gateway/" target="_blank">Amazon API Gateway</a>. The project is used by thousands of
          <a href="https://aws.amazon.com/" target="_blank">AWS</a> customers for running production applications of all scales,
          has over 5k stars on <a href="https://github.com/awslabs/aws-serverless-express" target="_blank">GitHub</a>, and is downloaded
          over 800k times a month on <a href="https://www.npmjs.com/package/aws-serverless-express" target="_blank">NPM</a>.
        </p>
        <p>
          I was responsible for the inception, implementation, maintenance, support, documentation, releases, and growth for this product.
          You can see <a href="https://aws.amazon.com/blogs/compute/going-serverless-migrating-an-express-application-to-amazon-api-gateway-and-aws-lambda/" target="_blank">my blog post on the AWS Compute Blog</a>)
          as well as <a href="https://aws.amazon.com/blogs/aws/running-express-applications-on-aws-lambda-and-amazon-api-gateway/" target="_blank">a blog post by Jeff Barr</a>.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#88FF00',
    fontColor: '#FFFFFF',
    image: SarImage,
    title: 'AWS Serverless Application Repository',
    titleLink: 'https://aws.amazon.com/serverless/serverlessrepo/',
    role: 'Founding member; senior engineer',
    Description: () => (
      <React.Fragment>
        <p>
          The <a href="https://aws.amazon.com/serverless/serverlessrepo/" target="_blank">Serverless Application Repository​</a> is an
          AWS service enabling customers to publish serverless applications, tools, and plugins that can then be deployed into other
          AWS accounts. As a founding and senior member of the team, I had significant input on defining team processes and the design
          of the service.
        </p>
        <p>
          As Scrum Master for this Agile team, I organized sprints, prioritized roadmaps/backlog, ran sprint planning and retrospective meetings,
          and was responsible for the overall success of each sprint. I worked with Product Managers to design new features for the service based
          on customer feedback and was the engineering lead for the UI.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#FF8800',
    fontColor: '#FFFFFF',
    image: ApiGatewayImage,
    title: 'Amazon API Gateway',
    titleLink: 'https://aws.amazon.com/api-gateway/',
    role: 'UI engineering lead; launch member',
    Description: () => (
      <React.Fragment>
        <p>
          <a href="https://aws.amazon.com/api-gateway/" target="_blank">Amazon API Gateway</a> allows customers to define HTTP/REST APIs to
          interface with various integrations (primarily, <a href="https://aws.amazon.com/lambda" target="_blank">Lambda</a>). I led the
          development of the UI for this service and helped modernize UI development within the organization by providing guidance on modern
          web development techniques (ECMAScript 6+, Webpack, automated testing, etc.) to teams such as Lambda and Cognito.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#00FF88',
    fontColor: '#FFFFFF',
    image: SqsPartialBatchFailureImage,
    title: '@middy/sqs-partial-batch-failure',
    titleLink: 'https://www.npmjs.com/package/@middy/sqs-partial-batch-failure',
    role: 'Creator',
    Description: () => (
      <React.Fragment>
        <p>
          <a href="https://www.npmjs.com/package/@middy/sqs-partial-batch-failure" target="_blank">@middy/sqs-partial-batch-failure</a> is
          a Lambda middleware for <a href="/gracefully-handling-lambda-sqs-partial-batch-failures/" target="_blank">handling SQS partial batch failures in AWS Lambda</a>.
        </p>
      </React.Fragment>
    )
  },
  {
    backgroundColor: '#0088FF',
    fontColor: '#FFFFFF',
    image: CsnetImage,
    title: 'Community Services .NET',
    titleLink: 'http://csnet.net.au/',
    role: 'Engineering lead',
    Description: () => (
      <React.Fragment>
        <p>
          <a href="http://csnet.net.au/" target="_blank">Community Services .NET (CSnet)</a> is a startup focused on delivering Case Management Software to Human Services organizations.
          I assisted with the overall design and architecture of the system, led the development of the UI, and worked with customers to
          define their product requirements.
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
          Based on <a href="https://github.com/greglobinski/gatsby-starter-hero-blog" target="_blank">gatsby-starter-hero-blog</a> by
          <a href="https://www.greglobinski.com/" target="_blank">Greg Lobinski</a>. Powered by
          <a href="https://www.gatsbyjs.org/" target="_blank">Gatsby</a> and deployed and hosted on AWS using
          <a href="https://aws.amazon.com/amplify/" target="_blank">Amplify</a>.
        </p>
      </React.Fragment>
    )
  },
]

const Projects = ({ theme }) => {

  return (
    <React.Fragment>
      <div className="projects">
        {projects.map((p, i) => <Project key={i} i={i} theme={theme} project={p} />)}
        {/* --- STYLES --- */}
        {/* NOTE: calc() fails when using variables ${theme.text.maxWidth.desktop} so we're hardcoding below */}
        <style jsx>{`
          @from-width tablet {
            .projects {
              margin-left: calc(-100vw / 2 + 650px / 2);
              margin-right: calc(-100vw / 2 + 650px / 2);
            }
          }
          @from-width desktop {
            .projects {
              margin-left: calc(-100vw / 2 + 700px / 2);
              margin-right: calc(-100vw / 2 + 700px / 2);
            }
          }
        `}</style>
      </div>
    </React.Fragment>
  );
};

Projects.propTypes = {
};

const Project = ({ theme, project, i }) => {
  const { Description } = project
  const isOddIterator = i % 2 !== 0
  const oddProjectEntryModifier = isOddIterator ? 'project--odd' : ''
  return (
    <React.Fragment>
      <section
        className={`project ${oddProjectEntryModifier}`}
      // style={{
      //   backgroundColor: project.backgroundColor,
      //   color: project.fontColor
      // }}
      >
        <div className="project__inner">
          <div className="project__image">
            <img src={project.image} />
          </div>
          <div className="project__description">
            <h2>
              {project.titleLink ? <a href={project.titleLink} target="_blank">{project.title}</a> : project.title}
            </h2>
            {project.role ? <h3>{project.role}</h3> : null}
            <Description />
          </div>
        </div>

        {/* --- STYLES --- */}
        <style jsx>{`
          .project {
            margin-bottom: 3em;
          }
          .project__inner {
            display: flex;
            margin: auto;
            flex-direction: column;
          }
          .project__image img {
              width: fit-content;
              margin: auto;
              max-width: 160px;
          }
          @from-width tablet {
            .project__inner {
              flex-direction: row;
            }
            .project__image img {
              width: auto;
                max-height: 160px;
            }
          }
          @from-width tablet {
            .project__inner {
              max-width: ${theme.text.maxWidth.tablet};
            }

            .project--odd .project__inner {
              flex-direction: row-reverse;
            }

            .project__image {
              margin-right: 2em;
            }

            .project--odd .project__image {
              margin-left: 2em;
              margin-right: 0;
            }
          }
          @from-width desktop {
            .project__inner {
              max-width: ${theme.text.maxWidth.desktop};
            }
          }
          .project__image {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        `}</style>
      </section>
    </React.Fragment>
  )
}

export default Projects;
