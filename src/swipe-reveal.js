SwipeReveal = function ( el, options ) {
  this.el = el;
  this.$el = $(el);
  this.$ = function () {
    var args = Array.prototype.slice.call(arguments);
    args.push(this.$el);
    return $.apply($, arguments);
  };
  this.options = $.extend( true, {}, this.options, options );
  this.state = 'default';
  this.width = this.$el.width();
  this.hammerOptions = {
    drag: true,
    drag_block_horizontal: true,
    drag_lock_min_distance: 20
  };
  this.options.contentsSelector = '.' + this.options.contentsClass;
  this.options.revealedSelector = '.' + this.options.revealedClass;
  this.options.undoSelector = this.options.undoSelector || this.options.revealedSelector + ' .undo';
  this._init();
};

SwipeReveal.prototype.options = {
  autoDismiss: true
, autoDismissWarn: true
, dismissTimeout: 3000
, dismissWarnTimeout: 1000
, revealThreshold: 0.33
, undoEvent: 'tap'
, slideOutDuration: 500
, revealedShowDuration: 250
, revealedHideDuration: 250
, dismissHideDuration: 500
, slideCancelEasing: 'easeInExpo'
, slideOutEasing: 'easeOutExpo'
, undoDismissDuration: 250
, undoDismissEasing: 'easeOutExpo'
, contentsClass: 'swipe-reveal-contents'
, revealedClass: 'swipe-reveal-revealed'
, revealed: function (el) {
    return [
      '<div class="message revealed-cell">Revealed</div>'
    , '<div class="undo revealed-cell">Undo</div>'
    ].join('')
  }
};

SwipeReveal.prototype._init = function () {
  var that = this;

  var $lis = this.$('li');

  $lis
    .wrapInner('<div class="' + that.options.contentsClass + '">')
    .wrap('<div>')
    .each(function (i) {
      var inner = that.options.revealed(this);
      var revealed = '<div class="' + that.options.revealedClass + '">' + inner + '</div>';
      $(this).append(revealed)
    })

  this.$el.hammer(that.hammerOptions).on('dragstart', that.options.contentsSelector, function(event) {
    var $this = $(this);
    $this.data('swipe-reveal-contents', true);
    var gesture = event.gesture;
    if (gesture.direction !== 'right' && gesture.direction !== 'left') return false;
    that.currentItem = this;
    if (that.state !== 'default') return false;
    that.state = 'dragging';
  });

  this.$el.hammer(that.hammerOptions).on('dragstart', that.options.revealedSelector, function(event) {
    var $this = $(this);
    var $li = $this.closest('li');
    $li.doTimeout('dismiss')
    $li.doTimeout('dismiss-warn')
    $this.data('swipe-reveal-revealed', true);
    var gesture = event.gesture;
    if (gesture.direction !== 'right' && gesture.direction !== 'left') return false;
    that.currentItem = this;
  });
  
  $(document).hammer(that.hammerOptions).on('drag', function(event) {
    var $this = $(that.currentItem);
    var isContents = $this.data('swipe-reveal-contents');
    if (isContents) {
      if (!that.currentItem) return false;
      if (that.state !== 'dragging') return false;
    }
    that.lastDragEvent = event;
    //if (this !== that.currentItem) return false;
    $this.css({
      left: event.gesture.deltaX
    , opacity: (that.width - Math.abs(event.gesture.deltaX)) / that.width
      //top: event.gesture.deltaY
    });
    if (isContents) {
      var $revealed = $this.closest('li').find(that.options.revealedSelector)
      $revealed.css({
       opacity: (Math.abs(event.gesture.deltaX)) / that.width
      });
    }
  });

  $(document).hammer(that.hammerOptions).on('dragend', function (event) {
    if (!that.currentItem) return;
    that.onDragEnd.call(that, event)
    that.currentItem = null;
  });
  
  this.$el.on('undo', function (e, item) {
    that.undo($(e.target).closest('li'));
  });

  this.$el.on('dismiss', function (e, item) {
    that.dismiss($(e.target).closest('li'));
  });

  var that = this;
  that.$el.hammer(that.hammerOptions).on(that.options.undoEvent, that.options.undoSelector, function () {
    that.undo(this);
  })

}

SwipeReveal.prototype.onDragEnd = function(event) {
  var that = this;
  var gesture = event.gesture;
  var $this = $(that.currentItem);
  var $li = that.getLi($this);

  if (Math.abs(gesture.deltaX) > that.width * that.options.revealThreshold) {
    that.slideOut(event, $li);
  }
  else {
    that.slideCancel(event, $li);
  }
};

SwipeReveal.prototype.dismiss = function (li) {
  var that = this;
  var $li = that.getLi(li);
  var height = $li.outerHeight();
  $li.data('swipe-reveal-original-height', height);
  $li.css({
    'min-height': 0
  , height: height
  })
  .animate({
    height: 0
  //, avoidTransforms: true
  , avoidCSSTransitions: true
  }, {
    duration: that.options.dismissHideDuration
  , queue: false
  })
  .promise()
  .done(function () {
    if ($li.height() === 0) {
      $li.remove();
    }
  })
};

SwipeReveal.prototype.slideCancel = function (event, li) {
  var that = this;
  var gesture = event.gesture;

  that.state = 'default';

  var isContents = $(that.currentItem).data('swipe-reveal-contents');

  var $li = that.getLi(li);
  var $elem = $li.find(isContents ? that.options.contentsSelector : that.options.revealedSelector);

  var velocityX = gesture.velocityX;
  var startLeft = gesture.deltaX;
  var endLeft = gesture.direction == 'left' ? -1 * that.width : that.width;
  var dist = Math.abs(endLeft - startLeft);
  var distStrength = (dist / that.width);
  var duration = (distStrength * that.width) / Math.max(0.2, Math.abs(velocityX));

  $elem.animate({
    left: 0
  , opacity: 1
  }, {
    duration: (distStrength * that.width)
  , queue: false
  , specialEasing : {
      left: that.options.slideCancelEasing
    }
  })
}

SwipeReveal.prototype.slideOut = function (event, li) {
  var that = this;
  var gesture = event.gesture;

  that.state = 'out';

  var isContents = $(that.currentItem).data('swipe-reveal-contents');

  var $li = that.getLi(li);
  var $contents = $li.find(that.options.contentsSelector);
  var $revealed = $li.find(that.options.revealedSelector)

  var endLeft = gesture.direction == 'left' ? -1 * that.width : that.width;

  var after;
  if (isContents) {
    after = function () {
      if (that.options.autoDismiss) {
        $li.doTimeout('dismiss', that.options.dismissTimeout, function () {
          that.dismiss.call(that, $li);
        })
        if (that.options.autoDismissWarn) {
          $li.doTimeout('dismiss-warn', that.options.dismissWarnTimeout, function () {
            $li.animate({
              opacity: 0.5
            }, {
              duration: that.options.dismissTimeout - that.options.dismissWarnTimeout
            , queue: false
            })
          })
        }
      }
    }
  }
  else {
    after = function () {
      that.dismiss.call(that, $li);
    }
  }

  var velocity = Math.max(gesture.velocityX, 0.5);
  var directional = (gesture.direction == 'left' ? -1 : 1);

  var frameMs = 1000 / 60; // 60 fps

  var start = {
    left: parseFloat((isContents ? $contents : $revealed).css('left'))
  , opacity: parseFloat($revealed.css('opacity'))
  }
  var curr = {};
  var total = {};
  var per = {};
  var end = {};
  curr.left = start.left;
  total.left = that.width - Math.abs(start.left);
  end.left = that.width * directional;
  per.left = velocity * frameMs * directional;

  var numFrames = Math.abs(Math.ceil(total.left/per.left));

  curr.opacity = start.opacity;
  total.opacity = 1 - start.opacity;
  per.opacity = total.opacity / numFrames;

  var frame = function () {
    curr.left += per.left;
    curr.opacity += per.opacity;
    if (isContents) {
      $contents.css({
        left: curr.left
      })
      $revealed.css({
        opacity: curr.opacity
      })
    }
    else {
      $revealed.css({
        left: curr.left
      })
    }
    if (directional > 0 ? curr.left < end.left : curr.left > end.left) {
      setTimeout(frame, frameMs)
    }
    else {
      after();
    }
  };
  frame();
}

SwipeReveal.prototype.undo = function (item) {
  var that = this;
  var $li = that.getLi(item);
  $li.doTimeout('dismiss');
  $li.doTimeout('dismiss-warn');
  var $revealed = $li.find(that.options.revealedSelector)
  var $contents = $li.find(that.options.contentsSelector);

  $revealed.show().animate({
    opacity: 0
  }, {
    duration: that.options.revealedHideDuration
  })

  var props = {
    opacity: 1
  };
  var height = $li.data('swipe-reveal-original-height');
  if (height) {
    props.height = height
    props.avoidCSSTransitions = true;
  }
  $li.stop().animate(props, {
    duration: that.options.undoDismissDuration
  , queue: false
  });
  $contents.animate({
    left: 0
  , opacity: 1
  }, {
    duration: that.options.undoDismissDuration
  , queue: false
  , specialEasing : {
      left: that.options.undoDismissEasing
    }
  })
  .promise()
  .done(function () {
    that.state = 'default';
  })
}

SwipeReveal.prototype.getLi = function (item) {
  var $item = $(item);
  if ($item.is('li')) {
    $li = $item;
  }
  else {
    $li = $item.closest('li');
  }
  return $li;
}

$.bridget('swipeReveal', SwipeReveal);
