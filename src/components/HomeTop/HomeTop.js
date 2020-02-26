import React from "react";
import PropTypes from "prop-types";
import { FaTwitter, FaLinkedin, FaGithub, FaArrowDown } from "react-icons/fa/";
import config from "../../../content/meta/config";
import avatar from "../../../static/icons/icon-192x192.png";

const HomeTOp = props => {
  const { backgrounds, theme, scrollToContent } = props;

  return (
    <React.Fragment>
      <section className="home-top">
        <img src={config.gravatarImgMd5 == "" ? avatar : config.gravatarImgMd5} alt={config.siteTitle} />
        <h1>Brett Andrews</h1>
        <h2>Cloud-Native Software Solutions</h2>
        <h3>
          <a className="social-link" href="https://twitter.com/AWSbrett" target="_blank">
            <FaTwitter />
          </a>
          <a className="social-link" href="https://github.com/brettstack" target="_blank">
            <FaGithub />
          </a>
          <a className="social-link" href="https://www.linkedin.com/in/breandr" target="_blank">
            <FaLinkedin />
          </a>
        </h3>
        <button onClick={scrollToContent} aria-label="scroll">
          <FaArrowDown />
        </button>
      </section>

      {/* --- STYLES --- */}
      <style jsx>{`
        .home-top {
          align-items: center;
          background: ${theme.hero.background};
          background-image: url(${backgrounds.mobile});
          background-size: cover;
          color: ${theme.text.color.primary.inverse};
          display: flex;
          flex-flow: column nowrap;
          justify-content: center;
          min-height: 100vh;
          height: 100px;
          padding: ${theme.space.inset.l};
          padding-top: ${theme.header.height.homepage};
          
          img {
            max-width: 150px;
            border-radius: 50%;
            margin-bottom: 1em;
          }

          .social-link {
            color: #fff;
            margin-right: 1rem;

            &:last-child {
              margin-right: 0;
            }
          }
        }

        h1, h2 {
          text-align: center;
          margin: ${theme.space.stack.l};
          color: ${theme.hero.h1.color};
          line-height: ${theme.hero.h1.lineHeight};
          text-remove-gap: both 0 "Open Sans";

          :global(strong) {
            position: relative;

            &::after,
            &::before {
              content: "›";
              color: ${theme.text.color.attention};
              margin: 0 ${theme.space.xs} 0 0;
              text-shadow: 0 0 ${theme.space.s} ${theme.color.neutral.gray.k};
            }
            &::after {
              content: "‹";
              margin: 0 0 0 ${theme.space.xs};
            }
          }
        }

        h1 {
          font-size: ${theme.hero.h1.size};
        }

        h2 {
          font-size: ${theme.hero.h2.size};
        }

        h3 {
          font-size: ${theme.hero.h3.size};
        }
        
        button {
          background: none;/*${theme.background.color.brand};*/
          border: 0;
          border-radius: 50%;
          font-size: ${theme.font.size.m};
          padding: ${theme.space.s} ${theme.space.m};
          cursor: pointer;
          width: ${theme.space.xl};
          height: ${theme.space.xl};
          margin-top: 1em;

          &:focus {
            outline-style: none;
            background: ${theme.color.brand.primary.active};
          }

          :global(svg) {
            position: relative;
            top: 5px;
            fill: ${theme.color.neutral.white};
            stroke-width: 40;
            stroke: ${theme.color.neutral.white};
            animation-duration: ${theme.time.duration.long};
            animation-name: buttonIconMove;
            animation-iteration-count: infinite;
          }
        }

        @keyframes buttonIconMove {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @from-width tablet {
          .home-top {
            background-image: url(${backgrounds.tablet});
          }

          h1 {
            max-width: 90%;
            font-size: ${`calc(${theme.hero.h1.size} * 1.3)`};
          }

          button {
            font-size: ${theme.font.size.l};
          }
        }

        @from-width desktop {
          .hero {
            background-image: url(${backgrounds.desktop});
          }

          h1 {
            max-width: 80%;
            font-size: ${`calc(${theme.hero.h1.size} * 1.5)`};
          }

          button {
            font-size: ${theme.font.size.xl};
          }
        }
      `}</style>
    </React.Fragment>
  );
};

HomeTOp.propTypes = {
  scrollToContent: PropTypes.func.isRequired,
  backgrounds: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default HomeTOp;
