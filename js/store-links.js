// Where the book is sold. Paste the links once the book is published; an empty link hides its button.
//   amazon: the Kindle book page, e.g. https://www.amazon.com/dp/XXXXXXXXXX
//   direct: the Lemon Squeezy product link (PDF + EPUB delivered automatically), e.g. https://yourstore.lemonsqueezy.com/buy/...
window.STORE_LINKS = {
  amazon: '',
  direct: '',
};

// Shows the configured buy buttons on the book page, or the "coming soon" message when none is set.
document.addEventListener('DOMContentLoaded', function () {
  var links = window.STORE_LINKS || {};
  var anyLink = false;
  document.querySelectorAll('[data-store]').forEach(function (button) {
    var url = links[button.getAttribute('data-store')];
    if (url) {
      button.href = url;
      button.hidden = false;
      anyLink = true;
    }
  });
  var soon = document.getElementById('store-soon');
  if (soon) soon.hidden = anyLink;
});
