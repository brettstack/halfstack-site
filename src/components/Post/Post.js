import React from "react";
import PropTypes from "prop-types";
import "prismjs/themes/prism-okaidia.css";
import Img from "gatsby-image";

import asyncComponent from "../AsyncComponent";
import Headline from "../Article/Headline";
import Bodytext from "../Article/Bodytext";
import Meta from "./Meta";
import Author from "./Author";
import Comments from "./Comments";
import NextPrev from "./NextPrev";
import MailChimpSubscribe from '../MailChimpSubscribe'

const Share = asyncComponent(() =>
  import("./Share")
    .then(module => {
      return module.default;
    })
    .catch(error => {
      console.error('share error:', error)
    })
);

const Post = props => {
  const {
    post,
    post: {
      html,
      fields: { prefix, slug },
      frontmatter: {
        title,
        author,
        category,
        cover: {
          children: [{ fluid }]
        }
      }
    },
    authornote,
    facebook,
    next: nextPost,
    prev: prevPost,
    theme
  } = props;

  return (
    <React.Fragment>
      <header className="post__header">
        <Headline title={title} theme={theme} />
        <Meta prefix={prefix} author={author} category={category} theme={theme} />
        <MailChimpSubscribe theme={theme} />
        <Img fluid={fluid} />
      </header>
      <Bodytext html={html} theme={theme} />
      <footer>
        <MailChimpSubscribe theme={theme} />
        <Share post={post} theme={theme} />
        <Author note={authornote} theme={theme} />
        <NextPrev next={nextPost} prev={prevPost} theme={theme} />
        <Comments slug={slug} facebook={facebook} theme={theme} />
      </footer>
      {/* --- STYLES --- */}
      {/* NOTE: calc() fails when using variables ${theme.text.maxWidth.desktop} so we're hardcoding below */}
      <style jsx>{`
      .post__header :global(.gatsby-image-wrapper) {
        border-radius: ${theme.size.radius.default};
        margin-bottom: 1em;
      }
      `}</style>
    </React.Fragment>
  );
};

Post.propTypes = {
  post: PropTypes.object.isRequired,
  authornote: PropTypes.string.isRequired,
  facebook: PropTypes.object.isRequired,
  next: PropTypes.object,
  prev: PropTypes.object,
  theme: PropTypes.object.isRequired
};

export default Post;
