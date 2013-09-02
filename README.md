# SwipeReveal

Soup up your vanilla HTML list with swipe-to-reveal actions, à la the Gmail app for Android or Twitter for iPhone.

Works with mouse and touch events!

[Here's a demo.](http://AndersDJohnson.github.io/swipe-reveal/examples/basic/)

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

To programmatically "undo" a reveal on a list item (returning it to default state), use:

```javascript
var $list = $('.swipe-reveal');
$list.swipeReveal();
// ...
$list.swipeReveal('undo', listElement);

});
```

And to "dismiss" a list item (remove from list), use:

```javascript
// ...
$list.swipeReveal('dismiss', listElement);
});


## Options

See source code for all options. Here are some important ones:

**revealed** *function ( HTMLElement ) => String*: A function returning markup for revealed content. Called for each list element, passed as an argument.

**revealThreshold** *Number* (default = 0.33): A value 0-1 representing the minimum distance as a fraction of item list width that drag must be in order to trigger a reveal.

**undoSelector** *String* (default = '.undo'): A selector for an element in the revealed markup that triggers an `"undo"` event to close the reveal.

**autoDismiss** *Boolean* (default = true): Whether to automatically remove revealed items if an `"undo"` isn't requested before `dismissTimeout`.

**dismissTimeout** *Number* (default = 3000): Time until revealed items are automatically dismissed, if `autoDismiss` is enabled.

## License

MIT. Copyright Anders D. Johnson
