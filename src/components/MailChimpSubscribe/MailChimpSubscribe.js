import React from "react";
import PropTypes from "prop-types";

const MailChimpSubscribe = props => {
  const {
    theme
  } = props;

  return (
    <React.Fragment>
      <link href="//cdn-images.mailchimp.com/embedcode/classic-10_7.css" rel="stylesheet" type="text/css"></link>
      <div id="mc_embed_signup">
        <form action="https://software.us4.list-manage.com/subscribe/post?u=b13787ffc31c5db27758e8484&amp;id=0afafd7ecc" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
          <div id="mc_embed_signup_scroll">
            <h2>Subscribe</h2>
            <div class="mc-field-group">
              <label for="mce-EMAIL">Email Address </label>
              <input type="email" name="EMAIL" class="required email" id="mce-EMAIL" />
            </div>
            <div id="mce-responses" class="clear">
              <div class="response" id="mce-error-response" style={{ "display": "none" }}></div>
              <div class="response" id="mce-success-response" style={{ "display": "none" }}></div>
            </div>
            <div style={{ "position": "absolute", left: '-5000px' }} aria-hidden="true">
              <input type="text" name="b_b13787ffc31c5db27758e8484_0afafd7ecc" tabindex="-1" />
            </div>
            <div class="clear">
              <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button" />
            </div>
          </div>
        </form>
      </div>
      <style jsx>{`
        #mc_embed_signup{background:#fff; clear:left; font:14px Helvetica,Arial,sans-serif; }
        `}
      </style>
    </React.Fragment>
  );
};

MailChimpSubscribe.propTypes = {
  theme: PropTypes.object.isRequired
};

export default MailChimpSubscribe;
