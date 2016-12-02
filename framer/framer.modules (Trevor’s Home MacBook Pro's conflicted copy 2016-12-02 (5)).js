require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


},{}],"nestedList":[function(require,module,exports){
CollapseHolder;


},{}],"nestedList":[function(require,module,exports){
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
    var j, k, layer, layerHeights, layerMinXs, layerMinYs, layerWidths, len, len1;
    CollapseHolder.__super__.constructor.call(this);
    this.originY = 0;
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
    for (k = 0, len1 = layerArray.length; k < len1; k++) {
      layer = layerArray[k];
      layer.superLayer = this;
      layer.point = {
        x: layer.x - this.x,
        y: layer.y - this.y
      };
    }
    this.sortLayers(layerArray);
  }

  CollapseHolder.prototype.adjustLayers = function(adjustment, toggleLayer, origin) {
    var j, layer, len, movement, ref;
    print("#COLL###################################################");
    print("Looking at " + this.name + " by request of " + origin.name);
    print(this.id, origin.id, origin.id !== this.id, origin.id === this.id);
    if (origin.id !== this.id) {
      print("Adjusting " + this.name);
      ref = this.children;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
        print(" |  looking at: " + layer.name + " from " + this.name + " by request of " + origin.name);
        if (layer.id !== origin.id) {
          movement = 0;
          if (layer.y > toggleLayer.y) {
            movement = adjustment;
            layer.animate({
              properties: {
                y: layer.y + adjustment
              },
              time: 0.2
            });
            print("parent", layer.parent);
            layer.parent.animate({
              properties: {
                height: layer.parent.height + adjustment
              },
              time: 0.2
            });
          } else {
            print("Not adjusting origin: " + origin.name);
          }
        } else {
          movement = 0;
        }
        print(" |  moving " + layer.name + " by " + movement);
      }
    } else if (origin.toggleLayer.id !== this.id) {
      print("Not Adjusting " + this.name);
    }
    print("DONE -- MOVING TO: " + this.parent.name);
    print("########################################################");
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
    print(this.height);
    adjustment = this.height;
    print(" ");
    print(" ");
    print("CHANGING " + this.name + " TO " + this.states.current.name);
    if (this.states.current.scaleY === 0) {
      print("shrinking", adjustment);
      adjustment = 0 - adjustment;
    } else {
      print("expanding", adjustment);
    }
    return this.adjustLayers(adjustment, l, this);
  };

  CollapseHolder.prototype.sortLayers = function(layerArray) {
    var layer, layerName, results;
    this.sortedLayers = [];
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

  function NestedList(layerList) {
    this.adjustLayers = bind(this.adjustLayers, this);
    this.resizeLayers = bind(this.resizeLayers, this);
    this.createHolders = bind(this.createHolders, this);
    NestedList.__super__.constructor.call(this);
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
    if (typeof toggleLayer !== "undefined") {
      this.depth = this.depth - 1;
      return new exports.CollapseHolder(collapseLayers, toggleLayer);
    }
    this.resizeLayers(collapseLayers);
    return this.layers = collapseLayers;
  };

  NestedList.prototype.resizeLayers = function(collapseLayers) {
    var j, k, layer, layerHeights, layerMinXs, layerMinYs, layerWidths, len, len1, results;
    layerHeights = [];
    layerWidths = [];
    layerMinXs = [];
    layerMinYs = [];
    for (j = 0, len = collapseLayers.length; j < len; j++) {
      layer = collapseLayers[j];
      if (layer.superLayer === !this) {
        this.superLayer = layer.superLayer;
      }
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
    this.x = Math.min.apply(this, layerMinXs);
    this.y = Math.min.apply(this, layerMinYs);
    results = [];
    for (k = 0, len1 = collapseLayers.length; k < len1; k++) {
      layer = collapseLayers[k];
      layer.superLayer = this;
      results.push(layer.point = {
        x: layer.x - this.x,
        y: layer.y - this.y
      });
    }
    return results;
  };

  NestedList.prototype.adjustLayers = function(adjustment, toggleLayer, origin) {
    var j, layer, len, movement, ref;
    print("#NEST###################################################");
    print("Adjustment", adjustment);
    print("Looking at " + this.name + " by request of " + origin.name);
    print("id: " + this.id, "origin: " + origin.id, "=o: " + origin.id === this.id, "=t: " + toggleLayer.id === this.id);
    if (origin.id !== this.id) {
      print("Adjusting " + this.name);
      ref = this.children;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
        print(" |  looking at: " + layer.name + " " + layer.id);
        print(" | |  from " + this.name + " " + this.id);
        print(" | |  by request of " + origin.name);
        print(" | |  clicked on " + toggleLayer.name);
        if (layer.id !== origin.id && layer.id !== toggleLayer.id) {
          print(layer.name, layer.screenFrame.y, " -- ", origin.name, origin.screenFrame.y, adjustment);
          if (layer.screenFrame.y >= origin.screenFrame.y) {
            print(" |  moving " + layer.name + " by " + adjustment);
            layer.animate({
              properties: {
                y: layer.y + adjustment
              },
              time: 0.2
            });
          }
        } else if (layer.id === origin.id) {
          print("Not adjusting origin: " + layer.name);
        } else if (layer.id === toggleLayer.id) {
          print("not adjusting toggleLayer");
        } else {
          movement = 0;
        }
      }
    } else if (origin.toggleLayer.id !== this.id) {
      print("Not Adjusting " + this.name);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvc2hvcnRjdXRzLmNvZmZlZSIsIi4uL21vZHVsZXMvbmVzdGVkTGlzdC5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy90cmV2b3Jjb2xlbWFuL0Ryb3Bib3ggKFBlcnNvbmFsKS9mcmFtZXIvZnJhbWVyLWNvbGxhcHNlSG9sZGVyLmZyYW1lci9tb2R1bGVzL25lc3RlZExpc3QuanMiLCIuLi9tb2R1bGVzL215TW9kdWxlLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIFNob3J0Y3V0cyBmb3IgRnJhbWVyIDEuMFxuICBodHRwOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lclxuXG4gIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuICBSZWFkbWU6XG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lclxuXG4gIExpY2Vuc2U6XG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lci9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4jIyNcblxuXG5cblxuIyMjXG4gIENPTkZJR1VSQVRJT05cbiMjI1xuXG5zaG9ydGN1dHMgPSB7fVxuXG5GcmFtZXIuRGVmYXVsdHMuRmFkZUFuaW1hdGlvbiA9XG4gIGN1cnZlOiBcImJlemllci1jdXJ2ZVwiXG4gIHRpbWU6IDAuMlxuXG5GcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24gPVxuICBjdXJ2ZTogXCJzcHJpbmcoNDAwLDQwLDApXCJcblxuXG5cbiMjI1xuICBMT09QIE9OIEVWRVJZIExBWUVSXG5cbiAgU2hvcnRoYW5kIGZvciBhcHBseWluZyBhIGZ1bmN0aW9uIHRvIGV2ZXJ5IGxheWVyIGluIHRoZSBkb2N1bWVudC5cblxuICBFeGFtcGxlOlxuICBgYGBzaG9ydGN1dHMuZXZlcnlMYXllcihmdW5jdGlvbihsYXllcikge1xuICAgIGxheWVyLnZpc2libGUgPSBmYWxzZTtcbiAgfSk7YGBgXG4jIyNcbnNob3J0Y3V0cy5ldmVyeUxheWVyID0gKGZuKSAtPlxuICBmb3IgbGF5ZXJOYW1lIG9mIHdpbmRvdy5MYXllcnNcbiAgICBfbGF5ZXIgPSB3aW5kb3cuTGF5ZXJzW2xheWVyTmFtZV1cbiAgICBmbiBfbGF5ZXJcblxuXG4jIyNcbiAgU0hPUlRIQU5EIEZPUiBBQ0NFU1NJTkcgTEFZRVJTXG5cbiAgQ29udmVydCBlYWNoIGxheWVyIGNvbWluZyBmcm9tIHRoZSBleHBvcnRlciBpbnRvIGEgSmF2YXNjcmlwdCBvYmplY3QgZm9yIHNob3J0aGFuZCBhY2Nlc3MuXG5cbiAgVGhpcyBoYXMgdG8gYmUgY2FsbGVkIG1hbnVhbGx5IGluIEZyYW1lcjMgYWZ0ZXIgeW91J3ZlIHJhbiB0aGUgaW1wb3J0ZXIuXG5cbiAgbXlMYXllcnMgPSBGcmFtZXIuSW1wb3J0ZXIubG9hZChcIi4uLlwiKVxuICBzaG9ydGN1dHMuaW5pdGlhbGl6ZShteUxheWVycylcblxuICBJZiB5b3UgaGF2ZSBhIGxheWVyIGluIHlvdXIgUFNEL1NrZXRjaCBjYWxsZWQgXCJOZXdzRmVlZFwiLCB0aGlzIHdpbGwgY3JlYXRlIGEgZ2xvYmFsIEphdmFzY3JpcHQgdmFyaWFibGUgY2FsbGVkIFwiTmV3c0ZlZWRcIiB0aGF0IHlvdSBjYW4gbWFuaXB1bGF0ZSB3aXRoIEZyYW1lci5cblxuICBFeGFtcGxlOlxuICBgTmV3c0ZlZWQudmlzaWJsZSA9IGZhbHNlO2BcblxuICBOb3RlczpcbiAgSmF2YXNjcmlwdCBoYXMgc29tZSBuYW1lcyByZXNlcnZlZCBmb3IgaW50ZXJuYWwgZnVuY3Rpb24gdGhhdCB5b3UgY2FuJ3Qgb3ZlcnJpZGUgKGZvciBleC4gKVxuICBJZiB5b3UgY2FsbCBpbml0aWFsaXplIHdpdGhvdXQgYW55dGhpbmcsIGl0IHdpbGwgdXNlIGFsbCBjdXJyZW50bHkgYXZhaWxhYmxlIGxheWVycy5cbiMjI1xuc2hvcnRjdXRzLmluaXRpYWxpemUgPSAobGF5ZXJzKSAtPlxuXG4gIGxheWVyID0gRnJhbWVyLkN1cnJlbnRDb250ZXh0Ll9sYXllckxpc3QgaWYgbm90IGxheWVyc1xuXG4gIHdpbmRvdy5MYXllcnMgPSBsYXllcnNcblxuICBzaG9ydGN1dHMuZXZlcnlMYXllciAobGF5ZXIpIC0+XG4gICAgc2FuaXRpemVkTGF5ZXJOYW1lID0gbGF5ZXIubmFtZS5yZXBsYWNlKC9bLSshPzoqXFxbXFxdXFwoXFwpXFwvXS9nLCAnJykudHJpbSgpLnJlcGxhY2UoL1xccy9nLCAnXycpXG4gICAgd2luZG93W3Nhbml0aXplZExheWVyTmFtZV0gPSBsYXllclxuICAgIHNob3J0Y3V0cy5zYXZlT3JpZ2luYWxGcmFtZSBsYXllclxuICAgIHNob3J0Y3V0cy5pbml0aWFsaXplVG91Y2hTdGF0ZXMgbGF5ZXJcblxuXG4jIyNcbiAgRklORCBDSElMRCBMQVlFUlMgQlkgTkFNRVxuXG4gIFJldHJpZXZlcyBzdWJMYXllcnMgb2Ygc2VsZWN0ZWQgbGF5ZXIgdGhhdCBoYXZlIGEgbWF0Y2hpbmcgbmFtZS5cblxuICBnZXRDaGlsZDogcmV0dXJuIHRoZSBmaXJzdCBzdWJsYXllciB3aG9zZSBuYW1lIGluY2x1ZGVzIHRoZSBnaXZlbiBzdHJpbmdcbiAgZ2V0Q2hpbGRyZW46IHJldHVybiBhbGwgc3ViTGF5ZXJzIHRoYXQgbWF0Y2hcblxuICBVc2VmdWwgd2hlbiBlZy4gaXRlcmF0aW5nIG92ZXIgdGFibGUgY2VsbHMuIFVzZSBnZXRDaGlsZCB0byBhY2Nlc3MgdGhlIGJ1dHRvbiBmb3VuZCBpbiBlYWNoIGNlbGwuIFRoaXMgaXMgKipjYXNlIGluc2Vuc2l0aXZlKiouXG5cbiAgRXhhbXBsZTpcbiAgYHRvcExheWVyID0gTmV3c0ZlZWQuZ2V0Q2hpbGQoXCJUb3BcIilgIExvb2tzIGZvciBsYXllcnMgd2hvc2UgbmFtZSBtYXRjaGVzIFRvcC4gUmV0dXJucyB0aGUgZmlyc3QgbWF0Y2hpbmcgbGF5ZXIuXG5cbiAgYGNoaWxkTGF5ZXJzID0gVGFibGUuZ2V0Q2hpbGRyZW4oXCJDZWxsXCIpYCBSZXR1cm5zIGFsbCBjaGlsZHJlbiB3aG9zZSBuYW1lIG1hdGNoIENlbGwgaW4gYW4gYXJyYXkuXG4jIyNcbkxheWVyOjpnZXRDaGlsZCA9IChuZWVkbGUsIHJlY3Vyc2l2ZSA9IGZhbHNlKSAtPlxuICAjIFNlYXJjaCBkaXJlY3QgY2hpbGRyZW5cbiAgZm9yIHN1YkxheWVyIGluIEBzdWJMYXllcnNcbiAgICByZXR1cm4gc3ViTGF5ZXIgaWYgc3ViTGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobmVlZGxlLnRvTG93ZXJDYXNlKCkpIGlzbnQgLTEgXG5cbiAgIyBSZWN1cnNpdmVseSBzZWFyY2ggY2hpbGRyZW4gb2YgY2hpbGRyZW5cbiAgaWYgcmVjdXJzaXZlXG4gICAgZm9yIHN1YkxheWVyIGluIEBzdWJMYXllcnNcbiAgICAgIHJldHVybiBzdWJMYXllci5nZXRDaGlsZChuZWVkbGUsIHJlY3Vyc2l2ZSkgaWYgc3ViTGF5ZXIuZ2V0Q2hpbGQobmVlZGxlLCByZWN1cnNpdmUpIFxuXG5cbkxheWVyOjpnZXRDaGlsZHJlbiA9IChuZWVkbGUsIHJlY3Vyc2l2ZSA9IGZhbHNlKSAtPlxuICByZXN1bHRzID0gW11cblxuICBpZiByZWN1cnNpdmVcbiAgICBmb3Igc3ViTGF5ZXIgaW4gQHN1YkxheWVyc1xuICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0IHN1YkxheWVyLmdldENoaWxkcmVuKG5lZWRsZSwgcmVjdXJzaXZlKVxuICAgIHJlc3VsdHMucHVzaCBAIGlmIEBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihuZWVkbGUudG9Mb3dlckNhc2UoKSkgaXNudCAtMVxuICAgIHJldHVybiByZXN1bHRzXG5cbiAgZWxzZVxuICAgIGZvciBzdWJMYXllciBpbiBAc3ViTGF5ZXJzXG4gICAgICBpZiBzdWJMYXllci5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihuZWVkbGUudG9Mb3dlckNhc2UoKSkgaXNudCAtMSBcbiAgICAgICAgcmVzdWx0cy5wdXNoIHN1YkxheWVyIFxuICAgIHJldHVybiByZXN1bHRzXG5cblxuXG4jIyNcbiAgQ09OVkVSVCBBIE5VTUJFUiBSQU5HRSBUTyBBTk9USEVSXG5cbiAgQ29udmVydHMgYSBudW1iZXIgd2l0aGluIG9uZSByYW5nZSB0byBhbm90aGVyIHJhbmdlXG5cbiAgRXhhbXBsZTpcbiAgV2Ugd2FudCB0byBtYXAgdGhlIG9wYWNpdHkgb2YgYSBsYXllciB0byBpdHMgeCBsb2NhdGlvbi5cblxuICBUaGUgb3BhY2l0eSB3aWxsIGJlIDAgaWYgdGhlIFggY29vcmRpbmF0ZSBpcyAwLCBhbmQgaXQgd2lsbCBiZSAxIGlmIHRoZSBYIGNvb3JkaW5hdGUgaXMgNjQwLiBBbGwgdGhlIFggY29vcmRpbmF0ZXMgaW4gYmV0d2VlbiB3aWxsIHJlc3VsdCBpbiBpbnRlcm1lZGlhdGUgdmFsdWVzIGJldHdlZW4gMCBhbmQgMS5cblxuICBgbXlMYXllci5vcGFjaXR5ID0gY29udmVydFJhbmdlKDAsIDY0MCwgbXlMYXllci54LCAwLCAxKWBcblxuICBCeSBkZWZhdWx0LCB0aGlzIHZhbHVlIG1pZ2h0IGJlIG91dHNpZGUgdGhlIGJvdW5kcyBvZiBOZXdNaW4gYW5kIE5ld01heCBpZiB0aGUgT2xkVmFsdWUgaXMgb3V0c2lkZSBPbGRNaW4gYW5kIE9sZE1heC4gSWYgeW91IHdhbnQgdG8gY2FwIHRoZSBmaW5hbCB2YWx1ZSB0byBOZXdNaW4gYW5kIE5ld01heCwgc2V0IGNhcHBlZCB0byB0cnVlLlxuICBNYWtlIHN1cmUgTmV3TWluIGlzIHNtYWxsZXIgdGhhbiBOZXdNYXggaWYgeW91J3JlIHVzaW5nIHRoaXMuIElmIHlvdSBuZWVkIGFuIGludmVyc2UgcHJvcG9ydGlvbiwgdHJ5IHN3YXBwaW5nIE9sZE1pbiBhbmQgT2xkTWF4LlxuIyMjXG5zaG9ydGN1dHMuY29udmVydFJhbmdlID0gKE9sZE1pbiwgT2xkTWF4LCBPbGRWYWx1ZSwgTmV3TWluLCBOZXdNYXgsIGNhcHBlZCkgLT5cbiAgT2xkUmFuZ2UgPSAoT2xkTWF4IC0gT2xkTWluKVxuICBOZXdSYW5nZSA9IChOZXdNYXggLSBOZXdNaW4pXG4gIE5ld1ZhbHVlID0gKCgoT2xkVmFsdWUgLSBPbGRNaW4pICogTmV3UmFuZ2UpIC8gT2xkUmFuZ2UpICsgTmV3TWluXG5cbiAgaWYgY2FwcGVkXG4gICAgaWYgTmV3VmFsdWUgPiBOZXdNYXhcbiAgICAgIE5ld01heFxuICAgIGVsc2UgaWYgTmV3VmFsdWUgPCBOZXdNaW5cbiAgICAgIE5ld01pblxuICAgIGVsc2VcbiAgICAgIE5ld1ZhbHVlXG4gIGVsc2VcbiAgICBOZXdWYWx1ZVxuXG5cbiMjI1xuICBPUklHSU5BTCBGUkFNRVxuXG4gIFN0b3JlcyB0aGUgaW5pdGlhbCBsb2NhdGlvbiBhbmQgc2l6ZSBvZiBhIGxheWVyIGluIHRoZSBcIm9yaWdpbmFsRnJhbWVcIiBhdHRyaWJ1dGUsIHNvIHlvdSBjYW4gcmV2ZXJ0IHRvIGl0IGxhdGVyIG9uLlxuXG4gIEV4YW1wbGU6XG4gIFRoZSB4IGNvb3JkaW5hdGUgb2YgTXlMYXllciBpcyBpbml0aWFsbHkgNDAwIChmcm9tIHRoZSBQU0QpXG5cbiAgYGBgTXlMYXllci54ID0gMjAwOyAvLyBub3cgd2Ugc2V0IGl0IHRvIDIwMC5cbiAgTXlMYXllci54ID0gTXlMYXllci5vcmlnaW5hbEZyYW1lLnggLy8gbm93IHdlIHNldCBpdCBiYWNrIHRvIGl0cyBvcmlnaW5hbCB2YWx1ZSwgNDAwLmBgYFxuIyMjXG5zaG9ydGN1dHMuc2F2ZU9yaWdpbmFsRnJhbWUgPSAobGF5ZXIpIC0+XG4gIGxheWVyLm9yaWdpbmFsRnJhbWUgPSBsYXllci5mcmFtZVxuXG4jIyNcbiAgU0hPUlRIQU5EIEhPVkVSIFNZTlRBWFxuXG4gIFF1aWNrbHkgZGVmaW5lIGZ1bmN0aW9ucyB0aGF0IHNob3VsZCBydW4gd2hlbiBJIGhvdmVyIG92ZXIgYSBsYXllciwgYW5kIGhvdmVyIG91dC5cblxuICBFeGFtcGxlOlxuICBgTXlMYXllci5ob3ZlcihmdW5jdGlvbigpIHsgT3RoZXJMYXllci5zaG93KCkgfSwgZnVuY3Rpb24oKSB7IE90aGVyTGF5ZXIuaGlkZSgpIH0pO2BcbiMjI1xuTGF5ZXI6OmhvdmVyID0gKGVudGVyRnVuY3Rpb24sIGxlYXZlRnVuY3Rpb24pIC0+XG4gIHRoaXMub24gJ21vdXNlZW50ZXInLCBlbnRlckZ1bmN0aW9uXG4gIHRoaXMub24gJ21vdXNlbGVhdmUnLCBsZWF2ZUZ1bmN0aW9uXG5cblxuIyMjXG4gIFNIT1JUSEFORCBUQVAgU1lOVEFYXG5cbiAgSW5zdGVhZCBvZiBgTXlMYXllci5vbihFdmVudHMuVG91Y2hFbmQsIGhhbmRsZXIpYCwgdXNlIGBNeUxheWVyLnRhcChoYW5kbGVyKWBcbiMjI1xuXG5MYXllcjo6dGFwID0gKGhhbmRsZXIpIC0+XG4gIHRoaXMub24gRXZlbnRzLlRvdWNoRW5kLCBoYW5kbGVyXG5cblxuIyMjXG4gIFNIT1JUSEFORCBDTElDSyBTWU5UQVhcblxuICBJbnN0ZWFkIG9mIGBNeUxheWVyLm9uKEV2ZW50cy5DbGljaywgaGFuZGxlcilgLCB1c2UgYE15TGF5ZXIuY2xpY2soaGFuZGxlcilgXG4jIyNcblxuTGF5ZXI6OmNsaWNrID0gKGhhbmRsZXIpIC0+XG4gIHRoaXMub24gRXZlbnRzLkNsaWNrLCBoYW5kbGVyXG5cblxuXG4jIyNcbiAgU0hPUlRIQU5EIEFOSU1BVElPTiBTWU5UQVhcblxuICBBIHNob3J0ZXIgYW5pbWF0aW9uIHN5bnRheCB0aGF0IG1pcnJvcnMgdGhlIGpRdWVyeSBzeW50YXg6XG4gIGxheWVyLmFuaW1hdGUocHJvcGVydGllcywgW3RpbWVdLCBbY3VydmVdLCBbY2FsbGJhY2tdKVxuXG4gIEFsbCBwYXJhbWV0ZXJzIGV4Y2VwdCBwcm9wZXJ0aWVzIGFyZSBvcHRpb25hbCBhbmQgY2FuIGJlIG9taXR0ZWQuXG5cbiAgT2xkOlxuICBgYGBNeUxheWVyLmFuaW1hdGUoe1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHg6IDUwMFxuICAgIH0sXG4gICAgdGltZTogNTAwLFxuICAgIGN1cnZlOiAnYmV6aWVyLWN1cnZlJ1xuICB9KWBgYFxuXG4gIE5ldzpcbiAgYGBgTXlMYXllci5hbmltYXRlVG8oe1xuICAgIHg6IDUwMFxuICB9KWBgYFxuXG4gIE9wdGlvbmFsbHkgKHdpdGggMTAwMG1zIGR1cmF0aW9uIGFuZCBzcHJpbmcpOlxuICAgIGBgYE15TGF5ZXIuYW5pbWF0ZVRvKHtcbiAgICB4OiA1MDBcbiAgfSwgMTAwMCwgXCJzcHJpbmcoMTAwLDEwLDApXCIpXG4jIyNcblxuXG5cbkxheWVyOjphbmltYXRlVG8gPSAocHJvcGVydGllcywgZmlyc3QsIHNlY29uZCwgdGhpcmQpIC0+XG4gIHRoaXNMYXllciA9IHRoaXNcbiAgdGltZSA9IGN1cnZlID0gY2FsbGJhY2sgPSBudWxsXG5cbiAgaWYgdHlwZW9mKGZpcnN0KSA9PSBcIm51bWJlclwiXG4gICAgdGltZSA9IGZpcnN0XG4gICAgaWYgdHlwZW9mKHNlY29uZCkgPT0gXCJzdHJpbmdcIlxuICAgICAgY3VydmUgPSBzZWNvbmRcbiAgICAgIGNhbGxiYWNrID0gdGhpcmRcbiAgICBjYWxsYmFjayA9IHNlY29uZCBpZiB0eXBlb2Yoc2Vjb25kKSA9PSBcImZ1bmN0aW9uXCJcbiAgZWxzZSBpZiB0eXBlb2YoZmlyc3QpID09IFwic3RyaW5nXCJcbiAgICBjdXJ2ZSA9IGZpcnN0XG4gICAgY2FsbGJhY2sgPSBzZWNvbmQgaWYgdHlwZW9mKHNlY29uZCkgPT0gXCJmdW5jdGlvblwiXG4gIGVsc2UgaWYgdHlwZW9mKGZpcnN0KSA9PSBcImZ1bmN0aW9uXCJcbiAgICBjYWxsYmFjayA9IGZpcnN0XG5cbiAgaWYgdGltZT8gJiYgIWN1cnZlP1xuICAgIGN1cnZlID0gJ2Jlemllci1jdXJ2ZSdcbiAgXG4gIGN1cnZlID0gRnJhbWVyLkRlZmF1bHRzLkFuaW1hdGlvbi5jdXJ2ZSBpZiAhY3VydmU/XG4gIHRpbWUgPSBGcmFtZXIuRGVmYXVsdHMuQW5pbWF0aW9uLnRpbWUgaWYgIXRpbWU/XG5cbiAgdGhpc0xheWVyLmFuaW1hdGlvblRvID0gbmV3IEFuaW1hdGlvblxuICAgIGxheWVyOiB0aGlzTGF5ZXJcbiAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzXG4gICAgY3VydmU6IGN1cnZlXG4gICAgdGltZTogdGltZVxuXG4gIHRoaXNMYXllci5hbmltYXRpb25Uby5vbiAnc3RhcnQnLCAtPlxuICAgIHRoaXNMYXllci5pc0FuaW1hdGluZyA9IHRydWVcblxuICB0aGlzTGF5ZXIuYW5pbWF0aW9uVG8ub24gJ2VuZCcsIC0+XG4gICAgdGhpc0xheWVyLmlzQW5pbWF0aW5nID0gbnVsbFxuICAgIGlmIGNhbGxiYWNrP1xuICAgICAgY2FsbGJhY2soKVxuXG4gIHRoaXNMYXllci5hbmltYXRpb25Uby5zdGFydCgpXG5cbiMjI1xuICBBTklNQVRFIE1PQklMRSBMQVlFUlMgSU4gQU5EIE9VVCBPRiBUSEUgVklFV1BPUlRcblxuICBTaG9ydGhhbmQgc3ludGF4IGZvciBhbmltYXRpbmcgbGF5ZXJzIGluIGFuZCBvdXQgb2YgdGhlIHZpZXdwb3J0LiBBc3N1bWVzIHRoYXQgdGhlIGxheWVyIHlvdSBhcmUgYW5pbWF0aW5nIGlzIGEgd2hvbGUgc2NyZWVuIGFuZCBoYXMgdGhlIHNhbWUgZGltZW5zaW9ucyBhcyB5b3VyIGNvbnRhaW5lci5cblxuICBFbmFibGUgdGhlIGRldmljZSBwcmV2aWV3IGluIEZyYW1lciBTdHVkaW8gdG8gdXNlIHRoaXMg4oCTwqBpdCBsZXRzIHRoaXMgc2NyaXB0IGZpZ3VyZSBvdXQgd2hhdCB0aGUgYm91bmRzIG9mIHlvdXIgc2NyZWVuIGFyZS5cblxuICBFeGFtcGxlOlxuICAqIGBNeUxheWVyLnNsaWRlVG9MZWZ0KClgIHdpbGwgYW5pbWF0ZSB0aGUgbGF5ZXIgKip0byoqIHRoZSBsZWZ0IGNvcm5lciBvZiB0aGUgc2NyZWVuIChmcm9tIGl0cyBjdXJyZW50IHBvc2l0aW9uKVxuXG4gICogYE15TGF5ZXIuc2xpZGVGcm9tTGVmdCgpYCB3aWxsIGFuaW1hdGUgdGhlIGxheWVyIGludG8gdGhlIHZpZXdwb3J0ICoqZnJvbSoqIHRoZSBsZWZ0IGNvcm5lciAoZnJvbSB4PS13aWR0aClcblxuICBDb25maWd1cmF0aW9uOlxuICAqIChCeSBkZWZhdWx0IHdlIHVzZSBhIHNwcmluZyBjdXJ2ZSB0aGF0IGFwcHJveGltYXRlcyBpT1MuIFRvIHVzZSBhIHRpbWUgZHVyYXRpb24sIGNoYW5nZSB0aGUgY3VydmUgdG8gYmV6aWVyLWN1cnZlLilcbiAgKiBGcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24udGltZVxuICAqIEZyYW1lci5EZWZhdWx0cy5TbGlkZUFuaW1hdGlvbi5jdXJ2ZVxuXG5cbiAgSG93IHRvIHJlYWQgdGhlIGNvbmZpZ3VyYXRpb246XG4gIGBgYHNsaWRlRnJvbUxlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiICAgICAvLyBhbmltYXRlIGFsb25nIHRoZSBYIGF4aXNcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIGZyb206IC0xICAgICAgICAgIC8vIHN0YXJ0IHZhbHVlOiBvdXRzaWRlIHRoZSBsZWZ0IGNvcm5lciAoIHggPSAtd2lkdGhfcGhvbmUgKVxuICAgIHRvOiAwICAgICAgICAgICAgIC8vIGVuZCB2YWx1ZTogaW5zaWRlIHRoZSBsZWZ0IGNvcm5lciAoIHggPSB3aWR0aF9sYXllciApXG4gIGBgYFxuIyMjXG5cblxuc2hvcnRjdXRzLnNsaWRlQW5pbWF0aW9ucyA9XG4gIHNsaWRlRnJvbUxlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICBmcm9tOiAtMVxuICAgIHRvOiAwXG5cbiAgc2xpZGVUb0xlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICB0bzogLTFcblxuICBzbGlkZUZyb21SaWdodDpcbiAgICBwcm9wZXJ0eTogXCJ4XCJcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIGZyb206IDFcbiAgICB0bzogMFxuXG4gIHNsaWRlVG9SaWdodDpcbiAgICBwcm9wZXJ0eTogXCJ4XCJcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIHRvOiAxXG5cbiAgc2xpZGVGcm9tVG9wOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIGZyb206IC0xXG4gICAgdG86IDBcblxuICBzbGlkZVRvVG9wOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIHRvOiAtMVxuXG4gIHNsaWRlRnJvbUJvdHRvbTpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICBmcm9tOiAxXG4gICAgdG86IDBcblxuICBzbGlkZVRvQm90dG9tOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIHRvOiAxXG5cblxuXG5fLmVhY2ggc2hvcnRjdXRzLnNsaWRlQW5pbWF0aW9ucywgKG9wdHMsIG5hbWUpIC0+XG4gIExheWVyLnByb3RvdHlwZVtuYW1lXSA9ICh0aW1lKSAtPlxuICAgIF9waG9uZSA9IEZyYW1lci5EZXZpY2U/LnNjcmVlbj8uZnJhbWVcblxuICAgIHVubGVzcyBfcGhvbmVcbiAgICAgIGVyciA9IFwiUGxlYXNlIHNlbGVjdCBhIGRldmljZSBwcmV2aWV3IGluIEZyYW1lciBTdHVkaW8gdG8gdXNlIHRoZSBzbGlkZSBwcmVzZXQgYW5pbWF0aW9ucy5cIlxuICAgICAgcHJpbnQgZXJyXG4gICAgICBjb25zb2xlLmxvZyBlcnJcbiAgICAgIHJldHVyblxuXG4gICAgX3Byb3BlcnR5ID0gb3B0cy5wcm9wZXJ0eVxuICAgIF9mYWN0b3IgPSBfcGhvbmVbb3B0cy5mYWN0b3JdXG5cbiAgICBpZiBvcHRzLmZyb20/XG4gICAgICAjIEluaXRpYXRlIHRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgYW5pbWF0aW9uIChpLmUuIG9mZiBzY3JlZW4gb24gdGhlIGxlZnQgY29ybmVyKVxuICAgICAgdGhpc1tfcHJvcGVydHldID0gb3B0cy5mcm9tICogX2ZhY3RvclxuXG4gICAgIyBEZWZhdWx0IGFuaW1hdGlvbiBzeW50YXggbGF5ZXIuYW5pbWF0ZSh7X3Byb3BlcnR5OiAwfSkgd291bGQgdHJ5IHRvIGFuaW1hdGUgJ19wcm9wZXJ0eScgbGl0ZXJhbGx5LCBpbiBvcmRlciBmb3IgaXQgdG8gYmxvdyB1cCB0byB3aGF0J3MgaW4gaXQgKGVnIHgpLCB3ZSB1c2UgdGhpcyBzeW50YXhcbiAgICBfYW5pbWF0aW9uQ29uZmlnID0ge31cbiAgICBfYW5pbWF0aW9uQ29uZmlnW19wcm9wZXJ0eV0gPSBvcHRzLnRvICogX2ZhY3RvclxuXG4gICAgaWYgdGltZVxuICAgICAgX3RpbWUgPSB0aW1lXG4gICAgICBfY3VydmUgPSBcImJlemllci1jdXJ2ZVwiXG4gICAgZWxzZVxuICAgICAgX3RpbWUgPSBGcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24udGltZVxuICAgICAgX2N1cnZlID0gRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uLmN1cnZlXG5cbiAgICB0aGlzLmFuaW1hdGVcbiAgICAgIHByb3BlcnRpZXM6IF9hbmltYXRpb25Db25maWdcbiAgICAgIHRpbWU6IF90aW1lXG4gICAgICBjdXJ2ZTogX2N1cnZlXG5cblxuXG4jIyNcbiAgRUFTWSBGQURFIElOIC8gRkFERSBPVVRcblxuICAuc2hvdygpIGFuZCAuaGlkZSgpIGFyZSBzaG9ydGN1dHMgdG8gYWZmZWN0IG9wYWNpdHkgYW5kIHBvaW50ZXIgZXZlbnRzLiBUaGlzIGlzIGVzc2VudGlhbGx5IHRoZSBzYW1lIGFzIGhpZGluZyB3aXRoIGB2aXNpYmxlID0gZmFsc2VgIGJ1dCBjYW4gYmUgYW5pbWF0ZWQuXG5cbiAgLmZhZGVJbigpIGFuZCAuZmFkZU91dCgpIGFyZSBzaG9ydGN1dHMgdG8gZmFkZSBpbiBhIGhpZGRlbiBsYXllciwgb3IgZmFkZSBvdXQgYSB2aXNpYmxlIGxheWVyLlxuXG4gIFRoZXNlIHNob3J0Y3V0cyB3b3JrIG9uIGluZGl2aWR1YWwgbGF5ZXIgb2JqZWN0cyBhcyB3ZWxsIGFzIGFuIGFycmF5IG9mIGxheWVycy5cblxuICBFeGFtcGxlOlxuICAqIGBNeUxheWVyLmZhZGVJbigpYCB3aWxsIGZhZGUgaW4gTXlMYXllciB1c2luZyBkZWZhdWx0IHRpbWluZy5cbiAgKiBgW015TGF5ZXIsIE90aGVyTGF5ZXJdLmZhZGVPdXQoNClgIHdpbGwgZmFkZSBvdXQgYm90aCBNeUxheWVyIGFuZCBPdGhlckxheWVyIG92ZXIgNCBzZWNvbmRzLlxuXG4gIFRvIGN1c3RvbWl6ZSB0aGUgZmFkZSBhbmltYXRpb24sIGNoYW5nZSB0aGUgdmFyaWFibGVzIHRpbWUgYW5kIGN1cnZlIGluc2lkZSBgRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb25gLlxuIyMjXG5MYXllcjo6c2hvdyA9IC0+XG4gIEBvcGFjaXR5ID0gMVxuICBAc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJ1xuICBAXG5cbkxheWVyOjpoaWRlID0gLT5cbiAgQG9wYWNpdHkgPSAwXG4gIEBzdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnXG4gIEBcblxuTGF5ZXI6OmZhZGVJbiA9ICh0aW1lID0gRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24udGltZSkgLT5cbiAgcmV0dXJuIGlmIEBvcGFjaXR5ID09IDFcblxuICB1bmxlc3MgQHZpc2libGVcbiAgICBAb3BhY2l0eSA9IDBcbiAgICBAdmlzaWJsZSA9IHRydWVcblxuICBAYW5pbWF0ZVRvIG9wYWNpdHk6IDEsIHRpbWUsIEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uLmN1cnZlXG5cbkxheWVyOjpmYWRlT3V0ID0gKHRpbWUgPSBGcmFtZXIuRGVmYXVsdHMuRmFkZUFuaW1hdGlvbi50aW1lKSAtPlxuICByZXR1cm4gaWYgQG9wYWNpdHkgPT0gMFxuXG4gIHRoYXQgPSBAXG4gIEBhbmltYXRlVG8gb3BhY2l0eTogMCwgdGltZSwgRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24uY3VydmUsIC0+IHRoYXQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJ1xuXG4jIGFsbCBvZiB0aGUgZWFzeSBpbi9vdXQgaGVscGVycyB3b3JrIG9uIGFuIGFycmF5IG9mIHZpZXdzIGFzIHdlbGwgYXMgaW5kaXZpZHVhbCB2aWV3c1xuXy5lYWNoIFsnc2hvdycsICdoaWRlJywgJ2ZhZGVJbicsICdmYWRlT3V0J10sIChmblN0cmluZyktPiAgXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBBcnJheS5wcm90b3R5cGUsIGZuU3RyaW5nLCBcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIHZhbHVlOiAodGltZSkgLT5cbiAgICAgIF8uZWFjaCBALCAobGF5ZXIpIC0+XG4gICAgICAgIExheWVyLnByb3RvdHlwZVtmblN0cmluZ10uY2FsbChsYXllciwgdGltZSkgaWYgbGF5ZXIgaW5zdGFuY2VvZiBMYXllclxuICAgICAgQFxuXG5cbiMjI1xuICBFQVNZIEhPVkVSIEFORCBUT1VDSC9DTElDSyBTVEFURVMgRk9SIExBWUVSU1xuXG4gIEJ5IG5hbWluZyB5b3VyIGxheWVyIGhpZXJhcmNoeSBpbiB0aGUgZm9sbG93aW5nIHdheSwgeW91IGNhbiBhdXRvbWF0aWNhbGx5IGhhdmUgeW91ciBsYXllcnMgcmVhY3QgdG8gaG92ZXJzLCBjbGlja3Mgb3IgdGFwcy5cblxuICBCdXR0b25fdG91Y2hhYmxlXG4gIC0gQnV0dG9uX2RlZmF1bHQgKGRlZmF1bHQgc3RhdGUpXG4gIC0gQnV0dG9uX2Rvd24gKHRvdWNoL2NsaWNrIHN0YXRlKVxuICAtIEJ1dHRvbl9ob3ZlciAoaG92ZXIpXG4jIyNcblxuc2hvcnRjdXRzLmluaXRpYWxpemVUb3VjaFN0YXRlcyA9IChsYXllcikgLT5cbiAgX2RlZmF1bHQgPSBsYXllci5nZXRDaGlsZCgnZGVmYXVsdCcpXG5cbiAgaWYgbGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ3RvdWNoYWJsZScpIGFuZCBfZGVmYXVsdFxuXG4gICAgdW5sZXNzIEZyYW1lci5VdGlscy5pc01vYmlsZSgpXG4gICAgICBfaG92ZXIgPSBsYXllci5nZXRDaGlsZCgnaG92ZXInKVxuICAgIF9kb3duID0gbGF5ZXIuZ2V0Q2hpbGQoJ2Rvd24nKVxuXG4gICAgIyBUaGVzZSBsYXllcnMgc2hvdWxkIGJlIGhpZGRlbiBieSBkZWZhdWx0XG4gICAgX2hvdmVyPy5oaWRlKClcbiAgICBfZG93bj8uaGlkZSgpXG5cbiAgICAjIENyZWF0ZSBmYWtlIGhpdCB0YXJnZXQgKHNvIHdlIGRvbid0IHJlLWZpcmUgZXZlbnRzKVxuICAgIGlmIF9ob3ZlciBvciBfZG93blxuICAgICAgaGl0VGFyZ2V0ID0gbmV3IExheWVyXG4gICAgICAgIGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCdcbiAgICAgICAgZnJhbWU6IF9kZWZhdWx0LmZyYW1lXG5cbiAgICAgIGhpdFRhcmdldC5zdXBlckxheWVyID0gbGF5ZXJcbiAgICAgIGhpdFRhcmdldC5icmluZ1RvRnJvbnQoKVxuXG4gICAgIyBUaGVyZSBpcyBhIGhvdmVyIHN0YXRlLCBzbyBkZWZpbmUgaG92ZXIgZXZlbnRzIChub3QgZm9yIG1vYmlsZSlcbiAgICBpZiBfaG92ZXJcbiAgICAgIGxheWVyLmhvdmVyIC0+XG4gICAgICAgIF9kZWZhdWx0LmhpZGUoKVxuICAgICAgICBfaG92ZXIuc2hvdygpXG4gICAgICAsIC0+XG4gICAgICAgIF9kZWZhdWx0LnNob3coKVxuICAgICAgICBfaG92ZXIuaGlkZSgpXG5cbiAgICAjIFRoZXJlIGlzIGEgZG93biBzdGF0ZSwgc28gZGVmaW5lIGRvd24gZXZlbnRzXG4gICAgaWYgX2Rvd25cbiAgICAgIGxheWVyLm9uIEV2ZW50cy5Ub3VjaFN0YXJ0LCAtPlxuICAgICAgICBfZGVmYXVsdC5oaWRlKClcbiAgICAgICAgX2hvdmVyPy5oaWRlKCkgIyB0b3VjaCBkb3duIHN0YXRlIG92ZXJyaWRlcyBob3ZlciBzdGF0ZVxuICAgICAgICBfZG93bi5zaG93KClcblxuICAgICAgbGF5ZXIub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuICAgICAgICBfZG93bi5oaWRlKClcblxuICAgICAgICBpZiBfaG92ZXJcbiAgICAgICAgICAjIElmIHRoZXJlIHdhcyBhIGhvdmVyIHN0YXRlLCBnbyBiYWNrIHRvIHRoZSBob3ZlciBzdGF0ZVxuICAgICAgICAgIF9ob3Zlci5zaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIF9kZWZhdWx0LnNob3coKVxuXG5cbl8uZXh0ZW5kKGV4cG9ydHMsIHNob3J0Y3V0cylcblxuIiwiY2xhc3MgZXhwb3J0cy5Db2xsYXBzZUhvbGRlciBleHRlbmRzIExheWVyXG5cdGNvbnN0cnVjdG9yOiAobGF5ZXJBcnJheSwgdG9nZ2xlTGF5ZXIsIHNrZXRjaCkgLT5cblx0XHRzdXBlcigpXG5cdFx0QC5vcmlnaW5ZID0gMFxuXHRcdEAuYW5pbWF0aW9uT3B0aW9ucyA9XG5cdFx0XHR0aW1lOiAwLjJcblx0XHRALnN0YXRlcy5jb2xsYXBzZWQgPVxuXHRcdFx0c2NhbGVZOiAwXG5cdFx0QC5zdGF0ZXMuZGVmYXVsdCA9XG5cdFx0XHRzY2FsZVk6IDFcblx0XHRALmhlaWdodCA9IDBcblx0XHRALmJhY2tncm91bmRDb2xvciA9IFwidHJhbnNwYXJlbnRcIlxuXHRcdGlmIHRvZ2dsZUxheWVyXG5cdFx0XHRALm5hbWUgPSBcImNvbGxhcHNlX1wiICsgdG9nZ2xlTGF5ZXIubmFtZVxuXHRcdFx0QC50b2dnbGVMYXllciA9IHRvZ2dsZUxheWVyXG5cdFx0dG9nZ2xlTGF5ZXIub24gRXZlbnRzLkNsaWNrLCAoZSxsKSA9PlxuXHRcdFx0QC50b2dnbGUobClcbiMgXHRcdFx0QC5zdGF0ZXMubmV4dCgpXG5cblx0XHRsYXllckhlaWdodHMgPSBbXVxuXHRcdGxheWVyV2lkdGhzID0gW11cblx0XHRsYXllck1pblhzID0gW11cblx0XHRsYXllck1pbllzID0gW11cblxuXHRcdGZvciBsYXllciBpbiBsYXllckFycmF5XG5cdFx0XHRALnN1cGVyTGF5ZXI9bGF5ZXIuc3VwZXJMYXllclxuXHRcdFx0QC5oZWlnaHQgPSBALmhlaWdodCArIGxheWVyLmhlaWdodFxuXHRcdFx0bGF5ZXJIZWlnaHRzLnB1c2ggbGF5ZXIuaGVpZ2h0XG5cdFx0XHRsYXllcldpZHRocy5wdXNoIGxheWVyLndpZHRoXG5cdFx0XHRsYXllck1pblhzLnB1c2ggbGF5ZXIubWluWFxuXHRcdFx0bGF5ZXJNaW5Zcy5wdXNoIGxheWVyLm1pbllcblxuXHRcdEAud2lkdGggPSBNYXRoLm1heC5hcHBseSBALCAobGF5ZXJXaWR0aHMpXG5cdFx0QC5oZWlnaHQgPSBsYXllckhlaWdodHMucmVkdWNlICh0LHMpIC0+IHQgKyBzXG5cdFx0QC5mdWxsSGVpZ2h0ID0gQC5oZWlnaHRcblxuXHRcdEAueCA9IE1hdGgubWluLmFwcGx5IEAsIChsYXllck1pblhzKVxuXHRcdEAueSA9IE1hdGgubWluLmFwcGx5IEAsIChsYXllck1pbllzKVxuXG5cdFx0Zm9yIGxheWVyIGluIGxheWVyQXJyYXlcblx0XHRcdGxheWVyLnN1cGVyTGF5ZXIgPSBAXG5cdFx0XHRsYXllci5wb2ludCA9XG5cdFx0XHRcdHg6IGxheWVyLngtQC54XG5cdFx0XHRcdHk6IGxheWVyLnktQC55XG5cblx0XHRALnNvcnRMYXllcnMobGF5ZXJBcnJheSlcblxuXG5cdGFkanVzdExheWVyczogKGFkanVzdG1lbnQsIHRvZ2dsZUxheWVyLCBvcmlnaW4pID0+XG5cdFx0cHJpbnQgXCIjQ09MTCMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1wiXG5cdFx0cHJpbnQgXCJMb29raW5nIGF0IFwiICsgQC5uYW1lICsgXCIgYnkgcmVxdWVzdCBvZiBcIiArIG9yaWdpbi5uYW1lXG5cdFx0cHJpbnQgQC5pZCwgb3JpZ2luLmlkLCBvcmlnaW4uaWQgIT0gQC5pZCwgb3JpZ2luLmlkID09IEAuaWRcblx0XHRpZiBvcmlnaW4uaWQgIT0gQC5pZFxuXHRcdFx0cHJpbnQgXCJBZGp1c3RpbmcgXCIgKyBALm5hbWVcblx0XHRcdGZvciBsYXllciBpbiBALmNoaWxkcmVuXG5cdFx0XHRcdHByaW50IFwiIHwgIGxvb2tpbmcgYXQ6IFwiICsgbGF5ZXIubmFtZSArIFwiIGZyb20gXCIgKyBALm5hbWUgKyBcIiBieSByZXF1ZXN0IG9mIFwiICsgb3JpZ2luLm5hbWVcblx0XHRcdFx0aWYgbGF5ZXIuaWQgIT0gb3JpZ2luLmlkXG5cdFx0XHRcdFx0bW92ZW1lbnQ9MFxuXHRcdFx0XHRcdGlmIGxheWVyLnkgPiB0b2dnbGVMYXllci55XG5cdFx0XHRcdFx0XHRtb3ZlbWVudCA9IGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdGxheWVyLmFuaW1hdGVcblx0XHRcdFx0XHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0XHRcdFx0XHR5OiBsYXllci55ICsgYWRqdXN0bWVudFxuXHRcdFx0XHRcdFx0XHR0aW1lOiAwLjJcblx0XHRcdFx0XHRcdHByaW50IFwicGFyZW50XCIsIGxheWVyLnBhcmVudFxuXHRcdFx0XHRcdFx0bGF5ZXIucGFyZW50LmFuaW1hdGVcblx0XHRcdFx0XHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IGxheWVyLnBhcmVudC5oZWlnaHQgKyBhZGp1c3RtZW50XG5cdFx0XHRcdFx0XHRcdHRpbWU6IDAuMlxuXHRcdFx0XHRcdGVsc2UgcHJpbnQgXCJOb3QgYWRqdXN0aW5nIG9yaWdpbjogXCIgKyBvcmlnaW4ubmFtZVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bW92ZW1lbnQgPSAwXG5cdFx0XHRcdHByaW50IFwiIHwgIG1vdmluZyBcIiArIGxheWVyLm5hbWUgKyBcIiBieSBcIiArIG1vdmVtZW50XG5cdFx0ZWxzZSBpZiBvcmlnaW4udG9nZ2xlTGF5ZXIuaWQgIT0gQC5pZFxuXHRcdFx0cHJpbnQgXCJOb3QgQWRqdXN0aW5nIFwiICsgQC5uYW1lXG5cdFx0cHJpbnQgXCJET05FIC0tIE1PVklORyBUTzogXCIgKyBALnBhcmVudC5uYW1lXG5cdFx0cHJpbnQgXCIjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1wiXG5cdFx0QC5wYXJlbnQuYWRqdXN0TGF5ZXJzKGFkanVzdG1lbnQsIHRvZ2dsZUxheWVyLCBvcmlnaW4pXG5cblx0Y29sbGFwc2U6ICgpID0+IEAuYW5pbWF0ZShcImNvbGxhcHNlZFwiKVxuXHRleHBhbmQ6ICgpID0+IEAuYW5pbWF0ZShcImRlZmF1bHRcIilcblx0dG9nZ2xlOiAobCkgPT5cblx0XHRALnN0YXRlcy5uZXh0KClcblx0XHRwcmludCBALmhlaWdodFxuXHRcdGFkanVzdG1lbnQgPSBALmhlaWdodFxuXHRcdHByaW50IFwiIFwiXG5cdFx0cHJpbnQgXCIgXCJcblx0XHRwcmludCBcIkNIQU5HSU5HIFwiICsgQC5uYW1lICsgXCIgVE8gXCIgKyBALnN0YXRlcy5jdXJyZW50Lm5hbWVcblx0XHRpZiBALnN0YXRlcy5jdXJyZW50LnNjYWxlWSBpcyAwXG5cdFx0XHRwcmludCBcInNocmlua2luZ1wiLCBhZGp1c3RtZW50XG5cdFx0XHRhZGp1c3RtZW50ID0gMCAtIGFkanVzdG1lbnRcblx0XHRlbHNlXG5cdFx0XHRwcmludCBcImV4cGFuZGluZ1wiLCBhZGp1c3RtZW50XG5cdFx0QC5hZGp1c3RMYXllcnMoYWRqdXN0bWVudCwgbCwgQClcblxuXG5cblxuXHRzb3J0TGF5ZXJzOiAobGF5ZXJBcnJheSkgPT5cbiAgICBcdEAuc29ydGVkTGF5ZXJzID0gW11cbiAgICBcdGZvciBsYXllck5hbWUsIGxheWVyIG9mIGxheWVyQXJyYXlcbiAgICBcdFx0QC5zb3J0ZWRMYXllcnMucHVzaChsYXllcilcbiAgICBcdFx0QC5zb3J0ZWRMYXllcnMuc29ydCgoYSxiKSAtPiBhLnktYi55KVxuXG5cblxuY2xhc3MgZXhwb3J0cy5OZXN0ZWRMaXN0IGV4dGVuZHMgTGF5ZXJcblx0Y29uc3RydWN0b3I6IChsYXllckxpc3QpIC0+XG5cdFx0c3VwZXIoKVxuXHRcdEAuY29udGVudCA9IEAuY3JlYXRlSG9sZGVycyhsYXllckxpc3QpXG5cdFx0QC5kZXB0aCA9IDBcblx0XHRALnNpemUgPSBALmNvbnRlbnQuc2l6ZVxuXHRcdEAucG9pbnQgPSBALmNvbnRlbnQucG9pbnRcblx0XHRALm5hbWUgPSBcIk5lc3RlZExpc3RcIlxuXHRjcmVhdGVIb2xkZXJzOiAobGV2ZWwsIHRvZ2dsZUxheWVyKSA9PlxuXHRcdGNvbGxhcHNlTGF5ZXJzID0gW11cblx0XHRuZXh0VG9nZ2xlID0gbnVsbFxuXHRcdGZvciBpIGluIGxldmVsXG5cdFx0XHRpZiBub3QgaVswXVxuXHRcdFx0XHRuZXh0VG9nZ2xlID0gaVxuXHRcdFx0XHRjb2xsYXBzZUxheWVycy5wdXNoKGkpXG5cdFx0XHRlbHNlIGlmIGlbMF1cblx0XHRcdFx0QC5kZXB0aD0gQC5kZXB0aCsxXG5cdFx0XHRcdGNvbGxhcHNlTGF5ZXJzLnB1c2goQC5jcmVhdGVIb2xkZXJzKGksIG5leHRUb2dnbGUpKVxuXHRcdGlmIHR5cGVvZiB0b2dnbGVMYXllciAhPSBcInVuZGVmaW5lZFwiXG5cdFx0XHRALmRlcHRoID0gQC5kZXB0aCAtIDFcblx0XHRcdHJldHVybiBuZXcgZXhwb3J0cy5Db2xsYXBzZUhvbGRlcihjb2xsYXBzZUxheWVycywgdG9nZ2xlTGF5ZXIpXG5cblx0XHRALnJlc2l6ZUxheWVycyhjb2xsYXBzZUxheWVycylcblx0XHRALmxheWVycyA9IGNvbGxhcHNlTGF5ZXJzXG5cblx0cmVzaXplTGF5ZXJzOiAoY29sbGFwc2VMYXllcnMpID0+XG5cdFx0bGF5ZXJIZWlnaHRzID0gW11cblx0XHRsYXllcldpZHRocyA9IFtdXG5cdFx0bGF5ZXJNaW5YcyA9IFtdXG5cdFx0bGF5ZXJNaW5ZcyA9IFtdXG5cblx0XHRmb3IgbGF5ZXIgaW4gY29sbGFwc2VMYXllcnNcblx0XHRcdGlmIGxheWVyLnN1cGVyTGF5ZXIgaXMgbm90IEBcblx0XHRcdFx0QC5zdXBlckxheWVyPWxheWVyLnN1cGVyTGF5ZXJcblx0XHRcdEAuaGVpZ2h0ID0gQC5oZWlnaHQgKyBsYXllci5oZWlnaHRcblx0XHRcdGxheWVySGVpZ2h0cy5wdXNoIGxheWVyLmhlaWdodFxuXHRcdFx0bGF5ZXJXaWR0aHMucHVzaCBsYXllci53aWR0aFxuXHRcdFx0bGF5ZXJNaW5Ycy5wdXNoIGxheWVyLm1pblhcblx0XHRcdGxheWVyTWluWXMucHVzaCBsYXllci5taW5ZXG5cblx0XHRALndpZHRoID0gTWF0aC5tYXguYXBwbHkgQCwgKGxheWVyV2lkdGhzKVxuXHRcdEAuaGVpZ2h0ID0gbGF5ZXJIZWlnaHRzLnJlZHVjZSAodCxzKSAtPiB0ICsgc1xuXG5cdFx0QC54ID0gTWF0aC5taW4uYXBwbHkgQCwgKGxheWVyTWluWHMpXG5cdFx0QC55ID0gTWF0aC5taW4uYXBwbHkgQCwgKGxheWVyTWluWXMpXG5cblx0XHRmb3IgbGF5ZXIgaW4gY29sbGFwc2VMYXllcnNcblx0XHRcdGxheWVyLnN1cGVyTGF5ZXIgPSBAXG5cdFx0XHRsYXllci5wb2ludCA9XG5cdFx0XHRcdHg6IGxheWVyLngtQC54XG5cdFx0XHRcdHk6IGxheWVyLnktQC55XG5cblx0YWRqdXN0TGF5ZXJzOiAoYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbikgPT5cblx0XHRwcmludCBcIiNORVNUIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXCJcblx0XHRwcmludCBcIkFkanVzdG1lbnRcIiwgYWRqdXN0bWVudFxuXHRcdHByaW50IFwiTG9va2luZyBhdCBcIiArIEAubmFtZSArIFwiIGJ5IHJlcXVlc3Qgb2YgXCIgKyBvcmlnaW4ubmFtZVxuXHRcdHByaW50IFwiaWQ6IFwiICsgQC5pZCwgXCJvcmlnaW46IFwiICsgIG9yaWdpbi5pZCwgXCI9bzogXCIgKyBvcmlnaW4uaWQgPT0gQC5pZCwgXCI9dDogXCIgKyB0b2dnbGVMYXllci5pZCA9PSBALmlkXG5cdFx0aWYgb3JpZ2luLmlkICE9IEAuaWRcblx0XHRcdHByaW50IFwiQWRqdXN0aW5nIFwiICsgQC5uYW1lXG5cdFx0XHRmb3IgbGF5ZXIgaW4gQC5jaGlsZHJlblxuXHRcdFx0XHRwcmludCBcIiB8ICBsb29raW5nIGF0OiBcIiArIGxheWVyLm5hbWUrIFwiIFwiICsgbGF5ZXIuaWRcblx0XHRcdFx0cHJpbnQgXCIgfCB8ICBmcm9tIFwiICsgQC5uYW1lICsgXCIgXCIgKyBALmlkXG5cdFx0XHRcdHByaW50IFwiIHwgfCAgYnkgcmVxdWVzdCBvZiBcIiArIG9yaWdpbi5uYW1lXG5cdFx0XHRcdHByaW50IFwiIHwgfCAgY2xpY2tlZCBvbiBcIiArIHRvZ2dsZUxheWVyLm5hbWVcblx0XHRcdFx0aWYgbGF5ZXIuaWQgIT0gb3JpZ2luLmlkIGFuZCBsYXllci5pZCAhPSB0b2dnbGVMYXllci5pZFxuXHRcdFx0XHRcdHByaW50IGxheWVyLm5hbWUsIGxheWVyLnNjcmVlbkZyYW1lLnksIFwiIC0tIFwiLCBvcmlnaW4ubmFtZSwgb3JpZ2luLnNjcmVlbkZyYW1lLnksIGFkanVzdG1lbnRcblx0XHRcdFx0XHRpZiBsYXllci5zY3JlZW5GcmFtZS55ID49IG9yaWdpbi5zY3JlZW5GcmFtZS55XG5cdFx0XHRcdFx0XHRwcmludCBcIiB8ICBtb3ZpbmcgXCIgKyBsYXllci5uYW1lICsgXCIgYnkgXCIgKyBhZGp1c3RtZW50XG5cdFx0XHRcdFx0XHRsYXllci5hbmltYXRlXG5cdFx0XHRcdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0XHRcdFx0eTogbGF5ZXIueSArIGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdFx0dGltZTogMC4yXG5cblx0XHRcdFx0ZWxzZSBpZiBsYXllci5pZCA9PSBvcmlnaW4uaWRcblx0XHRcdFx0XHRwcmludCBcIk5vdCBhZGp1c3Rpbmcgb3JpZ2luOiBcIiArIGxheWVyLm5hbWVcblx0XHRcdFx0ZWxzZSBpZiBsYXllci5pZCA9PSB0b2dnbGVMYXllci5pZFxuXHRcdFx0XHRcdHByaW50IFwibm90IGFkanVzdGluZyB0b2dnbGVMYXllclwiXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRtb3ZlbWVudCA9IDBcblxuXHRcdGVsc2UgaWYgb3JpZ2luLnRvZ2dsZUxheWVyLmlkICE9IEAuaWRcblx0XHRcdHByaW50IFwiTm90IEFkanVzdGluZyBcIiArIEAubmFtZVxuXG5cdFx0QC5hbmltYXRlXG5cdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRoZWlnaHQ6IEAuaGVpZ2h0ICsgYWRqdXN0bWVudFxuXHRcdFx0dGltZTogMC4yXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIENvbGxhcHNlSG9sZGVyKCBbIGxheWVyQXJyYXkgXSAsIHRvZ2dsZUxheWVyIClcbiMgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jXG4jIEFSR1VNRU5UU1xuI1xuIyBsYXllckFycmF5XG4jIC0tLS0tLS0tLS1cbiMgQW4gYXJyYXkgb2YgbGF5ZXJzIHRvIGJlIGNvbGxhcHNlZC4gdGhlc2UgYXJlIHRoZSBvbmVzIHRoYXRcbiMgc2hvdWxkIGFsbCBkaXNhcHBlYXIgaW4gYSBncm91cCB0b2dldGhlci5cbiMgISEhISBOT1RFICEhISFcbiMgdGhlc2UgbGF5ZXJzIGFsbCBuZWVkIHRvIGhhdmUgdGhlIHNhbWUgcGFyZW50IGZvciB0aGlzIHRvIHdvcmsgISEhXG4jXG4jIHRvZ2dsZUxheWVyXG4jIC0tLS0tLS0tLS0tXG4jIHRoZSBsYXllciB5b3Ugd2FudCB0byBjbGljayBvbiB0byBzaG93L2hpZGUgdGhlIGxheWVycyBpblxuIyBsYXllckFycmF5XG4jXG4jIFNLRVRDSCBGSUxFXG4jXG4jIE15IGZpbGU6XG4jIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL3MvOWRhcmd0bXhoaG1jcnNsL2V4cGFuZEV4YW1wbGUuc2tldGNoP2RsPTBcbiNcbiMgSW4gdGhlIHNrZXRjaCBmaWxlLCBlYWNoIHJvdyBzaG91bGQgYmUgaW5kZXBlbmRlbnQsIGFuZCBlcXVhbCBpbiB0aGUgaGllcmFyY2h5LiBMaWtlIHRoaXM6XG4jICAgfFxuIyAgICstPiByb3dfMVxuIyAgICstPiByb3dfMV8xXG4jICAgKy0+IHJvd18xXzFfQVxuIyAgICstPiByb3dfMV8yXG4jICAgKy0+IHJvd18xXzNcbiMgICArLT4gcm93XzJcbiMgICBldGMuXG4jXG4jIENyZWF0ZSBuZXN0ZWQgdHJlZXMgYnkgcGxhY2luZyBDb2xsYXBzZUhvbGRlcnMgaW50byBDb2xsYXBzZUhvbGRlcnNcbiIsIkNvbGxhcHNlSG9sZGVyO1xuXG4iLCIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIu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
