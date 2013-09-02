# SwipeReveal

Soup up your vanilla HTML list with swipe-to-reveal actions à la the Gmail app for Android or Twitter for iPhone.

Depends on jQuery, Hammer.js, jQuery Easing, jQuery doTimeout, jquery-bridget, and optionally jQuery-Animate-Enhanced.

## Usage

Download.

Install bower dependencies:

`bower install`

Then add code:

```html
<ul class="swipe-reveal">
  <li>...</li>
</ul>
```

```javascript
$(function () {
  $('.swipe-reveal').swipeReveal();
});
```

See examples directory for more details.

## Options

See source code for all options. Here are some important ones:

**revealed** *function ( HTMLElement ) => String*: A function returning markup for revealed content.

**revealThreshold** *Number*: A value 0-1 representing the minimum distance as a fraction of item list width that drag must be in order to trigger a reveal.

**autoDismiss** *Boolean*: Whether to automatically remove revealed items if undo isn't requested before `dismissTimeout`.

**dismissTimeout** *Number*: Time until revealed items are automatically dismissed, if `autoDismiss` is enabled.

## License

MIT. Copyright Anders D. Johnson
