require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvc2hvcnRjdXRzLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3RyZXZvcmNvbGVtYW4vRHJvcGJveCAoUGVyc29uYWwpL2ZyYW1lci9mcmFtZXItY29sbGFwc2VIb2xkZXIuZnJhbWVyL21vZHVsZXMvbmVzdGVkTGlzdC5qcyIsIi4uL21vZHVsZXMvbmVzdGVkTGlzdC5jb2ZmZWUiLCIuLi9tb2R1bGVzL215TW9kdWxlLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIFNob3J0Y3V0cyBmb3IgRnJhbWVyIDEuMFxuICBodHRwOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lclxuXG4gIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuICBSZWFkbWU6XG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lclxuXG4gIExpY2Vuc2U6XG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lci9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4jIyNcblxuXG5cblxuIyMjXG4gIENPTkZJR1VSQVRJT05cbiMjI1xuXG5zaG9ydGN1dHMgPSB7fVxuXG5GcmFtZXIuRGVmYXVsdHMuRmFkZUFuaW1hdGlvbiA9XG4gIGN1cnZlOiBcImJlemllci1jdXJ2ZVwiXG4gIHRpbWU6IDAuMlxuXG5GcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24gPVxuICBjdXJ2ZTogXCJzcHJpbmcoNDAwLDQwLDApXCJcblxuXG5cbiMjI1xuICBMT09QIE9OIEVWRVJZIExBWUVSXG5cbiAgU2hvcnRoYW5kIGZvciBhcHBseWluZyBhIGZ1bmN0aW9uIHRvIGV2ZXJ5IGxheWVyIGluIHRoZSBkb2N1bWVudC5cblxuICBFeGFtcGxlOlxuICBgYGBzaG9ydGN1dHMuZXZlcnlMYXllcihmdW5jdGlvbihsYXllcikge1xuICAgIGxheWVyLnZpc2libGUgPSBmYWxzZTtcbiAgfSk7YGBgXG4jIyNcbnNob3J0Y3V0cy5ldmVyeUxheWVyID0gKGZuKSAtPlxuICBmb3IgbGF5ZXJOYW1lIG9mIHdpbmRvdy5MYXllcnNcbiAgICBfbGF5ZXIgPSB3aW5kb3cuTGF5ZXJzW2xheWVyTmFtZV1cbiAgICBmbiBfbGF5ZXJcblxuXG4jIyNcbiAgU0hPUlRIQU5EIEZPUiBBQ0NFU1NJTkcgTEFZRVJTXG5cbiAgQ29udmVydCBlYWNoIGxheWVyIGNvbWluZyBmcm9tIHRoZSBleHBvcnRlciBpbnRvIGEgSmF2YXNjcmlwdCBvYmplY3QgZm9yIHNob3J0aGFuZCBhY2Nlc3MuXG5cbiAgVGhpcyBoYXMgdG8gYmUgY2FsbGVkIG1hbnVhbGx5IGluIEZyYW1lcjMgYWZ0ZXIgeW91J3ZlIHJhbiB0aGUgaW1wb3J0ZXIuXG5cbiAgbXlMYXllcnMgPSBGcmFtZXIuSW1wb3J0ZXIubG9hZChcIi4uLlwiKVxuICBzaG9ydGN1dHMuaW5pdGlhbGl6ZShteUxheWVycylcblxuICBJZiB5b3UgaGF2ZSBhIGxheWVyIGluIHlvdXIgUFNEL1NrZXRjaCBjYWxsZWQgXCJOZXdzRmVlZFwiLCB0aGlzIHdpbGwgY3JlYXRlIGEgZ2xvYmFsIEphdmFzY3JpcHQgdmFyaWFibGUgY2FsbGVkIFwiTmV3c0ZlZWRcIiB0aGF0IHlvdSBjYW4gbWFuaXB1bGF0ZSB3aXRoIEZyYW1lci5cblxuICBFeGFtcGxlOlxuICBgTmV3c0ZlZWQudmlzaWJsZSA9IGZhbHNlO2BcblxuICBOb3RlczpcbiAgSmF2YXNjcmlwdCBoYXMgc29tZSBuYW1lcyByZXNlcnZlZCBmb3IgaW50ZXJuYWwgZnVuY3Rpb24gdGhhdCB5b3UgY2FuJ3Qgb3ZlcnJpZGUgKGZvciBleC4gKVxuICBJZiB5b3UgY2FsbCBpbml0aWFsaXplIHdpdGhvdXQgYW55dGhpbmcsIGl0IHdpbGwgdXNlIGFsbCBjdXJyZW50bHkgYXZhaWxhYmxlIGxheWVycy5cbiMjI1xuc2hvcnRjdXRzLmluaXRpYWxpemUgPSAobGF5ZXJzKSAtPlxuXG4gIGxheWVyID0gRnJhbWVyLkN1cnJlbnRDb250ZXh0Ll9sYXllckxpc3QgaWYgbm90IGxheWVyc1xuXG4gIHdpbmRvdy5MYXllcnMgPSBsYXllcnNcblxuICBzaG9ydGN1dHMuZXZlcnlMYXllciAobGF5ZXIpIC0+XG4gICAgc2FuaXRpemVkTGF5ZXJOYW1lID0gbGF5ZXIubmFtZS5yZXBsYWNlKC9bLSshPzoqXFxbXFxdXFwoXFwpXFwvXS9nLCAnJykudHJpbSgpLnJlcGxhY2UoL1xccy9nLCAnXycpXG4gICAgd2luZG93W3Nhbml0aXplZExheWVyTmFtZV0gPSBsYXllclxuICAgIHNob3J0Y3V0cy5zYXZlT3JpZ2luYWxGcmFtZSBsYXllclxuICAgIHNob3J0Y3V0cy5pbml0aWFsaXplVG91Y2hTdGF0ZXMgbGF5ZXJcblxuXG4jIyNcbiAgRklORCBDSElMRCBMQVlFUlMgQlkgTkFNRVxuXG4gIFJldHJpZXZlcyBzdWJMYXllcnMgb2Ygc2VsZWN0ZWQgbGF5ZXIgdGhhdCBoYXZlIGEgbWF0Y2hpbmcgbmFtZS5cblxuICBnZXRDaGlsZDogcmV0dXJuIHRoZSBmaXJzdCBzdWJsYXllciB3aG9zZSBuYW1lIGluY2x1ZGVzIHRoZSBnaXZlbiBzdHJpbmdcbiAgZ2V0Q2hpbGRyZW46IHJldHVybiBhbGwgc3ViTGF5ZXJzIHRoYXQgbWF0Y2hcblxuICBVc2VmdWwgd2hlbiBlZy4gaXRlcmF0aW5nIG92ZXIgdGFibGUgY2VsbHMuIFVzZSBnZXRDaGlsZCB0byBhY2Nlc3MgdGhlIGJ1dHRvbiBmb3VuZCBpbiBlYWNoIGNlbGwuIFRoaXMgaXMgKipjYXNlIGluc2Vuc2l0aXZlKiouXG5cbiAgRXhhbXBsZTpcbiAgYHRvcExheWVyID0gTmV3c0ZlZWQuZ2V0Q2hpbGQoXCJUb3BcIilgIExvb2tzIGZvciBsYXllcnMgd2hvc2UgbmFtZSBtYXRjaGVzIFRvcC4gUmV0dXJucyB0aGUgZmlyc3QgbWF0Y2hpbmcgbGF5ZXIuXG5cbiAgYGNoaWxkTGF5ZXJzID0gVGFibGUuZ2V0Q2hpbGRyZW4oXCJDZWxsXCIpYCBSZXR1cm5zIGFsbCBjaGlsZHJlbiB3aG9zZSBuYW1lIG1hdGNoIENlbGwgaW4gYW4gYXJyYXkuXG4jIyNcbkxheWVyOjpnZXRDaGlsZCA9IChuZWVkbGUsIHJlY3Vyc2l2ZSA9IGZhbHNlKSAtPlxuICAjIFNlYXJjaCBkaXJlY3QgY2hpbGRyZW5cbiAgZm9yIHN1YkxheWVyIGluIEBzdWJMYXllcnNcbiAgICByZXR1cm4gc3ViTGF5ZXIgaWYgc3ViTGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobmVlZGxlLnRvTG93ZXJDYXNlKCkpIGlzbnQgLTEgXG5cbiAgIyBSZWN1cnNpdmVseSBzZWFyY2ggY2hpbGRyZW4gb2YgY2hpbGRyZW5cbiAgaWYgcmVjdXJzaXZlXG4gICAgZm9yIHN1YkxheWVyIGluIEBzdWJMYXllcnNcbiAgICAgIHJldHVybiBzdWJMYXllci5nZXRDaGlsZChuZWVkbGUsIHJlY3Vyc2l2ZSkgaWYgc3ViTGF5ZXIuZ2V0Q2hpbGQobmVlZGxlLCByZWN1cnNpdmUpIFxuXG5cbkxheWVyOjpnZXRDaGlsZHJlbiA9IChuZWVkbGUsIHJlY3Vyc2l2ZSA9IGZhbHNlKSAtPlxuICByZXN1bHRzID0gW11cblxuICBpZiByZWN1cnNpdmVcbiAgICBmb3Igc3ViTGF5ZXIgaW4gQHN1YkxheWVyc1xuICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0IHN1YkxheWVyLmdldENoaWxkcmVuKG5lZWRsZSwgcmVjdXJzaXZlKVxuICAgIHJlc3VsdHMucHVzaCBAIGlmIEBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihuZWVkbGUudG9Mb3dlckNhc2UoKSkgaXNudCAtMVxuICAgIHJldHVybiByZXN1bHRzXG5cbiAgZWxzZVxuICAgIGZvciBzdWJMYXllciBpbiBAc3ViTGF5ZXJzXG4gICAgICBpZiBzdWJMYXllci5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihuZWVkbGUudG9Mb3dlckNhc2UoKSkgaXNudCAtMSBcbiAgICAgICAgcmVzdWx0cy5wdXNoIHN1YkxheWVyIFxuICAgIHJldHVybiByZXN1bHRzXG5cblxuXG4jIyNcbiAgQ09OVkVSVCBBIE5VTUJFUiBSQU5HRSBUTyBBTk9USEVSXG5cbiAgQ29udmVydHMgYSBudW1iZXIgd2l0aGluIG9uZSByYW5nZSB0byBhbm90aGVyIHJhbmdlXG5cbiAgRXhhbXBsZTpcbiAgV2Ugd2FudCB0byBtYXAgdGhlIG9wYWNpdHkgb2YgYSBsYXllciB0byBpdHMgeCBsb2NhdGlvbi5cblxuICBUaGUgb3BhY2l0eSB3aWxsIGJlIDAgaWYgdGhlIFggY29vcmRpbmF0ZSBpcyAwLCBhbmQgaXQgd2lsbCBiZSAxIGlmIHRoZSBYIGNvb3JkaW5hdGUgaXMgNjQwLiBBbGwgdGhlIFggY29vcmRpbmF0ZXMgaW4gYmV0d2VlbiB3aWxsIHJlc3VsdCBpbiBpbnRlcm1lZGlhdGUgdmFsdWVzIGJldHdlZW4gMCBhbmQgMS5cblxuICBgbXlMYXllci5vcGFjaXR5ID0gY29udmVydFJhbmdlKDAsIDY0MCwgbXlMYXllci54LCAwLCAxKWBcblxuICBCeSBkZWZhdWx0LCB0aGlzIHZhbHVlIG1pZ2h0IGJlIG91dHNpZGUgdGhlIGJvdW5kcyBvZiBOZXdNaW4gYW5kIE5ld01heCBpZiB0aGUgT2xkVmFsdWUgaXMgb3V0c2lkZSBPbGRNaW4gYW5kIE9sZE1heC4gSWYgeW91IHdhbnQgdG8gY2FwIHRoZSBmaW5hbCB2YWx1ZSB0byBOZXdNaW4gYW5kIE5ld01heCwgc2V0IGNhcHBlZCB0byB0cnVlLlxuICBNYWtlIHN1cmUgTmV3TWluIGlzIHNtYWxsZXIgdGhhbiBOZXdNYXggaWYgeW91J3JlIHVzaW5nIHRoaXMuIElmIHlvdSBuZWVkIGFuIGludmVyc2UgcHJvcG9ydGlvbiwgdHJ5IHN3YXBwaW5nIE9sZE1pbiBhbmQgT2xkTWF4LlxuIyMjXG5zaG9ydGN1dHMuY29udmVydFJhbmdlID0gKE9sZE1pbiwgT2xkTWF4LCBPbGRWYWx1ZSwgTmV3TWluLCBOZXdNYXgsIGNhcHBlZCkgLT5cbiAgT2xkUmFuZ2UgPSAoT2xkTWF4IC0gT2xkTWluKVxuICBOZXdSYW5nZSA9IChOZXdNYXggLSBOZXdNaW4pXG4gIE5ld1ZhbHVlID0gKCgoT2xkVmFsdWUgLSBPbGRNaW4pICogTmV3UmFuZ2UpIC8gT2xkUmFuZ2UpICsgTmV3TWluXG5cbiAgaWYgY2FwcGVkXG4gICAgaWYgTmV3VmFsdWUgPiBOZXdNYXhcbiAgICAgIE5ld01heFxuICAgIGVsc2UgaWYgTmV3VmFsdWUgPCBOZXdNaW5cbiAgICAgIE5ld01pblxuICAgIGVsc2VcbiAgICAgIE5ld1ZhbHVlXG4gIGVsc2VcbiAgICBOZXdWYWx1ZVxuXG5cbiMjI1xuICBPUklHSU5BTCBGUkFNRVxuXG4gIFN0b3JlcyB0aGUgaW5pdGlhbCBsb2NhdGlvbiBhbmQgc2l6ZSBvZiBhIGxheWVyIGluIHRoZSBcIm9yaWdpbmFsRnJhbWVcIiBhdHRyaWJ1dGUsIHNvIHlvdSBjYW4gcmV2ZXJ0IHRvIGl0IGxhdGVyIG9uLlxuXG4gIEV4YW1wbGU6XG4gIFRoZSB4IGNvb3JkaW5hdGUgb2YgTXlMYXllciBpcyBpbml0aWFsbHkgNDAwIChmcm9tIHRoZSBQU0QpXG5cbiAgYGBgTXlMYXllci54ID0gMjAwOyAvLyBub3cgd2Ugc2V0IGl0IHRvIDIwMC5cbiAgTXlMYXllci54ID0gTXlMYXllci5vcmlnaW5hbEZyYW1lLnggLy8gbm93IHdlIHNldCBpdCBiYWNrIHRvIGl0cyBvcmlnaW5hbCB2YWx1ZSwgNDAwLmBgYFxuIyMjXG5zaG9ydGN1dHMuc2F2ZU9yaWdpbmFsRnJhbWUgPSAobGF5ZXIpIC0+XG4gIGxheWVyLm9yaWdpbmFsRnJhbWUgPSBsYXllci5mcmFtZVxuXG4jIyNcbiAgU0hPUlRIQU5EIEhPVkVSIFNZTlRBWFxuXG4gIFF1aWNrbHkgZGVmaW5lIGZ1bmN0aW9ucyB0aGF0IHNob3VsZCBydW4gd2hlbiBJIGhvdmVyIG92ZXIgYSBsYXllciwgYW5kIGhvdmVyIG91dC5cblxuICBFeGFtcGxlOlxuICBgTXlMYXllci5ob3ZlcihmdW5jdGlvbigpIHsgT3RoZXJMYXllci5zaG93KCkgfSwgZnVuY3Rpb24oKSB7IE90aGVyTGF5ZXIuaGlkZSgpIH0pO2BcbiMjI1xuTGF5ZXI6OmhvdmVyID0gKGVudGVyRnVuY3Rpb24sIGxlYXZlRnVuY3Rpb24pIC0+XG4gIHRoaXMub24gJ21vdXNlZW50ZXInLCBlbnRlckZ1bmN0aW9uXG4gIHRoaXMub24gJ21vdXNlbGVhdmUnLCBsZWF2ZUZ1bmN0aW9uXG5cblxuIyMjXG4gIFNIT1JUSEFORCBUQVAgU1lOVEFYXG5cbiAgSW5zdGVhZCBvZiBgTXlMYXllci5vbihFdmVudHMuVG91Y2hFbmQsIGhhbmRsZXIpYCwgdXNlIGBNeUxheWVyLnRhcChoYW5kbGVyKWBcbiMjI1xuXG5MYXllcjo6dGFwID0gKGhhbmRsZXIpIC0+XG4gIHRoaXMub24gRXZlbnRzLlRvdWNoRW5kLCBoYW5kbGVyXG5cblxuIyMjXG4gIFNIT1JUSEFORCBDTElDSyBTWU5UQVhcblxuICBJbnN0ZWFkIG9mIGBNeUxheWVyLm9uKEV2ZW50cy5DbGljaywgaGFuZGxlcilgLCB1c2UgYE15TGF5ZXIuY2xpY2soaGFuZGxlcilgXG4jIyNcblxuTGF5ZXI6OmNsaWNrID0gKGhhbmRsZXIpIC0+XG4gIHRoaXMub24gRXZlbnRzLkNsaWNrLCBoYW5kbGVyXG5cblxuXG4jIyNcbiAgU0hPUlRIQU5EIEFOSU1BVElPTiBTWU5UQVhcblxuICBBIHNob3J0ZXIgYW5pbWF0aW9uIHN5bnRheCB0aGF0IG1pcnJvcnMgdGhlIGpRdWVyeSBzeW50YXg6XG4gIGxheWVyLmFuaW1hdGUocHJvcGVydGllcywgW3RpbWVdLCBbY3VydmVdLCBbY2FsbGJhY2tdKVxuXG4gIEFsbCBwYXJhbWV0ZXJzIGV4Y2VwdCBwcm9wZXJ0aWVzIGFyZSBvcHRpb25hbCBhbmQgY2FuIGJlIG9taXR0ZWQuXG5cbiAgT2xkOlxuICBgYGBNeUxheWVyLmFuaW1hdGUoe1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHg6IDUwMFxuICAgIH0sXG4gICAgdGltZTogNTAwLFxuICAgIGN1cnZlOiAnYmV6aWVyLWN1cnZlJ1xuICB9KWBgYFxuXG4gIE5ldzpcbiAgYGBgTXlMYXllci5hbmltYXRlVG8oe1xuICAgIHg6IDUwMFxuICB9KWBgYFxuXG4gIE9wdGlvbmFsbHkgKHdpdGggMTAwMG1zIGR1cmF0aW9uIGFuZCBzcHJpbmcpOlxuICAgIGBgYE15TGF5ZXIuYW5pbWF0ZVRvKHtcbiAgICB4OiA1MDBcbiAgfSwgMTAwMCwgXCJzcHJpbmcoMTAwLDEwLDApXCIpXG4jIyNcblxuXG5cbkxheWVyOjphbmltYXRlVG8gPSAocHJvcGVydGllcywgZmlyc3QsIHNlY29uZCwgdGhpcmQpIC0+XG4gIHRoaXNMYXllciA9IHRoaXNcbiAgdGltZSA9IGN1cnZlID0gY2FsbGJhY2sgPSBudWxsXG5cbiAgaWYgdHlwZW9mKGZpcnN0KSA9PSBcIm51bWJlclwiXG4gICAgdGltZSA9IGZpcnN0XG4gICAgaWYgdHlwZW9mKHNlY29uZCkgPT0gXCJzdHJpbmdcIlxuICAgICAgY3VydmUgPSBzZWNvbmRcbiAgICAgIGNhbGxiYWNrID0gdGhpcmRcbiAgICBjYWxsYmFjayA9IHNlY29uZCBpZiB0eXBlb2Yoc2Vjb25kKSA9PSBcImZ1bmN0aW9uXCJcbiAgZWxzZSBpZiB0eXBlb2YoZmlyc3QpID09IFwic3RyaW5nXCJcbiAgICBjdXJ2ZSA9IGZpcnN0XG4gICAgY2FsbGJhY2sgPSBzZWNvbmQgaWYgdHlwZW9mKHNlY29uZCkgPT0gXCJmdW5jdGlvblwiXG4gIGVsc2UgaWYgdHlwZW9mKGZpcnN0KSA9PSBcImZ1bmN0aW9uXCJcbiAgICBjYWxsYmFjayA9IGZpcnN0XG5cbiAgaWYgdGltZT8gJiYgIWN1cnZlP1xuICAgIGN1cnZlID0gJ2Jlemllci1jdXJ2ZSdcbiAgXG4gIGN1cnZlID0gRnJhbWVyLkRlZmF1bHRzLkFuaW1hdGlvbi5jdXJ2ZSBpZiAhY3VydmU/XG4gIHRpbWUgPSBGcmFtZXIuRGVmYXVsdHMuQW5pbWF0aW9uLnRpbWUgaWYgIXRpbWU/XG5cbiAgdGhpc0xheWVyLmFuaW1hdGlvblRvID0gbmV3IEFuaW1hdGlvblxuICAgIGxheWVyOiB0aGlzTGF5ZXJcbiAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzXG4gICAgY3VydmU6IGN1cnZlXG4gICAgdGltZTogdGltZVxuXG4gIHRoaXNMYXllci5hbmltYXRpb25Uby5vbiAnc3RhcnQnLCAtPlxuICAgIHRoaXNMYXllci5pc0FuaW1hdGluZyA9IHRydWVcblxuICB0aGlzTGF5ZXIuYW5pbWF0aW9uVG8ub24gJ2VuZCcsIC0+XG4gICAgdGhpc0xheWVyLmlzQW5pbWF0aW5nID0gbnVsbFxuICAgIGlmIGNhbGxiYWNrP1xuICAgICAgY2FsbGJhY2soKVxuXG4gIHRoaXNMYXllci5hbmltYXRpb25Uby5zdGFydCgpXG5cbiMjI1xuICBBTklNQVRFIE1PQklMRSBMQVlFUlMgSU4gQU5EIE9VVCBPRiBUSEUgVklFV1BPUlRcblxuICBTaG9ydGhhbmQgc3ludGF4IGZvciBhbmltYXRpbmcgbGF5ZXJzIGluIGFuZCBvdXQgb2YgdGhlIHZpZXdwb3J0LiBBc3N1bWVzIHRoYXQgdGhlIGxheWVyIHlvdSBhcmUgYW5pbWF0aW5nIGlzIGEgd2hvbGUgc2NyZWVuIGFuZCBoYXMgdGhlIHNhbWUgZGltZW5zaW9ucyBhcyB5b3VyIGNvbnRhaW5lci5cblxuICBFbmFibGUgdGhlIGRldmljZSBwcmV2aWV3IGluIEZyYW1lciBTdHVkaW8gdG8gdXNlIHRoaXMg4oCTwqBpdCBsZXRzIHRoaXMgc2NyaXB0IGZpZ3VyZSBvdXQgd2hhdCB0aGUgYm91bmRzIG9mIHlvdXIgc2NyZWVuIGFyZS5cblxuICBFeGFtcGxlOlxuICAqIGBNeUxheWVyLnNsaWRlVG9MZWZ0KClgIHdpbGwgYW5pbWF0ZSB0aGUgbGF5ZXIgKip0byoqIHRoZSBsZWZ0IGNvcm5lciBvZiB0aGUgc2NyZWVuIChmcm9tIGl0cyBjdXJyZW50IHBvc2l0aW9uKVxuXG4gICogYE15TGF5ZXIuc2xpZGVGcm9tTGVmdCgpYCB3aWxsIGFuaW1hdGUgdGhlIGxheWVyIGludG8gdGhlIHZpZXdwb3J0ICoqZnJvbSoqIHRoZSBsZWZ0IGNvcm5lciAoZnJvbSB4PS13aWR0aClcblxuICBDb25maWd1cmF0aW9uOlxuICAqIChCeSBkZWZhdWx0IHdlIHVzZSBhIHNwcmluZyBjdXJ2ZSB0aGF0IGFwcHJveGltYXRlcyBpT1MuIFRvIHVzZSBhIHRpbWUgZHVyYXRpb24sIGNoYW5nZSB0aGUgY3VydmUgdG8gYmV6aWVyLWN1cnZlLilcbiAgKiBGcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24udGltZVxuICAqIEZyYW1lci5EZWZhdWx0cy5TbGlkZUFuaW1hdGlvbi5jdXJ2ZVxuXG5cbiAgSG93IHRvIHJlYWQgdGhlIGNvbmZpZ3VyYXRpb246XG4gIGBgYHNsaWRlRnJvbUxlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiICAgICAvLyBhbmltYXRlIGFsb25nIHRoZSBYIGF4aXNcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIGZyb206IC0xICAgICAgICAgIC8vIHN0YXJ0IHZhbHVlOiBvdXRzaWRlIHRoZSBsZWZ0IGNvcm5lciAoIHggPSAtd2lkdGhfcGhvbmUgKVxuICAgIHRvOiAwICAgICAgICAgICAgIC8vIGVuZCB2YWx1ZTogaW5zaWRlIHRoZSBsZWZ0IGNvcm5lciAoIHggPSB3aWR0aF9sYXllciApXG4gIGBgYFxuIyMjXG5cblxuc2hvcnRjdXRzLnNsaWRlQW5pbWF0aW9ucyA9XG4gIHNsaWRlRnJvbUxlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICBmcm9tOiAtMVxuICAgIHRvOiAwXG5cbiAgc2xpZGVUb0xlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICB0bzogLTFcblxuICBzbGlkZUZyb21SaWdodDpcbiAgICBwcm9wZXJ0eTogXCJ4XCJcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIGZyb206IDFcbiAgICB0bzogMFxuXG4gIHNsaWRlVG9SaWdodDpcbiAgICBwcm9wZXJ0eTogXCJ4XCJcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIHRvOiAxXG5cbiAgc2xpZGVGcm9tVG9wOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIGZyb206IC0xXG4gICAgdG86IDBcblxuICBzbGlkZVRvVG9wOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIHRvOiAtMVxuXG4gIHNsaWRlRnJvbUJvdHRvbTpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICBmcm9tOiAxXG4gICAgdG86IDBcblxuICBzbGlkZVRvQm90dG9tOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIHRvOiAxXG5cblxuXG5fLmVhY2ggc2hvcnRjdXRzLnNsaWRlQW5pbWF0aW9ucywgKG9wdHMsIG5hbWUpIC0+XG4gIExheWVyLnByb3RvdHlwZVtuYW1lXSA9ICh0aW1lKSAtPlxuICAgIF9waG9uZSA9IEZyYW1lci5EZXZpY2U/LnNjcmVlbj8uZnJhbWVcblxuICAgIHVubGVzcyBfcGhvbmVcbiAgICAgIGVyciA9IFwiUGxlYXNlIHNlbGVjdCBhIGRldmljZSBwcmV2aWV3IGluIEZyYW1lciBTdHVkaW8gdG8gdXNlIHRoZSBzbGlkZSBwcmVzZXQgYW5pbWF0aW9ucy5cIlxuICAgICAgcHJpbnQgZXJyXG4gICAgICBjb25zb2xlLmxvZyBlcnJcbiAgICAgIHJldHVyblxuXG4gICAgX3Byb3BlcnR5ID0gb3B0cy5wcm9wZXJ0eVxuICAgIF9mYWN0b3IgPSBfcGhvbmVbb3B0cy5mYWN0b3JdXG5cbiAgICBpZiBvcHRzLmZyb20/XG4gICAgICAjIEluaXRpYXRlIHRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgYW5pbWF0aW9uIChpLmUuIG9mZiBzY3JlZW4gb24gdGhlIGxlZnQgY29ybmVyKVxuICAgICAgdGhpc1tfcHJvcGVydHldID0gb3B0cy5mcm9tICogX2ZhY3RvclxuXG4gICAgIyBEZWZhdWx0IGFuaW1hdGlvbiBzeW50YXggbGF5ZXIuYW5pbWF0ZSh7X3Byb3BlcnR5OiAwfSkgd291bGQgdHJ5IHRvIGFuaW1hdGUgJ19wcm9wZXJ0eScgbGl0ZXJhbGx5LCBpbiBvcmRlciBmb3IgaXQgdG8gYmxvdyB1cCB0byB3aGF0J3MgaW4gaXQgKGVnIHgpLCB3ZSB1c2UgdGhpcyBzeW50YXhcbiAgICBfYW5pbWF0aW9uQ29uZmlnID0ge31cbiAgICBfYW5pbWF0aW9uQ29uZmlnW19wcm9wZXJ0eV0gPSBvcHRzLnRvICogX2ZhY3RvclxuXG4gICAgaWYgdGltZVxuICAgICAgX3RpbWUgPSB0aW1lXG4gICAgICBfY3VydmUgPSBcImJlemllci1jdXJ2ZVwiXG4gICAgZWxzZVxuICAgICAgX3RpbWUgPSBGcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24udGltZVxuICAgICAgX2N1cnZlID0gRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uLmN1cnZlXG5cbiAgICB0aGlzLmFuaW1hdGVcbiAgICAgIHByb3BlcnRpZXM6IF9hbmltYXRpb25Db25maWdcbiAgICAgIHRpbWU6IF90aW1lXG4gICAgICBjdXJ2ZTogX2N1cnZlXG5cblxuXG4jIyNcbiAgRUFTWSBGQURFIElOIC8gRkFERSBPVVRcblxuICAuc2hvdygpIGFuZCAuaGlkZSgpIGFyZSBzaG9ydGN1dHMgdG8gYWZmZWN0IG9wYWNpdHkgYW5kIHBvaW50ZXIgZXZlbnRzLiBUaGlzIGlzIGVzc2VudGlhbGx5IHRoZSBzYW1lIGFzIGhpZGluZyB3aXRoIGB2aXNpYmxlID0gZmFsc2VgIGJ1dCBjYW4gYmUgYW5pbWF0ZWQuXG5cbiAgLmZhZGVJbigpIGFuZCAuZmFkZU91dCgpIGFyZSBzaG9ydGN1dHMgdG8gZmFkZSBpbiBhIGhpZGRlbiBsYXllciwgb3IgZmFkZSBvdXQgYSB2aXNpYmxlIGxheWVyLlxuXG4gIFRoZXNlIHNob3J0Y3V0cyB3b3JrIG9uIGluZGl2aWR1YWwgbGF5ZXIgb2JqZWN0cyBhcyB3ZWxsIGFzIGFuIGFycmF5IG9mIGxheWVycy5cblxuICBFeGFtcGxlOlxuICAqIGBNeUxheWVyLmZhZGVJbigpYCB3aWxsIGZhZGUgaW4gTXlMYXllciB1c2luZyBkZWZhdWx0IHRpbWluZy5cbiAgKiBgW015TGF5ZXIsIE90aGVyTGF5ZXJdLmZhZGVPdXQoNClgIHdpbGwgZmFkZSBvdXQgYm90aCBNeUxheWVyIGFuZCBPdGhlckxheWVyIG92ZXIgNCBzZWNvbmRzLlxuXG4gIFRvIGN1c3RvbWl6ZSB0aGUgZmFkZSBhbmltYXRpb24sIGNoYW5nZSB0aGUgdmFyaWFibGVzIHRpbWUgYW5kIGN1cnZlIGluc2lkZSBgRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb25gLlxuIyMjXG5MYXllcjo6c2hvdyA9IC0+XG4gIEBvcGFjaXR5ID0gMVxuICBAc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJ1xuICBAXG5cbkxheWVyOjpoaWRlID0gLT5cbiAgQG9wYWNpdHkgPSAwXG4gIEBzdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnXG4gIEBcblxuTGF5ZXI6OmZhZGVJbiA9ICh0aW1lID0gRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24udGltZSkgLT5cbiAgcmV0dXJuIGlmIEBvcGFjaXR5ID09IDFcblxuICB1bmxlc3MgQHZpc2libGVcbiAgICBAb3BhY2l0eSA9IDBcbiAgICBAdmlzaWJsZSA9IHRydWVcblxuICBAYW5pbWF0ZVRvIG9wYWNpdHk6IDEsIHRpbWUsIEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uLmN1cnZlXG5cbkxheWVyOjpmYWRlT3V0ID0gKHRpbWUgPSBGcmFtZXIuRGVmYXVsdHMuRmFkZUFuaW1hdGlvbi50aW1lKSAtPlxuICByZXR1cm4gaWYgQG9wYWNpdHkgPT0gMFxuXG4gIHRoYXQgPSBAXG4gIEBhbmltYXRlVG8gb3BhY2l0eTogMCwgdGltZSwgRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24uY3VydmUsIC0+IHRoYXQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJ1xuXG4jIGFsbCBvZiB0aGUgZWFzeSBpbi9vdXQgaGVscGVycyB3b3JrIG9uIGFuIGFycmF5IG9mIHZpZXdzIGFzIHdlbGwgYXMgaW5kaXZpZHVhbCB2aWV3c1xuXy5lYWNoIFsnc2hvdycsICdoaWRlJywgJ2ZhZGVJbicsICdmYWRlT3V0J10sIChmblN0cmluZyktPiAgXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBBcnJheS5wcm90b3R5cGUsIGZuU3RyaW5nLCBcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIHZhbHVlOiAodGltZSkgLT5cbiAgICAgIF8uZWFjaCBALCAobGF5ZXIpIC0+XG4gICAgICAgIExheWVyLnByb3RvdHlwZVtmblN0cmluZ10uY2FsbChsYXllciwgdGltZSkgaWYgbGF5ZXIgaW5zdGFuY2VvZiBMYXllclxuICAgICAgQFxuXG5cbiMjI1xuICBFQVNZIEhPVkVSIEFORCBUT1VDSC9DTElDSyBTVEFURVMgRk9SIExBWUVSU1xuXG4gIEJ5IG5hbWluZyB5b3VyIGxheWVyIGhpZXJhcmNoeSBpbiB0aGUgZm9sbG93aW5nIHdheSwgeW91IGNhbiBhdXRvbWF0aWNhbGx5IGhhdmUgeW91ciBsYXllcnMgcmVhY3QgdG8gaG92ZXJzLCBjbGlja3Mgb3IgdGFwcy5cblxuICBCdXR0b25fdG91Y2hhYmxlXG4gIC0gQnV0dG9uX2RlZmF1bHQgKGRlZmF1bHQgc3RhdGUpXG4gIC0gQnV0dG9uX2Rvd24gKHRvdWNoL2NsaWNrIHN0YXRlKVxuICAtIEJ1dHRvbl9ob3ZlciAoaG92ZXIpXG4jIyNcblxuc2hvcnRjdXRzLmluaXRpYWxpemVUb3VjaFN0YXRlcyA9IChsYXllcikgLT5cbiAgX2RlZmF1bHQgPSBsYXllci5nZXRDaGlsZCgnZGVmYXVsdCcpXG5cbiAgaWYgbGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ3RvdWNoYWJsZScpIGFuZCBfZGVmYXVsdFxuXG4gICAgdW5sZXNzIEZyYW1lci5VdGlscy5pc01vYmlsZSgpXG4gICAgICBfaG92ZXIgPSBsYXllci5nZXRDaGlsZCgnaG92ZXInKVxuICAgIF9kb3duID0gbGF5ZXIuZ2V0Q2hpbGQoJ2Rvd24nKVxuXG4gICAgIyBUaGVzZSBsYXllcnMgc2hvdWxkIGJlIGhpZGRlbiBieSBkZWZhdWx0XG4gICAgX2hvdmVyPy5oaWRlKClcbiAgICBfZG93bj8uaGlkZSgpXG5cbiAgICAjIENyZWF0ZSBmYWtlIGhpdCB0YXJnZXQgKHNvIHdlIGRvbid0IHJlLWZpcmUgZXZlbnRzKVxuICAgIGlmIF9ob3ZlciBvciBfZG93blxuICAgICAgaGl0VGFyZ2V0ID0gbmV3IExheWVyXG4gICAgICAgIGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCdcbiAgICAgICAgZnJhbWU6IF9kZWZhdWx0LmZyYW1lXG5cbiAgICAgIGhpdFRhcmdldC5zdXBlckxheWVyID0gbGF5ZXJcbiAgICAgIGhpdFRhcmdldC5icmluZ1RvRnJvbnQoKVxuXG4gICAgIyBUaGVyZSBpcyBhIGhvdmVyIHN0YXRlLCBzbyBkZWZpbmUgaG92ZXIgZXZlbnRzIChub3QgZm9yIG1vYmlsZSlcbiAgICBpZiBfaG92ZXJcbiAgICAgIGxheWVyLmhvdmVyIC0+XG4gICAgICAgIF9kZWZhdWx0LmhpZGUoKVxuICAgICAgICBfaG92ZXIuc2hvdygpXG4gICAgICAsIC0+XG4gICAgICAgIF9kZWZhdWx0LnNob3coKVxuICAgICAgICBfaG92ZXIuaGlkZSgpXG5cbiAgICAjIFRoZXJlIGlzIGEgZG93biBzdGF0ZSwgc28gZGVmaW5lIGRvd24gZXZlbnRzXG4gICAgaWYgX2Rvd25cbiAgICAgIGxheWVyLm9uIEV2ZW50cy5Ub3VjaFN0YXJ0LCAtPlxuICAgICAgICBfZGVmYXVsdC5oaWRlKClcbiAgICAgICAgX2hvdmVyPy5oaWRlKCkgIyB0b3VjaCBkb3duIHN0YXRlIG92ZXJyaWRlcyBob3ZlciBzdGF0ZVxuICAgICAgICBfZG93bi5zaG93KClcblxuICAgICAgbGF5ZXIub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuICAgICAgICBfZG93bi5oaWRlKClcblxuICAgICAgICBpZiBfaG92ZXJcbiAgICAgICAgICAjIElmIHRoZXJlIHdhcyBhIGhvdmVyIHN0YXRlLCBnbyBiYWNrIHRvIHRoZSBob3ZlciBzdGF0ZVxuICAgICAgICAgIF9ob3Zlci5zaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIF9kZWZhdWx0LnNob3coKVxuXG5cbl8uZXh0ZW5kKGV4cG9ydHMsIHNob3J0Y3V0cylcblxuIiwidmFyIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9LFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuZXhwb3J0cy5Db2xsYXBzZUhvbGRlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChDb2xsYXBzZUhvbGRlciwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gQ29sbGFwc2VIb2xkZXIobGF5ZXJBcnJheSwgdG9nZ2xlTGF5ZXIsIHNrZXRjaCkge1xuICAgIHRoaXMuc29ydExheWVycyA9IGJpbmQodGhpcy5zb3J0TGF5ZXJzLCB0aGlzKTtcbiAgICB0aGlzLnRvZ2dsZSA9IGJpbmQodGhpcy50b2dnbGUsIHRoaXMpO1xuICAgIHRoaXMuZXhwYW5kID0gYmluZCh0aGlzLmV4cGFuZCwgdGhpcyk7XG4gICAgdGhpcy5jb2xsYXBzZSA9IGJpbmQodGhpcy5jb2xsYXBzZSwgdGhpcyk7XG4gICAgdGhpcy5hZGp1c3RMYXllcnMgPSBiaW5kKHRoaXMuYWRqdXN0TGF5ZXJzLCB0aGlzKTtcbiAgICB2YXIgaiwgaywgbGF5ZXIsIGxheWVySGVpZ2h0cywgbGF5ZXJNaW5YcywgbGF5ZXJNaW5ZcywgbGF5ZXJXaWR0aHMsIGxlbiwgbGVuMTtcbiAgICBDb2xsYXBzZUhvbGRlci5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgICB0aGlzLm9yaWdpblkgPSAwO1xuICAgIHRoaXMuYW5pbWF0aW9uT3B0aW9ucyA9IHtcbiAgICAgIHRpbWU6IDAuMlxuICAgIH07XG4gICAgdGhpcy5zdGF0ZXMuY29sbGFwc2VkID0ge1xuICAgICAgc2NhbGVZOiAwXG4gICAgfTtcbiAgICB0aGlzLnN0YXRlc1tcImRlZmF1bHRcIl0gPSB7XG4gICAgICBzY2FsZVk6IDFcbiAgICB9O1xuICAgIHRoaXMuaGVpZ2h0ID0gMDtcbiAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwidHJhbnNwYXJlbnRcIjtcbiAgICBpZiAodG9nZ2xlTGF5ZXIpIHtcbiAgICAgIHRoaXMubmFtZSA9IFwiY29sbGFwc2VfXCIgKyB0b2dnbGVMYXllci5uYW1lO1xuICAgICAgdGhpcy50b2dnbGVMYXllciA9IHRvZ2dsZUxheWVyO1xuICAgIH1cbiAgICB0b2dnbGVMYXllci5vbihFdmVudHMuQ2xpY2ssIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsIGwpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnRvZ2dsZShsKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIGxheWVySGVpZ2h0cyA9IFtdO1xuICAgIGxheWVyV2lkdGhzID0gW107XG4gICAgbGF5ZXJNaW5YcyA9IFtdO1xuICAgIGxheWVyTWluWXMgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSBsYXllckFycmF5Lmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBsYXllciA9IGxheWVyQXJyYXlbal07XG4gICAgICB0aGlzLnN1cGVyTGF5ZXIgPSBsYXllci5zdXBlckxheWVyO1xuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCArIGxheWVyLmhlaWdodDtcbiAgICAgIGxheWVySGVpZ2h0cy5wdXNoKGxheWVyLmhlaWdodCk7XG4gICAgICBsYXllcldpZHRocy5wdXNoKGxheWVyLndpZHRoKTtcbiAgICAgIGxheWVyTWluWHMucHVzaChsYXllci5taW5YKTtcbiAgICAgIGxheWVyTWluWXMucHVzaChsYXllci5taW5ZKTtcbiAgICB9XG4gICAgdGhpcy53aWR0aCA9IE1hdGgubWF4LmFwcGx5KHRoaXMsIGxheWVyV2lkdGhzKTtcbiAgICB0aGlzLmhlaWdodCA9IGxheWVySGVpZ2h0cy5yZWR1Y2UoZnVuY3Rpb24odCwgcykge1xuICAgICAgcmV0dXJuIHQgKyBzO1xuICAgIH0pO1xuICAgIHRoaXMuZnVsbEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgIHRoaXMueCA9IE1hdGgubWluLmFwcGx5KHRoaXMsIGxheWVyTWluWHMpO1xuICAgIHRoaXMueSA9IE1hdGgubWluLmFwcGx5KHRoaXMsIGxheWVyTWluWXMpO1xuICAgIGZvciAoayA9IDAsIGxlbjEgPSBsYXllckFycmF5Lmxlbmd0aDsgayA8IGxlbjE7IGsrKykge1xuICAgICAgbGF5ZXIgPSBsYXllckFycmF5W2tdO1xuICAgICAgbGF5ZXIuc3VwZXJMYXllciA9IHRoaXM7XG4gICAgICBsYXllci5wb2ludCA9IHtcbiAgICAgICAgeDogbGF5ZXIueCAtIHRoaXMueCxcbiAgICAgICAgeTogbGF5ZXIueSAtIHRoaXMueVxuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5zb3J0TGF5ZXJzKGxheWVyQXJyYXkpO1xuICB9XG5cbiAgQ29sbGFwc2VIb2xkZXIucHJvdG90eXBlLmFkanVzdExheWVycyA9IGZ1bmN0aW9uKGFkanVzdG1lbnQsIHRvZ2dsZUxheWVyLCBvcmlnaW4pIHtcbiAgICB2YXIgaiwgbGF5ZXIsIGxlbiwgbW92ZW1lbnQsIHJlZjtcbiAgICBwcmludChcIiNDT0xMIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXCIpO1xuICAgIHByaW50KFwiTG9va2luZyBhdCBcIiArIHRoaXMubmFtZSArIFwiIGJ5IHJlcXVlc3Qgb2YgXCIgKyBvcmlnaW4ubmFtZSk7XG4gICAgcHJpbnQodGhpcy5pZCwgb3JpZ2luLmlkLCBvcmlnaW4uaWQgIT09IHRoaXMuaWQsIG9yaWdpbi5pZCA9PT0gdGhpcy5pZCk7XG4gICAgaWYgKG9yaWdpbi5pZCAhPT0gdGhpcy5pZCkge1xuICAgICAgcHJpbnQoXCJBZGp1c3RpbmcgXCIgKyB0aGlzLm5hbWUpO1xuICAgICAgcmVmID0gdGhpcy5jaGlsZHJlbjtcbiAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBsYXllciA9IHJlZltqXTtcbiAgICAgICAgcHJpbnQoXCIgfCAgbG9va2luZyBhdDogXCIgKyBsYXllci5uYW1lICsgXCIgZnJvbSBcIiArIHRoaXMubmFtZSArIFwiIGJ5IHJlcXVlc3Qgb2YgXCIgKyBvcmlnaW4ubmFtZSk7XG4gICAgICAgIGlmIChsYXllci5pZCAhPT0gb3JpZ2luLmlkKSB7XG4gICAgICAgICAgbW92ZW1lbnQgPSAwO1xuICAgICAgICAgIGlmIChsYXllci55ID4gdG9nZ2xlTGF5ZXIueSkge1xuICAgICAgICAgICAgbW92ZW1lbnQgPSBhZGp1c3RtZW50O1xuICAgICAgICAgICAgbGF5ZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICB5OiBsYXllci55ICsgYWRqdXN0bWVudFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0aW1lOiAwLjJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJpbnQoXCJwYXJlbnRcIiwgbGF5ZXIucGFyZW50KTtcbiAgICAgICAgICAgIGxheWVyLnBhcmVudC5hbmltYXRlKHtcbiAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgIGhlaWdodDogbGF5ZXIucGFyZW50LmhlaWdodCArIGFkanVzdG1lbnRcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGltZTogMC4yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJpbnQoXCJOb3QgYWRqdXN0aW5nIG9yaWdpbjogXCIgKyBvcmlnaW4ubmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vdmVtZW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBwcmludChcIiB8ICBtb3ZpbmcgXCIgKyBsYXllci5uYW1lICsgXCIgYnkgXCIgKyBtb3ZlbWVudCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmlnaW4udG9nZ2xlTGF5ZXIuaWQgIT09IHRoaXMuaWQpIHtcbiAgICAgIHByaW50KFwiTm90IEFkanVzdGluZyBcIiArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIHByaW50KFwiRE9ORSAtLSBNT1ZJTkcgVE86IFwiICsgdGhpcy5wYXJlbnQubmFtZSk7XG4gICAgcHJpbnQoXCIjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1wiKTtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQuYWRqdXN0TGF5ZXJzKGFkanVzdG1lbnQsIHRvZ2dsZUxheWVyLCBvcmlnaW4pO1xuICB9O1xuXG4gIENvbGxhcHNlSG9sZGVyLnByb3RvdHlwZS5jb2xsYXBzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFuaW1hdGUoXCJjb2xsYXBzZWRcIik7XG4gIH07XG5cbiAgQ29sbGFwc2VIb2xkZXIucHJvdG90eXBlLmV4cGFuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFuaW1hdGUoXCJkZWZhdWx0XCIpO1xuICB9O1xuXG4gIENvbGxhcHNlSG9sZGVyLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbihsKSB7XG4gICAgdmFyIGFkanVzdG1lbnQ7XG4gICAgdGhpcy5zdGF0ZXMubmV4dCgpO1xuICAgIHByaW50KHRoaXMuaGVpZ2h0KTtcbiAgICBhZGp1c3RtZW50ID0gdGhpcy5oZWlnaHQ7XG4gICAgcHJpbnQoXCIgXCIpO1xuICAgIHByaW50KFwiIFwiKTtcbiAgICBwcmludChcIkNIQU5HSU5HIFwiICsgdGhpcy5uYW1lICsgXCIgVE8gXCIgKyB0aGlzLnN0YXRlcy5jdXJyZW50Lm5hbWUpO1xuICAgIGlmICh0aGlzLnN0YXRlcy5jdXJyZW50LnNjYWxlWSA9PT0gMCkge1xuICAgICAgcHJpbnQoXCJzaHJpbmtpbmdcIiwgYWRqdXN0bWVudCk7XG4gICAgICBhZGp1c3RtZW50ID0gMCAtIGFkanVzdG1lbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByaW50KFwiZXhwYW5kaW5nXCIsIGFkanVzdG1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hZGp1c3RMYXllcnMoYWRqdXN0bWVudCwgbCwgdGhpcyk7XG4gIH07XG5cbiAgQ29sbGFwc2VIb2xkZXIucHJvdG90eXBlLnNvcnRMYXllcnMgPSBmdW5jdGlvbihsYXllckFycmF5KSB7XG4gICAgdmFyIGxheWVyLCBsYXllck5hbWUsIHJlc3VsdHM7XG4gICAgdGhpcy5zb3J0ZWRMYXllcnMgPSBbXTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChsYXllck5hbWUgaW4gbGF5ZXJBcnJheSkge1xuICAgICAgbGF5ZXIgPSBsYXllckFycmF5W2xheWVyTmFtZV07XG4gICAgICB0aGlzLnNvcnRlZExheWVycy5wdXNoKGxheWVyKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnNvcnRlZExheWVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEueSAtIGIueTtcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgcmV0dXJuIENvbGxhcHNlSG9sZGVyO1xuXG59KShMYXllcik7XG5cbmV4cG9ydHMuTmVzdGVkTGlzdCA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChOZXN0ZWRMaXN0LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBOZXN0ZWRMaXN0KGxheWVyTGlzdCkge1xuICAgIHRoaXMuYWRqdXN0TGF5ZXJzID0gYmluZCh0aGlzLmFkanVzdExheWVycywgdGhpcyk7XG4gICAgdGhpcy5yZXNpemVMYXllcnMgPSBiaW5kKHRoaXMucmVzaXplTGF5ZXJzLCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZUhvbGRlcnMgPSBiaW5kKHRoaXMuY3JlYXRlSG9sZGVycywgdGhpcyk7XG4gICAgTmVzdGVkTGlzdC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmNvbnRlbnQgPSB0aGlzLmNyZWF0ZUhvbGRlcnMobGF5ZXJMaXN0KTtcbiAgICB0aGlzLmRlcHRoID0gMDtcbiAgICB0aGlzLnNpemUgPSB0aGlzLmNvbnRlbnQuc2l6ZTtcbiAgICB0aGlzLnBvaW50ID0gdGhpcy5jb250ZW50LnBvaW50O1xuICAgIHRoaXMubmFtZSA9IFwiTmVzdGVkTGlzdFwiO1xuICB9XG5cbiAgTmVzdGVkTGlzdC5wcm90b3R5cGUuY3JlYXRlSG9sZGVycyA9IGZ1bmN0aW9uKGxldmVsLCB0b2dnbGVMYXllcikge1xuICAgIHZhciBjb2xsYXBzZUxheWVycywgaSwgaiwgbGVuLCBuZXh0VG9nZ2xlO1xuICAgIGNvbGxhcHNlTGF5ZXJzID0gW107XG4gICAgbmV4dFRvZ2dsZSA9IG51bGw7XG4gICAgZm9yIChqID0gMCwgbGVuID0gbGV2ZWwubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGkgPSBsZXZlbFtqXTtcbiAgICAgIGlmICghaVswXSkge1xuICAgICAgICBuZXh0VG9nZ2xlID0gaTtcbiAgICAgICAgY29sbGFwc2VMYXllcnMucHVzaChpKTtcbiAgICAgIH0gZWxzZSBpZiAoaVswXSkge1xuICAgICAgICB0aGlzLmRlcHRoID0gdGhpcy5kZXB0aCArIDE7XG4gICAgICAgIGNvbGxhcHNlTGF5ZXJzLnB1c2godGhpcy5jcmVhdGVIb2xkZXJzKGksIG5leHRUb2dnbGUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0b2dnbGVMYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5kZXB0aCA9IHRoaXMuZGVwdGggLSAxO1xuICAgICAgcmV0dXJuIG5ldyBleHBvcnRzLkNvbGxhcHNlSG9sZGVyKGNvbGxhcHNlTGF5ZXJzLCB0b2dnbGVMYXllcik7XG4gICAgfVxuICAgIHRoaXMucmVzaXplTGF5ZXJzKGNvbGxhcHNlTGF5ZXJzKTtcbiAgICByZXR1cm4gdGhpcy5sYXllcnMgPSBjb2xsYXBzZUxheWVycztcbiAgfTtcblxuICBOZXN0ZWRMaXN0LnByb3RvdHlwZS5yZXNpemVMYXllcnMgPSBmdW5jdGlvbihjb2xsYXBzZUxheWVycykge1xuICAgIHZhciBqLCBrLCBsYXllciwgbGF5ZXJIZWlnaHRzLCBsYXllck1pblhzLCBsYXllck1pbllzLCBsYXllcldpZHRocywgbGVuLCBsZW4xLCByZXN1bHRzO1xuICAgIGxheWVySGVpZ2h0cyA9IFtdO1xuICAgIGxheWVyV2lkdGhzID0gW107XG4gICAgbGF5ZXJNaW5YcyA9IFtdO1xuICAgIGxheWVyTWluWXMgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSBjb2xsYXBzZUxheWVycy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgbGF5ZXIgPSBjb2xsYXBzZUxheWVyc1tqXTtcbiAgICAgIGlmIChsYXllci5zdXBlckxheWVyID09PSAhdGhpcykge1xuICAgICAgICB0aGlzLnN1cGVyTGF5ZXIgPSBsYXllci5zdXBlckxheWVyO1xuICAgICAgfVxuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCArIGxheWVyLmhlaWdodDtcbiAgICAgIGxheWVySGVpZ2h0cy5wdXNoKGxheWVyLmhlaWdodCk7XG4gICAgICBsYXllcldpZHRocy5wdXNoKGxheWVyLndpZHRoKTtcbiAgICAgIGxheWVyTWluWHMucHVzaChsYXllci5taW5YKTtcbiAgICAgIGxheWVyTWluWXMucHVzaChsYXllci5taW5ZKTtcbiAgICB9XG4gICAgdGhpcy53aWR0aCA9IE1hdGgubWF4LmFwcGx5KHRoaXMsIGxheWVyV2lkdGhzKTtcbiAgICB0aGlzLmhlaWdodCA9IGxheWVySGVpZ2h0cy5yZWR1Y2UoZnVuY3Rpb24odCwgcykge1xuICAgICAgcmV0dXJuIHQgKyBzO1xuICAgIH0pO1xuICAgIHRoaXMueCA9IE1hdGgubWluLmFwcGx5KHRoaXMsIGxheWVyTWluWHMpO1xuICAgIHRoaXMueSA9IE1hdGgubWluLmFwcGx5KHRoaXMsIGxheWVyTWluWXMpO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGsgPSAwLCBsZW4xID0gY29sbGFwc2VMYXllcnMubGVuZ3RoOyBrIDwgbGVuMTsgaysrKSB7XG4gICAgICBsYXllciA9IGNvbGxhcHNlTGF5ZXJzW2tdO1xuICAgICAgbGF5ZXIuc3VwZXJMYXllciA9IHRoaXM7XG4gICAgICByZXN1bHRzLnB1c2gobGF5ZXIucG9pbnQgPSB7XG4gICAgICAgIHg6IGxheWVyLnggLSB0aGlzLngsXG4gICAgICAgIHk6IGxheWVyLnkgLSB0aGlzLnlcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBOZXN0ZWRMaXN0LnByb3RvdHlwZS5hZGp1c3RMYXllcnMgPSBmdW5jdGlvbihhZGp1c3RtZW50LCB0b2dnbGVMYXllciwgb3JpZ2luKSB7XG4gICAgdmFyIGosIGxheWVyLCBsZW4sIG1vdmVtZW50LCByZWY7XG4gICAgcHJpbnQoXCIjTkVTVCMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1wiKTtcbiAgICBwcmludChcIkFkanVzdG1lbnRcIiwgYWRqdXN0bWVudCk7XG4gICAgcHJpbnQoXCJMb29raW5nIGF0IFwiICsgdGhpcy5uYW1lICsgXCIgYnkgcmVxdWVzdCBvZiBcIiArIG9yaWdpbi5uYW1lKTtcbiAgICBwcmludChcImlkOiBcIiArIHRoaXMuaWQsIFwib3JpZ2luOiBcIiArIG9yaWdpbi5pZCwgXCI9bzogXCIgKyBvcmlnaW4uaWQgPT09IHRoaXMuaWQsIFwiPXQ6IFwiICsgdG9nZ2xlTGF5ZXIuaWQgPT09IHRoaXMuaWQpO1xuICAgIGlmIChvcmlnaW4uaWQgIT09IHRoaXMuaWQpIHtcbiAgICAgIHByaW50KFwiQWRqdXN0aW5nIFwiICsgdGhpcy5uYW1lKTtcbiAgICAgIHJlZiA9IHRoaXMuY2hpbGRyZW47XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgbGF5ZXIgPSByZWZbal07XG4gICAgICAgIHByaW50KFwiIHwgIGxvb2tpbmcgYXQ6IFwiICsgbGF5ZXIubmFtZSArIFwiIFwiICsgbGF5ZXIuaWQpO1xuICAgICAgICBwcmludChcIiB8IHwgIGZyb20gXCIgKyB0aGlzLm5hbWUgKyBcIiBcIiArIHRoaXMuaWQpO1xuICAgICAgICBwcmludChcIiB8IHwgIGJ5IHJlcXVlc3Qgb2YgXCIgKyBvcmlnaW4ubmFtZSk7XG4gICAgICAgIHByaW50KFwiIHwgfCAgY2xpY2tlZCBvbiBcIiArIHRvZ2dsZUxheWVyLm5hbWUpO1xuICAgICAgICBpZiAobGF5ZXIuaWQgIT09IG9yaWdpbi5pZCAmJiBsYXllci5pZCAhPT0gdG9nZ2xlTGF5ZXIuaWQpIHtcbiAgICAgICAgICBwcmludChsYXllci5uYW1lLCBsYXllci5zY3JlZW5GcmFtZS55LCBcIiAtLSBcIiwgb3JpZ2luLm5hbWUsIG9yaWdpbi5zY3JlZW5GcmFtZS55LCBhZGp1c3RtZW50KTtcbiAgICAgICAgICBpZiAobGF5ZXIuc2NyZWVuRnJhbWUueSA+PSBvcmlnaW4uc2NyZWVuRnJhbWUueSkge1xuICAgICAgICAgICAgcHJpbnQoXCIgfCAgbW92aW5nIFwiICsgbGF5ZXIubmFtZSArIFwiIGJ5IFwiICsgYWRqdXN0bWVudCk7XG4gICAgICAgICAgICBsYXllci5hbmltYXRlKHtcbiAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgIHk6IGxheWVyLnkgKyBhZGp1c3RtZW50XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRpbWU6IDAuMlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGxheWVyLmlkID09PSBvcmlnaW4uaWQpIHtcbiAgICAgICAgICBwcmludChcIk5vdCBhZGp1c3Rpbmcgb3JpZ2luOiBcIiArIGxheWVyLm5hbWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGxheWVyLmlkID09PSB0b2dnbGVMYXllci5pZCkge1xuICAgICAgICAgIHByaW50KFwibm90IGFkanVzdGluZyB0b2dnbGVMYXllclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb3ZlbWVudCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yaWdpbi50b2dnbGVMYXllci5pZCAhPT0gdGhpcy5pZCkge1xuICAgICAgcHJpbnQoXCJOb3QgQWRqdXN0aW5nIFwiICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYW5pbWF0ZSh7XG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQgKyBhZGp1c3RtZW50XG4gICAgICB9LFxuICAgICAgdGltZTogMC4yXG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIE5lc3RlZExpc3Q7XG5cbn0pKExheWVyKTtcbiIsImNsYXNzIGV4cG9ydHMuQ29sbGFwc2VIb2xkZXIgZXh0ZW5kcyBMYXllclxuXHRjb25zdHJ1Y3RvcjogKGxheWVyQXJyYXksIHRvZ2dsZUxheWVyLCBza2V0Y2gpIC0+XG5cdFx0c3VwZXIoKVxuXHRcdEAub3JpZ2luWSA9IDBcblx0XHRALmFuaW1hdGlvbk9wdGlvbnMgPVxuXHRcdFx0dGltZTogMC4yXG5cdFx0QC5zdGF0ZXMuY29sbGFwc2VkID1cblx0XHRcdHNjYWxlWTogMFxuXHRcdEAuc3RhdGVzLmRlZmF1bHQgPVxuXHRcdFx0c2NhbGVZOiAxXG5cdFx0QC5oZWlnaHQgPSAwXG5cdFx0QC5iYWNrZ3JvdW5kQ29sb3IgPSBcInRyYW5zcGFyZW50XCJcblx0XHRpZiB0b2dnbGVMYXllclxuXHRcdFx0QC5uYW1lID0gXCJjb2xsYXBzZV9cIiArIHRvZ2dsZUxheWVyLm5hbWVcblx0XHRcdEAudG9nZ2xlTGF5ZXIgPSB0b2dnbGVMYXllclxuXHRcdHRvZ2dsZUxheWVyLm9uIEV2ZW50cy5DbGljaywgKGUsbCkgPT5cblx0XHRcdEAudG9nZ2xlKGwpXG4jIFx0XHRcdEAuc3RhdGVzLm5leHQoKVxuXG5cdFx0bGF5ZXJIZWlnaHRzID0gW11cblx0XHRsYXllcldpZHRocyA9IFtdXG5cdFx0bGF5ZXJNaW5YcyA9IFtdXG5cdFx0bGF5ZXJNaW5ZcyA9IFtdXG5cblx0XHRmb3IgbGF5ZXIgaW4gbGF5ZXJBcnJheVxuXHRcdFx0QC5zdXBlckxheWVyPWxheWVyLnN1cGVyTGF5ZXJcblx0XHRcdEAuaGVpZ2h0ID0gQC5oZWlnaHQgKyBsYXllci5oZWlnaHRcblx0XHRcdGxheWVySGVpZ2h0cy5wdXNoIGxheWVyLmhlaWdodFxuXHRcdFx0bGF5ZXJXaWR0aHMucHVzaCBsYXllci53aWR0aFxuXHRcdFx0bGF5ZXJNaW5Ycy5wdXNoIGxheWVyLm1pblhcblx0XHRcdGxheWVyTWluWXMucHVzaCBsYXllci5taW5ZXG5cblx0XHRALndpZHRoID0gTWF0aC5tYXguYXBwbHkgQCwgKGxheWVyV2lkdGhzKVxuXHRcdEAuaGVpZ2h0ID0gbGF5ZXJIZWlnaHRzLnJlZHVjZSAodCxzKSAtPiB0ICsgc1xuXHRcdEAuZnVsbEhlaWdodCA9IEAuaGVpZ2h0XG5cblx0XHRALnggPSBNYXRoLm1pbi5hcHBseSBALCAobGF5ZXJNaW5Ycylcblx0XHRALnkgPSBNYXRoLm1pbi5hcHBseSBALCAobGF5ZXJNaW5ZcylcblxuXHRcdGZvciBsYXllciBpbiBsYXllckFycmF5XG5cdFx0XHRsYXllci5zdXBlckxheWVyID0gQFxuXHRcdFx0bGF5ZXIucG9pbnQgPVxuXHRcdFx0XHR4OiBsYXllci54LUAueFxuXHRcdFx0XHR5OiBsYXllci55LUAueVxuXG5cdFx0QC5zb3J0TGF5ZXJzKGxheWVyQXJyYXkpXG5cblxuXHRhZGp1c3RMYXllcnM6IChhZGp1c3RtZW50LCB0b2dnbGVMYXllciwgb3JpZ2luKSA9PlxuXHRcdHByaW50IFwiI0NPTEwjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcIlxuXHRcdHByaW50IFwiTG9va2luZyBhdCBcIiArIEAubmFtZSArIFwiIGJ5IHJlcXVlc3Qgb2YgXCIgKyBvcmlnaW4ubmFtZVxuXHRcdHByaW50IEAuaWQsIG9yaWdpbi5pZCwgb3JpZ2luLmlkICE9IEAuaWQsIG9yaWdpbi5pZCA9PSBALmlkXG5cdFx0aWYgb3JpZ2luLmlkICE9IEAuaWRcblx0XHRcdHByaW50IFwiQWRqdXN0aW5nIFwiICsgQC5uYW1lXG5cdFx0XHRmb3IgbGF5ZXIgaW4gQC5jaGlsZHJlblxuXHRcdFx0XHRwcmludCBcIiB8ICBsb29raW5nIGF0OiBcIiArIGxheWVyLm5hbWUgKyBcIiBmcm9tIFwiICsgQC5uYW1lICsgXCIgYnkgcmVxdWVzdCBvZiBcIiArIG9yaWdpbi5uYW1lXG5cdFx0XHRcdGlmIGxheWVyLmlkICE9IG9yaWdpbi5pZFxuXHRcdFx0XHRcdG1vdmVtZW50PTBcblx0XHRcdFx0XHRpZiBsYXllci55ID4gdG9nZ2xlTGF5ZXIueVxuXHRcdFx0XHRcdFx0bW92ZW1lbnQgPSBhZGp1c3RtZW50XG5cdFx0XHRcdFx0XHRsYXllci5hbmltYXRlXG5cdFx0XHRcdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0XHRcdFx0eTogbGF5ZXIueSArIGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdFx0dGltZTogMC4yXG5cdFx0XHRcdFx0XHRwcmludCBcInBhcmVudFwiLCBsYXllci5wYXJlbnRcblx0XHRcdFx0XHRcdGxheWVyLnBhcmVudC5hbmltYXRlXG5cdFx0XHRcdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0OiBsYXllci5wYXJlbnQuaGVpZ2h0ICsgYWRqdXN0bWVudFxuXHRcdFx0XHRcdFx0XHR0aW1lOiAwLjJcblx0XHRcdFx0XHRlbHNlIHByaW50IFwiTm90IGFkanVzdGluZyBvcmlnaW46IFwiICsgb3JpZ2luLm5hbWVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG1vdmVtZW50ID0gMFxuXHRcdFx0XHRwcmludCBcIiB8ICBtb3ZpbmcgXCIgKyBsYXllci5uYW1lICsgXCIgYnkgXCIgKyBtb3ZlbWVudFxuXHRcdGVsc2UgaWYgb3JpZ2luLnRvZ2dsZUxheWVyLmlkICE9IEAuaWRcblx0XHRcdHByaW50IFwiTm90IEFkanVzdGluZyBcIiArIEAubmFtZVxuXHRcdHByaW50IFwiRE9ORSAtLSBNT1ZJTkcgVE86IFwiICsgQC5wYXJlbnQubmFtZVxuXHRcdHByaW50IFwiIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcIlxuXHRcdEAucGFyZW50LmFkanVzdExheWVycyhhZGp1c3RtZW50LCB0b2dnbGVMYXllciwgb3JpZ2luKVxuXG5cdGNvbGxhcHNlOiAoKSA9PiBALmFuaW1hdGUoXCJjb2xsYXBzZWRcIilcblx0ZXhwYW5kOiAoKSA9PiBALmFuaW1hdGUoXCJkZWZhdWx0XCIpXG5cdHRvZ2dsZTogKGwpID0+XG5cdFx0QC5zdGF0ZXMubmV4dCgpXG5cdFx0cHJpbnQgQC5oZWlnaHRcblx0XHRhZGp1c3RtZW50ID0gQC5oZWlnaHRcblx0XHRwcmludCBcIiBcIlxuXHRcdHByaW50IFwiIFwiXG5cdFx0cHJpbnQgXCJDSEFOR0lORyBcIiArIEAubmFtZSArIFwiIFRPIFwiICsgQC5zdGF0ZXMuY3VycmVudC5uYW1lXG5cdFx0aWYgQC5zdGF0ZXMuY3VycmVudC5zY2FsZVkgaXMgMFxuXHRcdFx0cHJpbnQgXCJzaHJpbmtpbmdcIiwgYWRqdXN0bWVudFxuXHRcdFx0YWRqdXN0bWVudCA9IDAgLSBhZGp1c3RtZW50XG5cdFx0ZWxzZVxuXHRcdFx0cHJpbnQgXCJleHBhbmRpbmdcIiwgYWRqdXN0bWVudFxuXHRcdEAuYWRqdXN0TGF5ZXJzKGFkanVzdG1lbnQsIGwsIEApXG5cblxuXG5cblx0c29ydExheWVyczogKGxheWVyQXJyYXkpID0+XG4gICAgXHRALnNvcnRlZExheWVycyA9IFtdXG4gICAgXHRmb3IgbGF5ZXJOYW1lLCBsYXllciBvZiBsYXllckFycmF5XG4gICAgXHRcdEAuc29ydGVkTGF5ZXJzLnB1c2gobGF5ZXIpXG4gICAgXHRcdEAuc29ydGVkTGF5ZXJzLnNvcnQoKGEsYikgLT4gYS55LWIueSlcblxuXG5cbmNsYXNzIGV4cG9ydHMuTmVzdGVkTGlzdCBleHRlbmRzIExheWVyXG5cdGNvbnN0cnVjdG9yOiAobGF5ZXJMaXN0KSAtPlxuXHRcdHN1cGVyKClcblx0XHRALmNvbnRlbnQgPSBALmNyZWF0ZUhvbGRlcnMobGF5ZXJMaXN0KVxuXHRcdEAuZGVwdGggPSAwXG5cdFx0QC5zaXplID0gQC5jb250ZW50LnNpemVcblx0XHRALnBvaW50ID0gQC5jb250ZW50LnBvaW50XG5cdFx0QC5uYW1lID0gXCJOZXN0ZWRMaXN0XCJcblx0Y3JlYXRlSG9sZGVyczogKGxldmVsLCB0b2dnbGVMYXllcikgPT5cblx0XHRjb2xsYXBzZUxheWVycyA9IFtdXG5cdFx0bmV4dFRvZ2dsZSA9IG51bGxcblx0XHRmb3IgaSBpbiBsZXZlbFxuXHRcdFx0aWYgbm90IGlbMF1cblx0XHRcdFx0bmV4dFRvZ2dsZSA9IGlcblx0XHRcdFx0Y29sbGFwc2VMYXllcnMucHVzaChpKVxuXHRcdFx0ZWxzZSBpZiBpWzBdXG5cdFx0XHRcdEAuZGVwdGg9IEAuZGVwdGgrMVxuXHRcdFx0XHRjb2xsYXBzZUxheWVycy5wdXNoKEAuY3JlYXRlSG9sZGVycyhpLCBuZXh0VG9nZ2xlKSlcblx0XHRpZiB0eXBlb2YgdG9nZ2xlTGF5ZXIgIT0gXCJ1bmRlZmluZWRcIlxuXHRcdFx0QC5kZXB0aCA9IEAuZGVwdGggLSAxXG5cdFx0XHRyZXR1cm4gbmV3IGV4cG9ydHMuQ29sbGFwc2VIb2xkZXIoY29sbGFwc2VMYXllcnMsIHRvZ2dsZUxheWVyKVxuXG5cdFx0QC5yZXNpemVMYXllcnMoY29sbGFwc2VMYXllcnMpXG5cdFx0QC5sYXllcnMgPSBjb2xsYXBzZUxheWVyc1xuXG5cdHJlc2l6ZUxheWVyczogKGNvbGxhcHNlTGF5ZXJzKSA9PlxuXHRcdGxheWVySGVpZ2h0cyA9IFtdXG5cdFx0bGF5ZXJXaWR0aHMgPSBbXVxuXHRcdGxheWVyTWluWHMgPSBbXVxuXHRcdGxheWVyTWluWXMgPSBbXVxuXG5cdFx0Zm9yIGxheWVyIGluIGNvbGxhcHNlTGF5ZXJzXG5cdFx0XHRpZiBsYXllci5zdXBlckxheWVyIGlzIG5vdCBAXG5cdFx0XHRcdEAuc3VwZXJMYXllcj1sYXllci5zdXBlckxheWVyXG5cdFx0XHRALmhlaWdodCA9IEAuaGVpZ2h0ICsgbGF5ZXIuaGVpZ2h0XG5cdFx0XHRsYXllckhlaWdodHMucHVzaCBsYXllci5oZWlnaHRcblx0XHRcdGxheWVyV2lkdGhzLnB1c2ggbGF5ZXIud2lkdGhcblx0XHRcdGxheWVyTWluWHMucHVzaCBsYXllci5taW5YXG5cdFx0XHRsYXllck1pbllzLnB1c2ggbGF5ZXIubWluWVxuXG5cdFx0QC53aWR0aCA9IE1hdGgubWF4LmFwcGx5IEAsIChsYXllcldpZHRocylcblx0XHRALmhlaWdodCA9IGxheWVySGVpZ2h0cy5yZWR1Y2UgKHQscykgLT4gdCArIHNcblxuXHRcdEAueCA9IE1hdGgubWluLmFwcGx5IEAsIChsYXllck1pblhzKVxuXHRcdEAueSA9IE1hdGgubWluLmFwcGx5IEAsIChsYXllck1pbllzKVxuXG5cdFx0Zm9yIGxheWVyIGluIGNvbGxhcHNlTGF5ZXJzXG5cdFx0XHRsYXllci5zdXBlckxheWVyID0gQFxuXHRcdFx0bGF5ZXIucG9pbnQgPVxuXHRcdFx0XHR4OiBsYXllci54LUAueFxuXHRcdFx0XHR5OiBsYXllci55LUAueVxuXG5cdGFkanVzdExheWVyczogKGFkanVzdG1lbnQsIHRvZ2dsZUxheWVyLCBvcmlnaW4pID0+XG5cdFx0cHJpbnQgXCIjTkVTVCMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1wiXG5cdFx0cHJpbnQgXCJBZGp1c3RtZW50XCIsIGFkanVzdG1lbnRcblx0XHRwcmludCBcIkxvb2tpbmcgYXQgXCIgKyBALm5hbWUgKyBcIiBieSByZXF1ZXN0IG9mIFwiICsgb3JpZ2luLm5hbWVcblx0XHRwcmludCBcImlkOiBcIiArIEAuaWQsIFwib3JpZ2luOiBcIiArICBvcmlnaW4uaWQsIFwiPW86IFwiICsgb3JpZ2luLmlkID09IEAuaWQsIFwiPXQ6IFwiICsgdG9nZ2xlTGF5ZXIuaWQgPT0gQC5pZFxuXHRcdGlmIG9yaWdpbi5pZCAhPSBALmlkXG5cdFx0XHRwcmludCBcIkFkanVzdGluZyBcIiArIEAubmFtZVxuXHRcdFx0Zm9yIGxheWVyIGluIEAuY2hpbGRyZW5cblx0XHRcdFx0cHJpbnQgXCIgfCAgbG9va2luZyBhdDogXCIgKyBsYXllci5uYW1lKyBcIiBcIiArIGxheWVyLmlkXG5cdFx0XHRcdHByaW50IFwiIHwgfCAgZnJvbSBcIiArIEAubmFtZSArIFwiIFwiICsgQC5pZFxuXHRcdFx0XHRwcmludCBcIiB8IHwgIGJ5IHJlcXVlc3Qgb2YgXCIgKyBvcmlnaW4ubmFtZVxuXHRcdFx0XHRwcmludCBcIiB8IHwgIGNsaWNrZWQgb24gXCIgKyB0b2dnbGVMYXllci5uYW1lXG5cdFx0XHRcdGlmIGxheWVyLmlkICE9IG9yaWdpbi5pZCBhbmQgbGF5ZXIuaWQgIT0gdG9nZ2xlTGF5ZXIuaWRcblx0XHRcdFx0XHRwcmludCBsYXllci5uYW1lLCBsYXllci5zY3JlZW5GcmFtZS55LCBcIiAtLSBcIiwgb3JpZ2luLm5hbWUsIG9yaWdpbi5zY3JlZW5GcmFtZS55LCBhZGp1c3RtZW50XG5cdFx0XHRcdFx0aWYgbGF5ZXIuc2NyZWVuRnJhbWUueSA+PSBvcmlnaW4uc2NyZWVuRnJhbWUueVxuXHRcdFx0XHRcdFx0cHJpbnQgXCIgfCAgbW92aW5nIFwiICsgbGF5ZXIubmFtZSArIFwiIGJ5IFwiICsgYWRqdXN0bWVudFxuXHRcdFx0XHRcdFx0bGF5ZXIuYW5pbWF0ZVxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRcdFx0XHRcdHk6IGxheWVyLnkgKyBhZGp1c3RtZW50XG5cdFx0XHRcdFx0XHRcdHRpbWU6IDAuMlxuXG5cdFx0XHRcdGVsc2UgaWYgbGF5ZXIuaWQgPT0gb3JpZ2luLmlkXG5cdFx0XHRcdFx0cHJpbnQgXCJOb3QgYWRqdXN0aW5nIG9yaWdpbjogXCIgKyBsYXllci5uYW1lXG5cdFx0XHRcdGVsc2UgaWYgbGF5ZXIuaWQgPT0gdG9nZ2xlTGF5ZXIuaWRcblx0XHRcdFx0XHRwcmludCBcIm5vdCBhZGp1c3RpbmcgdG9nZ2xlTGF5ZXJcIlxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bW92ZW1lbnQgPSAwXG5cblx0XHRlbHNlIGlmIG9yaWdpbi50b2dnbGVMYXllci5pZCAhPSBALmlkXG5cdFx0XHRwcmludCBcIk5vdCBBZGp1c3RpbmcgXCIgKyBALm5hbWVcblxuXHRcdEAuYW5pbWF0ZVxuXHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0aGVpZ2h0OiBALmhlaWdodCArIGFkanVzdG1lbnRcblx0XHRcdHRpbWU6IDAuMlxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBDb2xsYXBzZUhvbGRlciggWyBsYXllckFycmF5IF0gLCB0b2dnbGVMYXllciApXG4jICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuI1xuIyBBUkdVTUVOVFNcbiNcbiMgbGF5ZXJBcnJheVxuIyAtLS0tLS0tLS0tXG4jIEFuIGFycmF5IG9mIGxheWVycyB0byBiZSBjb2xsYXBzZWQuIHRoZXNlIGFyZSB0aGUgb25lcyB0aGF0XG4jIHNob3VsZCBhbGwgZGlzYXBwZWFyIGluIGEgZ3JvdXAgdG9nZXRoZXIuXG4jICEhISEgTk9URSAhISEhXG4jIHRoZXNlIGxheWVycyBhbGwgbmVlZCB0byBoYXZlIHRoZSBzYW1lIHBhcmVudCBmb3IgdGhpcyB0byB3b3JrICEhIVxuI1xuIyB0b2dnbGVMYXllclxuIyAtLS0tLS0tLS0tLVxuIyB0aGUgbGF5ZXIgeW91IHdhbnQgdG8gY2xpY2sgb24gdG8gc2hvdy9oaWRlIHRoZSBsYXllcnMgaW5cbiMgbGF5ZXJBcnJheVxuI1xuIyBTS0VUQ0ggRklMRVxuI1xuIyBNeSBmaWxlOlxuIyBodHRwczovL3d3dy5kcm9wYm94LmNvbS9zLzlkYXJndG14aGhtY3JzbC9leHBhbmRFeGFtcGxlLnNrZXRjaD9kbD0wXG4jXG4jIEluIHRoZSBza2V0Y2ggZmlsZSwgZWFjaCByb3cgc2hvdWxkIGJlIGluZGVwZW5kZW50LCBhbmQgZXF1YWwgaW4gdGhlIGhpZXJhcmNoeS4gTGlrZSB0aGlzOlxuIyAgIHxcbiMgICArLT4gcm93XzFcbiMgICArLT4gcm93XzFfMVxuIyAgICstPiByb3dfMV8xX0FcbiMgICArLT4gcm93XzFfMlxuIyAgICstPiByb3dfMV8zXG4jICAgKy0+IHJvd18yXG4jICAgZXRjLlxuI1xuIyBDcmVhdGUgbmVzdGVkIHRyZWVzIGJ5IHBsYWNpbmcgQ29sbGFwc2VIb2xkZXJzIGludG8gQ29sbGFwc2VIb2xkZXJzXG4iLCIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFJQUE7QURJQSxPQUFPLENBQUMsS0FBUixHQUFnQjs7QUFFaEIsT0FBTyxDQUFDLFVBQVIsR0FBcUIsU0FBQTtTQUNwQixLQUFBLENBQU0sdUJBQU47QUFEb0I7O0FBR3JCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQOzs7O0FEVGxCLElBQUE7Ozs7QUFBTSxPQUFPLENBQUM7OztFQUNBLHdCQUFDLFVBQUQsRUFBYSxXQUFiLEVBQTBCLE1BQTFCOzs7Ozs7QUFDWixRQUFBO0lBQUEsOENB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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
