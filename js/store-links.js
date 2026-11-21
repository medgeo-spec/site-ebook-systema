// Where the book is sold. An empty value hides its button.
//   amazon: the Kindle book page, e.g. https://www.amazon.com/dp/XXXXXXXXXX
//   paddle: direct sale on this site (Paddle checkout, then download of the PDF + EPUB).
//           Filled in by scripts/paddle-setup.mjs; these values are public by design.
window.STORE_LINKS = {
  amazon: '',
  paddle: {
    environment: 'sandbox',
    clientToken: 'test_fb4266a6750b4e5c7457fb1e8f8',
    priceId: 'pri_01m802aen7dshpbd5cr50dqav5',
  },
};

(function () {
  var PADDLE_JS = 'https://cdn.paddle.com/paddle/v2/paddle.js';
  var LOCALES = { en: 'en', fr: 'fr', es: 'es', ar: 'ar' };
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  // Pages in a language folder (fr/, es/, ar/) link one level up.
  var root = /\/(fr|es|ar)\//.test(window.location.pathname) ? '../' : '';
  var paddleReady = null;

  function loadPaddle(config) {
    if (paddleReady) return paddleReady;
    paddleReady = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = PADDLE_JS;
      script.onload = function () {
        if (config.environment !== 'production') window.Paddle.Environment.set('sandbox');
        window.Paddle.Initialize({
          token: config.clientToken,
          eventCallback: function (event) {
            // After payment: the thank-you page offers the downloads for this transaction.
            if (event && event.name === 'checkout.completed' && event.data && event.data.transaction_id) {
              window.location.href = root + 'thank-you.html?txn=' + encodeURIComponent(event.data.transaction_id) + '&lang=' + lang;
            }
          },
        });
        resolve(window.Paddle);
      };
      script.onerror = function () {
        paddleReady = null;
        reject(new Error('Paddle.js could not be loaded'));
      };
      document.head.appendChild(script);
    });
    return paddleReady;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var links = window.STORE_LINKS || {};
    var paddle = links.paddle || {};
    // A sandbox (test) checkout is only offered on test hosts: this computer and Netlify previews
    // (names containing "--"). The public site shows "coming soon" until the live Paddle keys are in place.
    var host = window.location.hostname;
    var testHost = host === 'localhost' || host === '127.0.0.1' || host.indexOf('--') !== -1;
    var directSale = !!(paddle.clientToken && paddle.priceId) && (paddle.environment === 'production' || testHost);
    var anyLink = false;

    document.querySelectorAll('[data-store]').forEach(function (button) {
      var store = button.getAttribute('data-store');
      if (store === 'amazon' && links.amazon) {
        button.href = links.amazon;
        button.hidden = false;
        anyLink = true;
      }
      if (store === 'direct' && directSale) {
        button.href = '#buy';
        button.removeAttribute('target');
        button.hidden = false;
        anyLink = true;
        button.addEventListener('click', function (event) {
          event.preventDefault();
          loadPaddle(paddle).then(function (Paddle) {
            Paddle.Checkout.open({
              items: [{ priceId: paddle.priceId, quantity: 1 }],
              settings: { displayMode: 'overlay', locale: LOCALES[lang] || 'en' },
            });
          });
        });
      }
    });

    var soon = document.getElementById('store-soon');
    if (soon) soon.hidden = anyLink;
  });
})();
