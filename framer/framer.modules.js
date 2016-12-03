require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"nestedList":[function(require,module,exports){
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.CollapseHolder = (function(superClass) {
  extend(CollapseHolder, superClass);

  function CollapseHolder(layerArray, toggleLayer, sketch) {
    this.sortLayers = bind(this.sortLayers, this);
    this.toggle = bind(this.toggle, this);
    this.expand = bind(this.expand, this);
    this.collapse = bind(this.collapse, this);
    this.adjustLayers = bind(this.adjustLayers, this);
    this.resizeLayers = bind(this.resizeLayers, this);
    CollapseHolder.__super__.constructor.call(this);
    this.originY = 0;
    this.sortedLayers = [];
    this.animationOptions = {
      time: 0.2
    };
    this.states.collapsed = {
      scaleY: 0
    };
    this.states["default"] = {
      scaleY: 1
    };
    this.height = 0;
    this.backgroundColor = "transparent";
    if (toggleLayer) {
      this.name = "collapse_" + toggleLayer.name;
      this.toggleLayer = toggleLayer;
    }
    toggleLayer.on(Events.Click, (function(_this) {
      return function(e, l) {
        return _this.toggle(l);
      };
    })(this));
    this.resizeLayers(layerArray);
    this.sortLayers(layerArray);
  }

  CollapseHolder.prototype.resizeLayers = function(layerArray) {
    var j, k, layer, layerHeights, layerMinXs, layerMinYs, layerWidths, len, len1, results;
    layerHeights = [];
    layerWidths = [];
    layerMinXs = [];
    layerMinYs = [];
    for (j = 0, len = layerArray.length; j < len; j++) {
      layer = layerArray[j];
      this.superLayer = layer.superLayer;
      this.height = this.height + layer.height;
      layerHeights.push(layer.height);
      layerWidths.push(layer.width);
      layerMinXs.push(layer.minX);
      layerMinYs.push(layer.minY);
    }
    this.width = Math.max.apply(this, layerWidths);
    this.height = layerHeights.reduce(function(t, s) {
      return t + s;
    });
    this.fullHeight = this.height;
    this.x = Math.min.apply(this, layerMinXs);
    this.y = Math.min.apply(this, layerMinYs);
    results = [];
    for (k = 0, len1 = layerArray.length; k < len1; k++) {
      layer = layerArray[k];
      layer.superLayer = this;
      results.push(layer.point = {
        x: layer.x - this.x,
        y: layer.y - this.y
      });
    }
    return results;
  };

  CollapseHolder.prototype.adjustLayers = function(adjustment, toggleLayer, origin) {
    var j, layer, len, ref;
    if (origin.id !== this.id) {
      ref = this.children;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
        if (layer.id !== origin.id) {
          if (this.sortedLayers.indexOf(layer) > this.sortedLayers.indexOf(origin)) {
            layer.animate({
              properties: {
                y: layer.y + adjustment
              },
              time: 0.2
            });
            layer.parent.animate({
              properties: {
                height: layer.parent.height + adjustment
              },
              time: 0.2
            });
          }
        } else {

        }
      }
    }
    return this.parent.adjustLayers(adjustment, toggleLayer, origin);
  };

  CollapseHolder.prototype.collapse = function() {
    return this.animate("collapsed");
  };

  CollapseHolder.prototype.expand = function() {
    return this.animate("default");
  };

  CollapseHolder.prototype.toggle = function(l) {
    var adjustment;
    this.states.next();
    adjustment = this.height;
    if (this.states.current.scaleY === 0) {
      adjustment = 0 - adjustment;
    } else {

    }
    return this.adjustLayers(adjustment, l, this);
  };

  CollapseHolder.prototype.sortLayers = function(layerArray) {
    var layer, layerName, results;
    results = [];
    for (layerName in layerArray) {
      layer = layerArray[layerName];
      this.sortedLayers.push(layer);
      results.push(this.sortedLayers.sort(function(a, b) {
        return a.y - b.y;
      }));
    }
    return results;
  };

  return CollapseHolder;

})(Layer);

exports.NestedList = (function(superClass) {
  extend(NestedList, superClass);

  function NestedList(parent, layerList) {
    this.adjustLayers = bind(this.adjustLayers, this);
    this.resizeLayers = bind(this.resizeLayers, this);
    this.createHolders = bind(this.createHolders, this);
    NestedList.__super__.constructor.call(this);
    layerList.sort(function(a, b) {
      return a.y - b.y;
    });
    this.container = parent;
    this.superLayer = parent.superLayer;
    this.content = this.createHolders(layerList);
    this.depth = 0;
    this.size = this.content.size;
    this.point = this.content.point;
    this.name = "NestedList";
  }

  NestedList.prototype.createHolders = function(level, toggleLayer) {
    var collapseLayers, i, j, len, nextToggle;
    collapseLayers = [];
    nextToggle = null;
    for (j = 0, len = level.length; j < len; j++) {
      i = level[j];
      if (!i[0]) {
        nextToggle = i;
        collapseLayers.push(i);
      } else if (i[0]) {
        this.depth = this.depth + 1;
        collapseLayers.push(this.createHolders(i, nextToggle));
      }
    }
    if (toggleLayer instanceof Layer) {
      this.depth = this.depth - 1;
      return new exports.CollapseHolder(collapseLayers, toggleLayer);
    }
    this.resizeLayers(collapseLayers, true);
    return this.layers = collapseLayers;
  };

  NestedList.prototype.resizeLayers = function(collapseLayers, firstTime) {
    var j, k, layer, layerHeights, layerMinXs, layerMinYs, layerWidths, len, len1, results;
    layerHeights = [];
    layerWidths = [];
    layerMinXs = [];
    layerMinYs = [];
    for (j = 0, len = collapseLayers.length; j < len; j++) {
      layer = collapseLayers[j];
      this.height = this.height + layer.height;
      layerHeights.push(layer.height);
      layerWidths.push(layer.width);
      layerMinXs.push(layer.minX);
      layerMinYs.push(layer.minY);
    }
    this.width = Math.max.apply(this, layerWidths);
    this.height = layerHeights.reduce(function(t, s) {
      return t + s;
    });
    if (firstTime) {
      this.x = this.container.x;
      this.y = this.container.y;
      results = [];
      for (k = 0, len1 = collapseLayers.length; k < len1; k++) {
        layer = collapseLayers[k];
        layer.parent = this;
        results.push(layer.superLayer = this);
      }
      return results;
    }
  };

  NestedList.prototype.adjustLayers = function(adjustment, toggleLayer, origin) {
    var j, layer, len, ref;
    if (origin.id !== this.id) {
      ref = this.children;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
        if (layer.id !== origin.id && layer.id !== toggleLayer.id) {
          if (layer.screenFrame.y >= origin.screenFrame.y) {
            layer.animate({
              properties: {
                y: layer.y + adjustment
              },
              time: 0.2
            });
          }
        }
      }
    }
    return this.animate({
      properties: {
        height: this.height + adjustment
      },
      time: 0.2
    });
  };

  return NestedList;

})(Layer);


},{}],"shortcuts":[function(require,module,exports){

/*
  Shortcuts for Framer 1.0
  http://github.com/facebook/shortcuts-for-framer

  Copyright (c) 2014, Facebook, Inc.
  All rights reserved.

  Readme:
  https://github.com/facebook/shortcuts-for-framer

  License:
  https://github.com/facebook/shortcuts-for-framer/blob/master/LICENSE.md
 */

/*
  CONFIGURATION
 */
var shortcuts;

shortcuts = {};

Framer.Defaults.FadeAnimation = {
  curve: "bezier-curve",
  time: 0.2
};

Framer.Defaults.SlideAnimation = {
  curve: "spring(400,40,0)"
};


/*
  LOOP ON EVERY LAYER

  Shorthand for applying a function to every layer in the document.

  Example:
  ```shortcuts.everyLayer(function(layer) {
    layer.visible = false;
  });```
 */

shortcuts.everyLayer = function(fn) {
  var _layer, layerName, results1;
  results1 = [];
  for (layerName in window.Layers) {
    _layer = window.Layers[layerName];
    results1.push(fn(_layer));
  }
  return results1;
};


/*
  SHORTHAND FOR ACCESSING LAYERS

  Convert each layer coming from the exporter into a Javascript object for shorthand access.

  This has to be called manually in Framer3 after you've ran the importer.

  myLayers = Framer.Importer.load("...")
  shortcuts.initialize(myLayers)

  If you have a layer in your PSD/Sketch called "NewsFeed", this will create a global Javascript variable called "NewsFeed" that you can manipulate with Framer.

  Example:
  `NewsFeed.visible = false;`

  Notes:
  Javascript has some names reserved for internal function that you can't override (for ex. )
  If you call initialize without anything, it will use all currently available layers.
 */

shortcuts.initialize = function(layers) {
  var layer;
  if (!layers) {
    layer = Framer.CurrentContext._layerList;
  }
  window.Layers = layers;
  return shortcuts.everyLayer(function(layer) {
    var sanitizedLayerName;
    sanitizedLayerName = layer.name.replace(/[-+!?:*\[\]\(\)\/]/g, '').trim().replace(/\s/g, '_');
    window[sanitizedLayerName] = layer;
    shortcuts.saveOriginalFrame(layer);
    return shortcuts.initializeTouchStates(layer);
  });
};


/*
  FIND CHILD LAYERS BY NAME

  Retrieves subLayers of selected layer that have a matching name.

  getChild: return the first sublayer whose name includes the given string
  getChildren: return all subLayers that match

  Useful when eg. iterating over table cells. Use getChild to access the button found in each cell. This is **case insensitive**.

  Example:
  `topLayer = NewsFeed.getChild("Top")` Looks for layers whose name matches Top. Returns the first matching layer.

  `childLayers = Table.getChildren("Cell")` Returns all children whose name match Cell in an array.
 */

Layer.prototype.getChild = function(needle, recursive) {
  var i, j, len, len1, ref, ref1, subLayer;
  if (recursive == null) {
    recursive = false;
  }
  ref = this.subLayers;
  for (i = 0, len = ref.length; i < len; i++) {
    subLayer = ref[i];
    if (subLayer.name.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
      return subLayer;
    }
  }
  if (recursive) {
    ref1 = this.subLayers;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      subLayer = ref1[j];
      if (subLayer.getChild(needle, recursive)) {
        return subLayer.getChild(needle, recursive);
      }
    }
  }
};

Layer.prototype.getChildren = function(needle, recursive) {
  var i, j, len, len1, ref, ref1, results, subLayer;
  if (recursive == null) {
    recursive = false;
  }
  results = [];
  if (recursive) {
    ref = this.subLayers;
    for (i = 0, len = ref.length; i < len; i++) {
      subLayer = ref[i];
      results = results.concat(subLayer.getChildren(needle, recursive));
    }
    if (this.name.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
      results.push(this);
    }
    return results;
  } else {
    ref1 = this.subLayers;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      subLayer = ref1[j];
      if (subLayer.name.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
        results.push(subLayer);
      }
    }
    return results;
  }
};


/*
  CONVERT A NUMBER RANGE TO ANOTHER

  Converts a number within one range to another range

  Example:
  We want to map the opacity of a layer to its x location.

  The opacity will be 0 if the X coordinate is 0, and it will be 1 if the X coordinate is 640. All the X coordinates in between will result in intermediate values between 0 and 1.

  `myLayer.opacity = convertRange(0, 640, myLayer.x, 0, 1)`

  By default, this value might be outside the bounds of NewMin and NewMax if the OldValue is outside OldMin and OldMax. If you want to cap the final value to NewMin and NewMax, set capped to true.
  Make sure NewMin is smaller than NewMax if you're using this. If you need an inverse proportion, try swapping OldMin and OldMax.
 */

shortcuts.convertRange = function(OldMin, OldMax, OldValue, NewMin, NewMax, capped) {
  var NewRange, NewValue, OldRange;
  OldRange = OldMax - OldMin;
  NewRange = NewMax - NewMin;
  NewValue = (((OldValue - OldMin) * NewRange) / OldRange) + NewMin;
  if (capped) {
    if (NewValue > NewMax) {
      return NewMax;
    } else if (NewValue < NewMin) {
      return NewMin;
    } else {
      return NewValue;
    }
  } else {
    return NewValue;
  }
};


/*
  ORIGINAL FRAME

  Stores the initial location and size of a layer in the "originalFrame" attribute, so you can revert to it later on.

  Example:
  The x coordinate of MyLayer is initially 400 (from the PSD)

  ```MyLayer.x = 200; // now we set it to 200.
  MyLayer.x = MyLayer.originalFrame.x // now we set it back to its original value, 400.```
 */

shortcuts.saveOriginalFrame = function(layer) {
  return layer.originalFrame = layer.frame;
};


/*
  SHORTHAND HOVER SYNTAX

  Quickly define functions that should run when I hover over a layer, and hover out.

  Example:
  `MyLayer.hover(function() { OtherLayer.show() }, function() { OtherLayer.hide() });`
 */

Layer.prototype.hover = function(enterFunction, leaveFunction) {
  this.on('mouseenter', enterFunction);
  return this.on('mouseleave', leaveFunction);
};


/*
  SHORTHAND TAP SYNTAX

  Instead of `MyLayer.on(Events.TouchEnd, handler)`, use `MyLayer.tap(handler)`
 */

Layer.prototype.tap = function(handler) {
  return this.on(Events.TouchEnd, handler);
};


/*
  SHORTHAND CLICK SYNTAX

  Instead of `MyLayer.on(Events.Click, handler)`, use `MyLayer.click(handler)`
 */

Layer.prototype.click = function(handler) {
  return this.on(Events.Click, handler);
};


/*
  SHORTHAND ANIMATION SYNTAX

  A shorter animation syntax that mirrors the jQuery syntax:
  layer.animate(properties, [time], [curve], [callback])

  All parameters except properties are optional and can be omitted.

  Old:
  ```MyLayer.animate({
    properties: {
      x: 500
    },
    time: 500,
    curve: 'bezier-curve'
  })```

  New:
  ```MyLayer.animateTo({
    x: 500
  })```

  Optionally (with 1000ms duration and spring):
    ```MyLayer.animateTo({
    x: 500
  }, 1000, "spring(100,10,0)")
 */

Layer.prototype.animateTo = function(properties, first, second, third) {
  var callback, curve, thisLayer, time;
  thisLayer = this;
  time = curve = callback = null;
  if (typeof first === "number") {
    time = first;
    if (typeof second === "string") {
      curve = second;
      callback = third;
    }
    if (typeof second === "function") {
      callback = second;
    }
  } else if (typeof first === "string") {
    curve = first;
    if (typeof second === "function") {
      callback = second;
    }
  } else if (typeof first === "function") {
    callback = first;
  }
  if ((time != null) && (curve == null)) {
    curve = 'bezier-curve';
  }
  if (curve == null) {
    curve = Framer.Defaults.Animation.curve;
  }
  if (time == null) {
    time = Framer.Defaults.Animation.time;
  }
  thisLayer.animationTo = new Animation({
    layer: thisLayer,
    properties: properties,
    curve: curve,
    time: time
  });
  thisLayer.animationTo.on('start', function() {
    return thisLayer.isAnimating = true;
  });
  thisLayer.animationTo.on('end', function() {
    thisLayer.isAnimating = null;
    if (callback != null) {
      return callback();
    }
  });
  return thisLayer.animationTo.start();
};


/*
  ANIMATE MOBILE LAYERS IN AND OUT OF THE VIEWPORT

  Shorthand syntax for animating layers in and out of the viewport. Assumes that the layer you are animating is a whole screen and has the same dimensions as your container.

  Enable the device preview in Framer Studio to use this – it lets this script figure out what the bounds of your screen are.

  Example:
  * `MyLayer.slideToLeft()` will animate the layer **to** the left corner of the screen (from its current position)

  * `MyLayer.slideFromLeft()` will animate the layer into the viewport **from** the left corner (from x=-width)

  Configuration:
  * (By default we use a spring curve that approximates iOS. To use a time duration, change the curve to bezier-curve.)
  * Framer.Defaults.SlideAnimation.time
  * Framer.Defaults.SlideAnimation.curve


  How to read the configuration:
  ```slideFromLeft:
    property: "x"     // animate along the X axis
    factor: "width"
    from: -1          // start value: outside the left corner ( x = -width_phone )
    to: 0             // end value: inside the left corner ( x = width_layer )
  ```
 */

shortcuts.slideAnimations = {
  slideFromLeft: {
    property: "x",
    factor: "width",
    from: -1,
    to: 0
  },
  slideToLeft: {
    property: "x",
    factor: "width",
    to: -1
  },
  slideFromRight: {
    property: "x",
    factor: "width",
    from: 1,
    to: 0
  },
  slideToRight: {
    property: "x",
    factor: "width",
    to: 1
  },
  slideFromTop: {
    property: "y",
    factor: "height",
    from: -1,
    to: 0
  },
  slideToTop: {
    property: "y",
    factor: "height",
    to: -1
  },
  slideFromBottom: {
    property: "y",
    factor: "height",
    from: 1,
    to: 0
  },
  slideToBottom: {
    property: "y",
    factor: "height",
    to: 1
  }
};

_.each(shortcuts.slideAnimations, function(opts, name) {
  return Layer.prototype[name] = function(time) {
    var _animationConfig, _curve, _factor, _phone, _property, _time, err, ref, ref1;
    _phone = (ref = Framer.Device) != null ? (ref1 = ref.screen) != null ? ref1.frame : void 0 : void 0;
    if (!_phone) {
      err = "Please select a device preview in Framer Studio to use the slide preset animations.";
      print(err);
      console.log(err);
      return;
    }
    _property = opts.property;
    _factor = _phone[opts.factor];
    if (opts.from != null) {
      this[_property] = opts.from * _factor;
    }
    _animationConfig = {};
    _animationConfig[_property] = opts.to * _factor;
    if (time) {
      _time = time;
      _curve = "bezier-curve";
    } else {
      _time = Framer.Defaults.SlideAnimation.time;
      _curve = Framer.Defaults.SlideAnimation.curve;
    }
    return this.animate({
      properties: _animationConfig,
      time: _time,
      curve: _curve
    });
  };
});


/*
  EASY FADE IN / FADE OUT

  .show() and .hide() are shortcuts to affect opacity and pointer events. This is essentially the same as hiding with `visible = false` but can be animated.

  .fadeIn() and .fadeOut() are shortcuts to fade in a hidden layer, or fade out a visible layer.

  These shortcuts work on individual layer objects as well as an array of layers.

  Example:
  * `MyLayer.fadeIn()` will fade in MyLayer using default timing.
  * `[MyLayer, OtherLayer].fadeOut(4)` will fade out both MyLayer and OtherLayer over 4 seconds.

  To customize the fade animation, change the variables time and curve inside `Framer.Defaults.FadeAnimation`.
 */

Layer.prototype.show = function() {
  this.opacity = 1;
  this.style.pointerEvents = 'auto';
  return this;
};

Layer.prototype.hide = function() {
  this.opacity = 0;
  this.style.pointerEvents = 'none';
  return this;
};

Layer.prototype.fadeIn = function(time) {
  if (time == null) {
    time = Framer.Defaults.FadeAnimation.time;
  }
  if (this.opacity === 1) {
    return;
  }
  if (!this.visible) {
    this.opacity = 0;
    this.visible = true;
  }
  return this.animateTo({
    opacity: 1
  }, time, Framer.Defaults.FadeAnimation.curve);
};

Layer.prototype.fadeOut = function(time) {
  var that;
  if (time == null) {
    time = Framer.Defaults.FadeAnimation.time;
  }
  if (this.opacity === 0) {
    return;
  }
  that = this;
  return this.animateTo({
    opacity: 0
  }, time, Framer.Defaults.FadeAnimation.curve, function() {
    return that.style.pointerEvents = 'none';
  });
};

_.each(['show', 'hide', 'fadeIn', 'fadeOut'], function(fnString) {
  return Object.defineProperty(Array.prototype, fnString, {
    enumerable: false,
    value: function(time) {
      _.each(this, function(layer) {
        if (layer instanceof Layer) {
          return Layer.prototype[fnString].call(layer, time);
        }
      });
      return this;
    }
  });
});


/*
  EASY HOVER AND TOUCH/CLICK STATES FOR LAYERS

  By naming your layer hierarchy in the following way, you can automatically have your layers react to hovers, clicks or taps.

  Button_touchable
  - Button_default (default state)
  - Button_down (touch/click state)
  - Button_hover (hover)
 */

shortcuts.initializeTouchStates = function(layer) {
  var _default, _down, _hover, hitTarget;
  _default = layer.getChild('default');
  if (layer.name.toLowerCase().indexOf('touchable') && _default) {
    if (!Framer.Utils.isMobile()) {
      _hover = layer.getChild('hover');
    }
    _down = layer.getChild('down');
    if (_hover != null) {
      _hover.hide();
    }
    if (_down != null) {
      _down.hide();
    }
    if (_hover || _down) {
      hitTarget = new Layer({
        background: 'transparent',
        frame: _default.frame
      });
      hitTarget.superLayer = layer;
      hitTarget.bringToFront();
    }
    if (_hover) {
      layer.hover(function() {
        _default.hide();
        return _hover.show();
      }, function() {
        _default.show();
        return _hover.hide();
      });
    }
    if (_down) {
      layer.on(Events.TouchStart, function() {
        _default.hide();
        if (_hover != null) {
          _hover.hide();
        }
        return _down.show();
      });
      return layer.on(Events.TouchEnd, function() {
        _down.hide();
        if (_hover) {
          return _hover.show();
        } else {
          return _default.show();
        }
      });
    }
  }
};

_.extend(exports, shortcuts);


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvc2hvcnRjdXRzLmNvZmZlZSIsIi4uL21vZHVsZXMvbmVzdGVkTGlzdC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICBTaG9ydGN1dHMgZm9yIEZyYW1lciAxLjBcbiAgaHR0cDovL2dpdGh1Yi5jb20vZmFjZWJvb2svc2hvcnRjdXRzLWZvci1mcmFtZXJcblxuICBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cbiAgUmVhZG1lOlxuICBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svc2hvcnRjdXRzLWZvci1mcmFtZXJcblxuICBMaWNlbnNlOlxuICBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svc2hvcnRjdXRzLWZvci1mcmFtZXIvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuIyMjXG5cblxuXG5cbiMjI1xuICBDT05GSUdVUkFUSU9OXG4jIyNcblxuc2hvcnRjdXRzID0ge31cblxuRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24gPVxuICBjdXJ2ZTogXCJiZXppZXItY3VydmVcIlxuICB0aW1lOiAwLjJcblxuRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uID1cbiAgY3VydmU6IFwic3ByaW5nKDQwMCw0MCwwKVwiXG5cblxuXG4jIyNcbiAgTE9PUCBPTiBFVkVSWSBMQVlFUlxuXG4gIFNob3J0aGFuZCBmb3IgYXBwbHlpbmcgYSBmdW5jdGlvbiB0byBldmVyeSBsYXllciBpbiB0aGUgZG9jdW1lbnQuXG5cbiAgRXhhbXBsZTpcbiAgYGBgc2hvcnRjdXRzLmV2ZXJ5TGF5ZXIoZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBsYXllci52aXNpYmxlID0gZmFsc2U7XG4gIH0pO2BgYFxuIyMjXG5zaG9ydGN1dHMuZXZlcnlMYXllciA9IChmbikgLT5cbiAgZm9yIGxheWVyTmFtZSBvZiB3aW5kb3cuTGF5ZXJzXG4gICAgX2xheWVyID0gd2luZG93LkxheWVyc1tsYXllck5hbWVdXG4gICAgZm4gX2xheWVyXG5cblxuIyMjXG4gIFNIT1JUSEFORCBGT1IgQUNDRVNTSU5HIExBWUVSU1xuXG4gIENvbnZlcnQgZWFjaCBsYXllciBjb21pbmcgZnJvbSB0aGUgZXhwb3J0ZXIgaW50byBhIEphdmFzY3JpcHQgb2JqZWN0IGZvciBzaG9ydGhhbmQgYWNjZXNzLlxuXG4gIFRoaXMgaGFzIHRvIGJlIGNhbGxlZCBtYW51YWxseSBpbiBGcmFtZXIzIGFmdGVyIHlvdSd2ZSByYW4gdGhlIGltcG9ydGVyLlxuXG4gIG15TGF5ZXJzID0gRnJhbWVyLkltcG9ydGVyLmxvYWQoXCIuLi5cIilcbiAgc2hvcnRjdXRzLmluaXRpYWxpemUobXlMYXllcnMpXG5cbiAgSWYgeW91IGhhdmUgYSBsYXllciBpbiB5b3VyIFBTRC9Ta2V0Y2ggY2FsbGVkIFwiTmV3c0ZlZWRcIiwgdGhpcyB3aWxsIGNyZWF0ZSBhIGdsb2JhbCBKYXZhc2NyaXB0IHZhcmlhYmxlIGNhbGxlZCBcIk5ld3NGZWVkXCIgdGhhdCB5b3UgY2FuIG1hbmlwdWxhdGUgd2l0aCBGcmFtZXIuXG5cbiAgRXhhbXBsZTpcbiAgYE5ld3NGZWVkLnZpc2libGUgPSBmYWxzZTtgXG5cbiAgTm90ZXM6XG4gIEphdmFzY3JpcHQgaGFzIHNvbWUgbmFtZXMgcmVzZXJ2ZWQgZm9yIGludGVybmFsIGZ1bmN0aW9uIHRoYXQgeW91IGNhbid0IG92ZXJyaWRlIChmb3IgZXguIClcbiAgSWYgeW91IGNhbGwgaW5pdGlhbGl6ZSB3aXRob3V0IGFueXRoaW5nLCBpdCB3aWxsIHVzZSBhbGwgY3VycmVudGx5IGF2YWlsYWJsZSBsYXllcnMuXG4jIyNcbnNob3J0Y3V0cy5pbml0aWFsaXplID0gKGxheWVycykgLT5cblxuICBsYXllciA9IEZyYW1lci5DdXJyZW50Q29udGV4dC5fbGF5ZXJMaXN0IGlmIG5vdCBsYXllcnNcblxuICB3aW5kb3cuTGF5ZXJzID0gbGF5ZXJzXG5cbiAgc2hvcnRjdXRzLmV2ZXJ5TGF5ZXIgKGxheWVyKSAtPlxuICAgIHNhbml0aXplZExheWVyTmFtZSA9IGxheWVyLm5hbWUucmVwbGFjZSgvWy0rIT86KlxcW1xcXVxcKFxcKVxcL10vZywgJycpLnRyaW0oKS5yZXBsYWNlKC9cXHMvZywgJ18nKVxuICAgIHdpbmRvd1tzYW5pdGl6ZWRMYXllck5hbWVdID0gbGF5ZXJcbiAgICBzaG9ydGN1dHMuc2F2ZU9yaWdpbmFsRnJhbWUgbGF5ZXJcbiAgICBzaG9ydGN1dHMuaW5pdGlhbGl6ZVRvdWNoU3RhdGVzIGxheWVyXG5cblxuIyMjXG4gIEZJTkQgQ0hJTEQgTEFZRVJTIEJZIE5BTUVcblxuICBSZXRyaWV2ZXMgc3ViTGF5ZXJzIG9mIHNlbGVjdGVkIGxheWVyIHRoYXQgaGF2ZSBhIG1hdGNoaW5nIG5hbWUuXG5cbiAgZ2V0Q2hpbGQ6IHJldHVybiB0aGUgZmlyc3Qgc3VibGF5ZXIgd2hvc2UgbmFtZSBpbmNsdWRlcyB0aGUgZ2l2ZW4gc3RyaW5nXG4gIGdldENoaWxkcmVuOiByZXR1cm4gYWxsIHN1YkxheWVycyB0aGF0IG1hdGNoXG5cbiAgVXNlZnVsIHdoZW4gZWcuIGl0ZXJhdGluZyBvdmVyIHRhYmxlIGNlbGxzLiBVc2UgZ2V0Q2hpbGQgdG8gYWNjZXNzIHRoZSBidXR0b24gZm91bmQgaW4gZWFjaCBjZWxsLiBUaGlzIGlzICoqY2FzZSBpbnNlbnNpdGl2ZSoqLlxuXG4gIEV4YW1wbGU6XG4gIGB0b3BMYXllciA9IE5ld3NGZWVkLmdldENoaWxkKFwiVG9wXCIpYCBMb29rcyBmb3IgbGF5ZXJzIHdob3NlIG5hbWUgbWF0Y2hlcyBUb3AuIFJldHVybnMgdGhlIGZpcnN0IG1hdGNoaW5nIGxheWVyLlxuXG4gIGBjaGlsZExheWVycyA9IFRhYmxlLmdldENoaWxkcmVuKFwiQ2VsbFwiKWAgUmV0dXJucyBhbGwgY2hpbGRyZW4gd2hvc2UgbmFtZSBtYXRjaCBDZWxsIGluIGFuIGFycmF5LlxuIyMjXG5MYXllcjo6Z2V0Q2hpbGQgPSAobmVlZGxlLCByZWN1cnNpdmUgPSBmYWxzZSkgLT5cbiAgIyBTZWFyY2ggZGlyZWN0IGNoaWxkcmVuXG4gIGZvciBzdWJMYXllciBpbiBAc3ViTGF5ZXJzXG4gICAgcmV0dXJuIHN1YkxheWVyIGlmIHN1YkxheWVyLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKG5lZWRsZS50b0xvd2VyQ2FzZSgpKSBpc250IC0xIFxuXG4gICMgUmVjdXJzaXZlbHkgc2VhcmNoIGNoaWxkcmVuIG9mIGNoaWxkcmVuXG4gIGlmIHJlY3Vyc2l2ZVxuICAgIGZvciBzdWJMYXllciBpbiBAc3ViTGF5ZXJzXG4gICAgICByZXR1cm4gc3ViTGF5ZXIuZ2V0Q2hpbGQobmVlZGxlLCByZWN1cnNpdmUpIGlmIHN1YkxheWVyLmdldENoaWxkKG5lZWRsZSwgcmVjdXJzaXZlKSBcblxuXG5MYXllcjo6Z2V0Q2hpbGRyZW4gPSAobmVlZGxlLCByZWN1cnNpdmUgPSBmYWxzZSkgLT5cbiAgcmVzdWx0cyA9IFtdXG5cbiAgaWYgcmVjdXJzaXZlXG4gICAgZm9yIHN1YkxheWVyIGluIEBzdWJMYXllcnNcbiAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCBzdWJMYXllci5nZXRDaGlsZHJlbihuZWVkbGUsIHJlY3Vyc2l2ZSlcbiAgICByZXN1bHRzLnB1c2ggQCBpZiBAbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobmVlZGxlLnRvTG93ZXJDYXNlKCkpIGlzbnQgLTFcbiAgICByZXR1cm4gcmVzdWx0c1xuXG4gIGVsc2VcbiAgICBmb3Igc3ViTGF5ZXIgaW4gQHN1YkxheWVyc1xuICAgICAgaWYgc3ViTGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobmVlZGxlLnRvTG93ZXJDYXNlKCkpIGlzbnQgLTEgXG4gICAgICAgIHJlc3VsdHMucHVzaCBzdWJMYXllciBcbiAgICByZXR1cm4gcmVzdWx0c1xuXG5cblxuIyMjXG4gIENPTlZFUlQgQSBOVU1CRVIgUkFOR0UgVE8gQU5PVEhFUlxuXG4gIENvbnZlcnRzIGEgbnVtYmVyIHdpdGhpbiBvbmUgcmFuZ2UgdG8gYW5vdGhlciByYW5nZVxuXG4gIEV4YW1wbGU6XG4gIFdlIHdhbnQgdG8gbWFwIHRoZSBvcGFjaXR5IG9mIGEgbGF5ZXIgdG8gaXRzIHggbG9jYXRpb24uXG5cbiAgVGhlIG9wYWNpdHkgd2lsbCBiZSAwIGlmIHRoZSBYIGNvb3JkaW5hdGUgaXMgMCwgYW5kIGl0IHdpbGwgYmUgMSBpZiB0aGUgWCBjb29yZGluYXRlIGlzIDY0MC4gQWxsIHRoZSBYIGNvb3JkaW5hdGVzIGluIGJldHdlZW4gd2lsbCByZXN1bHQgaW4gaW50ZXJtZWRpYXRlIHZhbHVlcyBiZXR3ZWVuIDAgYW5kIDEuXG5cbiAgYG15TGF5ZXIub3BhY2l0eSA9IGNvbnZlcnRSYW5nZSgwLCA2NDAsIG15TGF5ZXIueCwgMCwgMSlgXG5cbiAgQnkgZGVmYXVsdCwgdGhpcyB2YWx1ZSBtaWdodCBiZSBvdXRzaWRlIHRoZSBib3VuZHMgb2YgTmV3TWluIGFuZCBOZXdNYXggaWYgdGhlIE9sZFZhbHVlIGlzIG91dHNpZGUgT2xkTWluIGFuZCBPbGRNYXguIElmIHlvdSB3YW50IHRvIGNhcCB0aGUgZmluYWwgdmFsdWUgdG8gTmV3TWluIGFuZCBOZXdNYXgsIHNldCBjYXBwZWQgdG8gdHJ1ZS5cbiAgTWFrZSBzdXJlIE5ld01pbiBpcyBzbWFsbGVyIHRoYW4gTmV3TWF4IGlmIHlvdSdyZSB1c2luZyB0aGlzLiBJZiB5b3UgbmVlZCBhbiBpbnZlcnNlIHByb3BvcnRpb24sIHRyeSBzd2FwcGluZyBPbGRNaW4gYW5kIE9sZE1heC5cbiMjI1xuc2hvcnRjdXRzLmNvbnZlcnRSYW5nZSA9IChPbGRNaW4sIE9sZE1heCwgT2xkVmFsdWUsIE5ld01pbiwgTmV3TWF4LCBjYXBwZWQpIC0+XG4gIE9sZFJhbmdlID0gKE9sZE1heCAtIE9sZE1pbilcbiAgTmV3UmFuZ2UgPSAoTmV3TWF4IC0gTmV3TWluKVxuICBOZXdWYWx1ZSA9ICgoKE9sZFZhbHVlIC0gT2xkTWluKSAqIE5ld1JhbmdlKSAvIE9sZFJhbmdlKSArIE5ld01pblxuXG4gIGlmIGNhcHBlZFxuICAgIGlmIE5ld1ZhbHVlID4gTmV3TWF4XG4gICAgICBOZXdNYXhcbiAgICBlbHNlIGlmIE5ld1ZhbHVlIDwgTmV3TWluXG4gICAgICBOZXdNaW5cbiAgICBlbHNlXG4gICAgICBOZXdWYWx1ZVxuICBlbHNlXG4gICAgTmV3VmFsdWVcblxuXG4jIyNcbiAgT1JJR0lOQUwgRlJBTUVcblxuICBTdG9yZXMgdGhlIGluaXRpYWwgbG9jYXRpb24gYW5kIHNpemUgb2YgYSBsYXllciBpbiB0aGUgXCJvcmlnaW5hbEZyYW1lXCIgYXR0cmlidXRlLCBzbyB5b3UgY2FuIHJldmVydCB0byBpdCBsYXRlciBvbi5cblxuICBFeGFtcGxlOlxuICBUaGUgeCBjb29yZGluYXRlIG9mIE15TGF5ZXIgaXMgaW5pdGlhbGx5IDQwMCAoZnJvbSB0aGUgUFNEKVxuXG4gIGBgYE15TGF5ZXIueCA9IDIwMDsgLy8gbm93IHdlIHNldCBpdCB0byAyMDAuXG4gIE15TGF5ZXIueCA9IE15TGF5ZXIub3JpZ2luYWxGcmFtZS54IC8vIG5vdyB3ZSBzZXQgaXQgYmFjayB0byBpdHMgb3JpZ2luYWwgdmFsdWUsIDQwMC5gYGBcbiMjI1xuc2hvcnRjdXRzLnNhdmVPcmlnaW5hbEZyYW1lID0gKGxheWVyKSAtPlxuICBsYXllci5vcmlnaW5hbEZyYW1lID0gbGF5ZXIuZnJhbWVcblxuIyMjXG4gIFNIT1JUSEFORCBIT1ZFUiBTWU5UQVhcblxuICBRdWlja2x5IGRlZmluZSBmdW5jdGlvbnMgdGhhdCBzaG91bGQgcnVuIHdoZW4gSSBob3ZlciBvdmVyIGEgbGF5ZXIsIGFuZCBob3ZlciBvdXQuXG5cbiAgRXhhbXBsZTpcbiAgYE15TGF5ZXIuaG92ZXIoZnVuY3Rpb24oKSB7IE90aGVyTGF5ZXIuc2hvdygpIH0sIGZ1bmN0aW9uKCkgeyBPdGhlckxheWVyLmhpZGUoKSB9KTtgXG4jIyNcbkxheWVyOjpob3ZlciA9IChlbnRlckZ1bmN0aW9uLCBsZWF2ZUZ1bmN0aW9uKSAtPlxuICB0aGlzLm9uICdtb3VzZWVudGVyJywgZW50ZXJGdW5jdGlvblxuICB0aGlzLm9uICdtb3VzZWxlYXZlJywgbGVhdmVGdW5jdGlvblxuXG5cbiMjI1xuICBTSE9SVEhBTkQgVEFQIFNZTlRBWFxuXG4gIEluc3RlYWQgb2YgYE15TGF5ZXIub24oRXZlbnRzLlRvdWNoRW5kLCBoYW5kbGVyKWAsIHVzZSBgTXlMYXllci50YXAoaGFuZGxlcilgXG4jIyNcblxuTGF5ZXI6OnRhcCA9IChoYW5kbGVyKSAtPlxuICB0aGlzLm9uIEV2ZW50cy5Ub3VjaEVuZCwgaGFuZGxlclxuXG5cbiMjI1xuICBTSE9SVEhBTkQgQ0xJQ0sgU1lOVEFYXG5cbiAgSW5zdGVhZCBvZiBgTXlMYXllci5vbihFdmVudHMuQ2xpY2ssIGhhbmRsZXIpYCwgdXNlIGBNeUxheWVyLmNsaWNrKGhhbmRsZXIpYFxuIyMjXG5cbkxheWVyOjpjbGljayA9IChoYW5kbGVyKSAtPlxuICB0aGlzLm9uIEV2ZW50cy5DbGljaywgaGFuZGxlclxuXG5cblxuIyMjXG4gIFNIT1JUSEFORCBBTklNQVRJT04gU1lOVEFYXG5cbiAgQSBzaG9ydGVyIGFuaW1hdGlvbiBzeW50YXggdGhhdCBtaXJyb3JzIHRoZSBqUXVlcnkgc3ludGF4OlxuICBsYXllci5hbmltYXRlKHByb3BlcnRpZXMsIFt0aW1lXSwgW2N1cnZlXSwgW2NhbGxiYWNrXSlcblxuICBBbGwgcGFyYW1ldGVycyBleGNlcHQgcHJvcGVydGllcyBhcmUgb3B0aW9uYWwgYW5kIGNhbiBiZSBvbWl0dGVkLlxuXG4gIE9sZDpcbiAgYGBgTXlMYXllci5hbmltYXRlKHtcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB4OiA1MDBcbiAgICB9LFxuICAgIHRpbWU6IDUwMCxcbiAgICBjdXJ2ZTogJ2Jlemllci1jdXJ2ZSdcbiAgfSlgYGBcblxuICBOZXc6XG4gIGBgYE15TGF5ZXIuYW5pbWF0ZVRvKHtcbiAgICB4OiA1MDBcbiAgfSlgYGBcblxuICBPcHRpb25hbGx5ICh3aXRoIDEwMDBtcyBkdXJhdGlvbiBhbmQgc3ByaW5nKTpcbiAgICBgYGBNeUxheWVyLmFuaW1hdGVUbyh7XG4gICAgeDogNTAwXG4gIH0sIDEwMDAsIFwic3ByaW5nKDEwMCwxMCwwKVwiKVxuIyMjXG5cblxuXG5MYXllcjo6YW5pbWF0ZVRvID0gKHByb3BlcnRpZXMsIGZpcnN0LCBzZWNvbmQsIHRoaXJkKSAtPlxuICB0aGlzTGF5ZXIgPSB0aGlzXG4gIHRpbWUgPSBjdXJ2ZSA9IGNhbGxiYWNrID0gbnVsbFxuXG4gIGlmIHR5cGVvZihmaXJzdCkgPT0gXCJudW1iZXJcIlxuICAgIHRpbWUgPSBmaXJzdFxuICAgIGlmIHR5cGVvZihzZWNvbmQpID09IFwic3RyaW5nXCJcbiAgICAgIGN1cnZlID0gc2Vjb25kXG4gICAgICBjYWxsYmFjayA9IHRoaXJkXG4gICAgY2FsbGJhY2sgPSBzZWNvbmQgaWYgdHlwZW9mKHNlY29uZCkgPT0gXCJmdW5jdGlvblwiXG4gIGVsc2UgaWYgdHlwZW9mKGZpcnN0KSA9PSBcInN0cmluZ1wiXG4gICAgY3VydmUgPSBmaXJzdFxuICAgIGNhbGxiYWNrID0gc2Vjb25kIGlmIHR5cGVvZihzZWNvbmQpID09IFwiZnVuY3Rpb25cIlxuICBlbHNlIGlmIHR5cGVvZihmaXJzdCkgPT0gXCJmdW5jdGlvblwiXG4gICAgY2FsbGJhY2sgPSBmaXJzdFxuXG4gIGlmIHRpbWU/ICYmICFjdXJ2ZT9cbiAgICBjdXJ2ZSA9ICdiZXppZXItY3VydmUnXG4gIFxuICBjdXJ2ZSA9IEZyYW1lci5EZWZhdWx0cy5BbmltYXRpb24uY3VydmUgaWYgIWN1cnZlP1xuICB0aW1lID0gRnJhbWVyLkRlZmF1bHRzLkFuaW1hdGlvbi50aW1lIGlmICF0aW1lP1xuXG4gIHRoaXNMYXllci5hbmltYXRpb25UbyA9IG5ldyBBbmltYXRpb25cbiAgICBsYXllcjogdGhpc0xheWVyXG4gICAgcHJvcGVydGllczogcHJvcGVydGllc1xuICAgIGN1cnZlOiBjdXJ2ZVxuICAgIHRpbWU6IHRpbWVcblxuICB0aGlzTGF5ZXIuYW5pbWF0aW9uVG8ub24gJ3N0YXJ0JywgLT5cbiAgICB0aGlzTGF5ZXIuaXNBbmltYXRpbmcgPSB0cnVlXG5cbiAgdGhpc0xheWVyLmFuaW1hdGlvblRvLm9uICdlbmQnLCAtPlxuICAgIHRoaXNMYXllci5pc0FuaW1hdGluZyA9IG51bGxcbiAgICBpZiBjYWxsYmFjaz9cbiAgICAgIGNhbGxiYWNrKClcblxuICB0aGlzTGF5ZXIuYW5pbWF0aW9uVG8uc3RhcnQoKVxuXG4jIyNcbiAgQU5JTUFURSBNT0JJTEUgTEFZRVJTIElOIEFORCBPVVQgT0YgVEhFIFZJRVdQT1JUXG5cbiAgU2hvcnRoYW5kIHN5bnRheCBmb3IgYW5pbWF0aW5nIGxheWVycyBpbiBhbmQgb3V0IG9mIHRoZSB2aWV3cG9ydC4gQXNzdW1lcyB0aGF0IHRoZSBsYXllciB5b3UgYXJlIGFuaW1hdGluZyBpcyBhIHdob2xlIHNjcmVlbiBhbmQgaGFzIHRoZSBzYW1lIGRpbWVuc2lvbnMgYXMgeW91ciBjb250YWluZXIuXG5cbiAgRW5hYmxlIHRoZSBkZXZpY2UgcHJldmlldyBpbiBGcmFtZXIgU3R1ZGlvIHRvIHVzZSB0aGlzIOKAk8KgaXQgbGV0cyB0aGlzIHNjcmlwdCBmaWd1cmUgb3V0IHdoYXQgdGhlIGJvdW5kcyBvZiB5b3VyIHNjcmVlbiBhcmUuXG5cbiAgRXhhbXBsZTpcbiAgKiBgTXlMYXllci5zbGlkZVRvTGVmdCgpYCB3aWxsIGFuaW1hdGUgdGhlIGxheWVyICoqdG8qKiB0aGUgbGVmdCBjb3JuZXIgb2YgdGhlIHNjcmVlbiAoZnJvbSBpdHMgY3VycmVudCBwb3NpdGlvbilcblxuICAqIGBNeUxheWVyLnNsaWRlRnJvbUxlZnQoKWAgd2lsbCBhbmltYXRlIHRoZSBsYXllciBpbnRvIHRoZSB2aWV3cG9ydCAqKmZyb20qKiB0aGUgbGVmdCBjb3JuZXIgKGZyb20geD0td2lkdGgpXG5cbiAgQ29uZmlndXJhdGlvbjpcbiAgKiAoQnkgZGVmYXVsdCB3ZSB1c2UgYSBzcHJpbmcgY3VydmUgdGhhdCBhcHByb3hpbWF0ZXMgaU9TLiBUbyB1c2UgYSB0aW1lIGR1cmF0aW9uLCBjaGFuZ2UgdGhlIGN1cnZlIHRvIGJlemllci1jdXJ2ZS4pXG4gICogRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uLnRpbWVcbiAgKiBGcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24uY3VydmVcblxuXG4gIEhvdyB0byByZWFkIHRoZSBjb25maWd1cmF0aW9uOlxuICBgYGBzbGlkZUZyb21MZWZ0OlxuICAgIHByb3BlcnR5OiBcInhcIiAgICAgLy8gYW5pbWF0ZSBhbG9uZyB0aGUgWCBheGlzXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICBmcm9tOiAtMSAgICAgICAgICAvLyBzdGFydCB2YWx1ZTogb3V0c2lkZSB0aGUgbGVmdCBjb3JuZXIgKCB4ID0gLXdpZHRoX3Bob25lIClcbiAgICB0bzogMCAgICAgICAgICAgICAvLyBlbmQgdmFsdWU6IGluc2lkZSB0aGUgbGVmdCBjb3JuZXIgKCB4ID0gd2lkdGhfbGF5ZXIgKVxuICBgYGBcbiMjI1xuXG5cbnNob3J0Y3V0cy5zbGlkZUFuaW1hdGlvbnMgPVxuICBzbGlkZUZyb21MZWZ0OlxuICAgIHByb3BlcnR5OiBcInhcIlxuICAgIGZhY3RvcjogXCJ3aWR0aFwiXG4gICAgZnJvbTogLTFcbiAgICB0bzogMFxuXG4gIHNsaWRlVG9MZWZ0OlxuICAgIHByb3BlcnR5OiBcInhcIlxuICAgIGZhY3RvcjogXCJ3aWR0aFwiXG4gICAgdG86IC0xXG5cbiAgc2xpZGVGcm9tUmlnaHQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICBmcm9tOiAxXG4gICAgdG86IDBcblxuICBzbGlkZVRvUmlnaHQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICB0bzogMVxuXG4gIHNsaWRlRnJvbVRvcDpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICBmcm9tOiAtMVxuICAgIHRvOiAwXG5cbiAgc2xpZGVUb1RvcDpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICB0bzogLTFcblxuICBzbGlkZUZyb21Cb3R0b206XG4gICAgcHJvcGVydHk6IFwieVwiXG4gICAgZmFjdG9yOiBcImhlaWdodFwiXG4gICAgZnJvbTogMVxuICAgIHRvOiAwXG5cbiAgc2xpZGVUb0JvdHRvbTpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICB0bzogMVxuXG5cblxuXy5lYWNoIHNob3J0Y3V0cy5zbGlkZUFuaW1hdGlvbnMsIChvcHRzLCBuYW1lKSAtPlxuICBMYXllci5wcm90b3R5cGVbbmFtZV0gPSAodGltZSkgLT5cbiAgICBfcGhvbmUgPSBGcmFtZXIuRGV2aWNlPy5zY3JlZW4/LmZyYW1lXG5cbiAgICB1bmxlc3MgX3Bob25lXG4gICAgICBlcnIgPSBcIlBsZWFzZSBzZWxlY3QgYSBkZXZpY2UgcHJldmlldyBpbiBGcmFtZXIgU3R1ZGlvIHRvIHVzZSB0aGUgc2xpZGUgcHJlc2V0IGFuaW1hdGlvbnMuXCJcbiAgICAgIHByaW50IGVyclxuICAgICAgY29uc29sZS5sb2cgZXJyXG4gICAgICByZXR1cm5cblxuICAgIF9wcm9wZXJ0eSA9IG9wdHMucHJvcGVydHlcbiAgICBfZmFjdG9yID0gX3Bob25lW29wdHMuZmFjdG9yXVxuXG4gICAgaWYgb3B0cy5mcm9tP1xuICAgICAgIyBJbml0aWF0ZSB0aGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIGFuaW1hdGlvbiAoaS5lLiBvZmYgc2NyZWVuIG9uIHRoZSBsZWZ0IGNvcm5lcilcbiAgICAgIHRoaXNbX3Byb3BlcnR5XSA9IG9wdHMuZnJvbSAqIF9mYWN0b3JcblxuICAgICMgRGVmYXVsdCBhbmltYXRpb24gc3ludGF4IGxheWVyLmFuaW1hdGUoe19wcm9wZXJ0eTogMH0pIHdvdWxkIHRyeSB0byBhbmltYXRlICdfcHJvcGVydHknIGxpdGVyYWxseSwgaW4gb3JkZXIgZm9yIGl0IHRvIGJsb3cgdXAgdG8gd2hhdCdzIGluIGl0IChlZyB4KSwgd2UgdXNlIHRoaXMgc3ludGF4XG4gICAgX2FuaW1hdGlvbkNvbmZpZyA9IHt9XG4gICAgX2FuaW1hdGlvbkNvbmZpZ1tfcHJvcGVydHldID0gb3B0cy50byAqIF9mYWN0b3JcblxuICAgIGlmIHRpbWVcbiAgICAgIF90aW1lID0gdGltZVxuICAgICAgX2N1cnZlID0gXCJiZXppZXItY3VydmVcIlxuICAgIGVsc2VcbiAgICAgIF90aW1lID0gRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uLnRpbWVcbiAgICAgIF9jdXJ2ZSA9IEZyYW1lci5EZWZhdWx0cy5TbGlkZUFuaW1hdGlvbi5jdXJ2ZVxuXG4gICAgdGhpcy5hbmltYXRlXG4gICAgICBwcm9wZXJ0aWVzOiBfYW5pbWF0aW9uQ29uZmlnXG4gICAgICB0aW1lOiBfdGltZVxuICAgICAgY3VydmU6IF9jdXJ2ZVxuXG5cblxuIyMjXG4gIEVBU1kgRkFERSBJTiAvIEZBREUgT1VUXG5cbiAgLnNob3coKSBhbmQgLmhpZGUoKSBhcmUgc2hvcnRjdXRzIHRvIGFmZmVjdCBvcGFjaXR5IGFuZCBwb2ludGVyIGV2ZW50cy4gVGhpcyBpcyBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyBoaWRpbmcgd2l0aCBgdmlzaWJsZSA9IGZhbHNlYCBidXQgY2FuIGJlIGFuaW1hdGVkLlxuXG4gIC5mYWRlSW4oKSBhbmQgLmZhZGVPdXQoKSBhcmUgc2hvcnRjdXRzIHRvIGZhZGUgaW4gYSBoaWRkZW4gbGF5ZXIsIG9yIGZhZGUgb3V0IGEgdmlzaWJsZSBsYXllci5cblxuICBUaGVzZSBzaG9ydGN1dHMgd29yayBvbiBpbmRpdmlkdWFsIGxheWVyIG9iamVjdHMgYXMgd2VsbCBhcyBhbiBhcnJheSBvZiBsYXllcnMuXG5cbiAgRXhhbXBsZTpcbiAgKiBgTXlMYXllci5mYWRlSW4oKWAgd2lsbCBmYWRlIGluIE15TGF5ZXIgdXNpbmcgZGVmYXVsdCB0aW1pbmcuXG4gICogYFtNeUxheWVyLCBPdGhlckxheWVyXS5mYWRlT3V0KDQpYCB3aWxsIGZhZGUgb3V0IGJvdGggTXlMYXllciBhbmQgT3RoZXJMYXllciBvdmVyIDQgc2Vjb25kcy5cblxuICBUbyBjdXN0b21pemUgdGhlIGZhZGUgYW5pbWF0aW9uLCBjaGFuZ2UgdGhlIHZhcmlhYmxlcyB0aW1lIGFuZCBjdXJ2ZSBpbnNpZGUgYEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uYC5cbiMjI1xuTGF5ZXI6OnNob3cgPSAtPlxuICBAb3BhY2l0eSA9IDFcbiAgQHN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0bydcbiAgQFxuXG5MYXllcjo6aGlkZSA9IC0+XG4gIEBvcGFjaXR5ID0gMFxuICBAc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJ1xuICBAXG5cbkxheWVyOjpmYWRlSW4gPSAodGltZSA9IEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uLnRpbWUpIC0+XG4gIHJldHVybiBpZiBAb3BhY2l0eSA9PSAxXG5cbiAgdW5sZXNzIEB2aXNpYmxlXG4gICAgQG9wYWNpdHkgPSAwXG4gICAgQHZpc2libGUgPSB0cnVlXG5cbiAgQGFuaW1hdGVUbyBvcGFjaXR5OiAxLCB0aW1lLCBGcmFtZXIuRGVmYXVsdHMuRmFkZUFuaW1hdGlvbi5jdXJ2ZVxuXG5MYXllcjo6ZmFkZU91dCA9ICh0aW1lID0gRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24udGltZSkgLT5cbiAgcmV0dXJuIGlmIEBvcGFjaXR5ID09IDBcblxuICB0aGF0ID0gQFxuICBAYW5pbWF0ZVRvIG9wYWNpdHk6IDAsIHRpbWUsIEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uLmN1cnZlLCAtPiB0aGF0LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSdcblxuIyBhbGwgb2YgdGhlIGVhc3kgaW4vb3V0IGhlbHBlcnMgd29yayBvbiBhbiBhcnJheSBvZiB2aWV3cyBhcyB3ZWxsIGFzIGluZGl2aWR1YWwgdmlld3Ncbl8uZWFjaCBbJ3Nob3cnLCAnaGlkZScsICdmYWRlSW4nLCAnZmFkZU91dCddLCAoZm5TdHJpbmcpLT4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQXJyYXkucHJvdG90eXBlLCBmblN0cmluZywgXG4gICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB2YWx1ZTogKHRpbWUpIC0+XG4gICAgICBfLmVhY2ggQCwgKGxheWVyKSAtPlxuICAgICAgICBMYXllci5wcm90b3R5cGVbZm5TdHJpbmddLmNhbGwobGF5ZXIsIHRpbWUpIGlmIGxheWVyIGluc3RhbmNlb2YgTGF5ZXJcbiAgICAgIEBcblxuXG4jIyNcbiAgRUFTWSBIT1ZFUiBBTkQgVE9VQ0gvQ0xJQ0sgU1RBVEVTIEZPUiBMQVlFUlNcblxuICBCeSBuYW1pbmcgeW91ciBsYXllciBoaWVyYXJjaHkgaW4gdGhlIGZvbGxvd2luZyB3YXksIHlvdSBjYW4gYXV0b21hdGljYWxseSBoYXZlIHlvdXIgbGF5ZXJzIHJlYWN0IHRvIGhvdmVycywgY2xpY2tzIG9yIHRhcHMuXG5cbiAgQnV0dG9uX3RvdWNoYWJsZVxuICAtIEJ1dHRvbl9kZWZhdWx0IChkZWZhdWx0IHN0YXRlKVxuICAtIEJ1dHRvbl9kb3duICh0b3VjaC9jbGljayBzdGF0ZSlcbiAgLSBCdXR0b25faG92ZXIgKGhvdmVyKVxuIyMjXG5cbnNob3J0Y3V0cy5pbml0aWFsaXplVG91Y2hTdGF0ZXMgPSAobGF5ZXIpIC0+XG4gIF9kZWZhdWx0ID0gbGF5ZXIuZ2V0Q2hpbGQoJ2RlZmF1bHQnKVxuXG4gIGlmIGxheWVyLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCd0b3VjaGFibGUnKSBhbmQgX2RlZmF1bHRcblxuICAgIHVubGVzcyBGcmFtZXIuVXRpbHMuaXNNb2JpbGUoKVxuICAgICAgX2hvdmVyID0gbGF5ZXIuZ2V0Q2hpbGQoJ2hvdmVyJylcbiAgICBfZG93biA9IGxheWVyLmdldENoaWxkKCdkb3duJylcblxuICAgICMgVGhlc2UgbGF5ZXJzIHNob3VsZCBiZSBoaWRkZW4gYnkgZGVmYXVsdFxuICAgIF9ob3Zlcj8uaGlkZSgpXG4gICAgX2Rvd24/LmhpZGUoKVxuXG4gICAgIyBDcmVhdGUgZmFrZSBoaXQgdGFyZ2V0IChzbyB3ZSBkb24ndCByZS1maXJlIGV2ZW50cylcbiAgICBpZiBfaG92ZXIgb3IgX2Rvd25cbiAgICAgIGhpdFRhcmdldCA9IG5ldyBMYXllclxuICAgICAgICBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnXG4gICAgICAgIGZyYW1lOiBfZGVmYXVsdC5mcmFtZVxuXG4gICAgICBoaXRUYXJnZXQuc3VwZXJMYXllciA9IGxheWVyXG4gICAgICBoaXRUYXJnZXQuYnJpbmdUb0Zyb250KClcblxuICAgICMgVGhlcmUgaXMgYSBob3ZlciBzdGF0ZSwgc28gZGVmaW5lIGhvdmVyIGV2ZW50cyAobm90IGZvciBtb2JpbGUpXG4gICAgaWYgX2hvdmVyXG4gICAgICBsYXllci5ob3ZlciAtPlxuICAgICAgICBfZGVmYXVsdC5oaWRlKClcbiAgICAgICAgX2hvdmVyLnNob3coKVxuICAgICAgLCAtPlxuICAgICAgICBfZGVmYXVsdC5zaG93KClcbiAgICAgICAgX2hvdmVyLmhpZGUoKVxuXG4gICAgIyBUaGVyZSBpcyBhIGRvd24gc3RhdGUsIHNvIGRlZmluZSBkb3duIGV2ZW50c1xuICAgIGlmIF9kb3duXG4gICAgICBsYXllci5vbiBFdmVudHMuVG91Y2hTdGFydCwgLT5cbiAgICAgICAgX2RlZmF1bHQuaGlkZSgpXG4gICAgICAgIF9ob3Zlcj8uaGlkZSgpICMgdG91Y2ggZG93biBzdGF0ZSBvdmVycmlkZXMgaG92ZXIgc3RhdGVcbiAgICAgICAgX2Rvd24uc2hvdygpXG5cbiAgICAgIGxheWVyLm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT5cbiAgICAgICAgX2Rvd24uaGlkZSgpXG5cbiAgICAgICAgaWYgX2hvdmVyXG4gICAgICAgICAgIyBJZiB0aGVyZSB3YXMgYSBob3ZlciBzdGF0ZSwgZ28gYmFjayB0byB0aGUgaG92ZXIgc3RhdGVcbiAgICAgICAgICBfaG92ZXIuc2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBfZGVmYXVsdC5zaG93KClcblxuXG5fLmV4dGVuZChleHBvcnRzLCBzaG9ydGN1dHMpXG5cbiIsImNsYXNzIGV4cG9ydHMuQ29sbGFwc2VIb2xkZXIgZXh0ZW5kcyBMYXllclxuXHRjb25zdHJ1Y3RvcjogKGxheWVyQXJyYXksIHRvZ2dsZUxheWVyLCBza2V0Y2gpIC0+XG5cdFx0c3VwZXIoKVxuXHRcdEAub3JpZ2luWSA9IDBcblx0XHRALnNvcnRlZExheWVycz1bXVxuXHRcdEAuYW5pbWF0aW9uT3B0aW9ucyA9XG5cdFx0XHR0aW1lOiAwLjJcblx0XHRALnN0YXRlcy5jb2xsYXBzZWQgPVxuXHRcdFx0c2NhbGVZOiAwXG5cdFx0QC5zdGF0ZXMuZGVmYXVsdCA9XG5cdFx0XHRzY2FsZVk6IDFcblx0XHRALmhlaWdodCA9IDBcblx0XHRALmJhY2tncm91bmRDb2xvciA9IFwidHJhbnNwYXJlbnRcIlxuXHRcdGlmIHRvZ2dsZUxheWVyXG5cdFx0XHRALm5hbWUgPSBcImNvbGxhcHNlX1wiICsgdG9nZ2xlTGF5ZXIubmFtZVxuXHRcdFx0QC50b2dnbGVMYXllciA9IHRvZ2dsZUxheWVyXG5cdFx0dG9nZ2xlTGF5ZXIub24gRXZlbnRzLkNsaWNrLCAoZSxsKSA9PlxuXHRcdFx0XHRALnRvZ2dsZShsKVxuXG5cdFx0QC5yZXNpemVMYXllcnMobGF5ZXJBcnJheSlcblxuXHRcdEAuc29ydExheWVycyhsYXllckFycmF5KVxuXG5cdHJlc2l6ZUxheWVyczogKGxheWVyQXJyYXkpID0+XG5cdFx0bGF5ZXJIZWlnaHRzID0gW11cblx0XHRsYXllcldpZHRocyA9IFtdXG5cdFx0bGF5ZXJNaW5YcyA9IFtdXG5cdFx0bGF5ZXJNaW5ZcyA9IFtdXG5cblx0XHRmb3IgbGF5ZXIgaW4gbGF5ZXJBcnJheVxuXHRcdFx0QC5zdXBlckxheWVyPWxheWVyLnN1cGVyTGF5ZXJcblx0XHRcdEAuaGVpZ2h0ID0gQC5oZWlnaHQgKyBsYXllci5oZWlnaHRcblx0XHRcdGxheWVySGVpZ2h0cy5wdXNoIGxheWVyLmhlaWdodFxuXHRcdFx0bGF5ZXJXaWR0aHMucHVzaCBsYXllci53aWR0aFxuXHRcdFx0bGF5ZXJNaW5Ycy5wdXNoIGxheWVyLm1pblhcblx0XHRcdGxheWVyTWluWXMucHVzaCBsYXllci5taW5ZXG5cblx0XHRALndpZHRoID0gTWF0aC5tYXguYXBwbHkgQCwgKGxheWVyV2lkdGhzKVxuXHRcdEAuaGVpZ2h0ID0gbGF5ZXJIZWlnaHRzLnJlZHVjZSAodCxzKSAtPiB0ICsgc1xuXHRcdEAuZnVsbEhlaWdodCA9IEAuaGVpZ2h0XG5cblx0XHRALnggPSBNYXRoLm1pbi5hcHBseSBALCAobGF5ZXJNaW5Ycylcblx0XHRALnkgPSBNYXRoLm1pbi5hcHBseSBALCAobGF5ZXJNaW5ZcylcblxuXHRcdGZvciBsYXllciBpbiBsYXllckFycmF5XG5cdFx0XHRsYXllci5zdXBlckxheWVyID0gQFxuXHRcdFx0bGF5ZXIucG9pbnQgPVxuXHRcdFx0XHR4OiBsYXllci54LUAueFxuXHRcdFx0XHR5OiBsYXllci55LUAueVxuXG5cdGFkanVzdExheWVyczogKGFkanVzdG1lbnQsIHRvZ2dsZUxheWVyLCBvcmlnaW4pID0+XG5cdFx0aWYgb3JpZ2luLmlkICE9IEAuaWRcblx0XHRcdGZvciBsYXllciBpbiBALmNoaWxkcmVuXG5cdFx0XHRcdGlmIGxheWVyLmlkICE9IG9yaWdpbi5pZFxuXHRcdFx0XHRcdGlmIEAuc29ydGVkTGF5ZXJzLmluZGV4T2YobGF5ZXIpID4gQC5zb3J0ZWRMYXllcnMuaW5kZXhPZihvcmlnaW4pXG5cdFx0XHRcdFx0XHRsYXllci5hbmltYXRlXG5cdFx0XHRcdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0XHRcdFx0eTogbGF5ZXIueSArIGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdFx0dGltZTogMC4yXG5cdFx0XHRcdFx0XHRsYXllci5wYXJlbnQuYW5pbWF0ZVxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDogbGF5ZXIucGFyZW50LmhlaWdodCArIGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdFx0dGltZTogMC4yXG5cdFx0XHRcdGVsc2Vcblx0XHRALnBhcmVudC5hZGp1c3RMYXllcnMoYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbilcblxuXHRjb2xsYXBzZTogKCkgPT4gQC5hbmltYXRlKFwiY29sbGFwc2VkXCIpXG5cblx0ZXhwYW5kOiAoKSA9PiBALmFuaW1hdGUoXCJkZWZhdWx0XCIpXG5cblx0dG9nZ2xlOiAobCkgPT5cblx0XHRALnN0YXRlcy5uZXh0KClcblx0XHRhZGp1c3RtZW50ID0gQC5oZWlnaHRcblx0XHRpZiBALnN0YXRlcy5jdXJyZW50LnNjYWxlWSBpcyAwXG5cdFx0XHRhZGp1c3RtZW50ID0gMCAtIGFkanVzdG1lbnRcblx0XHRlbHNlXG5cdFx0QC5hZGp1c3RMYXllcnMoYWRqdXN0bWVudCwgbCwgQClcblxuXHRzb3J0TGF5ZXJzOiAobGF5ZXJBcnJheSkgPT5cbiAgICBcdGZvciBsYXllck5hbWUsIGxheWVyIG9mIGxheWVyQXJyYXlcbiAgICBcdFx0QC5zb3J0ZWRMYXllcnMucHVzaChsYXllcilcbiAgICBcdFx0QC5zb3J0ZWRMYXllcnMuc29ydCgoYSxiKSAtPiBhLnktYi55KVxuXG5cblxuY2xhc3MgZXhwb3J0cy5OZXN0ZWRMaXN0IGV4dGVuZHMgTGF5ZXJcblx0Y29uc3RydWN0b3I6IChwYXJlbnQsIGxheWVyTGlzdCkgLT5cblx0XHRzdXBlcigpXG5cdFx0bGF5ZXJMaXN0LnNvcnQoKGEsYikgLT4gYS55LWIueSlcblx0XHRALmNvbnRhaW5lciA9IHBhcmVudFxuXHRcdEAuc3VwZXJMYXllciA9IHBhcmVudC5zdXBlckxheWVyXG5cdFx0QC5jb250ZW50ID0gQC5jcmVhdGVIb2xkZXJzKGxheWVyTGlzdClcblx0XHRALmRlcHRoID0gMFxuXHRcdEAuc2l6ZSA9IEAuY29udGVudC5zaXplXG5cdFx0QC5wb2ludCA9IEAuY29udGVudC5wb2ludFxuXHRcdEAubmFtZSA9IFwiTmVzdGVkTGlzdFwiXG5cdGNyZWF0ZUhvbGRlcnM6IChsZXZlbCwgdG9nZ2xlTGF5ZXIpID0+XG5cdFx0Y29sbGFwc2VMYXllcnMgPSBbXVxuXHRcdG5leHRUb2dnbGUgPSBudWxsXG5cdFx0Zm9yIGkgaW4gbGV2ZWxcblx0XHRcdGlmIG5vdCBpWzBdXG5cdFx0XHRcdG5leHRUb2dnbGUgPSBpXG5cdFx0XHRcdGNvbGxhcHNlTGF5ZXJzLnB1c2goaSlcblx0XHRcdGVsc2UgaWYgaVswXVxuXHRcdFx0XHRALmRlcHRoPSBALmRlcHRoKzFcblx0XHRcdFx0Y29sbGFwc2VMYXllcnMucHVzaChALmNyZWF0ZUhvbGRlcnMoaSwgbmV4dFRvZ2dsZSkpXG5cdFx0aWYgdG9nZ2xlTGF5ZXIgaW5zdGFuY2VvZiBMYXllclxuXHRcdFx0QC5kZXB0aCA9IEAuZGVwdGggLSAxXG5cdFx0XHRyZXR1cm4gbmV3IGV4cG9ydHMuQ29sbGFwc2VIb2xkZXIoY29sbGFwc2VMYXllcnMsIHRvZ2dsZUxheWVyKVxuXG5cdFx0QC5yZXNpemVMYXllcnMoY29sbGFwc2VMYXllcnMsIHRydWUpXG5cdFx0QC5sYXllcnMgPSBjb2xsYXBzZUxheWVyc1xuXG5cdHJlc2l6ZUxheWVyczogKGNvbGxhcHNlTGF5ZXJzLCBmaXJzdFRpbWUpID0+XG5cdFx0bGF5ZXJIZWlnaHRzID0gW11cblx0XHRsYXllcldpZHRocyA9IFtdXG5cdFx0bGF5ZXJNaW5YcyA9IFtdXG5cdFx0bGF5ZXJNaW5ZcyA9IFtdXG5cblx0XHRmb3IgbGF5ZXIgaW4gY29sbGFwc2VMYXllcnNcblx0XHRcdEAuaGVpZ2h0ID0gQC5oZWlnaHQgKyBsYXllci5oZWlnaHRcblx0XHRcdGxheWVySGVpZ2h0cy5wdXNoIGxheWVyLmhlaWdodFxuXHRcdFx0bGF5ZXJXaWR0aHMucHVzaCBsYXllci53aWR0aFxuXHRcdFx0bGF5ZXJNaW5Ycy5wdXNoIGxheWVyLm1pblhcblx0XHRcdGxheWVyTWluWXMucHVzaCBsYXllci5taW5ZXG5cblx0XHRALndpZHRoID0gTWF0aC5tYXguYXBwbHkgQCwgKGxheWVyV2lkdGhzKVxuXHRcdEAuaGVpZ2h0ID0gbGF5ZXJIZWlnaHRzLnJlZHVjZSAodCxzKSAtPiB0ICsgc1xuXG5cdFx0aWYgZmlyc3RUaW1lXG5cdFx0XHRALnggPSBALmNvbnRhaW5lci54XG5cdFx0XHRALnkgPSBALmNvbnRhaW5lci55XG5cblx0XHRcdGZvciBsYXllciBpbiBjb2xsYXBzZUxheWVyc1xuXHRcdFx0XHRsYXllci5wYXJlbnQgPSBAXG5cdFx0XHRcdGxheWVyLnN1cGVyTGF5ZXIgPSBAXG5cblx0YWRqdXN0TGF5ZXJzOiAoYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbikgPT5cblx0XHRpZiBvcmlnaW4uaWQgIT0gQC5pZFxuXHRcdFx0Zm9yIGxheWVyIGluIEAuY2hpbGRyZW5cblx0XHRcdFx0aWYgbGF5ZXIuaWQgIT0gb3JpZ2luLmlkIGFuZCBsYXllci5pZCAhPSB0b2dnbGVMYXllci5pZFxuXHRcdFx0XHRcdGlmIGxheWVyLnNjcmVlbkZyYW1lLnkgPj0gb3JpZ2luLnNjcmVlbkZyYW1lLnlcblx0XHRcdFx0XHRcdGxheWVyLmFuaW1hdGVcblx0XHRcdFx0XHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0XHRcdFx0XHR5OiBsYXllci55ICsgYWRqdXN0bWVudFxuXHRcdFx0XHRcdFx0XHR0aW1lOiAwLjJcblxuXHRcdEAuYW5pbWF0ZVxuXHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0aGVpZ2h0OiBALmhlaWdodCArIGFkanVzdG1lbnRcblx0XHRcdHRpbWU6IDAuMlxuXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgQ29sbGFwc2VIb2xkZXIoIFsgbGF5ZXJBcnJheSBdICwgdG9nZ2xlTGF5ZXIgKVxuIyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiNcbiMgQVJHVU1FTlRTXG4jXG4jIGxheWVyQXJyYXlcbiMgLS0tLS0tLS0tLVxuIyBBbiBhcnJheSBvZiBsYXllcnMgdG8gYmUgY29sbGFwc2VkLiB0aGVzZSBhcmUgdGhlIG9uZXMgdGhhdFxuIyBzaG91bGQgYWxsIGRpc2FwcGVhciBpbiBhIGdyb3VwIHRvZ2V0aGVyLlxuIyAhISEhIE5PVEUgISEhIVxuIyB0aGVzZSBsYXllcnMgYWxsIG5lZWQgdG8gaGF2ZSB0aGUgc2FtZSBwYXJlbnQgZm9yIHRoaXMgdG8gd29yayAhISFcbiNcbiMgdG9nZ2xlTGF5ZXJcbiMgLS0tLS0tLS0tLS1cbiMgdGhlIGxheWVyIHlvdSB3YW50IHRvIGNsaWNrIG9uIHRvIHNob3cvaGlkZSB0aGUgbGF5ZXJzIGluXG4jIGxheWVyQXJyYXlcbiNcbiMgU0tFVENIIEZJTEVcbiNcbiMgTXkgZmlsZTpcbiMgaHR0cHM6Ly93d3cuZHJvcGJveC5jb20vcy85ZGFyZ3RteGhobWNyc2wvZXhwYW5kRXhhbXBsZS5za2V0Y2g/ZGw9MFxuI1xuIyBJbiB0aGUgc2tldGNoIGZpbGUsIGVhY2ggcm93IHNob3VsZCBiZSBpbmRlcGVuZGVudCwgYW5kIGVxdWFsIGluIHRoZSBoaWVyYXJjaHkuIExpa2UgdGhpczpcbiMgICB8XG4jICAgKy0+IHJvd18xXG4jICAgKy0+IHJvd18xXzFcbiMgICArLT4gcm93XzFfMV9BXG4jICAgKy0+IHJvd18xXzJcbiMgICArLT4gcm93XzFfM1xuIyAgICstPiByb3dfMlxuIyAgIGV0Yy5cbiNcbiMgQ3JlYXRlIG5lc3RlZCB0cmVlcyBieSBwbGFjaW5nIENvbGxhcHNlSG9sZGVycyBpbnRvIENvbGxhcHNlSG9sZGVyc1xuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFFQUE7QURBQSxJQUFBOzs7O0FBQU0sT0FBTyxDQUFDOzs7RUFDQSx3QkFBQyxVQUFELEVBQWEsV0FBYixFQUEwQixNQUExQjs7Ozs7OztJQUNaLDhDQUFBO0lBQ0EsSUFBQyxDQUFDLE9BQUYsR0FBWTtJQUNaLElBQUMsQ0FBQyxZQUFGLEdBQWU7SUFDZixJQUFDLENBQUMsZ0JBQUYsR0FDQztNQUFBLElBQUEsRUFBTSxHQUFOOztJQUNELElBQUMsQ0FBQyxNQUFNLENBQUMsU0FBVCxHQUNDO01BQUEsTUFBQSxFQUFRLENBQVI7O0lBQ0QsSUFBQyxDQUFDLE1BQU0sQ0FBQyxTQUFELENBQVIsR0FDQztNQUFBLE1BQUEsRUFBUSxDQUFSOztJQUNELElBQUMsQ0FBQyxNQUFGLEdBQVc7SUFDWCxJQUFDLENBQUMsZUFBRixHQUFvQjtJQUNwQixJQUFHLFdBQUg7TUFDQyxJQUFDLENBQUMsSUFBRixHQUFTLFdBQUEsR0FBYyxXQUFXLENBQUM7TUFDbkMsSUFBQyxDQUFDLFdBQUYsR0FBZ0IsWUFGakI7O0lBR0EsV0FBVyxDQUFDLEVBQVosQ0FBZSxNQUFNLENBQUMsS0FBdEIsRUFBNkIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQsRUFBRyxDQUFIO2VBQzNCLEtBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBVDtNQUQyQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0I7SUFHQSxJQUFDLENB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
