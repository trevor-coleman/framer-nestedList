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
    if (origin.id !== this.id) {
      ref = this.children;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
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
            layer.parent.animate({
              properties: {
                height: layer.parent.height + adjustment
              },
              time: 0.2
            });
          }
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
        } else {
          movement = 0;
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
    if (origin.id !== this.id) {
      ref = this.children;
      for (j = 0, len = ref.length; j < len; j++) {
        layer = ref[j];
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
            layer.parent.animate({
              properties: {
                height: layer.parent.height + adjustment
              },
              time: 0.2
            });
          }
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
        } else {
          movement = 0;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvc2hvcnRjdXRzLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL0Ryb3Bib3ggKFBlcnNvbmFsKS9mcmFtZXIvZnJhbWVyLW5lc3RlZExpc3QuZnJhbWVyL21vZHVsZXMvbmVzdGVkTGlzdC5qcyIsIi4uL21vZHVsZXMvbmVzdGVkTGlzdC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICBTaG9ydGN1dHMgZm9yIEZyYW1lciAxLjBcbiAgaHR0cDovL2dpdGh1Yi5jb20vZmFjZWJvb2svc2hvcnRjdXRzLWZvci1mcmFtZXJcblxuICBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cbiAgUmVhZG1lOlxuICBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svc2hvcnRjdXRzLWZvci1mcmFtZXJcblxuICBMaWNlbnNlOlxuICBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svc2hvcnRjdXRzLWZvci1mcmFtZXIvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuIyMjXG5cblxuXG5cbiMjI1xuICBDT05GSUdVUkFUSU9OXG4jIyNcblxuc2hvcnRjdXRzID0ge31cblxuRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24gPVxuICBjdXJ2ZTogXCJiZXppZXItY3VydmVcIlxuICB0aW1lOiAwLjJcblxuRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uID1cbiAgY3VydmU6IFwic3ByaW5nKDQwMCw0MCwwKVwiXG5cblxuXG4jIyNcbiAgTE9PUCBPTiBFVkVSWSBMQVlFUlxuXG4gIFNob3J0aGFuZCBmb3IgYXBwbHlpbmcgYSBmdW5jdGlvbiB0byBldmVyeSBsYXllciBpbiB0aGUgZG9jdW1lbnQuXG5cbiAgRXhhbXBsZTpcbiAgYGBgc2hvcnRjdXRzLmV2ZXJ5TGF5ZXIoZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBsYXllci52aXNpYmxlID0gZmFsc2U7XG4gIH0pO2BgYFxuIyMjXG5zaG9ydGN1dHMuZXZlcnlMYXllciA9IChmbikgLT5cbiAgZm9yIGxheWVyTmFtZSBvZiB3aW5kb3cuTGF5ZXJzXG4gICAgX2xheWVyID0gd2luZG93LkxheWVyc1tsYXllck5hbWVdXG4gICAgZm4gX2xheWVyXG5cblxuIyMjXG4gIFNIT1JUSEFORCBGT1IgQUNDRVNTSU5HIExBWUVSU1xuXG4gIENvbnZlcnQgZWFjaCBsYXllciBjb21pbmcgZnJvbSB0aGUgZXhwb3J0ZXIgaW50byBhIEphdmFzY3JpcHQgb2JqZWN0IGZvciBzaG9ydGhhbmQgYWNjZXNzLlxuXG4gIFRoaXMgaGFzIHRvIGJlIGNhbGxlZCBtYW51YWxseSBpbiBGcmFtZXIzIGFmdGVyIHlvdSd2ZSByYW4gdGhlIGltcG9ydGVyLlxuXG4gIG15TGF5ZXJzID0gRnJhbWVyLkltcG9ydGVyLmxvYWQoXCIuLi5cIilcbiAgc2hvcnRjdXRzLmluaXRpYWxpemUobXlMYXllcnMpXG5cbiAgSWYgeW91IGhhdmUgYSBsYXllciBpbiB5b3VyIFBTRC9Ta2V0Y2ggY2FsbGVkIFwiTmV3c0ZlZWRcIiwgdGhpcyB3aWxsIGNyZWF0ZSBhIGdsb2JhbCBKYXZhc2NyaXB0IHZhcmlhYmxlIGNhbGxlZCBcIk5ld3NGZWVkXCIgdGhhdCB5b3UgY2FuIG1hbmlwdWxhdGUgd2l0aCBGcmFtZXIuXG5cbiAgRXhhbXBsZTpcbiAgYE5ld3NGZWVkLnZpc2libGUgPSBmYWxzZTtgXG5cbiAgTm90ZXM6XG4gIEphdmFzY3JpcHQgaGFzIHNvbWUgbmFtZXMgcmVzZXJ2ZWQgZm9yIGludGVybmFsIGZ1bmN0aW9uIHRoYXQgeW91IGNhbid0IG92ZXJyaWRlIChmb3IgZXguIClcbiAgSWYgeW91IGNhbGwgaW5pdGlhbGl6ZSB3aXRob3V0IGFueXRoaW5nLCBpdCB3aWxsIHVzZSBhbGwgY3VycmVudGx5IGF2YWlsYWJsZSBsYXllcnMuXG4jIyNcbnNob3J0Y3V0cy5pbml0aWFsaXplID0gKGxheWVycykgLT5cblxuICBsYXllciA9IEZyYW1lci5DdXJyZW50Q29udGV4dC5fbGF5ZXJMaXN0IGlmIG5vdCBsYXllcnNcblxuICB3aW5kb3cuTGF5ZXJzID0gbGF5ZXJzXG5cbiAgc2hvcnRjdXRzLmV2ZXJ5TGF5ZXIgKGxheWVyKSAtPlxuICAgIHNhbml0aXplZExheWVyTmFtZSA9IGxheWVyLm5hbWUucmVwbGFjZSgvWy0rIT86KlxcW1xcXVxcKFxcKVxcL10vZywgJycpLnRyaW0oKS5yZXBsYWNlKC9cXHMvZywgJ18nKVxuICAgIHdpbmRvd1tzYW5pdGl6ZWRMYXllck5hbWVdID0gbGF5ZXJcbiAgICBzaG9ydGN1dHMuc2F2ZU9yaWdpbmFsRnJhbWUgbGF5ZXJcbiAgICBzaG9ydGN1dHMuaW5pdGlhbGl6ZVRvdWNoU3RhdGVzIGxheWVyXG5cblxuIyMjXG4gIEZJTkQgQ0hJTEQgTEFZRVJTIEJZIE5BTUVcblxuICBSZXRyaWV2ZXMgc3ViTGF5ZXJzIG9mIHNlbGVjdGVkIGxheWVyIHRoYXQgaGF2ZSBhIG1hdGNoaW5nIG5hbWUuXG5cbiAgZ2V0Q2hpbGQ6IHJldHVybiB0aGUgZmlyc3Qgc3VibGF5ZXIgd2hvc2UgbmFtZSBpbmNsdWRlcyB0aGUgZ2l2ZW4gc3RyaW5nXG4gIGdldENoaWxkcmVuOiByZXR1cm4gYWxsIHN1YkxheWVycyB0aGF0IG1hdGNoXG5cbiAgVXNlZnVsIHdoZW4gZWcuIGl0ZXJhdGluZyBvdmVyIHRhYmxlIGNlbGxzLiBVc2UgZ2V0Q2hpbGQgdG8gYWNjZXNzIHRoZSBidXR0b24gZm91bmQgaW4gZWFjaCBjZWxsLiBUaGlzIGlzICoqY2FzZSBpbnNlbnNpdGl2ZSoqLlxuXG4gIEV4YW1wbGU6XG4gIGB0b3BMYXllciA9IE5ld3NGZWVkLmdldENoaWxkKFwiVG9wXCIpYCBMb29rcyBmb3IgbGF5ZXJzIHdob3NlIG5hbWUgbWF0Y2hlcyBUb3AuIFJldHVybnMgdGhlIGZpcnN0IG1hdGNoaW5nIGxheWVyLlxuXG4gIGBjaGlsZExheWVycyA9IFRhYmxlLmdldENoaWxkcmVuKFwiQ2VsbFwiKWAgUmV0dXJucyBhbGwgY2hpbGRyZW4gd2hvc2UgbmFtZSBtYXRjaCBDZWxsIGluIGFuIGFycmF5LlxuIyMjXG5MYXllcjo6Z2V0Q2hpbGQgPSAobmVlZGxlLCByZWN1cnNpdmUgPSBmYWxzZSkgLT5cbiAgIyBTZWFyY2ggZGlyZWN0IGNoaWxkcmVuXG4gIGZvciBzdWJMYXllciBpbiBAc3ViTGF5ZXJzXG4gICAgcmV0dXJuIHN1YkxheWVyIGlmIHN1YkxheWVyLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKG5lZWRsZS50b0xvd2VyQ2FzZSgpKSBpc250IC0xIFxuXG4gICMgUmVjdXJzaXZlbHkgc2VhcmNoIGNoaWxkcmVuIG9mIGNoaWxkcmVuXG4gIGlmIHJlY3Vyc2l2ZVxuICAgIGZvciBzdWJMYXllciBpbiBAc3ViTGF5ZXJzXG4gICAgICByZXR1cm4gc3ViTGF5ZXIuZ2V0Q2hpbGQobmVlZGxlLCByZWN1cnNpdmUpIGlmIHN1YkxheWVyLmdldENoaWxkKG5lZWRsZSwgcmVjdXJzaXZlKSBcblxuXG5MYXllcjo6Z2V0Q2hpbGRyZW4gPSAobmVlZGxlLCByZWN1cnNpdmUgPSBmYWxzZSkgLT5cbiAgcmVzdWx0cyA9IFtdXG5cbiAgaWYgcmVjdXJzaXZlXG4gICAgZm9yIHN1YkxheWVyIGluIEBzdWJMYXllcnNcbiAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCBzdWJMYXllci5nZXRDaGlsZHJlbihuZWVkbGUsIHJlY3Vyc2l2ZSlcbiAgICByZXN1bHRzLnB1c2ggQCBpZiBAbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobmVlZGxlLnRvTG93ZXJDYXNlKCkpIGlzbnQgLTFcbiAgICByZXR1cm4gcmVzdWx0c1xuXG4gIGVsc2VcbiAgICBmb3Igc3ViTGF5ZXIgaW4gQHN1YkxheWVyc1xuICAgICAgaWYgc3ViTGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobmVlZGxlLnRvTG93ZXJDYXNlKCkpIGlzbnQgLTEgXG4gICAgICAgIHJlc3VsdHMucHVzaCBzdWJMYXllciBcbiAgICByZXR1cm4gcmVzdWx0c1xuXG5cblxuIyMjXG4gIENPTlZFUlQgQSBOVU1CRVIgUkFOR0UgVE8gQU5PVEhFUlxuXG4gIENvbnZlcnRzIGEgbnVtYmVyIHdpdGhpbiBvbmUgcmFuZ2UgdG8gYW5vdGhlciByYW5nZVxuXG4gIEV4YW1wbGU6XG4gIFdlIHdhbnQgdG8gbWFwIHRoZSBvcGFjaXR5IG9mIGEgbGF5ZXIgdG8gaXRzIHggbG9jYXRpb24uXG5cbiAgVGhlIG9wYWNpdHkgd2lsbCBiZSAwIGlmIHRoZSBYIGNvb3JkaW5hdGUgaXMgMCwgYW5kIGl0IHdpbGwgYmUgMSBpZiB0aGUgWCBjb29yZGluYXRlIGlzIDY0MC4gQWxsIHRoZSBYIGNvb3JkaW5hdGVzIGluIGJldHdlZW4gd2lsbCByZXN1bHQgaW4gaW50ZXJtZWRpYXRlIHZhbHVlcyBiZXR3ZWVuIDAgYW5kIDEuXG5cbiAgYG15TGF5ZXIub3BhY2l0eSA9IGNvbnZlcnRSYW5nZSgwLCA2NDAsIG15TGF5ZXIueCwgMCwgMSlgXG5cbiAgQnkgZGVmYXVsdCwgdGhpcyB2YWx1ZSBtaWdodCBiZSBvdXRzaWRlIHRoZSBib3VuZHMgb2YgTmV3TWluIGFuZCBOZXdNYXggaWYgdGhlIE9sZFZhbHVlIGlzIG91dHNpZGUgT2xkTWluIGFuZCBPbGRNYXguIElmIHlvdSB3YW50IHRvIGNhcCB0aGUgZmluYWwgdmFsdWUgdG8gTmV3TWluIGFuZCBOZXdNYXgsIHNldCBjYXBwZWQgdG8gdHJ1ZS5cbiAgTWFrZSBzdXJlIE5ld01pbiBpcyBzbWFsbGVyIHRoYW4gTmV3TWF4IGlmIHlvdSdyZSB1c2luZyB0aGlzLiBJZiB5b3UgbmVlZCBhbiBpbnZlcnNlIHByb3BvcnRpb24sIHRyeSBzd2FwcGluZyBPbGRNaW4gYW5kIE9sZE1heC5cbiMjI1xuc2hvcnRjdXRzLmNvbnZlcnRSYW5nZSA9IChPbGRNaW4sIE9sZE1heCwgT2xkVmFsdWUsIE5ld01pbiwgTmV3TWF4LCBjYXBwZWQpIC0+XG4gIE9sZFJhbmdlID0gKE9sZE1heCAtIE9sZE1pbilcbiAgTmV3UmFuZ2UgPSAoTmV3TWF4IC0gTmV3TWluKVxuICBOZXdWYWx1ZSA9ICgoKE9sZFZhbHVlIC0gT2xkTWluKSAqIE5ld1JhbmdlKSAvIE9sZFJhbmdlKSArIE5ld01pblxuXG4gIGlmIGNhcHBlZFxuICAgIGlmIE5ld1ZhbHVlID4gTmV3TWF4XG4gICAgICBOZXdNYXhcbiAgICBlbHNlIGlmIE5ld1ZhbHVlIDwgTmV3TWluXG4gICAgICBOZXdNaW5cbiAgICBlbHNlXG4gICAgICBOZXdWYWx1ZVxuICBlbHNlXG4gICAgTmV3VmFsdWVcblxuXG4jIyNcbiAgT1JJR0lOQUwgRlJBTUVcblxuICBTdG9yZXMgdGhlIGluaXRpYWwgbG9jYXRpb24gYW5kIHNpemUgb2YgYSBsYXllciBpbiB0aGUgXCJvcmlnaW5hbEZyYW1lXCIgYXR0cmlidXRlLCBzbyB5b3UgY2FuIHJldmVydCB0byBpdCBsYXRlciBvbi5cblxuICBFeGFtcGxlOlxuICBUaGUgeCBjb29yZGluYXRlIG9mIE15TGF5ZXIgaXMgaW5pdGlhbGx5IDQwMCAoZnJvbSB0aGUgUFNEKVxuXG4gIGBgYE15TGF5ZXIueCA9IDIwMDsgLy8gbm93IHdlIHNldCBpdCB0byAyMDAuXG4gIE15TGF5ZXIueCA9IE15TGF5ZXIub3JpZ2luYWxGcmFtZS54IC8vIG5vdyB3ZSBzZXQgaXQgYmFjayB0byBpdHMgb3JpZ2luYWwgdmFsdWUsIDQwMC5gYGBcbiMjI1xuc2hvcnRjdXRzLnNhdmVPcmlnaW5hbEZyYW1lID0gKGxheWVyKSAtPlxuICBsYXllci5vcmlnaW5hbEZyYW1lID0gbGF5ZXIuZnJhbWVcblxuIyMjXG4gIFNIT1JUSEFORCBIT1ZFUiBTWU5UQVhcblxuICBRdWlja2x5IGRlZmluZSBmdW5jdGlvbnMgdGhhdCBzaG91bGQgcnVuIHdoZW4gSSBob3ZlciBvdmVyIGEgbGF5ZXIsIGFuZCBob3ZlciBvdXQuXG5cbiAgRXhhbXBsZTpcbiAgYE15TGF5ZXIuaG92ZXIoZnVuY3Rpb24oKSB7IE90aGVyTGF5ZXIuc2hvdygpIH0sIGZ1bmN0aW9uKCkgeyBPdGhlckxheWVyLmhpZGUoKSB9KTtgXG4jIyNcbkxheWVyOjpob3ZlciA9IChlbnRlckZ1bmN0aW9uLCBsZWF2ZUZ1bmN0aW9uKSAtPlxuICB0aGlzLm9uICdtb3VzZWVudGVyJywgZW50ZXJGdW5jdGlvblxuICB0aGlzLm9uICdtb3VzZWxlYXZlJywgbGVhdmVGdW5jdGlvblxuXG5cbiMjI1xuICBTSE9SVEhBTkQgVEFQIFNZTlRBWFxuXG4gIEluc3RlYWQgb2YgYE15TGF5ZXIub24oRXZlbnRzLlRvdWNoRW5kLCBoYW5kbGVyKWAsIHVzZSBgTXlMYXllci50YXAoaGFuZGxlcilgXG4jIyNcblxuTGF5ZXI6OnRhcCA9IChoYW5kbGVyKSAtPlxuICB0aGlzLm9uIEV2ZW50cy5Ub3VjaEVuZCwgaGFuZGxlclxuXG5cbiMjI1xuICBTSE9SVEhBTkQgQ0xJQ0sgU1lOVEFYXG5cbiAgSW5zdGVhZCBvZiBgTXlMYXllci5vbihFdmVudHMuQ2xpY2ssIGhhbmRsZXIpYCwgdXNlIGBNeUxheWVyLmNsaWNrKGhhbmRsZXIpYFxuIyMjXG5cbkxheWVyOjpjbGljayA9IChoYW5kbGVyKSAtPlxuICB0aGlzLm9uIEV2ZW50cy5DbGljaywgaGFuZGxlclxuXG5cblxuIyMjXG4gIFNIT1JUSEFORCBBTklNQVRJT04gU1lOVEFYXG5cbiAgQSBzaG9ydGVyIGFuaW1hdGlvbiBzeW50YXggdGhhdCBtaXJyb3JzIHRoZSBqUXVlcnkgc3ludGF4OlxuICBsYXllci5hbmltYXRlKHByb3BlcnRpZXMsIFt0aW1lXSwgW2N1cnZlXSwgW2NhbGxiYWNrXSlcblxuICBBbGwgcGFyYW1ldGVycyBleGNlcHQgcHJvcGVydGllcyBhcmUgb3B0aW9uYWwgYW5kIGNhbiBiZSBvbWl0dGVkLlxuXG4gIE9sZDpcbiAgYGBgTXlMYXllci5hbmltYXRlKHtcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB4OiA1MDBcbiAgICB9LFxuICAgIHRpbWU6IDUwMCxcbiAgICBjdXJ2ZTogJ2Jlemllci1jdXJ2ZSdcbiAgfSlgYGBcblxuICBOZXc6XG4gIGBgYE15TGF5ZXIuYW5pbWF0ZVRvKHtcbiAgICB4OiA1MDBcbiAgfSlgYGBcblxuICBPcHRpb25hbGx5ICh3aXRoIDEwMDBtcyBkdXJhdGlvbiBhbmQgc3ByaW5nKTpcbiAgICBgYGBNeUxheWVyLmFuaW1hdGVUbyh7XG4gICAgeDogNTAwXG4gIH0sIDEwMDAsIFwic3ByaW5nKDEwMCwxMCwwKVwiKVxuIyMjXG5cblxuXG5MYXllcjo6YW5pbWF0ZVRvID0gKHByb3BlcnRpZXMsIGZpcnN0LCBzZWNvbmQsIHRoaXJkKSAtPlxuICB0aGlzTGF5ZXIgPSB0aGlzXG4gIHRpbWUgPSBjdXJ2ZSA9IGNhbGxiYWNrID0gbnVsbFxuXG4gIGlmIHR5cGVvZihmaXJzdCkgPT0gXCJudW1iZXJcIlxuICAgIHRpbWUgPSBmaXJzdFxuICAgIGlmIHR5cGVvZihzZWNvbmQpID09IFwic3RyaW5nXCJcbiAgICAgIGN1cnZlID0gc2Vjb25kXG4gICAgICBjYWxsYmFjayA9IHRoaXJkXG4gICAgY2FsbGJhY2sgPSBzZWNvbmQgaWYgdHlwZW9mKHNlY29uZCkgPT0gXCJmdW5jdGlvblwiXG4gIGVsc2UgaWYgdHlwZW9mKGZpcnN0KSA9PSBcInN0cmluZ1wiXG4gICAgY3VydmUgPSBmaXJzdFxuICAgIGNhbGxiYWNrID0gc2Vjb25kIGlmIHR5cGVvZihzZWNvbmQpID09IFwiZnVuY3Rpb25cIlxuICBlbHNlIGlmIHR5cGVvZihmaXJzdCkgPT0gXCJmdW5jdGlvblwiXG4gICAgY2FsbGJhY2sgPSBmaXJzdFxuXG4gIGlmIHRpbWU/ICYmICFjdXJ2ZT9cbiAgICBjdXJ2ZSA9ICdiZXppZXItY3VydmUnXG4gIFxuICBjdXJ2ZSA9IEZyYW1lci5EZWZhdWx0cy5BbmltYXRpb24uY3VydmUgaWYgIWN1cnZlP1xuICB0aW1lID0gRnJhbWVyLkRlZmF1bHRzLkFuaW1hdGlvbi50aW1lIGlmICF0aW1lP1xuXG4gIHRoaXNMYXllci5hbmltYXRpb25UbyA9IG5ldyBBbmltYXRpb25cbiAgICBsYXllcjogdGhpc0xheWVyXG4gICAgcHJvcGVydGllczogcHJvcGVydGllc1xuICAgIGN1cnZlOiBjdXJ2ZVxuICAgIHRpbWU6IHRpbWVcblxuICB0aGlzTGF5ZXIuYW5pbWF0aW9uVG8ub24gJ3N0YXJ0JywgLT5cbiAgICB0aGlzTGF5ZXIuaXNBbmltYXRpbmcgPSB0cnVlXG5cbiAgdGhpc0xheWVyLmFuaW1hdGlvblRvLm9uICdlbmQnLCAtPlxuICAgIHRoaXNMYXllci5pc0FuaW1hdGluZyA9IG51bGxcbiAgICBpZiBjYWxsYmFjaz9cbiAgICAgIGNhbGxiYWNrKClcblxuICB0aGlzTGF5ZXIuYW5pbWF0aW9uVG8uc3RhcnQoKVxuXG4jIyNcbiAgQU5JTUFURSBNT0JJTEUgTEFZRVJTIElOIEFORCBPVVQgT0YgVEhFIFZJRVdQT1JUXG5cbiAgU2hvcnRoYW5kIHN5bnRheCBmb3IgYW5pbWF0aW5nIGxheWVycyBpbiBhbmQgb3V0IG9mIHRoZSB2aWV3cG9ydC4gQXNzdW1lcyB0aGF0IHRoZSBsYXllciB5b3UgYXJlIGFuaW1hdGluZyBpcyBhIHdob2xlIHNjcmVlbiBhbmQgaGFzIHRoZSBzYW1lIGRpbWVuc2lvbnMgYXMgeW91ciBjb250YWluZXIuXG5cbiAgRW5hYmxlIHRoZSBkZXZpY2UgcHJldmlldyBpbiBGcmFtZXIgU3R1ZGlvIHRvIHVzZSB0aGlzIOKAk8KgaXQgbGV0cyB0aGlzIHNjcmlwdCBmaWd1cmUgb3V0IHdoYXQgdGhlIGJvdW5kcyBvZiB5b3VyIHNjcmVlbiBhcmUuXG5cbiAgRXhhbXBsZTpcbiAgKiBgTXlMYXllci5zbGlkZVRvTGVmdCgpYCB3aWxsIGFuaW1hdGUgdGhlIGxheWVyICoqdG8qKiB0aGUgbGVmdCBjb3JuZXIgb2YgdGhlIHNjcmVlbiAoZnJvbSBpdHMgY3VycmVudCBwb3NpdGlvbilcblxuICAqIGBNeUxheWVyLnNsaWRlRnJvbUxlZnQoKWAgd2lsbCBhbmltYXRlIHRoZSBsYXllciBpbnRvIHRoZSB2aWV3cG9ydCAqKmZyb20qKiB0aGUgbGVmdCBjb3JuZXIgKGZyb20geD0td2lkdGgpXG5cbiAgQ29uZmlndXJhdGlvbjpcbiAgKiAoQnkgZGVmYXVsdCB3ZSB1c2UgYSBzcHJpbmcgY3VydmUgdGhhdCBhcHByb3hpbWF0ZXMgaU9TLiBUbyB1c2UgYSB0aW1lIGR1cmF0aW9uLCBjaGFuZ2UgdGhlIGN1cnZlIHRvIGJlemllci1jdXJ2ZS4pXG4gICogRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uLnRpbWVcbiAgKiBGcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24uY3VydmVcblxuXG4gIEhvdyB0byByZWFkIHRoZSBjb25maWd1cmF0aW9uOlxuICBgYGBzbGlkZUZyb21MZWZ0OlxuICAgIHByb3BlcnR5OiBcInhcIiAgICAgLy8gYW5pbWF0ZSBhbG9uZyB0aGUgWCBheGlzXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICBmcm9tOiAtMSAgICAgICAgICAvLyBzdGFydCB2YWx1ZTogb3V0c2lkZSB0aGUgbGVmdCBjb3JuZXIgKCB4ID0gLXdpZHRoX3Bob25lIClcbiAgICB0bzogMCAgICAgICAgICAgICAvLyBlbmQgdmFsdWU6IGluc2lkZSB0aGUgbGVmdCBjb3JuZXIgKCB4ID0gd2lkdGhfbGF5ZXIgKVxuICBgYGBcbiMjI1xuXG5cbnNob3J0Y3V0cy5zbGlkZUFuaW1hdGlvbnMgPVxuICBzbGlkZUZyb21MZWZ0OlxuICAgIHByb3BlcnR5OiBcInhcIlxuICAgIGZhY3RvcjogXCJ3aWR0aFwiXG4gICAgZnJvbTogLTFcbiAgICB0bzogMFxuXG4gIHNsaWRlVG9MZWZ0OlxuICAgIHByb3BlcnR5OiBcInhcIlxuICAgIGZhY3RvcjogXCJ3aWR0aFwiXG4gICAgdG86IC0xXG5cbiAgc2xpZGVGcm9tUmlnaHQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICBmcm9tOiAxXG4gICAgdG86IDBcblxuICBzbGlkZVRvUmlnaHQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICB0bzogMVxuXG4gIHNsaWRlRnJvbVRvcDpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICBmcm9tOiAtMVxuICAgIHRvOiAwXG5cbiAgc2xpZGVUb1RvcDpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICB0bzogLTFcblxuICBzbGlkZUZyb21Cb3R0b206XG4gICAgcHJvcGVydHk6IFwieVwiXG4gICAgZmFjdG9yOiBcImhlaWdodFwiXG4gICAgZnJvbTogMVxuICAgIHRvOiAwXG5cbiAgc2xpZGVUb0JvdHRvbTpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICB0bzogMVxuXG5cblxuXy5lYWNoIHNob3J0Y3V0cy5zbGlkZUFuaW1hdGlvbnMsIChvcHRzLCBuYW1lKSAtPlxuICBMYXllci5wcm90b3R5cGVbbmFtZV0gPSAodGltZSkgLT5cbiAgICBfcGhvbmUgPSBGcmFtZXIuRGV2aWNlPy5zY3JlZW4/LmZyYW1lXG5cbiAgICB1bmxlc3MgX3Bob25lXG4gICAgICBlcnIgPSBcIlBsZWFzZSBzZWxlY3QgYSBkZXZpY2UgcHJldmlldyBpbiBGcmFtZXIgU3R1ZGlvIHRvIHVzZSB0aGUgc2xpZGUgcHJlc2V0IGFuaW1hdGlvbnMuXCJcbiAgICAgIHByaW50IGVyclxuICAgICAgY29uc29sZS5sb2cgZXJyXG4gICAgICByZXR1cm5cblxuICAgIF9wcm9wZXJ0eSA9IG9wdHMucHJvcGVydHlcbiAgICBfZmFjdG9yID0gX3Bob25lW29wdHMuZmFjdG9yXVxuXG4gICAgaWYgb3B0cy5mcm9tP1xuICAgICAgIyBJbml0aWF0ZSB0aGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIGFuaW1hdGlvbiAoaS5lLiBvZmYgc2NyZWVuIG9uIHRoZSBsZWZ0IGNvcm5lcilcbiAgICAgIHRoaXNbX3Byb3BlcnR5XSA9IG9wdHMuZnJvbSAqIF9mYWN0b3JcblxuICAgICMgRGVmYXVsdCBhbmltYXRpb24gc3ludGF4IGxheWVyLmFuaW1hdGUoe19wcm9wZXJ0eTogMH0pIHdvdWxkIHRyeSB0byBhbmltYXRlICdfcHJvcGVydHknIGxpdGVyYWxseSwgaW4gb3JkZXIgZm9yIGl0IHRvIGJsb3cgdXAgdG8gd2hhdCdzIGluIGl0IChlZyB4KSwgd2UgdXNlIHRoaXMgc3ludGF4XG4gICAgX2FuaW1hdGlvbkNvbmZpZyA9IHt9XG4gICAgX2FuaW1hdGlvbkNvbmZpZ1tfcHJvcGVydHldID0gb3B0cy50byAqIF9mYWN0b3JcblxuICAgIGlmIHRpbWVcbiAgICAgIF90aW1lID0gdGltZVxuICAgICAgX2N1cnZlID0gXCJiZXppZXItY3VydmVcIlxuICAgIGVsc2VcbiAgICAgIF90aW1lID0gRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uLnRpbWVcbiAgICAgIF9jdXJ2ZSA9IEZyYW1lci5EZWZhdWx0cy5TbGlkZUFuaW1hdGlvbi5jdXJ2ZVxuXG4gICAgdGhpcy5hbmltYXRlXG4gICAgICBwcm9wZXJ0aWVzOiBfYW5pbWF0aW9uQ29uZmlnXG4gICAgICB0aW1lOiBfdGltZVxuICAgICAgY3VydmU6IF9jdXJ2ZVxuXG5cblxuIyMjXG4gIEVBU1kgRkFERSBJTiAvIEZBREUgT1VUXG5cbiAgLnNob3coKSBhbmQgLmhpZGUoKSBhcmUgc2hvcnRjdXRzIHRvIGFmZmVjdCBvcGFjaXR5IGFuZCBwb2ludGVyIGV2ZW50cy4gVGhpcyBpcyBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyBoaWRpbmcgd2l0aCBgdmlzaWJsZSA9IGZhbHNlYCBidXQgY2FuIGJlIGFuaW1hdGVkLlxuXG4gIC5mYWRlSW4oKSBhbmQgLmZhZGVPdXQoKSBhcmUgc2hvcnRjdXRzIHRvIGZhZGUgaW4gYSBoaWRkZW4gbGF5ZXIsIG9yIGZhZGUgb3V0IGEgdmlzaWJsZSBsYXllci5cblxuICBUaGVzZSBzaG9ydGN1dHMgd29yayBvbiBpbmRpdmlkdWFsIGxheWVyIG9iamVjdHMgYXMgd2VsbCBhcyBhbiBhcnJheSBvZiBsYXllcnMuXG5cbiAgRXhhbXBsZTpcbiAgKiBgTXlMYXllci5mYWRlSW4oKWAgd2lsbCBmYWRlIGluIE15TGF5ZXIgdXNpbmcgZGVmYXVsdCB0aW1pbmcuXG4gICogYFtNeUxheWVyLCBPdGhlckxheWVyXS5mYWRlT3V0KDQpYCB3aWxsIGZhZGUgb3V0IGJvdGggTXlMYXllciBhbmQgT3RoZXJMYXllciBvdmVyIDQgc2Vjb25kcy5cblxuICBUbyBjdXN0b21pemUgdGhlIGZhZGUgYW5pbWF0aW9uLCBjaGFuZ2UgdGhlIHZhcmlhYmxlcyB0aW1lIGFuZCBjdXJ2ZSBpbnNpZGUgYEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uYC5cbiMjI1xuTGF5ZXI6OnNob3cgPSAtPlxuICBAb3BhY2l0eSA9IDFcbiAgQHN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0bydcbiAgQFxuXG5MYXllcjo6aGlkZSA9IC0+XG4gIEBvcGFjaXR5ID0gMFxuICBAc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJ1xuICBAXG5cbkxheWVyOjpmYWRlSW4gPSAodGltZSA9IEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uLnRpbWUpIC0+XG4gIHJldHVybiBpZiBAb3BhY2l0eSA9PSAxXG5cbiAgdW5sZXNzIEB2aXNpYmxlXG4gICAgQG9wYWNpdHkgPSAwXG4gICAgQHZpc2libGUgPSB0cnVlXG5cbiAgQGFuaW1hdGVUbyBvcGFjaXR5OiAxLCB0aW1lLCBGcmFtZXIuRGVmYXVsdHMuRmFkZUFuaW1hdGlvbi5jdXJ2ZVxuXG5MYXllcjo6ZmFkZU91dCA9ICh0aW1lID0gRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24udGltZSkgLT5cbiAgcmV0dXJuIGlmIEBvcGFjaXR5ID09IDBcblxuICB0aGF0ID0gQFxuICBAYW5pbWF0ZVRvIG9wYWNpdHk6IDAsIHRpbWUsIEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uLmN1cnZlLCAtPiB0aGF0LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSdcblxuIyBhbGwgb2YgdGhlIGVhc3kgaW4vb3V0IGhlbHBlcnMgd29yayBvbiBhbiBhcnJheSBvZiB2aWV3cyBhcyB3ZWxsIGFzIGluZGl2aWR1YWwgdmlld3Ncbl8uZWFjaCBbJ3Nob3cnLCAnaGlkZScsICdmYWRlSW4nLCAnZmFkZU91dCddLCAoZm5TdHJpbmcpLT4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQXJyYXkucHJvdG90eXBlLCBmblN0cmluZywgXG4gICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB2YWx1ZTogKHRpbWUpIC0+XG4gICAgICBfLmVhY2ggQCwgKGxheWVyKSAtPlxuICAgICAgICBMYXllci5wcm90b3R5cGVbZm5TdHJpbmddLmNhbGwobGF5ZXIsIHRpbWUpIGlmIGxheWVyIGluc3RhbmNlb2YgTGF5ZXJcbiAgICAgIEBcblxuXG4jIyNcbiAgRUFTWSBIT1ZFUiBBTkQgVE9VQ0gvQ0xJQ0sgU1RBVEVTIEZPUiBMQVlFUlNcblxuICBCeSBuYW1pbmcgeW91ciBsYXllciBoaWVyYXJjaHkgaW4gdGhlIGZvbGxvd2luZyB3YXksIHlvdSBjYW4gYXV0b21hdGljYWxseSBoYXZlIHlvdXIgbGF5ZXJzIHJlYWN0IHRvIGhvdmVycywgY2xpY2tzIG9yIHRhcHMuXG5cbiAgQnV0dG9uX3RvdWNoYWJsZVxuICAtIEJ1dHRvbl9kZWZhdWx0IChkZWZhdWx0IHN0YXRlKVxuICAtIEJ1dHRvbl9kb3duICh0b3VjaC9jbGljayBzdGF0ZSlcbiAgLSBCdXR0b25faG92ZXIgKGhvdmVyKVxuIyMjXG5cbnNob3J0Y3V0cy5pbml0aWFsaXplVG91Y2hTdGF0ZXMgPSAobGF5ZXIpIC0+XG4gIF9kZWZhdWx0ID0gbGF5ZXIuZ2V0Q2hpbGQoJ2RlZmF1bHQnKVxuXG4gIGlmIGxheWVyLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCd0b3VjaGFibGUnKSBhbmQgX2RlZmF1bHRcblxuICAgIHVubGVzcyBGcmFtZXIuVXRpbHMuaXNNb2JpbGUoKVxuICAgICAgX2hvdmVyID0gbGF5ZXIuZ2V0Q2hpbGQoJ2hvdmVyJylcbiAgICBfZG93biA9IGxheWVyLmdldENoaWxkKCdkb3duJylcblxuICAgICMgVGhlc2UgbGF5ZXJzIHNob3VsZCBiZSBoaWRkZW4gYnkgZGVmYXVsdFxuICAgIF9ob3Zlcj8uaGlkZSgpXG4gICAgX2Rvd24/LmhpZGUoKVxuXG4gICAgIyBDcmVhdGUgZmFrZSBoaXQgdGFyZ2V0IChzbyB3ZSBkb24ndCByZS1maXJlIGV2ZW50cylcbiAgICBpZiBfaG92ZXIgb3IgX2Rvd25cbiAgICAgIGhpdFRhcmdldCA9IG5ldyBMYXllclxuICAgICAgICBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnXG4gICAgICAgIGZyYW1lOiBfZGVmYXVsdC5mcmFtZVxuXG4gICAgICBoaXRUYXJnZXQuc3VwZXJMYXllciA9IGxheWVyXG4gICAgICBoaXRUYXJnZXQuYnJpbmdUb0Zyb250KClcblxuICAgICMgVGhlcmUgaXMgYSBob3ZlciBzdGF0ZSwgc28gZGVmaW5lIGhvdmVyIGV2ZW50cyAobm90IGZvciBtb2JpbGUpXG4gICAgaWYgX2hvdmVyXG4gICAgICBsYXllci5ob3ZlciAtPlxuICAgICAgICBfZGVmYXVsdC5oaWRlKClcbiAgICAgICAgX2hvdmVyLnNob3coKVxuICAgICAgLCAtPlxuICAgICAgICBfZGVmYXVsdC5zaG93KClcbiAgICAgICAgX2hvdmVyLmhpZGUoKVxuXG4gICAgIyBUaGVyZSBpcyBhIGRvd24gc3RhdGUsIHNvIGRlZmluZSBkb3duIGV2ZW50c1xuICAgIGlmIF9kb3duXG4gICAgICBsYXllci5vbiBFdmVudHMuVG91Y2hTdGFydCwgLT5cbiAgICAgICAgX2RlZmF1bHQuaGlkZSgpXG4gICAgICAgIF9ob3Zlcj8uaGlkZSgpICMgdG91Y2ggZG93biBzdGF0ZSBvdmVycmlkZXMgaG92ZXIgc3RhdGVcbiAgICAgICAgX2Rvd24uc2hvdygpXG5cbiAgICAgIGxheWVyLm9uIEV2ZW50cy5Ub3VjaEVuZCwgLT5cbiAgICAgICAgX2Rvd24uaGlkZSgpXG5cbiAgICAgICAgaWYgX2hvdmVyXG4gICAgICAgICAgIyBJZiB0aGVyZSB3YXMgYSBob3ZlciBzdGF0ZSwgZ28gYmFjayB0byB0aGUgaG92ZXIgc3RhdGVcbiAgICAgICAgICBfaG92ZXIuc2hvdygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBfZGVmYXVsdC5zaG93KClcblxuXG5fLmV4dGVuZChleHBvcnRzLCBzaG9ydGN1dHMpXG5cbiIsInZhciBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbmV4cG9ydHMuQ29sbGFwc2VIb2xkZXIgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoQ29sbGFwc2VIb2xkZXIsIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIENvbGxhcHNlSG9sZGVyKGxheWVyQXJyYXksIHRvZ2dsZUxheWVyLCBza2V0Y2gpIHtcbiAgICB0aGlzLnNvcnRMYXllcnMgPSBiaW5kKHRoaXMuc29ydExheWVycywgdGhpcyk7XG4gICAgdGhpcy50b2dnbGUgPSBiaW5kKHRoaXMudG9nZ2xlLCB0aGlzKTtcbiAgICB0aGlzLmV4cGFuZCA9IGJpbmQodGhpcy5leHBhbmQsIHRoaXMpO1xuICAgIHRoaXMuY29sbGFwc2UgPSBiaW5kKHRoaXMuY29sbGFwc2UsIHRoaXMpO1xuICAgIHRoaXMuYWRqdXN0TGF5ZXJzID0gYmluZCh0aGlzLmFkanVzdExheWVycywgdGhpcyk7XG4gICAgdmFyIGosIGssIGxheWVyLCBsYXllckhlaWdodHMsIGxheWVyTWluWHMsIGxheWVyTWluWXMsIGxheWVyV2lkdGhzLCBsZW4sIGxlbjE7XG4gICAgQ29sbGFwc2VIb2xkZXIuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG4gICAgdGhpcy5vcmlnaW5ZID0gMDtcbiAgICB0aGlzLmFuaW1hdGlvbk9wdGlvbnMgPSB7XG4gICAgICB0aW1lOiAwLjJcbiAgICB9O1xuICAgIHRoaXMuc3RhdGVzLmNvbGxhcHNlZCA9IHtcbiAgICAgIHNjYWxlWTogMFxuICAgIH07XG4gICAgdGhpcy5zdGF0ZXNbXCJkZWZhdWx0XCJdID0ge1xuICAgICAgc2NhbGVZOiAxXG4gICAgfTtcbiAgICB0aGlzLmhlaWdodCA9IDA7XG4gICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBcInRyYW5zcGFyZW50XCI7XG4gICAgaWYgKHRvZ2dsZUxheWVyKSB7XG4gICAgICB0aGlzLm5hbWUgPSBcImNvbGxhcHNlX1wiICsgdG9nZ2xlTGF5ZXIubmFtZTtcbiAgICAgIHRoaXMudG9nZ2xlTGF5ZXIgPSB0b2dnbGVMYXllcjtcbiAgICB9XG4gICAgdG9nZ2xlTGF5ZXIub24oRXZlbnRzLkNsaWNrLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCBsKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy50b2dnbGUobCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICBsYXllckhlaWdodHMgPSBbXTtcbiAgICBsYXllcldpZHRocyA9IFtdO1xuICAgIGxheWVyTWluWHMgPSBbXTtcbiAgICBsYXllck1pbllzID0gW107XG4gICAgZm9yIChqID0gMCwgbGVuID0gbGF5ZXJBcnJheS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgbGF5ZXIgPSBsYXllckFycmF5W2pdO1xuICAgICAgdGhpcy5zdXBlckxheWVyID0gbGF5ZXIuc3VwZXJMYXllcjtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyBsYXllci5oZWlnaHQ7XG4gICAgICBsYXllckhlaWdodHMucHVzaChsYXllci5oZWlnaHQpO1xuICAgICAgbGF5ZXJXaWR0aHMucHVzaChsYXllci53aWR0aCk7XG4gICAgICBsYXllck1pblhzLnB1c2gobGF5ZXIubWluWCk7XG4gICAgICBsYXllck1pbllzLnB1c2gobGF5ZXIubWluWSk7XG4gICAgfVxuICAgIHRoaXMud2lkdGggPSBNYXRoLm1heC5hcHBseSh0aGlzLCBsYXllcldpZHRocyk7XG4gICAgdGhpcy5oZWlnaHQgPSBsYXllckhlaWdodHMucmVkdWNlKGZ1bmN0aW9uKHQsIHMpIHtcbiAgICAgIHJldHVybiB0ICsgcztcbiAgICB9KTtcbiAgICB0aGlzLmZ1bGxIZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICB0aGlzLnggPSBNYXRoLm1pbi5hcHBseSh0aGlzLCBsYXllck1pblhzKTtcbiAgICB0aGlzLnkgPSBNYXRoLm1pbi5hcHBseSh0aGlzLCBsYXllck1pbllzKTtcbiAgICBmb3IgKGsgPSAwLCBsZW4xID0gbGF5ZXJBcnJheS5sZW5ndGg7IGsgPCBsZW4xOyBrKyspIHtcbiAgICAgIGxheWVyID0gbGF5ZXJBcnJheVtrXTtcbiAgICAgIGxheWVyLnN1cGVyTGF5ZXIgPSB0aGlzO1xuICAgICAgbGF5ZXIucG9pbnQgPSB7XG4gICAgICAgIHg6IGxheWVyLnggLSB0aGlzLngsXG4gICAgICAgIHk6IGxheWVyLnkgLSB0aGlzLnlcbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMuc29ydExheWVycyhsYXllckFycmF5KTtcbiAgfVxuXG4gIENvbGxhcHNlSG9sZGVyLnByb3RvdHlwZS5hZGp1c3RMYXllcnMgPSBmdW5jdGlvbihhZGp1c3RtZW50LCB0b2dnbGVMYXllciwgb3JpZ2luKSB7XG4gICAgdmFyIGosIGxheWVyLCBsZW4sIG1vdmVtZW50LCByZWY7XG4gICAgaWYgKG9yaWdpbi5pZCAhPT0gdGhpcy5pZCkge1xuICAgICAgcmVmID0gdGhpcy5jaGlsZHJlbjtcbiAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBsYXllciA9IHJlZltqXTtcbiAgICAgICAgaWYgKGxheWVyLmlkICE9PSBvcmlnaW4uaWQpIHtcbiAgICAgICAgICBtb3ZlbWVudCA9IDA7XG4gICAgICAgICAgaWYgKGxheWVyLnkgPiB0b2dnbGVMYXllci55KSB7XG4gICAgICAgICAgICBtb3ZlbWVudCA9IGFkanVzdG1lbnQ7XG4gICAgICAgICAgICBsYXllci5hbmltYXRlKHtcbiAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgIHk6IGxheWVyLnkgKyBhZGp1c3RtZW50XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRpbWU6IDAuMlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYXllci5wYXJlbnQuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGxheWVyLnBhcmVudC5oZWlnaHQgKyBhZGp1c3RtZW50XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRpbWU6IDAuMlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBhcmVudC5hZGp1c3RMYXllcnMoYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbik7XG4gIH07XG5cbiAgQ29sbGFwc2VIb2xkZXIucHJvdG90eXBlLmNvbGxhcHNlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYW5pbWF0ZShcImNvbGxhcHNlZFwiKTtcbiAgfTtcblxuICBDb2xsYXBzZUhvbGRlci5wcm90b3R5cGUuZXhwYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYW5pbWF0ZShcImRlZmF1bHRcIik7XG4gIH07XG5cbiAgQ29sbGFwc2VIb2xkZXIucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKGwpIHtcbiAgICB2YXIgYWRqdXN0bWVudDtcbiAgICB0aGlzLnN0YXRlcy5uZXh0KCk7XG4gICAgYWRqdXN0bWVudCA9IHRoaXMuaGVpZ2h0O1xuICAgIGlmICh0aGlzLnN0YXRlcy5jdXJyZW50LnNjYWxlWSA9PT0gMCkge1xuICAgICAgYWRqdXN0bWVudCA9IDAgLSBhZGp1c3RtZW50O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hZGp1c3RMYXllcnMoYWRqdXN0bWVudCwgbCwgdGhpcyk7XG4gIH07XG5cbiAgQ29sbGFwc2VIb2xkZXIucHJvdG90eXBlLnNvcnRMYXllcnMgPSBmdW5jdGlvbihsYXllckFycmF5KSB7XG4gICAgdmFyIGxheWVyLCBsYXllck5hbWUsIHJlc3VsdHM7XG4gICAgdGhpcy5zb3J0ZWRMYXllcnMgPSBbXTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChsYXllck5hbWUgaW4gbGF5ZXJBcnJheSkge1xuICAgICAgbGF5ZXIgPSBsYXllckFycmF5W2xheWVyTmFtZV07XG4gICAgICB0aGlzLnNvcnRlZExheWVycy5wdXNoKGxheWVyKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnNvcnRlZExheWVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEueSAtIGIueTtcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgcmV0dXJuIENvbGxhcHNlSG9sZGVyO1xuXG59KShMYXllcik7XG5cbmV4cG9ydHMuTmVzdGVkTGlzdCA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChOZXN0ZWRMaXN0LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBOZXN0ZWRMaXN0KGxheWVyTGlzdCkge1xuICAgIHRoaXMuYWRqdXN0TGF5ZXJzID0gYmluZCh0aGlzLmFkanVzdExheWVycywgdGhpcyk7XG4gICAgdGhpcy5yZXNpemVMYXllcnMgPSBiaW5kKHRoaXMucmVzaXplTGF5ZXJzLCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZUhvbGRlcnMgPSBiaW5kKHRoaXMuY3JlYXRlSG9sZGVycywgdGhpcyk7XG4gICAgTmVzdGVkTGlzdC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmNvbnRlbnQgPSB0aGlzLmNyZWF0ZUhvbGRlcnMobGF5ZXJMaXN0KTtcbiAgICB0aGlzLmRlcHRoID0gMDtcbiAgICB0aGlzLnNpemUgPSB0aGlzLmNvbnRlbnQuc2l6ZTtcbiAgICB0aGlzLnBvaW50ID0gdGhpcy5jb250ZW50LnBvaW50O1xuICAgIHRoaXMubmFtZSA9IFwiTmVzdGVkTGlzdFwiO1xuICB9XG5cbiAgTmVzdGVkTGlzdC5wcm90b3R5cGUuY3JlYXRlSG9sZGVycyA9IGZ1bmN0aW9uKGxldmVsLCB0b2dnbGVMYXllcikge1xuICAgIHZhciBjb2xsYXBzZUxheWVycywgaSwgaiwgbGVuLCBuZXh0VG9nZ2xlO1xuICAgIGNvbGxhcHNlTGF5ZXJzID0gW107XG4gICAgbmV4dFRvZ2dsZSA9IG51bGw7XG4gICAgZm9yIChqID0gMCwgbGVuID0gbGV2ZWwubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGkgPSBsZXZlbFtqXTtcbiAgICAgIGlmICghaVswXSkge1xuICAgICAgICBuZXh0VG9nZ2xlID0gaTtcbiAgICAgICAgY29sbGFwc2VMYXllcnMucHVzaChpKTtcbiAgICAgIH0gZWxzZSBpZiAoaVswXSkge1xuICAgICAgICB0aGlzLmRlcHRoID0gdGhpcy5kZXB0aCArIDE7XG4gICAgICAgIGNvbGxhcHNlTGF5ZXJzLnB1c2godGhpcy5jcmVhdGVIb2xkZXJzKGksIG5leHRUb2dnbGUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0b2dnbGVMYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5kZXB0aCA9IHRoaXMuZGVwdGggLSAxO1xuICAgICAgcmV0dXJuIG5ldyBleHBvcnRzLkNvbGxhcHNlSG9sZGVyKGNvbGxhcHNlTGF5ZXJzLCB0b2dnbGVMYXllcik7XG4gICAgfVxuICAgIHRoaXMucmVzaXplTGF5ZXJzKGNvbGxhcHNlTGF5ZXJzKTtcbiAgICByZXR1cm4gdGhpcy5sYXllcnMgPSBjb2xsYXBzZUxheWVycztcbiAgfTtcblxuICBOZXN0ZWRMaXN0LnByb3RvdHlwZS5yZXNpemVMYXllcnMgPSBmdW5jdGlvbihjb2xsYXBzZUxheWVycykge1xuICAgIHZhciBqLCBrLCBsYXllciwgbGF5ZXJIZWlnaHRzLCBsYXllck1pblhzLCBsYXllck1pbllzLCBsYXllcldpZHRocywgbGVuLCBsZW4xLCByZXN1bHRzO1xuICAgIGxheWVySGVpZ2h0cyA9IFtdO1xuICAgIGxheWVyV2lkdGhzID0gW107XG4gICAgbGF5ZXJNaW5YcyA9IFtdO1xuICAgIGxheWVyTWluWXMgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSBjb2xsYXBzZUxheWVycy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgbGF5ZXIgPSBjb2xsYXBzZUxheWVyc1tqXTtcbiAgICAgIGlmIChsYXllci5zdXBlckxheWVyID09PSAhdGhpcykge1xuICAgICAgICB0aGlzLnN1cGVyTGF5ZXIgPSBsYXllci5zdXBlckxheWVyO1xuICAgICAgfVxuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCArIGxheWVyLmhlaWdodDtcbiAgICAgIGxheWVySGVpZ2h0cy5wdXNoKGxheWVyLmhlaWdodCk7XG4gICAgICBsYXllcldpZHRocy5wdXNoKGxheWVyLndpZHRoKTtcbiAgICAgIGxheWVyTWluWHMucHVzaChsYXllci5taW5YKTtcbiAgICAgIGxheWVyTWluWXMucHVzaChsYXllci5taW5ZKTtcbiAgICB9XG4gICAgdGhpcy53aWR0aCA9IE1hdGgubWF4LmFwcGx5KHRoaXMsIGxheWVyV2lkdGhzKTtcbiAgICB0aGlzLmhlaWdodCA9IGxheWVySGVpZ2h0cy5yZWR1Y2UoZnVuY3Rpb24odCwgcykge1xuICAgICAgcmV0dXJuIHQgKyBzO1xuICAgIH0pO1xuICAgIHRoaXMueCA9IE1hdGgubWluLmFwcGx5KHRoaXMsIGxheWVyTWluWHMpO1xuICAgIHRoaXMueSA9IE1hdGgubWluLmFwcGx5KHRoaXMsIGxheWVyTWluWXMpO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGsgPSAwLCBsZW4xID0gY29sbGFwc2VMYXllcnMubGVuZ3RoOyBrIDwgbGVuMTsgaysrKSB7XG4gICAgICBsYXllciA9IGNvbGxhcHNlTGF5ZXJzW2tdO1xuICAgICAgbGF5ZXIuc3VwZXJMYXllciA9IHRoaXM7XG4gICAgICByZXN1bHRzLnB1c2gobGF5ZXIucG9pbnQgPSB7XG4gICAgICAgIHg6IGxheWVyLnggLSB0aGlzLngsXG4gICAgICAgIHk6IGxheWVyLnkgLSB0aGlzLnlcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBOZXN0ZWRMaXN0LnByb3RvdHlwZS5hZGp1c3RMYXllcnMgPSBmdW5jdGlvbihhZGp1c3RtZW50LCB0b2dnbGVMYXllciwgb3JpZ2luKSB7XG4gICAgdmFyIGosIGxheWVyLCBsZW4sIG1vdmVtZW50LCByZWY7XG4gICAgaWYgKG9yaWdpbi5pZCAhPT0gdGhpcy5pZCkge1xuICAgICAgcmVmID0gdGhpcy5jaGlsZHJlbjtcbiAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBsYXllciA9IHJlZltqXTtcbiAgICAgICAgaWYgKGxheWVyLmlkICE9PSBvcmlnaW4uaWQgJiYgbGF5ZXIuaWQgIT09IHRvZ2dsZUxheWVyLmlkKSB7XG4gICAgICAgICAgaWYgKGxheWVyLnNjcmVlbkZyYW1lLnkgPj0gb3JpZ2luLnNjcmVlbkZyYW1lLnkpIHtcbiAgICAgICAgICAgIGxheWVyLmFuaW1hdGUoe1xuICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgeTogbGF5ZXIueSArIGFkanVzdG1lbnRcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGltZTogMC4yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW92ZW1lbnQgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFuaW1hdGUoe1xuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0ICsgYWRqdXN0bWVudFxuICAgICAgfSxcbiAgICAgIHRpbWU6IDAuMlxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBOZXN0ZWRMaXN0O1xuXG59KShMYXllcik7XG4iLCJjbGFzcyBleHBvcnRzLkNvbGxhcHNlSG9sZGVyIGV4dGVuZHMgTGF5ZXJcblx0Y29uc3RydWN0b3I6IChsYXllckFycmF5LCB0b2dnbGVMYXllciwgc2tldGNoKSAtPlxuXHRcdHN1cGVyKClcblx0XHRALm9yaWdpblkgPSAwXG5cdFx0QC5hbmltYXRpb25PcHRpb25zID1cblx0XHRcdHRpbWU6IDAuMlxuXHRcdEAuc3RhdGVzLmNvbGxhcHNlZCA9XG5cdFx0XHRzY2FsZVk6IDBcblx0XHRALnN0YXRlcy5kZWZhdWx0ID1cblx0XHRcdHNjYWxlWTogMVxuXHRcdEAuaGVpZ2h0ID0gMFxuXHRcdEAuYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiXG5cdFx0aWYgdG9nZ2xlTGF5ZXJcblx0XHRcdEAubmFtZSA9IFwiY29sbGFwc2VfXCIgKyB0b2dnbGVMYXllci5uYW1lXG5cdFx0XHRALnRvZ2dsZUxheWVyID0gdG9nZ2xlTGF5ZXJcblx0XHR0b2dnbGVMYXllci5vbiBFdmVudHMuQ2xpY2ssIChlLGwpID0+XG5cdFx0XHRALnRvZ2dsZShsKVxuIyBcdFx0XHRALnN0YXRlcy5uZXh0KClcblxuXHRcdGxheWVySGVpZ2h0cyA9IFtdXG5cdFx0bGF5ZXJXaWR0aHMgPSBbXVxuXHRcdGxheWVyTWluWHMgPSBbXVxuXHRcdGxheWVyTWluWXMgPSBbXVxuXG5cdFx0Zm9yIGxheWVyIGluIGxheWVyQXJyYXlcblx0XHRcdEAuc3VwZXJMYXllcj1sYXllci5zdXBlckxheWVyXG5cdFx0XHRALmhlaWdodCA9IEAuaGVpZ2h0ICsgbGF5ZXIuaGVpZ2h0XG5cdFx0XHRsYXllckhlaWdodHMucHVzaCBsYXllci5oZWlnaHRcblx0XHRcdGxheWVyV2lkdGhzLnB1c2ggbGF5ZXIud2lkdGhcblx0XHRcdGxheWVyTWluWHMucHVzaCBsYXllci5taW5YXG5cdFx0XHRsYXllck1pbllzLnB1c2ggbGF5ZXIubWluWVxuXG5cdFx0QC53aWR0aCA9IE1hdGgubWF4LmFwcGx5IEAsIChsYXllcldpZHRocylcblx0XHRALmhlaWdodCA9IGxheWVySGVpZ2h0cy5yZWR1Y2UgKHQscykgLT4gdCArIHNcblx0XHRALmZ1bGxIZWlnaHQgPSBALmhlaWdodFxuXG5cdFx0QC54ID0gTWF0aC5taW4uYXBwbHkgQCwgKGxheWVyTWluWHMpXG5cdFx0QC55ID0gTWF0aC5taW4uYXBwbHkgQCwgKGxheWVyTWluWXMpXG5cblx0XHRmb3IgbGF5ZXIgaW4gbGF5ZXJBcnJheVxuXHRcdFx0bGF5ZXIuc3VwZXJMYXllciA9IEBcblx0XHRcdGxheWVyLnBvaW50ID1cblx0XHRcdFx0eDogbGF5ZXIueC1ALnhcblx0XHRcdFx0eTogbGF5ZXIueS1ALnlcblxuXHRcdEAuc29ydExheWVycyhsYXllckFycmF5KVxuXG5cblx0YWRqdXN0TGF5ZXJzOiAoYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbikgPT5cblx0XHRpZiBvcmlnaW4uaWQgIT0gQC5pZFxuXHRcdFx0Zm9yIGxheWVyIGluIEAuY2hpbGRyZW5cblx0XHRcdFx0aWYgbGF5ZXIuaWQgIT0gb3JpZ2luLmlkXG5cdFx0XHRcdFx0bW92ZW1lbnQ9MFxuXHRcdFx0XHRcdGlmIGxheWVyLnkgPiB0b2dnbGVMYXllci55XG5cdFx0XHRcdFx0XHRtb3ZlbWVudCA9IGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdGxheWVyLmFuaW1hdGVcblx0XHRcdFx0XHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0XHRcdFx0XHR5OiBsYXllci55ICsgYWRqdXN0bWVudFxuXHRcdFx0XHRcdFx0XHR0aW1lOiAwLjJcblx0XHRcdFx0XHRcdGxheWVyLnBhcmVudC5hbmltYXRlXG5cdFx0XHRcdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0OiBsYXllci5wYXJlbnQuaGVpZ2h0ICsgYWRqdXN0bWVudFxuXHRcdFx0XHRcdFx0XHR0aW1lOiAwLjJcblx0XHRALnBhcmVudC5hZGp1c3RMYXllcnMoYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbilcblxuXHRjb2xsYXBzZTogKCkgPT4gQC5hbmltYXRlKFwiY29sbGFwc2VkXCIpXG5cdGV4cGFuZDogKCkgPT4gQC5hbmltYXRlKFwiZGVmYXVsdFwiKVxuXHR0b2dnbGU6IChsKSA9PlxuXHRcdEAuc3RhdGVzLm5leHQoKVxuXHRcdGFkanVzdG1lbnQgPSBALmhlaWdodFxuXHRcdGlmIEAuc3RhdGVzLmN1cnJlbnQuc2NhbGVZIGlzIDBcblx0XHRcdGFkanVzdG1lbnQgPSAwIC0gYWRqdXN0bWVudFxuXHRcdEAuYWRqdXN0TGF5ZXJzKGFkanVzdG1lbnQsIGwsIEApXG5cblxuXG5cblx0c29ydExheWVyczogKGxheWVyQXJyYXkpID0+XG4gICAgXHRALnNvcnRlZExheWVycyA9IFtdXG4gICAgXHRmb3IgbGF5ZXJOYW1lLCBsYXllciBvZiBsYXllckFycmF5XG4gICAgXHRcdEAuc29ydGVkTGF5ZXJzLnB1c2gobGF5ZXIpXG4gICAgXHRcdEAuc29ydGVkTGF5ZXJzLnNvcnQoKGEsYikgLT4gYS55LWIueSlcblxuXG5cbmNsYXNzIGV4cG9ydHMuTmVzdGVkTGlzdCBleHRlbmRzIExheWVyXG5cdGNvbnN0cnVjdG9yOiAobGF5ZXJMaXN0KSAtPlxuXHRcdHN1cGVyKClcblx0XHRALmNvbnRlbnQgPSBALmNyZWF0ZUhvbGRlcnMobGF5ZXJMaXN0KVxuXHRcdEAuZGVwdGggPSAwXG5cdFx0QC5zaXplID0gQC5jb250ZW50LnNpemVcblx0XHRALnBvaW50ID0gQC5jb250ZW50LnBvaW50XG5cdFx0QC5uYW1lID0gXCJOZXN0ZWRMaXN0XCJcblx0Y3JlYXRlSG9sZGVyczogKGxldmVsLCB0b2dnbGVMYXllcikgPT5cblx0XHRjb2xsYXBzZUxheWVycyA9IFtdXG5cdFx0bmV4dFRvZ2dsZSA9IG51bGxcblx0XHRmb3IgaSBpbiBsZXZlbFxuXHRcdFx0aWYgbm90IGlbMF1cblx0XHRcdFx0bmV4dFRvZ2dsZSA9IGlcblx0XHRcdFx0Y29sbGFwc2VMYXllcnMucHVzaChpKVxuXHRcdFx0ZWxzZSBpZiBpWzBdXG5cdFx0XHRcdEAuZGVwdGg9IEAuZGVwdGgrMVxuXHRcdFx0XHRjb2xsYXBzZUxheWVycy5wdXNoKEAuY3JlYXRlSG9sZGVycyhpLCBuZXh0VG9nZ2xlKSlcblx0XHRpZiB0eXBlb2YgdG9nZ2xlTGF5ZXIgIT0gXCJ1bmRlZmluZWRcIlxuXHRcdFx0QC5kZXB0aCA9IEAuZGVwdGggLSAxXG5cdFx0XHRyZXR1cm4gbmV3IGV4cG9ydHMuQ29sbGFwc2VIb2xkZXIoY29sbGFwc2VMYXllcnMsIHRvZ2dsZUxheWVyKVxuXG5cdFx0QC5yZXNpemVMYXllcnMoY29sbGFwc2VMYXllcnMpXG5cdFx0QC5sYXllcnMgPSBjb2xsYXBzZUxheWVyc1xuXG5cdHJlc2l6ZUxheWVyczogKGNvbGxhcHNlTGF5ZXJzKSA9PlxuXHRcdGxheWVySGVpZ2h0cyA9IFtdXG5cdFx0bGF5ZXJXaWR0aHMgPSBbXVxuXHRcdGxheWVyTWluWHMgPSBbXVxuXHRcdGxheWVyTWluWXMgPSBbXVxuXG5cdFx0Zm9yIGxheWVyIGluIGNvbGxhcHNlTGF5ZXJzXG5cdFx0XHRpZiBsYXllci5zdXBlckxheWVyIGlzIG5vdCBAXG5cdFx0XHRcdEAuc3VwZXJMYXllcj1sYXllci5zdXBlckxheWVyXG5cdFx0XHRALmhlaWdodCA9IEAuaGVpZ2h0ICsgbGF5ZXIuaGVpZ2h0XG5cdFx0XHRsYXllckhlaWdodHMucHVzaCBsYXllci5oZWlnaHRcblx0XHRcdGxheWVyV2lkdGhzLnB1c2ggbGF5ZXIud2lkdGhcblx0XHRcdGxheWVyTWluWHMucHVzaCBsYXllci5taW5YXG5cdFx0XHRsYXllck1pbllzLnB1c2ggbGF5ZXIubWluWVxuXG5cdFx0QC53aWR0aCA9IE1hdGgubWF4LmFwcGx5IEAsIChsYXllcldpZHRocylcblx0XHRALmhlaWdodCA9IGxheWVySGVpZ2h0cy5yZWR1Y2UgKHQscykgLT4gdCArIHNcblxuXHRcdEAueCA9IE1hdGgubWluLmFwcGx5IEAsIChsYXllck1pblhzKVxuXHRcdEAueSA9IE1hdGgubWluLmFwcGx5IEAsIChsYXllck1pbllzKVxuXG5cdFx0Zm9yIGxheWVyIGluIGNvbGxhcHNlTGF5ZXJzXG5cdFx0XHRsYXllci5zdXBlckxheWVyID0gQFxuXHRcdFx0bGF5ZXIucG9pbnQgPVxuXHRcdFx0XHR4OiBsYXllci54LUAueFxuXHRcdFx0XHR5OiBsYXllci55LUAueVxuXG5cdGFkanVzdExheWVyczogKGFkanVzdG1lbnQsIHRvZ2dsZUxheWVyLCBvcmlnaW4pID0+XG5cdFx0aWYgb3JpZ2luLmlkICE9IEAuaWRcblx0XHRcdGZvciBsYXllciBpbiBALmNoaWxkcmVuXG5cdFx0XHRcdGlmIGxheWVyLmlkICE9IG9yaWdpbi5pZCBhbmQgbGF5ZXIuaWQgIT0gdG9nZ2xlTGF5ZXIuaWRcblx0XHRcdFx0XHRpZiBsYXllci5zY3JlZW5GcmFtZS55ID49IG9yaWdpbi5zY3JlZW5GcmFtZS55XG5cdFx0XHRcdFx0XHRsYXllci5hbmltYXRlXG5cdFx0XHRcdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0XHRcdFx0eTogbGF5ZXIueSArIGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdFx0dGltZTogMC4yXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRtb3ZlbWVudCA9IDBcblx0XHRALmFuaW1hdGVcblx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdGhlaWdodDogQC5oZWlnaHQgKyBhZGp1c3RtZW50XG5cdFx0XHR0aW1lOiAwLjJcbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBR0FBO0FEQUEsSUFBQTs7OztBQUFNLE9BQU8sQ0FBQzs7O0VBQ0Esd0JBQUMsVUFBRCxFQUFhLFdBQWIsRUFBMEIsTUFBMUI7Ozs7OztBQUNaLFFBQUE7SUFBQSw4Q0FBQTtJQUNBLElBQUMsQ0FBQyxPQUFGLEdBQVk7SUFDWixJQUFDLENBQUMsZ0JBQUYsR0FDQztNQUFBLElBQUEsRUFBTSxHQUFOOztJQUNELElBQUMsQ0FBQyxNQUFNLENBQUMsU0FBVCxHQUNDO01BQUEsTUFBQSxFQUFRLENBQVI7O0lBQ0QsSUFBQyxDQUFDLE1BQU0sQ0FBQyxTQUFELENBQVIsR0FDQztNQUFBLE1BQUEsRUFBUSxDQUFSOztJQUNELElBQUMsQ0FBQyxNQUFGLEdBQVc7SUFD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QSxHQUFXLEVBUFo7O0FBREQsT0FERDs7V0FVQSxJQUFDLENBQUMsT0FBRixDQUNDO01BQUEsVUFBQSxFQUNDO1FBQUEsTUFBQSxFQUFRLElBQUMsQ0FBQyxNQUFGLEdBQVcsVUFBbkI7T0FERDtNQUVBLElBQUEsRUFBTSxHQUZOO0tBREQ7RUFYYTs7OztHQXBEa0I7Ozs7QURyRmpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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
