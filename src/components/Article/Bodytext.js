import React from "react";
import PropTypes from "prop-types";

const Bodytext = props => {
  const { html, theme } = props;

  return (
    <React.Fragment>
      <div className="bodytext" dangerouslySetInnerHTML={{ __html: html }} />

      <style jsx>{`
        .bodytext {
          animation-name: bodytextEntry;
          animation-duration: ${theme.time.duration.long};

          :global(ol) {
            margin-left: 2rem;
            margin-right: 2rem;
          }
          
          :global(blockquote) {
            padding: 0 1em;
            color: #6a737d;
            border-left: .25em solid #dfe2e5;
            margin-bottom: 1.5em;
            
            >:last-child {
              margin-bottom: 0;
            }
            
            >:first-child {
              margin-top: 0;
            }
          }

          :global(img) {
            display: block;
            margin: auto;
          }

          /* https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/?=prism#optional-add-line-highlighting-styles */
          :global(.gatsby-highlight-code-line) {
            background-color: #373832;
            display: block;
            margin-right: -1em;
            margin-left: -1em;
            padding-right: 1em;
            padding-left: 0.75em;
            border-left: 0.25em solid #9f9;
          }

          /**
           * Add back the container background-color, border-radius, padding, margin
           * and overflow that we removed from <pre>.
           */
          :global(.gatsby-highlight) {
            background-color: #272822;
            border-radius: 0.3em;
            margin: 0.5em 0;
            padding: 1em;
            overflow: auto;
          }

          /**
           * Remove the default PrismJS theme background-color, border-radius, margin,
           * padding and overflow.
           * 1. Make the element just wide enough to fit its content.
           * 2. Always fill the visible space in .gatsby-highlight.
           * 3. Adjust the position of the line numbers
           */
          :global(.gatsby-highlight pre[class*="language-"]) {
            background-color: transparent;
            margin: 0;
            padding: 0;
            overflow: initial;
            float: left; /* 1 */
            min-width: 100%; /* 2 */
          }
          
          :global(h2),
          :global(h3) {
            margin: 1.5em 0 1em;
          }

          :global(h2) {
            line-height: ${theme.font.lineHeight.s};
            font-size: ${theme.font.size.l};
          }

          :global(h3) {
            font-size: ${theme.font.size.m};
            line-height: ${theme.font.lineHeight.m};
          }

          :global(p) {
            font-size: ${theme.font.size.s};
            line-height: ${theme.font.lineHeight.xxl};
            margin: 0 0 1.5em;
          }
          :global(ul) {
            list-style: circle;
            margin: 0 0 1.5em;
            padding: 0 0 0 1.5em;
          }
          :global(li) {
            margin: 0.7em 0;
            line-height: 1.5;
          }
          :global(a) {
            font-weight: ${theme.font.weight.bold};
            color: ${theme.color.brand.primary};
            text-decoration: underline;
          }
          :global(a.gatsby-resp-image-link) {
            border: 0;
            display: block;
            margin: 2.5em 0;
            border-radius: ${theme.size.radius.default};
            overflow: hidden;
            border: 1px solid ${theme.line.color};
          }
          :global(code.language-text) {
            background: ${theme.color.neutral.gray.c};
            text-shadow: none;
            color: inherit;
            padding: 0.1em 0.3em 0.2em;
            border-radius: 0.1em;
          }
        }

        @keyframes bodytextEntry {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </React.Fragment>
  );
};

Bodytext.propTypes = {
  html: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired
};

export default Bodytext;
