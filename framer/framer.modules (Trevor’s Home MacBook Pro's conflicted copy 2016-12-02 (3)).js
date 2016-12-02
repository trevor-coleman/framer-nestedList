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
      return new CollapseHolder(collapseLayers, toggleLayer);
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

exports.CollapseHolder = (function(superClass) {
  var layer, layerName;

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

  CollapseHolder.prototype.sortLayers = function(layerArray) {};

  CollapseHolder.sortedLayers = [];

  for (layerName in layerArray) {
    layer = layerArray[layerName];
    CollapseHolder.sortedLayers.push(layer);
    CollapseHolder.sortedLayers.sort(function(a, b) {
      return a.y - b.y;
    });
  }

  return CollapseHolder;

})(Layer);


},{}],"nestedList":[function(require,module,exports){
var CollapseHolder,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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
      return new CollapseHolder(collapseLayers, toggleLayer);
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

CollapseHolder = (function(superClass) {
  var layer, layerName;

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
    this.sortLayers();
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

  CollapseHolder.prototype.sortLayers = function() {};

  CollapseHolder.sortedLayers = [];

  for (layerName in sketch) {
    layer = sketch[layerName];
    CollapseHolder.sortedLayers.push(layer);
    CollapseHolder.sortedLayers.sort(function(a, b) {
      return a.y - b.y;
    });
  }

  return CollapseHolder;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvc2hvcnRjdXRzLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3RyZXZvcmNvbGVtYW4vRHJvcGJveCAoUGVyc29uYWwpL2ZyYW1lci9mcmFtZXItY29sbGFwc2VIb2xkZXIuZnJhbWVyL21vZHVsZXMvbmVzdGVkTGlzdC5qcyIsIi4uL21vZHVsZXMvbmVzdGVkTGlzdC5jb2ZmZWUiLCIuLi9tb2R1bGVzL215TW9kdWxlLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIFNob3J0Y3V0cyBmb3IgRnJhbWVyIDEuMFxuICBodHRwOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lclxuXG4gIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuICBSZWFkbWU6XG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lclxuXG4gIExpY2Vuc2U6XG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9zaG9ydGN1dHMtZm9yLWZyYW1lci9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4jIyNcblxuXG5cblxuIyMjXG4gIENPTkZJR1VSQVRJT05cbiMjI1xuXG5zaG9ydGN1dHMgPSB7fVxuXG5GcmFtZXIuRGVmYXVsdHMuRmFkZUFuaW1hdGlvbiA9XG4gIGN1cnZlOiBcImJlemllci1jdXJ2ZVwiXG4gIHRpbWU6IDAuMlxuXG5GcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24gPVxuICBjdXJ2ZTogXCJzcHJpbmcoNDAwLDQwLDApXCJcblxuXG5cbiMjI1xuICBMT09QIE9OIEVWRVJZIExBWUVSXG5cbiAgU2hvcnRoYW5kIGZvciBhcHBseWluZyBhIGZ1bmN0aW9uIHRvIGV2ZXJ5IGxheWVyIGluIHRoZSBkb2N1bWVudC5cblxuICBFeGFtcGxlOlxuICBgYGBzaG9ydGN1dHMuZXZlcnlMYXllcihmdW5jdGlvbihsYXllcikge1xuICAgIGxheWVyLnZpc2libGUgPSBmYWxzZTtcbiAgfSk7YGBgXG4jIyNcbnNob3J0Y3V0cy5ldmVyeUxheWVyID0gKGZuKSAtPlxuICBmb3IgbGF5ZXJOYW1lIG9mIHdpbmRvdy5MYXllcnNcbiAgICBfbGF5ZXIgPSB3aW5kb3cuTGF5ZXJzW2xheWVyTmFtZV1cbiAgICBmbiBfbGF5ZXJcblxuXG4jIyNcbiAgU0hPUlRIQU5EIEZPUiBBQ0NFU1NJTkcgTEFZRVJTXG5cbiAgQ29udmVydCBlYWNoIGxheWVyIGNvbWluZyBmcm9tIHRoZSBleHBvcnRlciBpbnRvIGEgSmF2YXNjcmlwdCBvYmplY3QgZm9yIHNob3J0aGFuZCBhY2Nlc3MuXG5cbiAgVGhpcyBoYXMgdG8gYmUgY2FsbGVkIG1hbnVhbGx5IGluIEZyYW1lcjMgYWZ0ZXIgeW91J3ZlIHJhbiB0aGUgaW1wb3J0ZXIuXG5cbiAgbXlMYXllcnMgPSBGcmFtZXIuSW1wb3J0ZXIubG9hZChcIi4uLlwiKVxuICBzaG9ydGN1dHMuaW5pdGlhbGl6ZShteUxheWVycylcblxuICBJZiB5b3UgaGF2ZSBhIGxheWVyIGluIHlvdXIgUFNEL1NrZXRjaCBjYWxsZWQgXCJOZXdzRmVlZFwiLCB0aGlzIHdpbGwgY3JlYXRlIGEgZ2xvYmFsIEphdmFzY3JpcHQgdmFyaWFibGUgY2FsbGVkIFwiTmV3c0ZlZWRcIiB0aGF0IHlvdSBjYW4gbWFuaXB1bGF0ZSB3aXRoIEZyYW1lci5cblxuICBFeGFtcGxlOlxuICBgTmV3c0ZlZWQudmlzaWJsZSA9IGZhbHNlO2BcblxuICBOb3RlczpcbiAgSmF2YXNjcmlwdCBoYXMgc29tZSBuYW1lcyByZXNlcnZlZCBmb3IgaW50ZXJuYWwgZnVuY3Rpb24gdGhhdCB5b3UgY2FuJ3Qgb3ZlcnJpZGUgKGZvciBleC4gKVxuICBJZiB5b3UgY2FsbCBpbml0aWFsaXplIHdpdGhvdXQgYW55dGhpbmcsIGl0IHdpbGwgdXNlIGFsbCBjdXJyZW50bHkgYXZhaWxhYmxlIGxheWVycy5cbiMjI1xuc2hvcnRjdXRzLmluaXRpYWxpemUgPSAobGF5ZXJzKSAtPlxuXG4gIGxheWVyID0gRnJhbWVyLkN1cnJlbnRDb250ZXh0Ll9sYXllckxpc3QgaWYgbm90IGxheWVyc1xuXG4gIHdpbmRvdy5MYXllcnMgPSBsYXllcnNcblxuICBzaG9ydGN1dHMuZXZlcnlMYXllciAobGF5ZXIpIC0+XG4gICAgc2FuaXRpemVkTGF5ZXJOYW1lID0gbGF5ZXIubmFtZS5yZXBsYWNlKC9bLSshPzoqXFxbXFxdXFwoXFwpXFwvXS9nLCAnJykudHJpbSgpLnJlcGxhY2UoL1xccy9nLCAnXycpXG4gICAgd2luZG93W3Nhbml0aXplZExheWVyTmFtZV0gPSBsYXllclxuICAgIHNob3J0Y3V0cy5zYXZlT3JpZ2luYWxGcmFtZSBsYXllclxuICAgIHNob3J0Y3V0cy5pbml0aWFsaXplVG91Y2hTdGF0ZXMgbGF5ZXJcblxuXG4jIyNcbiAgRklORCBDSElMRCBMQVlFUlMgQlkgTkFNRVxuXG4gIFJldHJpZXZlcyBzdWJMYXllcnMgb2Ygc2VsZWN0ZWQgbGF5ZXIgdGhhdCBoYXZlIGEgbWF0Y2hpbmcgbmFtZS5cblxuICBnZXRDaGlsZDogcmV0dXJuIHRoZSBmaXJzdCBzdWJsYXllciB3aG9zZSBuYW1lIGluY2x1ZGVzIHRoZSBnaXZlbiBzdHJpbmdcbiAgZ2V0Q2hpbGRyZW46IHJldHVybiBhbGwgc3ViTGF5ZXJzIHRoYXQgbWF0Y2hcblxuICBVc2VmdWwgd2hlbiBlZy4gaXRlcmF0aW5nIG92ZXIgdGFibGUgY2VsbHMuIFVzZSBnZXRDaGlsZCB0byBhY2Nlc3MgdGhlIGJ1dHRvbiBmb3VuZCBpbiBlYWNoIGNlbGwuIFRoaXMgaXMgKipjYXNlIGluc2Vuc2l0aXZlKiouXG5cbiAgRXhhbXBsZTpcbiAgYHRvcExheWVyID0gTmV3c0ZlZWQuZ2V0Q2hpbGQoXCJUb3BcIilgIExvb2tzIGZvciBsYXllcnMgd2hvc2UgbmFtZSBtYXRjaGVzIFRvcC4gUmV0dXJucyB0aGUgZmlyc3QgbWF0Y2hpbmcgbGF5ZXIuXG5cbiAgYGNoaWxkTGF5ZXJzID0gVGFibGUuZ2V0Q2hpbGRyZW4oXCJDZWxsXCIpYCBSZXR1cm5zIGFsbCBjaGlsZHJlbiB3aG9zZSBuYW1lIG1hdGNoIENlbGwgaW4gYW4gYXJyYXkuXG4jIyNcbkxheWVyOjpnZXRDaGlsZCA9IChuZWVkbGUsIHJlY3Vyc2l2ZSA9IGZhbHNlKSAtPlxuICAjIFNlYXJjaCBkaXJlY3QgY2hpbGRyZW5cbiAgZm9yIHN1YkxheWVyIGluIEBzdWJMYXllcnNcbiAgICByZXR1cm4gc3ViTGF5ZXIgaWYgc3ViTGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobmVlZGxlLnRvTG93ZXJDYXNlKCkpIGlzbnQgLTEgXG5cbiAgIyBSZWN1cnNpdmVseSBzZWFyY2ggY2hpbGRyZW4gb2YgY2hpbGRyZW5cbiAgaWYgcmVjdXJzaXZlXG4gICAgZm9yIHN1YkxheWVyIGluIEBzdWJMYXllcnNcbiAgICAgIHJldHVybiBzdWJMYXllci5nZXRDaGlsZChuZWVkbGUsIHJlY3Vyc2l2ZSkgaWYgc3ViTGF5ZXIuZ2V0Q2hpbGQobmVlZGxlLCByZWN1cnNpdmUpIFxuXG5cbkxheWVyOjpnZXRDaGlsZHJlbiA9IChuZWVkbGUsIHJlY3Vyc2l2ZSA9IGZhbHNlKSAtPlxuICByZXN1bHRzID0gW11cblxuICBpZiByZWN1cnNpdmVcbiAgICBmb3Igc3ViTGF5ZXIgaW4gQHN1YkxheWVyc1xuICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0IHN1YkxheWVyLmdldENoaWxkcmVuKG5lZWRsZSwgcmVjdXJzaXZlKVxuICAgIHJlc3VsdHMucHVzaCBAIGlmIEBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihuZWVkbGUudG9Mb3dlckNhc2UoKSkgaXNudCAtMVxuICAgIHJldHVybiByZXN1bHRzXG5cbiAgZWxzZVxuICAgIGZvciBzdWJMYXllciBpbiBAc3ViTGF5ZXJzXG4gICAgICBpZiBzdWJMYXllci5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihuZWVkbGUudG9Mb3dlckNhc2UoKSkgaXNudCAtMSBcbiAgICAgICAgcmVzdWx0cy5wdXNoIHN1YkxheWVyIFxuICAgIHJldHVybiByZXN1bHRzXG5cblxuXG4jIyNcbiAgQ09OVkVSVCBBIE5VTUJFUiBSQU5HRSBUTyBBTk9USEVSXG5cbiAgQ29udmVydHMgYSBudW1iZXIgd2l0aGluIG9uZSByYW5nZSB0byBhbm90aGVyIHJhbmdlXG5cbiAgRXhhbXBsZTpcbiAgV2Ugd2FudCB0byBtYXAgdGhlIG9wYWNpdHkgb2YgYSBsYXllciB0byBpdHMgeCBsb2NhdGlvbi5cblxuICBUaGUgb3BhY2l0eSB3aWxsIGJlIDAgaWYgdGhlIFggY29vcmRpbmF0ZSBpcyAwLCBhbmQgaXQgd2lsbCBiZSAxIGlmIHRoZSBYIGNvb3JkaW5hdGUgaXMgNjQwLiBBbGwgdGhlIFggY29vcmRpbmF0ZXMgaW4gYmV0d2VlbiB3aWxsIHJlc3VsdCBpbiBpbnRlcm1lZGlhdGUgdmFsdWVzIGJldHdlZW4gMCBhbmQgMS5cblxuICBgbXlMYXllci5vcGFjaXR5ID0gY29udmVydFJhbmdlKDAsIDY0MCwgbXlMYXllci54LCAwLCAxKWBcblxuICBCeSBkZWZhdWx0LCB0aGlzIHZhbHVlIG1pZ2h0IGJlIG91dHNpZGUgdGhlIGJvdW5kcyBvZiBOZXdNaW4gYW5kIE5ld01heCBpZiB0aGUgT2xkVmFsdWUgaXMgb3V0c2lkZSBPbGRNaW4gYW5kIE9sZE1heC4gSWYgeW91IHdhbnQgdG8gY2FwIHRoZSBmaW5hbCB2YWx1ZSB0byBOZXdNaW4gYW5kIE5ld01heCwgc2V0IGNhcHBlZCB0byB0cnVlLlxuICBNYWtlIHN1cmUgTmV3TWluIGlzIHNtYWxsZXIgdGhhbiBOZXdNYXggaWYgeW91J3JlIHVzaW5nIHRoaXMuIElmIHlvdSBuZWVkIGFuIGludmVyc2UgcHJvcG9ydGlvbiwgdHJ5IHN3YXBwaW5nIE9sZE1pbiBhbmQgT2xkTWF4LlxuIyMjXG5zaG9ydGN1dHMuY29udmVydFJhbmdlID0gKE9sZE1pbiwgT2xkTWF4LCBPbGRWYWx1ZSwgTmV3TWluLCBOZXdNYXgsIGNhcHBlZCkgLT5cbiAgT2xkUmFuZ2UgPSAoT2xkTWF4IC0gT2xkTWluKVxuICBOZXdSYW5nZSA9IChOZXdNYXggLSBOZXdNaW4pXG4gIE5ld1ZhbHVlID0gKCgoT2xkVmFsdWUgLSBPbGRNaW4pICogTmV3UmFuZ2UpIC8gT2xkUmFuZ2UpICsgTmV3TWluXG5cbiAgaWYgY2FwcGVkXG4gICAgaWYgTmV3VmFsdWUgPiBOZXdNYXhcbiAgICAgIE5ld01heFxuICAgIGVsc2UgaWYgTmV3VmFsdWUgPCBOZXdNaW5cbiAgICAgIE5ld01pblxuICAgIGVsc2VcbiAgICAgIE5ld1ZhbHVlXG4gIGVsc2VcbiAgICBOZXdWYWx1ZVxuXG5cbiMjI1xuICBPUklHSU5BTCBGUkFNRVxuXG4gIFN0b3JlcyB0aGUgaW5pdGlhbCBsb2NhdGlvbiBhbmQgc2l6ZSBvZiBhIGxheWVyIGluIHRoZSBcIm9yaWdpbmFsRnJhbWVcIiBhdHRyaWJ1dGUsIHNvIHlvdSBjYW4gcmV2ZXJ0IHRvIGl0IGxhdGVyIG9uLlxuXG4gIEV4YW1wbGU6XG4gIFRoZSB4IGNvb3JkaW5hdGUgb2YgTXlMYXllciBpcyBpbml0aWFsbHkgNDAwIChmcm9tIHRoZSBQU0QpXG5cbiAgYGBgTXlMYXllci54ID0gMjAwOyAvLyBub3cgd2Ugc2V0IGl0IHRvIDIwMC5cbiAgTXlMYXllci54ID0gTXlMYXllci5vcmlnaW5hbEZyYW1lLnggLy8gbm93IHdlIHNldCBpdCBiYWNrIHRvIGl0cyBvcmlnaW5hbCB2YWx1ZSwgNDAwLmBgYFxuIyMjXG5zaG9ydGN1dHMuc2F2ZU9yaWdpbmFsRnJhbWUgPSAobGF5ZXIpIC0+XG4gIGxheWVyLm9yaWdpbmFsRnJhbWUgPSBsYXllci5mcmFtZVxuXG4jIyNcbiAgU0hPUlRIQU5EIEhPVkVSIFNZTlRBWFxuXG4gIFF1aWNrbHkgZGVmaW5lIGZ1bmN0aW9ucyB0aGF0IHNob3VsZCBydW4gd2hlbiBJIGhvdmVyIG92ZXIgYSBsYXllciwgYW5kIGhvdmVyIG91dC5cblxuICBFeGFtcGxlOlxuICBgTXlMYXllci5ob3ZlcihmdW5jdGlvbigpIHsgT3RoZXJMYXllci5zaG93KCkgfSwgZnVuY3Rpb24oKSB7IE90aGVyTGF5ZXIuaGlkZSgpIH0pO2BcbiMjI1xuTGF5ZXI6OmhvdmVyID0gKGVudGVyRnVuY3Rpb24sIGxlYXZlRnVuY3Rpb24pIC0+XG4gIHRoaXMub24gJ21vdXNlZW50ZXInLCBlbnRlckZ1bmN0aW9uXG4gIHRoaXMub24gJ21vdXNlbGVhdmUnLCBsZWF2ZUZ1bmN0aW9uXG5cblxuIyMjXG4gIFNIT1JUSEFORCBUQVAgU1lOVEFYXG5cbiAgSW5zdGVhZCBvZiBgTXlMYXllci5vbihFdmVudHMuVG91Y2hFbmQsIGhhbmRsZXIpYCwgdXNlIGBNeUxheWVyLnRhcChoYW5kbGVyKWBcbiMjI1xuXG5MYXllcjo6dGFwID0gKGhhbmRsZXIpIC0+XG4gIHRoaXMub24gRXZlbnRzLlRvdWNoRW5kLCBoYW5kbGVyXG5cblxuIyMjXG4gIFNIT1JUSEFORCBDTElDSyBTWU5UQVhcblxuICBJbnN0ZWFkIG9mIGBNeUxheWVyLm9uKEV2ZW50cy5DbGljaywgaGFuZGxlcilgLCB1c2UgYE15TGF5ZXIuY2xpY2soaGFuZGxlcilgXG4jIyNcblxuTGF5ZXI6OmNsaWNrID0gKGhhbmRsZXIpIC0+XG4gIHRoaXMub24gRXZlbnRzLkNsaWNrLCBoYW5kbGVyXG5cblxuXG4jIyNcbiAgU0hPUlRIQU5EIEFOSU1BVElPTiBTWU5UQVhcblxuICBBIHNob3J0ZXIgYW5pbWF0aW9uIHN5bnRheCB0aGF0IG1pcnJvcnMgdGhlIGpRdWVyeSBzeW50YXg6XG4gIGxheWVyLmFuaW1hdGUocHJvcGVydGllcywgW3RpbWVdLCBbY3VydmVdLCBbY2FsbGJhY2tdKVxuXG4gIEFsbCBwYXJhbWV0ZXJzIGV4Y2VwdCBwcm9wZXJ0aWVzIGFyZSBvcHRpb25hbCBhbmQgY2FuIGJlIG9taXR0ZWQuXG5cbiAgT2xkOlxuICBgYGBNeUxheWVyLmFuaW1hdGUoe1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHg6IDUwMFxuICAgIH0sXG4gICAgdGltZTogNTAwLFxuICAgIGN1cnZlOiAnYmV6aWVyLWN1cnZlJ1xuICB9KWBgYFxuXG4gIE5ldzpcbiAgYGBgTXlMYXllci5hbmltYXRlVG8oe1xuICAgIHg6IDUwMFxuICB9KWBgYFxuXG4gIE9wdGlvbmFsbHkgKHdpdGggMTAwMG1zIGR1cmF0aW9uIGFuZCBzcHJpbmcpOlxuICAgIGBgYE15TGF5ZXIuYW5pbWF0ZVRvKHtcbiAgICB4OiA1MDBcbiAgfSwgMTAwMCwgXCJzcHJpbmcoMTAwLDEwLDApXCIpXG4jIyNcblxuXG5cbkxheWVyOjphbmltYXRlVG8gPSAocHJvcGVydGllcywgZmlyc3QsIHNlY29uZCwgdGhpcmQpIC0+XG4gIHRoaXNMYXllciA9IHRoaXNcbiAgdGltZSA9IGN1cnZlID0gY2FsbGJhY2sgPSBudWxsXG5cbiAgaWYgdHlwZW9mKGZpcnN0KSA9PSBcIm51bWJlclwiXG4gICAgdGltZSA9IGZpcnN0XG4gICAgaWYgdHlwZW9mKHNlY29uZCkgPT0gXCJzdHJpbmdcIlxuICAgICAgY3VydmUgPSBzZWNvbmRcbiAgICAgIGNhbGxiYWNrID0gdGhpcmRcbiAgICBjYWxsYmFjayA9IHNlY29uZCBpZiB0eXBlb2Yoc2Vjb25kKSA9PSBcImZ1bmN0aW9uXCJcbiAgZWxzZSBpZiB0eXBlb2YoZmlyc3QpID09IFwic3RyaW5nXCJcbiAgICBjdXJ2ZSA9IGZpcnN0XG4gICAgY2FsbGJhY2sgPSBzZWNvbmQgaWYgdHlwZW9mKHNlY29uZCkgPT0gXCJmdW5jdGlvblwiXG4gIGVsc2UgaWYgdHlwZW9mKGZpcnN0KSA9PSBcImZ1bmN0aW9uXCJcbiAgICBjYWxsYmFjayA9IGZpcnN0XG5cbiAgaWYgdGltZT8gJiYgIWN1cnZlP1xuICAgIGN1cnZlID0gJ2Jlemllci1jdXJ2ZSdcbiAgXG4gIGN1cnZlID0gRnJhbWVyLkRlZmF1bHRzLkFuaW1hdGlvbi5jdXJ2ZSBpZiAhY3VydmU/XG4gIHRpbWUgPSBGcmFtZXIuRGVmYXVsdHMuQW5pbWF0aW9uLnRpbWUgaWYgIXRpbWU/XG5cbiAgdGhpc0xheWVyLmFuaW1hdGlvblRvID0gbmV3IEFuaW1hdGlvblxuICAgIGxheWVyOiB0aGlzTGF5ZXJcbiAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzXG4gICAgY3VydmU6IGN1cnZlXG4gICAgdGltZTogdGltZVxuXG4gIHRoaXNMYXllci5hbmltYXRpb25Uby5vbiAnc3RhcnQnLCAtPlxuICAgIHRoaXNMYXllci5pc0FuaW1hdGluZyA9IHRydWVcblxuICB0aGlzTGF5ZXIuYW5pbWF0aW9uVG8ub24gJ2VuZCcsIC0+XG4gICAgdGhpc0xheWVyLmlzQW5pbWF0aW5nID0gbnVsbFxuICAgIGlmIGNhbGxiYWNrP1xuICAgICAgY2FsbGJhY2soKVxuXG4gIHRoaXNMYXllci5hbmltYXRpb25Uby5zdGFydCgpXG5cbiMjI1xuICBBTklNQVRFIE1PQklMRSBMQVlFUlMgSU4gQU5EIE9VVCBPRiBUSEUgVklFV1BPUlRcblxuICBTaG9ydGhhbmQgc3ludGF4IGZvciBhbmltYXRpbmcgbGF5ZXJzIGluIGFuZCBvdXQgb2YgdGhlIHZpZXdwb3J0LiBBc3N1bWVzIHRoYXQgdGhlIGxheWVyIHlvdSBhcmUgYW5pbWF0aW5nIGlzIGEgd2hvbGUgc2NyZWVuIGFuZCBoYXMgdGhlIHNhbWUgZGltZW5zaW9ucyBhcyB5b3VyIGNvbnRhaW5lci5cblxuICBFbmFibGUgdGhlIGRldmljZSBwcmV2aWV3IGluIEZyYW1lciBTdHVkaW8gdG8gdXNlIHRoaXMg4oCTwqBpdCBsZXRzIHRoaXMgc2NyaXB0IGZpZ3VyZSBvdXQgd2hhdCB0aGUgYm91bmRzIG9mIHlvdXIgc2NyZWVuIGFyZS5cblxuICBFeGFtcGxlOlxuICAqIGBNeUxheWVyLnNsaWRlVG9MZWZ0KClgIHdpbGwgYW5pbWF0ZSB0aGUgbGF5ZXIgKip0byoqIHRoZSBsZWZ0IGNvcm5lciBvZiB0aGUgc2NyZWVuIChmcm9tIGl0cyBjdXJyZW50IHBvc2l0aW9uKVxuXG4gICogYE15TGF5ZXIuc2xpZGVGcm9tTGVmdCgpYCB3aWxsIGFuaW1hdGUgdGhlIGxheWVyIGludG8gdGhlIHZpZXdwb3J0ICoqZnJvbSoqIHRoZSBsZWZ0IGNvcm5lciAoZnJvbSB4PS13aWR0aClcblxuICBDb25maWd1cmF0aW9uOlxuICAqIChCeSBkZWZhdWx0IHdlIHVzZSBhIHNwcmluZyBjdXJ2ZSB0aGF0IGFwcHJveGltYXRlcyBpT1MuIFRvIHVzZSBhIHRpbWUgZHVyYXRpb24sIGNoYW5nZSB0aGUgY3VydmUgdG8gYmV6aWVyLWN1cnZlLilcbiAgKiBGcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24udGltZVxuICAqIEZyYW1lci5EZWZhdWx0cy5TbGlkZUFuaW1hdGlvbi5jdXJ2ZVxuXG5cbiAgSG93IHRvIHJlYWQgdGhlIGNvbmZpZ3VyYXRpb246XG4gIGBgYHNsaWRlRnJvbUxlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiICAgICAvLyBhbmltYXRlIGFsb25nIHRoZSBYIGF4aXNcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIGZyb206IC0xICAgICAgICAgIC8vIHN0YXJ0IHZhbHVlOiBvdXRzaWRlIHRoZSBsZWZ0IGNvcm5lciAoIHggPSAtd2lkdGhfcGhvbmUgKVxuICAgIHRvOiAwICAgICAgICAgICAgIC8vIGVuZCB2YWx1ZTogaW5zaWRlIHRoZSBsZWZ0IGNvcm5lciAoIHggPSB3aWR0aF9sYXllciApXG4gIGBgYFxuIyMjXG5cblxuc2hvcnRjdXRzLnNsaWRlQW5pbWF0aW9ucyA9XG4gIHNsaWRlRnJvbUxlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICBmcm9tOiAtMVxuICAgIHRvOiAwXG5cbiAgc2xpZGVUb0xlZnQ6XG4gICAgcHJvcGVydHk6IFwieFwiXG4gICAgZmFjdG9yOiBcIndpZHRoXCJcbiAgICB0bzogLTFcblxuICBzbGlkZUZyb21SaWdodDpcbiAgICBwcm9wZXJ0eTogXCJ4XCJcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIGZyb206IDFcbiAgICB0bzogMFxuXG4gIHNsaWRlVG9SaWdodDpcbiAgICBwcm9wZXJ0eTogXCJ4XCJcbiAgICBmYWN0b3I6IFwid2lkdGhcIlxuICAgIHRvOiAxXG5cbiAgc2xpZGVGcm9tVG9wOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIGZyb206IC0xXG4gICAgdG86IDBcblxuICBzbGlkZVRvVG9wOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIHRvOiAtMVxuXG4gIHNsaWRlRnJvbUJvdHRvbTpcbiAgICBwcm9wZXJ0eTogXCJ5XCJcbiAgICBmYWN0b3I6IFwiaGVpZ2h0XCJcbiAgICBmcm9tOiAxXG4gICAgdG86IDBcblxuICBzbGlkZVRvQm90dG9tOlxuICAgIHByb3BlcnR5OiBcInlcIlxuICAgIGZhY3RvcjogXCJoZWlnaHRcIlxuICAgIHRvOiAxXG5cblxuXG5fLmVhY2ggc2hvcnRjdXRzLnNsaWRlQW5pbWF0aW9ucywgKG9wdHMsIG5hbWUpIC0+XG4gIExheWVyLnByb3RvdHlwZVtuYW1lXSA9ICh0aW1lKSAtPlxuICAgIF9waG9uZSA9IEZyYW1lci5EZXZpY2U/LnNjcmVlbj8uZnJhbWVcblxuICAgIHVubGVzcyBfcGhvbmVcbiAgICAgIGVyciA9IFwiUGxlYXNlIHNlbGVjdCBhIGRldmljZSBwcmV2aWV3IGluIEZyYW1lciBTdHVkaW8gdG8gdXNlIHRoZSBzbGlkZSBwcmVzZXQgYW5pbWF0aW9ucy5cIlxuICAgICAgcHJpbnQgZXJyXG4gICAgICBjb25zb2xlLmxvZyBlcnJcbiAgICAgIHJldHVyblxuXG4gICAgX3Byb3BlcnR5ID0gb3B0cy5wcm9wZXJ0eVxuICAgIF9mYWN0b3IgPSBfcGhvbmVbb3B0cy5mYWN0b3JdXG5cbiAgICBpZiBvcHRzLmZyb20/XG4gICAgICAjIEluaXRpYXRlIHRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgYW5pbWF0aW9uIChpLmUuIG9mZiBzY3JlZW4gb24gdGhlIGxlZnQgY29ybmVyKVxuICAgICAgdGhpc1tfcHJvcGVydHldID0gb3B0cy5mcm9tICogX2ZhY3RvclxuXG4gICAgIyBEZWZhdWx0IGFuaW1hdGlvbiBzeW50YXggbGF5ZXIuYW5pbWF0ZSh7X3Byb3BlcnR5OiAwfSkgd291bGQgdHJ5IHRvIGFuaW1hdGUgJ19wcm9wZXJ0eScgbGl0ZXJhbGx5LCBpbiBvcmRlciBmb3IgaXQgdG8gYmxvdyB1cCB0byB3aGF0J3MgaW4gaXQgKGVnIHgpLCB3ZSB1c2UgdGhpcyBzeW50YXhcbiAgICBfYW5pbWF0aW9uQ29uZmlnID0ge31cbiAgICBfYW5pbWF0aW9uQ29uZmlnW19wcm9wZXJ0eV0gPSBvcHRzLnRvICogX2ZhY3RvclxuXG4gICAgaWYgdGltZVxuICAgICAgX3RpbWUgPSB0aW1lXG4gICAgICBfY3VydmUgPSBcImJlemllci1jdXJ2ZVwiXG4gICAgZWxzZVxuICAgICAgX3RpbWUgPSBGcmFtZXIuRGVmYXVsdHMuU2xpZGVBbmltYXRpb24udGltZVxuICAgICAgX2N1cnZlID0gRnJhbWVyLkRlZmF1bHRzLlNsaWRlQW5pbWF0aW9uLmN1cnZlXG5cbiAgICB0aGlzLmFuaW1hdGVcbiAgICAgIHByb3BlcnRpZXM6IF9hbmltYXRpb25Db25maWdcbiAgICAgIHRpbWU6IF90aW1lXG4gICAgICBjdXJ2ZTogX2N1cnZlXG5cblxuXG4jIyNcbiAgRUFTWSBGQURFIElOIC8gRkFERSBPVVRcblxuICAuc2hvdygpIGFuZCAuaGlkZSgpIGFyZSBzaG9ydGN1dHMgdG8gYWZmZWN0IG9wYWNpdHkgYW5kIHBvaW50ZXIgZXZlbnRzLiBUaGlzIGlzIGVzc2VudGlhbGx5IHRoZSBzYW1lIGFzIGhpZGluZyB3aXRoIGB2aXNpYmxlID0gZmFsc2VgIGJ1dCBjYW4gYmUgYW5pbWF0ZWQuXG5cbiAgLmZhZGVJbigpIGFuZCAuZmFkZU91dCgpIGFyZSBzaG9ydGN1dHMgdG8gZmFkZSBpbiBhIGhpZGRlbiBsYXllciwgb3IgZmFkZSBvdXQgYSB2aXNpYmxlIGxheWVyLlxuXG4gIFRoZXNlIHNob3J0Y3V0cyB3b3JrIG9uIGluZGl2aWR1YWwgbGF5ZXIgb2JqZWN0cyBhcyB3ZWxsIGFzIGFuIGFycmF5IG9mIGxheWVycy5cblxuICBFeGFtcGxlOlxuICAqIGBNeUxheWVyLmZhZGVJbigpYCB3aWxsIGZhZGUgaW4gTXlMYXllciB1c2luZyBkZWZhdWx0IHRpbWluZy5cbiAgKiBgW015TGF5ZXIsIE90aGVyTGF5ZXJdLmZhZGVPdXQoNClgIHdpbGwgZmFkZSBvdXQgYm90aCBNeUxheWVyIGFuZCBPdGhlckxheWVyIG92ZXIgNCBzZWNvbmRzLlxuXG4gIFRvIGN1c3RvbWl6ZSB0aGUgZmFkZSBhbmltYXRpb24sIGNoYW5nZSB0aGUgdmFyaWFibGVzIHRpbWUgYW5kIGN1cnZlIGluc2lkZSBgRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb25gLlxuIyMjXG5MYXllcjo6c2hvdyA9IC0+XG4gIEBvcGFjaXR5ID0gMVxuICBAc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJ1xuICBAXG5cbkxheWVyOjpoaWRlID0gLT5cbiAgQG9wYWNpdHkgPSAwXG4gIEBzdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnXG4gIEBcblxuTGF5ZXI6OmZhZGVJbiA9ICh0aW1lID0gRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24udGltZSkgLT5cbiAgcmV0dXJuIGlmIEBvcGFjaXR5ID09IDFcblxuICB1bmxlc3MgQHZpc2libGVcbiAgICBAb3BhY2l0eSA9IDBcbiAgICBAdmlzaWJsZSA9IHRydWVcblxuICBAYW5pbWF0ZVRvIG9wYWNpdHk6IDEsIHRpbWUsIEZyYW1lci5EZWZhdWx0cy5GYWRlQW5pbWF0aW9uLmN1cnZlXG5cbkxheWVyOjpmYWRlT3V0ID0gKHRpbWUgPSBGcmFtZXIuRGVmYXVsdHMuRmFkZUFuaW1hdGlvbi50aW1lKSAtPlxuICByZXR1cm4gaWYgQG9wYWNpdHkgPT0gMFxuXG4gIHRoYXQgPSBAXG4gIEBhbmltYXRlVG8gb3BhY2l0eTogMCwgdGltZSwgRnJhbWVyLkRlZmF1bHRzLkZhZGVBbmltYXRpb24uY3VydmUsIC0+IHRoYXQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJ1xuXG4jIGFsbCBvZiB0aGUgZWFzeSBpbi9vdXQgaGVscGVycyB3b3JrIG9uIGFuIGFycmF5IG9mIHZpZXdzIGFzIHdlbGwgYXMgaW5kaXZpZHVhbCB2aWV3c1xuXy5lYWNoIFsnc2hvdycsICdoaWRlJywgJ2ZhZGVJbicsICdmYWRlT3V0J10sIChmblN0cmluZyktPiAgXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBBcnJheS5wcm90b3R5cGUsIGZuU3RyaW5nLCBcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIHZhbHVlOiAodGltZSkgLT5cbiAgICAgIF8uZWFjaCBALCAobGF5ZXIpIC0+XG4gICAgICAgIExheWVyLnByb3RvdHlwZVtmblN0cmluZ10uY2FsbChsYXllciwgdGltZSkgaWYgbGF5ZXIgaW5zdGFuY2VvZiBMYXllclxuICAgICAgQFxuXG5cbiMjI1xuICBFQVNZIEhPVkVSIEFORCBUT1VDSC9DTElDSyBTVEFURVMgRk9SIExBWUVSU1xuXG4gIEJ5IG5hbWluZyB5b3VyIGxheWVyIGhpZXJhcmNoeSBpbiB0aGUgZm9sbG93aW5nIHdheSwgeW91IGNhbiBhdXRvbWF0aWNhbGx5IGhhdmUgeW91ciBsYXllcnMgcmVhY3QgdG8gaG92ZXJzLCBjbGlja3Mgb3IgdGFwcy5cblxuICBCdXR0b25fdG91Y2hhYmxlXG4gIC0gQnV0dG9uX2RlZmF1bHQgKGRlZmF1bHQgc3RhdGUpXG4gIC0gQnV0dG9uX2Rvd24gKHRvdWNoL2NsaWNrIHN0YXRlKVxuICAtIEJ1dHRvbl9ob3ZlciAoaG92ZXIpXG4jIyNcblxuc2hvcnRjdXRzLmluaXRpYWxpemVUb3VjaFN0YXRlcyA9IChsYXllcikgLT5cbiAgX2RlZmF1bHQgPSBsYXllci5nZXRDaGlsZCgnZGVmYXVsdCcpXG5cbiAgaWYgbGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ3RvdWNoYWJsZScpIGFuZCBfZGVmYXVsdFxuXG4gICAgdW5sZXNzIEZyYW1lci5VdGlscy5pc01vYmlsZSgpXG4gICAgICBfaG92ZXIgPSBsYXllci5nZXRDaGlsZCgnaG92ZXInKVxuICAgIF9kb3duID0gbGF5ZXIuZ2V0Q2hpbGQoJ2Rvd24nKVxuXG4gICAgIyBUaGVzZSBsYXllcnMgc2hvdWxkIGJlIGhpZGRlbiBieSBkZWZhdWx0XG4gICAgX2hvdmVyPy5oaWRlKClcbiAgICBfZG93bj8uaGlkZSgpXG5cbiAgICAjIENyZWF0ZSBmYWtlIGhpdCB0YXJnZXQgKHNvIHdlIGRvbid0IHJlLWZpcmUgZXZlbnRzKVxuICAgIGlmIF9ob3ZlciBvciBfZG93blxuICAgICAgaGl0VGFyZ2V0ID0gbmV3IExheWVyXG4gICAgICAgIGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCdcbiAgICAgICAgZnJhbWU6IF9kZWZhdWx0LmZyYW1lXG5cbiAgICAgIGhpdFRhcmdldC5zdXBlckxheWVyID0gbGF5ZXJcbiAgICAgIGhpdFRhcmdldC5icmluZ1RvRnJvbnQoKVxuXG4gICAgIyBUaGVyZSBpcyBhIGhvdmVyIHN0YXRlLCBzbyBkZWZpbmUgaG92ZXIgZXZlbnRzIChub3QgZm9yIG1vYmlsZSlcbiAgICBpZiBfaG92ZXJcbiAgICAgIGxheWVyLmhvdmVyIC0+XG4gICAgICAgIF9kZWZhdWx0LmhpZGUoKVxuICAgICAgICBfaG92ZXIuc2hvdygpXG4gICAgICAsIC0+XG4gICAgICAgIF9kZWZhdWx0LnNob3coKVxuICAgICAgICBfaG92ZXIuaGlkZSgpXG5cbiAgICAjIFRoZXJlIGlzIGEgZG93biBzdGF0ZSwgc28gZGVmaW5lIGRvd24gZXZlbnRzXG4gICAgaWYgX2Rvd25cbiAgICAgIGxheWVyLm9uIEV2ZW50cy5Ub3VjaFN0YXJ0LCAtPlxuICAgICAgICBfZGVmYXVsdC5oaWRlKClcbiAgICAgICAgX2hvdmVyPy5oaWRlKCkgIyB0b3VjaCBkb3duIHN0YXRlIG92ZXJyaWRlcyBob3ZlciBzdGF0ZVxuICAgICAgICBfZG93bi5zaG93KClcblxuICAgICAgbGF5ZXIub24gRXZlbnRzLlRvdWNoRW5kLCAtPlxuICAgICAgICBfZG93bi5oaWRlKClcblxuICAgICAgICBpZiBfaG92ZXJcbiAgICAgICAgICAjIElmIHRoZXJlIHdhcyBhIGhvdmVyIHN0YXRlLCBnbyBiYWNrIHRvIHRoZSBob3ZlciBzdGF0ZVxuICAgICAgICAgIF9ob3Zlci5zaG93KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIF9kZWZhdWx0LnNob3coKVxuXG5cbl8uZXh0ZW5kKGV4cG9ydHMsIHNob3J0Y3V0cylcblxuIiwidmFyIENvbGxhcHNlSG9sZGVyLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbmV4cG9ydHMuTmVzdGVkTGlzdCA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChOZXN0ZWRMaXN0LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBOZXN0ZWRMaXN0KGxheWVyTGlzdCkge1xuICAgIHRoaXMuYWRqdXN0TGF5ZXJzID0gYmluZCh0aGlzLmFkanVzdExheWVycywgdGhpcyk7XG4gICAgdGhpcy5yZXNpemVMYXllcnMgPSBiaW5kKHRoaXMucmVzaXplTGF5ZXJzLCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZUhvbGRlcnMgPSBiaW5kKHRoaXMuY3JlYXRlSG9sZGVycywgdGhpcyk7XG4gICAgTmVzdGVkTGlzdC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmNvbnRlbnQgPSB0aGlzLmNyZWF0ZUhvbGRlcnMobGF5ZXJMaXN0KTtcbiAgICB0aGlzLmRlcHRoID0gMDtcbiAgICB0aGlzLnNpemUgPSB0aGlzLmNvbnRlbnQuc2l6ZTtcbiAgICB0aGlzLnBvaW50ID0gdGhpcy5jb250ZW50LnBvaW50O1xuICAgIHRoaXMubmFtZSA9IFwiTmVzdGVkTGlzdFwiO1xuICB9XG5cbiAgTmVzdGVkTGlzdC5wcm90b3R5cGUuY3JlYXRlSG9sZGVycyA9IGZ1bmN0aW9uKGxldmVsLCB0b2dnbGVMYXllcikge1xuICAgIHZhciBjb2xsYXBzZUxheWVycywgaSwgaiwgbGVuLCBuZXh0VG9nZ2xlO1xuICAgIGNvbGxhcHNlTGF5ZXJzID0gW107XG4gICAgbmV4dFRvZ2dsZSA9IG51bGw7XG4gICAgZm9yIChqID0gMCwgbGVuID0gbGV2ZWwubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGkgPSBsZXZlbFtqXTtcbiAgICAgIGlmICghaVswXSkge1xuICAgICAgICBuZXh0VG9nZ2xlID0gaTtcbiAgICAgICAgY29sbGFwc2VMYXllcnMucHVzaChpKTtcbiAgICAgIH0gZWxzZSBpZiAoaVswXSkge1xuICAgICAgICB0aGlzLmRlcHRoID0gdGhpcy5kZXB0aCArIDE7XG4gICAgICAgIGNvbGxhcHNlTGF5ZXJzLnB1c2godGhpcy5jcmVhdGVIb2xkZXJzKGksIG5leHRUb2dnbGUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0b2dnbGVMYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5kZXB0aCA9IHRoaXMuZGVwdGggLSAxO1xuICAgICAgcmV0dXJuIG5ldyBDb2xsYXBzZUhvbGRlcihjb2xsYXBzZUxheWVycywgdG9nZ2xlTGF5ZXIpO1xuICAgIH1cbiAgICB0aGlzLnJlc2l6ZUxheWVycyhjb2xsYXBzZUxheWVycyk7XG4gICAgcmV0dXJuIHRoaXMubGF5ZXJzID0gY29sbGFwc2VMYXllcnM7XG4gIH07XG5cbiAgTmVzdGVkTGlzdC5wcm90b3R5cGUucmVzaXplTGF5ZXJzID0gZnVuY3Rpb24oY29sbGFwc2VMYXllcnMpIHtcbiAgICB2YXIgaiwgaywgbGF5ZXIsIGxheWVySGVpZ2h0cywgbGF5ZXJNaW5YcywgbGF5ZXJNaW5ZcywgbGF5ZXJXaWR0aHMsIGxlbiwgbGVuMSwgcmVzdWx0cztcbiAgICBsYXllckhlaWdodHMgPSBbXTtcbiAgICBsYXllcldpZHRocyA9IFtdO1xuICAgIGxheWVyTWluWHMgPSBbXTtcbiAgICBsYXllck1pbllzID0gW107XG4gICAgZm9yIChqID0gMCwgbGVuID0gY29sbGFwc2VMYXllcnMubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGxheWVyID0gY29sbGFwc2VMYXllcnNbal07XG4gICAgICBpZiAobGF5ZXIuc3VwZXJMYXllciA9PT0gIXRoaXMpIHtcbiAgICAgICAgdGhpcy5zdXBlckxheWVyID0gbGF5ZXIuc3VwZXJMYXllcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyBsYXllci5oZWlnaHQ7XG4gICAgICBsYXllckhlaWdodHMucHVzaChsYXllci5oZWlnaHQpO1xuICAgICAgbGF5ZXJXaWR0aHMucHVzaChsYXllci53aWR0aCk7XG4gICAgICBsYXllck1pblhzLnB1c2gobGF5ZXIubWluWCk7XG4gICAgICBsYXllck1pbllzLnB1c2gobGF5ZXIubWluWSk7XG4gICAgfVxuICAgIHRoaXMud2lkdGggPSBNYXRoLm1heC5hcHBseSh0aGlzLCBsYXllcldpZHRocyk7XG4gICAgdGhpcy5oZWlnaHQgPSBsYXllckhlaWdodHMucmVkdWNlKGZ1bmN0aW9uKHQsIHMpIHtcbiAgICAgIHJldHVybiB0ICsgcztcbiAgICB9KTtcbiAgICB0aGlzLnggPSBNYXRoLm1pbi5hcHBseSh0aGlzLCBsYXllck1pblhzKTtcbiAgICB0aGlzLnkgPSBNYXRoLm1pbi5hcHBseSh0aGlzLCBsYXllck1pbllzKTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChrID0gMCwgbGVuMSA9IGNvbGxhcHNlTGF5ZXJzLmxlbmd0aDsgayA8IGxlbjE7IGsrKykge1xuICAgICAgbGF5ZXIgPSBjb2xsYXBzZUxheWVyc1trXTtcbiAgICAgIGxheWVyLnN1cGVyTGF5ZXIgPSB0aGlzO1xuICAgICAgcmVzdWx0cy5wdXNoKGxheWVyLnBvaW50ID0ge1xuICAgICAgICB4OiBsYXllci54IC0gdGhpcy54LFxuICAgICAgICB5OiBsYXllci55IC0gdGhpcy55XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTmVzdGVkTGlzdC5wcm90b3R5cGUuYWRqdXN0TGF5ZXJzID0gZnVuY3Rpb24oYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbikge1xuICAgIHZhciBqLCBsYXllciwgbGVuLCBtb3ZlbWVudCwgcmVmO1xuICAgIHByaW50KFwiI05FU1QjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcIik7XG4gICAgcHJpbnQoXCJBZGp1c3RtZW50XCIsIGFkanVzdG1lbnQpO1xuICAgIHByaW50KFwiTG9va2luZyBhdCBcIiArIHRoaXMubmFtZSArIFwiIGJ5IHJlcXVlc3Qgb2YgXCIgKyBvcmlnaW4ubmFtZSk7XG4gICAgcHJpbnQoXCJpZDogXCIgKyB0aGlzLmlkLCBcIm9yaWdpbjogXCIgKyBvcmlnaW4uaWQsIFwiPW86IFwiICsgb3JpZ2luLmlkID09PSB0aGlzLmlkLCBcIj10OiBcIiArIHRvZ2dsZUxheWVyLmlkID09PSB0aGlzLmlkKTtcbiAgICBpZiAob3JpZ2luLmlkICE9PSB0aGlzLmlkKSB7XG4gICAgICBwcmludChcIkFkanVzdGluZyBcIiArIHRoaXMubmFtZSk7XG4gICAgICByZWYgPSB0aGlzLmNoaWxkcmVuO1xuICAgICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIGxheWVyID0gcmVmW2pdO1xuICAgICAgICBwcmludChcIiB8ICBsb29raW5nIGF0OiBcIiArIGxheWVyLm5hbWUgKyBcIiBcIiArIGxheWVyLmlkKTtcbiAgICAgICAgcHJpbnQoXCIgfCB8ICBmcm9tIFwiICsgdGhpcy5uYW1lICsgXCIgXCIgKyB0aGlzLmlkKTtcbiAgICAgICAgcHJpbnQoXCIgfCB8ICBieSByZXF1ZXN0IG9mIFwiICsgb3JpZ2luLm5hbWUpO1xuICAgICAgICBwcmludChcIiB8IHwgIGNsaWNrZWQgb24gXCIgKyB0b2dnbGVMYXllci5uYW1lKTtcbiAgICAgICAgaWYgKGxheWVyLmlkICE9PSBvcmlnaW4uaWQgJiYgbGF5ZXIuaWQgIT09IHRvZ2dsZUxheWVyLmlkKSB7XG4gICAgICAgICAgcHJpbnQobGF5ZXIubmFtZSwgbGF5ZXIuc2NyZWVuRnJhbWUueSwgXCIgLS0gXCIsIG9yaWdpbi5uYW1lLCBvcmlnaW4uc2NyZWVuRnJhbWUueSwgYWRqdXN0bWVudCk7XG4gICAgICAgICAgaWYgKGxheWVyLnNjcmVlbkZyYW1lLnkgPj0gb3JpZ2luLnNjcmVlbkZyYW1lLnkpIHtcbiAgICAgICAgICAgIHByaW50KFwiIHwgIG1vdmluZyBcIiArIGxheWVyLm5hbWUgKyBcIiBieSBcIiArIGFkanVzdG1lbnQpO1xuICAgICAgICAgICAgbGF5ZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICB5OiBsYXllci55ICsgYWRqdXN0bWVudFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0aW1lOiAwLjJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChsYXllci5pZCA9PT0gb3JpZ2luLmlkKSB7XG4gICAgICAgICAgcHJpbnQoXCJOb3QgYWRqdXN0aW5nIG9yaWdpbjogXCIgKyBsYXllci5uYW1lKTtcbiAgICAgICAgfSBlbHNlIGlmIChsYXllci5pZCA9PT0gdG9nZ2xlTGF5ZXIuaWQpIHtcbiAgICAgICAgICBwcmludChcIm5vdCBhZGp1c3RpbmcgdG9nZ2xlTGF5ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW92ZW1lbnQgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmlnaW4udG9nZ2xlTGF5ZXIuaWQgIT09IHRoaXMuaWQpIHtcbiAgICAgIHByaW50KFwiTm90IEFkanVzdGluZyBcIiArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFuaW1hdGUoe1xuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0ICsgYWRqdXN0bWVudFxuICAgICAgfSxcbiAgICAgIHRpbWU6IDAuMlxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBOZXN0ZWRMaXN0O1xuXG59KShMYXllcik7XG5cbkNvbGxhcHNlSG9sZGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgdmFyIGxheWVyLCBsYXllck5hbWU7XG5cbiAgZXh0ZW5kKENvbGxhcHNlSG9sZGVyLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBDb2xsYXBzZUhvbGRlcihsYXllckFycmF5LCB0b2dnbGVMYXllciwgc2tldGNoKSB7XG4gICAgdGhpcy5zb3J0TGF5ZXJzID0gYmluZCh0aGlzLnNvcnRMYXllcnMsIHRoaXMpO1xuICAgIHRoaXMudG9nZ2xlID0gYmluZCh0aGlzLnRvZ2dsZSwgdGhpcyk7XG4gICAgdGhpcy5leHBhbmQgPSBiaW5kKHRoaXMuZXhwYW5kLCB0aGlzKTtcbiAgICB0aGlzLmNvbGxhcHNlID0gYmluZCh0aGlzLmNvbGxhcHNlLCB0aGlzKTtcbiAgICB0aGlzLmFkanVzdExheWVycyA9IGJpbmQodGhpcy5hZGp1c3RMYXllcnMsIHRoaXMpO1xuICAgIHZhciBqLCBrLCBsYXllciwgbGF5ZXJIZWlnaHRzLCBsYXllck1pblhzLCBsYXllck1pbllzLCBsYXllcldpZHRocywgbGVuLCBsZW4xO1xuICAgIENvbGxhcHNlSG9sZGVyLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO1xuICAgIHRoaXMub3JpZ2luWSA9IDA7XG4gICAgdGhpcy5hbmltYXRpb25PcHRpb25zID0ge1xuICAgICAgdGltZTogMC4yXG4gICAgfTtcbiAgICB0aGlzLnN0YXRlcy5jb2xsYXBzZWQgPSB7XG4gICAgICBzY2FsZVk6IDBcbiAgICB9O1xuICAgIHRoaXMuc3RhdGVzW1wiZGVmYXVsdFwiXSA9IHtcbiAgICAgIHNjYWxlWTogMVxuICAgIH07XG4gICAgdGhpcy5oZWlnaHQgPSAwO1xuICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xuICAgIGlmICh0b2dnbGVMYXllcikge1xuICAgICAgdGhpcy5uYW1lID0gXCJjb2xsYXBzZV9cIiArIHRvZ2dsZUxheWVyLm5hbWU7XG4gICAgICB0aGlzLnRvZ2dsZUxheWVyID0gdG9nZ2xlTGF5ZXI7XG4gICAgfVxuICAgIHRvZ2dsZUxheWVyLm9uKEV2ZW50cy5DbGljaywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSwgbCkge1xuICAgICAgICByZXR1cm4gX3RoaXMudG9nZ2xlKGwpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgbGF5ZXJIZWlnaHRzID0gW107XG4gICAgbGF5ZXJXaWR0aHMgPSBbXTtcbiAgICBsYXllck1pblhzID0gW107XG4gICAgbGF5ZXJNaW5ZcyA9IFtdO1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IGxheWVyQXJyYXkubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGxheWVyID0gbGF5ZXJBcnJheVtqXTtcbiAgICAgIHRoaXMuc3VwZXJMYXllciA9IGxheWVyLnN1cGVyTGF5ZXI7XG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICsgbGF5ZXIuaGVpZ2h0O1xuICAgICAgbGF5ZXJIZWlnaHRzLnB1c2gobGF5ZXIuaGVpZ2h0KTtcbiAgICAgIGxheWVyV2lkdGhzLnB1c2gobGF5ZXIud2lkdGgpO1xuICAgICAgbGF5ZXJNaW5Ycy5wdXNoKGxheWVyLm1pblgpO1xuICAgICAgbGF5ZXJNaW5Zcy5wdXNoKGxheWVyLm1pblkpO1xuICAgIH1cbiAgICB0aGlzLndpZHRoID0gTWF0aC5tYXguYXBwbHkodGhpcywgbGF5ZXJXaWR0aHMpO1xuICAgIHRoaXMuaGVpZ2h0ID0gbGF5ZXJIZWlnaHRzLnJlZHVjZShmdW5jdGlvbih0LCBzKSB7XG4gICAgICByZXR1cm4gdCArIHM7XG4gICAgfSk7XG4gICAgdGhpcy5mdWxsSGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgdGhpcy54ID0gTWF0aC5taW4uYXBwbHkodGhpcywgbGF5ZXJNaW5Ycyk7XG4gICAgdGhpcy55ID0gTWF0aC5taW4uYXBwbHkodGhpcywgbGF5ZXJNaW5Zcyk7XG4gICAgZm9yIChrID0gMCwgbGVuMSA9IGxheWVyQXJyYXkubGVuZ3RoOyBrIDwgbGVuMTsgaysrKSB7XG4gICAgICBsYXllciA9IGxheWVyQXJyYXlba107XG4gICAgICBsYXllci5zdXBlckxheWVyID0gdGhpcztcbiAgICAgIGxheWVyLnBvaW50ID0ge1xuICAgICAgICB4OiBsYXllci54IC0gdGhpcy54LFxuICAgICAgICB5OiBsYXllci55IC0gdGhpcy55XG4gICAgICB9O1xuICAgIH1cbiAgICB0aGlzLnNvcnRMYXllcnMoKTtcbiAgfVxuXG4gIENvbGxhcHNlSG9sZGVyLnByb3RvdHlwZS5hZGp1c3RMYXllcnMgPSBmdW5jdGlvbihhZGp1c3RtZW50LCB0b2dnbGVMYXllciwgb3JpZ2luKSB7XG4gICAgdmFyIGosIGxheWVyLCBsZW4sIG1vdmVtZW50LCByZWY7XG4gICAgcHJpbnQoXCIjQ09MTCMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1wiKTtcbiAgICBwcmludChcIkxvb2tpbmcgYXQgXCIgKyB0aGlzLm5hbWUgKyBcIiBieSByZXF1ZXN0IG9mIFwiICsgb3JpZ2luLm5hbWUpO1xuICAgIHByaW50KHRoaXMuaWQsIG9yaWdpbi5pZCwgb3JpZ2luLmlkICE9PSB0aGlzLmlkLCBvcmlnaW4uaWQgPT09IHRoaXMuaWQpO1xuICAgIGlmIChvcmlnaW4uaWQgIT09IHRoaXMuaWQpIHtcbiAgICAgIHByaW50KFwiQWRqdXN0aW5nIFwiICsgdGhpcy5uYW1lKTtcbiAgICAgIHJlZiA9IHRoaXMuY2hpbGRyZW47XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgbGF5ZXIgPSByZWZbal07XG4gICAgICAgIHByaW50KFwiIHwgIGxvb2tpbmcgYXQ6IFwiICsgbGF5ZXIubmFtZSArIFwiIGZyb20gXCIgKyB0aGlzLm5hbWUgKyBcIiBieSByZXF1ZXN0IG9mIFwiICsgb3JpZ2luLm5hbWUpO1xuICAgICAgICBpZiAobGF5ZXIuaWQgIT09IG9yaWdpbi5pZCkge1xuICAgICAgICAgIG1vdmVtZW50ID0gMDtcbiAgICAgICAgICBpZiAobGF5ZXIueSA+IHRvZ2dsZUxheWVyLnkpIHtcbiAgICAgICAgICAgIG1vdmVtZW50ID0gYWRqdXN0bWVudDtcbiAgICAgICAgICAgIGxheWVyLmFuaW1hdGUoe1xuICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgeTogbGF5ZXIueSArIGFkanVzdG1lbnRcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGltZTogMC4yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByaW50KFwicGFyZW50XCIsIGxheWVyLnBhcmVudCk7XG4gICAgICAgICAgICBsYXllci5wYXJlbnQuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGxheWVyLnBhcmVudC5oZWlnaHQgKyBhZGp1c3RtZW50XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRpbWU6IDAuMlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByaW50KFwiTm90IGFkanVzdGluZyBvcmlnaW46IFwiICsgb3JpZ2luLm5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb3ZlbWVudCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcHJpbnQoXCIgfCAgbW92aW5nIFwiICsgbGF5ZXIubmFtZSArIFwiIGJ5IFwiICsgbW92ZW1lbnQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3JpZ2luLnRvZ2dsZUxheWVyLmlkICE9PSB0aGlzLmlkKSB7XG4gICAgICBwcmludChcIk5vdCBBZGp1c3RpbmcgXCIgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBwcmludChcIkRPTkUgLS0gTU9WSU5HIFRPOiBcIiArIHRoaXMucGFyZW50Lm5hbWUpO1xuICAgIHByaW50KFwiIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcIik7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LmFkanVzdExheWVycyhhZGp1c3RtZW50LCB0b2dnbGVMYXllciwgb3JpZ2luKTtcbiAgfTtcblxuICBDb2xsYXBzZUhvbGRlci5wcm90b3R5cGUuY29sbGFwc2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5hbmltYXRlKFwiY29sbGFwc2VkXCIpO1xuICB9O1xuXG4gIENvbGxhcHNlSG9sZGVyLnByb3RvdHlwZS5leHBhbmQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5hbmltYXRlKFwiZGVmYXVsdFwiKTtcbiAgfTtcblxuICBDb2xsYXBzZUhvbGRlci5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24obCkge1xuICAgIHZhciBhZGp1c3RtZW50O1xuICAgIHRoaXMuc3RhdGVzLm5leHQoKTtcbiAgICBwcmludCh0aGlzLmhlaWdodCk7XG4gICAgYWRqdXN0bWVudCA9IHRoaXMuaGVpZ2h0O1xuICAgIHByaW50KFwiIFwiKTtcbiAgICBwcmludChcIiBcIik7XG4gICAgcHJpbnQoXCJDSEFOR0lORyBcIiArIHRoaXMubmFtZSArIFwiIFRPIFwiICsgdGhpcy5zdGF0ZXMuY3VycmVudC5uYW1lKTtcbiAgICBpZiAodGhpcy5zdGF0ZXMuY3VycmVudC5zY2FsZVkgPT09IDApIHtcbiAgICAgIHByaW50KFwic2hyaW5raW5nXCIsIGFkanVzdG1lbnQpO1xuICAgICAgYWRqdXN0bWVudCA9IDAgLSBhZGp1c3RtZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmludChcImV4cGFuZGluZ1wiLCBhZGp1c3RtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRqdXN0TGF5ZXJzKGFkanVzdG1lbnQsIGwsIHRoaXMpO1xuICB9O1xuXG4gIENvbGxhcHNlSG9sZGVyLnByb3RvdHlwZS5zb3J0TGF5ZXJzID0gZnVuY3Rpb24oKSB7fTtcblxuICBDb2xsYXBzZUhvbGRlci5zb3J0ZWRMYXllcnMgPSBbXTtcblxuICBmb3IgKGxheWVyTmFtZSBpbiBza2V0Y2gpIHtcbiAgICBsYXllciA9IHNrZXRjaFtsYXllck5hbWVdO1xuICAgIENvbGxhcHNlSG9sZGVyLnNvcnRlZExheWVycy5wdXNoKGxheWVyKTtcbiAgICBDb2xsYXBzZUhvbGRlci5zb3J0ZWRMYXllcnMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYS55IC0gYi55O1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIENvbGxhcHNlSG9sZGVyO1xuXG59KShMYXllcik7XG4iLCJcbmNsYXNzIGV4cG9ydHMuTmVzdGVkTGlzdCBleHRlbmRzIExheWVyXG5cdGNvbnN0cnVjdG9yOiAobGF5ZXJMaXN0KSAtPlxuXHRcdHN1cGVyKClcblx0XHRALmNvbnRlbnQgPSBALmNyZWF0ZUhvbGRlcnMobGF5ZXJMaXN0KVxuXHRcdEAuZGVwdGggPSAwXG5cdFx0QC5zaXplID0gQC5jb250ZW50LnNpemVcblx0XHRALnBvaW50ID0gQC5jb250ZW50LnBvaW50XG5cdFx0QC5uYW1lID0gXCJOZXN0ZWRMaXN0XCJcblx0Y3JlYXRlSG9sZGVyczogKGxldmVsLCB0b2dnbGVMYXllcikgPT5cblx0XHRjb2xsYXBzZUxheWVycyA9IFtdXG5cdFx0bmV4dFRvZ2dsZSA9IG51bGxcblx0XHRmb3IgaSBpbiBsZXZlbFxuXHRcdFx0aWYgbm90IGlbMF1cblx0XHRcdFx0bmV4dFRvZ2dsZSA9IGlcblx0XHRcdFx0Y29sbGFwc2VMYXllcnMucHVzaChpKVxuXHRcdFx0ZWxzZSBpZiBpWzBdXG5cdFx0XHRcdEAuZGVwdGg9IEAuZGVwdGgrMVxuXHRcdFx0XHRjb2xsYXBzZUxheWVycy5wdXNoKEAuY3JlYXRlSG9sZGVycyhpLCBuZXh0VG9nZ2xlKSlcblx0XHRpZiB0eXBlb2YgdG9nZ2xlTGF5ZXIgIT0gXCJ1bmRlZmluZWRcIlxuXHRcdFx0QC5kZXB0aCA9IEAuZGVwdGggLSAxXG5cdFx0XHRyZXR1cm4gbmV3IENvbGxhcHNlSG9sZGVyKGNvbGxhcHNlTGF5ZXJzLCB0b2dnbGVMYXllcilcblxuXHRcdEAucmVzaXplTGF5ZXJzKGNvbGxhcHNlTGF5ZXJzKVxuXHRcdEAubGF5ZXJzID0gY29sbGFwc2VMYXllcnNcblxuXHRyZXNpemVMYXllcnM6IChjb2xsYXBzZUxheWVycykgPT5cblx0XHRsYXllckhlaWdodHMgPSBbXVxuXHRcdGxheWVyV2lkdGhzID0gW11cblx0XHRsYXllck1pblhzID0gW11cblx0XHRsYXllck1pbllzID0gW11cblxuXHRcdGZvciBsYXllciBpbiBjb2xsYXBzZUxheWVyc1xuXHRcdFx0aWYgbGF5ZXIuc3VwZXJMYXllciBpcyBub3QgQFxuXHRcdFx0XHRALnN1cGVyTGF5ZXI9bGF5ZXIuc3VwZXJMYXllclxuXHRcdFx0QC5oZWlnaHQgPSBALmhlaWdodCArIGxheWVyLmhlaWdodFxuXHRcdFx0bGF5ZXJIZWlnaHRzLnB1c2ggbGF5ZXIuaGVpZ2h0XG5cdFx0XHRsYXllcldpZHRocy5wdXNoIGxheWVyLndpZHRoXG5cdFx0XHRsYXllck1pblhzLnB1c2ggbGF5ZXIubWluWFxuXHRcdFx0bGF5ZXJNaW5Zcy5wdXNoIGxheWVyLm1pbllcblxuXHRcdEAud2lkdGggPSBNYXRoLm1heC5hcHBseSBALCAobGF5ZXJXaWR0aHMpXG5cdFx0QC5oZWlnaHQgPSBsYXllckhlaWdodHMucmVkdWNlICh0LHMpIC0+IHQgKyBzXG5cblx0XHRALnggPSBNYXRoLm1pbi5hcHBseSBALCAobGF5ZXJNaW5Ycylcblx0XHRALnkgPSBNYXRoLm1pbi5hcHBseSBALCAobGF5ZXJNaW5ZcylcblxuXHRcdGZvciBsYXllciBpbiBjb2xsYXBzZUxheWVyc1xuXHRcdFx0bGF5ZXIuc3VwZXJMYXllciA9IEBcblx0XHRcdGxheWVyLnBvaW50ID1cblx0XHRcdFx0eDogbGF5ZXIueC1ALnhcblx0XHRcdFx0eTogbGF5ZXIueS1ALnlcblxuXHRhZGp1c3RMYXllcnM6IChhZGp1c3RtZW50LCB0b2dnbGVMYXllciwgb3JpZ2luKSA9PlxuXHRcdHByaW50IFwiI05FU1QjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcIlxuXHRcdHByaW50IFwiQWRqdXN0bWVudFwiLCBhZGp1c3RtZW50XG5cdFx0cHJpbnQgXCJMb29raW5nIGF0IFwiICsgQC5uYW1lICsgXCIgYnkgcmVxdWVzdCBvZiBcIiArIG9yaWdpbi5uYW1lXG5cdFx0cHJpbnQgXCJpZDogXCIgKyBALmlkLCBcIm9yaWdpbjogXCIgKyAgb3JpZ2luLmlkLCBcIj1vOiBcIiArIG9yaWdpbi5pZCA9PSBALmlkLCBcIj10OiBcIiArIHRvZ2dsZUxheWVyLmlkID09IEAuaWRcblx0XHRpZiBvcmlnaW4uaWQgIT0gQC5pZFxuXHRcdFx0cHJpbnQgXCJBZGp1c3RpbmcgXCIgKyBALm5hbWVcblx0XHRcdGZvciBsYXllciBpbiBALmNoaWxkcmVuXG5cdFx0XHRcdHByaW50IFwiIHwgIGxvb2tpbmcgYXQ6IFwiICsgbGF5ZXIubmFtZSsgXCIgXCIgKyBsYXllci5pZFxuXHRcdFx0XHRwcmludCBcIiB8IHwgIGZyb20gXCIgKyBALm5hbWUgKyBcIiBcIiArIEAuaWRcblx0XHRcdFx0cHJpbnQgXCIgfCB8ICBieSByZXF1ZXN0IG9mIFwiICsgb3JpZ2luLm5hbWVcblx0XHRcdFx0cHJpbnQgXCIgfCB8ICBjbGlja2VkIG9uIFwiICsgdG9nZ2xlTGF5ZXIubmFtZVxuXHRcdFx0XHRpZiBsYXllci5pZCAhPSBvcmlnaW4uaWQgYW5kIGxheWVyLmlkICE9IHRvZ2dsZUxheWVyLmlkXG5cdFx0XHRcdFx0cHJpbnQgbGF5ZXIubmFtZSwgbGF5ZXIuc2NyZWVuRnJhbWUueSwgXCIgLS0gXCIsIG9yaWdpbi5uYW1lLCBvcmlnaW4uc2NyZWVuRnJhbWUueSwgYWRqdXN0bWVudFxuXHRcdFx0XHRcdGlmIGxheWVyLnNjcmVlbkZyYW1lLnkgPj0gb3JpZ2luLnNjcmVlbkZyYW1lLnlcblx0XHRcdFx0XHRcdHByaW50IFwiIHwgIG1vdmluZyBcIiArIGxheWVyLm5hbWUgKyBcIiBieSBcIiArIGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdGxheWVyLmFuaW1hdGVcblx0XHRcdFx0XHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0XHRcdFx0XHR5OiBsYXllci55ICsgYWRqdXN0bWVudFxuXHRcdFx0XHRcdFx0XHR0aW1lOiAwLjJcblxuXHRcdFx0XHRlbHNlIGlmIGxheWVyLmlkID09IG9yaWdpbi5pZFxuXHRcdFx0XHRcdHByaW50IFwiTm90IGFkanVzdGluZyBvcmlnaW46IFwiICsgbGF5ZXIubmFtZVxuXHRcdFx0XHRlbHNlIGlmIGxheWVyLmlkID09IHRvZ2dsZUxheWVyLmlkXG5cdFx0XHRcdFx0cHJpbnQgXCJub3QgYWRqdXN0aW5nIHRvZ2dsZUxheWVyXCJcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG1vdmVtZW50ID0gMFxuXG5cdFx0ZWxzZSBpZiBvcmlnaW4udG9nZ2xlTGF5ZXIuaWQgIT0gQC5pZFxuXHRcdFx0cHJpbnQgXCJOb3QgQWRqdXN0aW5nIFwiICsgQC5uYW1lXG5cblx0XHRALmFuaW1hdGVcblx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdGhlaWdodDogQC5oZWlnaHQgKyBhZGp1c3RtZW50XG5cdFx0XHR0aW1lOiAwLjJcblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgQ29sbGFwc2VIb2xkZXIoIFsgbGF5ZXJBcnJheSBdICwgdG9nZ2xlTGF5ZXIgKVxuIyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiNcbiMgQVJHVU1FTlRTXG4jXG4jIGxheWVyQXJyYXlcbiMgLS0tLS0tLS0tLVxuIyBBbiBhcnJheSBvZiBsYXllcnMgdG8gYmUgY29sbGFwc2VkLiB0aGVzZSBhcmUgdGhlIG9uZXMgdGhhdFxuIyBzaG91bGQgYWxsIGRpc2FwcGVhciBpbiBhIGdyb3VwIHRvZ2V0aGVyLlxuIyAhISEhIE5PVEUgISEhIVxuIyB0aGVzZSBsYXllcnMgYWxsIG5lZWQgdG8gaGF2ZSB0aGUgc2FtZSBwYXJlbnQgZm9yIHRoaXMgdG8gd29yayAhISFcbiNcbiMgdG9nZ2xlTGF5ZXJcbiMgLS0tLS0tLS0tLS1cbiMgdGhlIGxheWVyIHlvdSB3YW50IHRvIGNsaWNrIG9uIHRvIHNob3cvaGlkZSB0aGUgbGF5ZXJzIGluXG4jIGxheWVyQXJyYXlcbiNcbiMgU0tFVENIIEZJTEVcbiNcbiMgTXkgZmlsZTpcbiMgaHR0cHM6Ly93d3cuZHJvcGJveC5jb20vcy85ZGFyZ3RteGhobWNyc2wvZXhwYW5kRXhhbXBsZS5za2V0Y2g/ZGw9MFxuI1xuIyBJbiB0aGUgc2tldGNoIGZpbGUsIGVhY2ggcm93IHNob3VsZCBiZSBpbmRlcGVuZGVudCwgYW5kIGVxdWFsIGluIHRoZSBoaWVyYXJjaHkuIExpa2UgdGhpczpcbiMgICB8XG4jICAgKy0+IHJvd18xXG4jICAgKy0+IHJvd18xXzFcbiMgICArLT4gcm93XzFfMV9BXG4jICAgKy0+IHJvd18xXzJcbiMgICArLT4gcm93XzFfM1xuIyAgICstPiByb3dfMlxuIyAgIGV0Yy5cbiNcbiMgQ3JlYXRlIG5lc3RlZCB0cmVlcyBieSBwbGFjaW5nIENvbGxhcHNlSG9sZGVycyBpbnRvIENvbGxhcHNlSG9sZGVyc1xuXG5jbGFzcyBleHBvcnRzLkNvbGxhcHNlSG9sZGVyIGV4dGVuZHMgTGF5ZXJcblx0Y29uc3RydWN0b3I6IChsYXllckFycmF5LCB0b2dnbGVMYXllciwgc2tldGNoKSAtPlxuXHRcdHN1cGVyKClcblx0XHRALm9yaWdpblkgPSAwXG5cdFx0QC5hbmltYXRpb25PcHRpb25zID1cblx0XHRcdHRpbWU6IDAuMlxuXHRcdEAuc3RhdGVzLmNvbGxhcHNlZCA9XG5cdFx0XHRzY2FsZVk6IDBcblx0XHRALnN0YXRlcy5kZWZhdWx0ID1cblx0XHRcdHNjYWxlWTogMVxuXHRcdEAuaGVpZ2h0ID0gMFxuXHRcdEAuYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiXG5cdFx0aWYgdG9nZ2xlTGF5ZXJcblx0XHRcdEAubmFtZSA9IFwiY29sbGFwc2VfXCIgKyB0b2dnbGVMYXllci5uYW1lXG5cdFx0XHRALnRvZ2dsZUxheWVyID0gdG9nZ2xlTGF5ZXJcblx0XHR0b2dnbGVMYXllci5vbiBFdmVudHMuQ2xpY2ssIChlLGwpID0+XG5cdFx0XHRALnRvZ2dsZShsKVxuIyBcdFx0XHRALnN0YXRlcy5uZXh0KClcblxuXHRcdGxheWVySGVpZ2h0cyA9IFtdXG5cdFx0bGF5ZXJXaWR0aHMgPSBbXVxuXHRcdGxheWVyTWluWHMgPSBbXVxuXHRcdGxheWVyTWluWXMgPSBbXVxuXG5cdFx0Zm9yIGxheWVyIGluIGxheWVyQXJyYXlcblx0XHRcdEAuc3VwZXJMYXllcj1sYXllci5zdXBlckxheWVyXG5cdFx0XHRALmhlaWdodCA9IEAuaGVpZ2h0ICsgbGF5ZXIuaGVpZ2h0XG5cdFx0XHRsYXllckhlaWdodHMucHVzaCBsYXllci5oZWlnaHRcblx0XHRcdGxheWVyV2lkdGhzLnB1c2ggbGF5ZXIud2lkdGhcblx0XHRcdGxheWVyTWluWHMucHVzaCBsYXllci5taW5YXG5cdFx0XHRsYXllck1pbllzLnB1c2ggbGF5ZXIubWluWVxuXG5cdFx0QC53aWR0aCA9IE1hdGgubWF4LmFwcGx5IEAsIChsYXllcldpZHRocylcblx0XHRALmhlaWdodCA9IGxheWVySGVpZ2h0cy5yZWR1Y2UgKHQscykgLT4gdCArIHNcblx0XHRALmZ1bGxIZWlnaHQgPSBALmhlaWdodFxuXG5cdFx0QC54ID0gTWF0aC5taW4uYXBwbHkgQCwgKGxheWVyTWluWHMpXG5cdFx0QC55ID0gTWF0aC5taW4uYXBwbHkgQCwgKGxheWVyTWluWXMpXG5cblx0XHRmb3IgbGF5ZXIgaW4gbGF5ZXJBcnJheVxuXHRcdFx0bGF5ZXIuc3VwZXJMYXllciA9IEBcblx0XHRcdGxheWVyLnBvaW50ID1cblx0XHRcdFx0eDogbGF5ZXIueC1ALnhcblx0XHRcdFx0eTogbGF5ZXIueS1ALnlcblxuXHRcdEAuc29ydExheWVycyhsYXllckFycmF5KVxuXG5cblx0YWRqdXN0TGF5ZXJzOiAoYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbikgPT5cblx0XHRwcmludCBcIiNDT0xMIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXCJcblx0XHRwcmludCBcIkxvb2tpbmcgYXQgXCIgKyBALm5hbWUgKyBcIiBieSByZXF1ZXN0IG9mIFwiICsgb3JpZ2luLm5hbWVcblx0XHRwcmludCBALmlkLCBvcmlnaW4uaWQsIG9yaWdpbi5pZCAhPSBALmlkLCBvcmlnaW4uaWQgPT0gQC5pZFxuXHRcdGlmIG9yaWdpbi5pZCAhPSBALmlkXG5cdFx0XHRwcmludCBcIkFkanVzdGluZyBcIiArIEAubmFtZVxuXHRcdFx0Zm9yIGxheWVyIGluIEAuY2hpbGRyZW5cblx0XHRcdFx0cHJpbnQgXCIgfCAgbG9va2luZyBhdDogXCIgKyBsYXllci5uYW1lICsgXCIgZnJvbSBcIiArIEAubmFtZSArIFwiIGJ5IHJlcXVlc3Qgb2YgXCIgKyBvcmlnaW4ubmFtZVxuXHRcdFx0XHRpZiBsYXllci5pZCAhPSBvcmlnaW4uaWRcblx0XHRcdFx0XHRtb3ZlbWVudD0wXG5cdFx0XHRcdFx0aWYgbGF5ZXIueSA+IHRvZ2dsZUxheWVyLnlcblx0XHRcdFx0XHRcdG1vdmVtZW50ID0gYWRqdXN0bWVudFxuXHRcdFx0XHRcdFx0bGF5ZXIuYW5pbWF0ZVxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRcdFx0XHRcdHk6IGxheWVyLnkgKyBhZGp1c3RtZW50XG5cdFx0XHRcdFx0XHRcdHRpbWU6IDAuMlxuXHRcdFx0XHRcdFx0cHJpbnQgXCJwYXJlbnRcIiwgbGF5ZXIucGFyZW50XG5cdFx0XHRcdFx0XHRsYXllci5wYXJlbnQuYW5pbWF0ZVxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDogbGF5ZXIucGFyZW50LmhlaWdodCArIGFkanVzdG1lbnRcblx0XHRcdFx0XHRcdFx0dGltZTogMC4yXG5cdFx0XHRcdFx0ZWxzZSBwcmludCBcIk5vdCBhZGp1c3Rpbmcgb3JpZ2luOiBcIiArIG9yaWdpbi5uYW1lXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRtb3ZlbWVudCA9IDBcblx0XHRcdFx0cHJpbnQgXCIgfCAgbW92aW5nIFwiICsgbGF5ZXIubmFtZSArIFwiIGJ5IFwiICsgbW92ZW1lbnRcblx0XHRlbHNlIGlmIG9yaWdpbi50b2dnbGVMYXllci5pZCAhPSBALmlkXG5cdFx0XHRwcmludCBcIk5vdCBBZGp1c3RpbmcgXCIgKyBALm5hbWVcblx0XHRwcmludCBcIkRPTkUgLS0gTU9WSU5HIFRPOiBcIiArIEAucGFyZW50Lm5hbWVcblx0XHRwcmludCBcIiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXCJcblx0XHRALnBhcmVudC5hZGp1c3RMYXllcnMoYWRqdXN0bWVudCwgdG9nZ2xlTGF5ZXIsIG9yaWdpbilcblxuXHRjb2xsYXBzZTogKCkgPT4gQC5hbmltYXRlKFwiY29sbGFwc2VkXCIpXG5cdGV4cGFuZDogKCkgPT4gQC5hbmltYXRlKFwiZGVmYXVsdFwiKVxuXHR0b2dnbGU6IChsKSA9PlxuXHRcdEAuc3RhdGVzLm5leHQoKVxuXHRcdHByaW50IEAuaGVpZ2h0XG5cdFx0YWRqdXN0bWVudCA9IEAuaGVpZ2h0XG5cdFx0cHJpbnQgXCIgXCJcblx0XHRwcmludCBcIiBcIlxuXHRcdHByaW50IFwiQ0hBTkdJTkcgXCIgKyBALm5hbWUgKyBcIiBUTyBcIiArIEAuc3RhdGVzLmN1cnJlbnQubmFtZVxuXHRcdGlmIEAuc3RhdGVzLmN1cnJlbnQuc2NhbGVZIGlzIDBcblx0XHRcdHByaW50IFwic2hyaW5raW5nXCIsIGFkanVzdG1lbnRcblx0XHRcdGFkanVzdG1lbnQgPSAwIC0gYWRqdXN0bWVudFxuXHRcdGVsc2Vcblx0XHRcdHByaW50IFwiZXhwYW5kaW5nXCIsIGFkanVzdG1lbnRcblx0XHRALmFkanVzdExheWVycyhhZGp1c3RtZW50LCBsLCBAKVxuXG5cblxuXG5cdHNvcnRMYXllcnM6IChsYXllckFycmF5KSA9PlxuXHRALnNvcnRlZExheWVycyA9IFtdXG5cdGZvciBsYXllck5hbWUsIGxheWVyIG9mIGxheWVyQXJyYXlcblx0XHRALnNvcnRlZExheWVycy5wdXNoKGxheWVyKVxuXHRcdEAuc29ydGVkTGF5ZXJzLnNvcnQoKGEsYikgLT4gYS55LWIueSlcbiIsIiMgQWRkIHRoZSBmb2xsb3dpbmcgbGluZSB0byB5b3VyIHByb2plY3QgaW4gRnJhbWVyIFN0dWRpby4gXG4jIG15TW9kdWxlID0gcmVxdWlyZSBcIm15TW9kdWxlXCJcbiMgUmVmZXJlbmNlIHRoZSBjb250ZW50cyBieSBuYW1lLCBsaWtlIG15TW9kdWxlLm15RnVuY3Rpb24oKSBvciBteU1vZHVsZS5teVZhclxuXG5leHBvcnRzLm15VmFyID0gXCJteVZhcmlhYmxlXCJcblxuZXhwb3J0cy5teUZ1bmN0aW9uID0gLT5cblx0cHJpbnQgXCJteUZ1bmN0aW9uIGlzIHJ1bm5pbmdcIlxuXG5leHBvcnRzLm15QXJyYXkgPSBbMSwgMiwgM10iLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUlBQTtBRElBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCOztBQUVoQixPQUFPLENBQUMsVUFBUixHQUFxQixTQUFBO1NBQ3BCLEtBQUEsQ0FBTSx1QkFBTjtBQURvQjs7QUFHckIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVA7Ozs7QURSbEIsSUFBQTs7OztBQUFNLE9BQU8sQ0FBQzs7O0VBQ0Esb0JBQUMsU0FBRDs7OztJQUNaLDBDQUFBO0lBQ0EsSUFBQyxDQUFDLE9BQUYsR0FBWSxJQUFDLENBQUMsYUFBRixDQUFnQixTQUFoQjtJQUNaLElBQUMsQ0FBQyxLQUFGLEdBQVU7SUFDVixJQUFDLENBQUMsSUFBRixHQUFTLElBQUMsQ0FBQyxPQUFPLENBQUM7SUFDbkIsSUFBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3BCLElBQUMsQ0FBQyxJQUFGLEdBQVM7RUFORzs7dUJBT2IsYUFBQSxHQUFlLFNBQUMsS0FBRCxFQUFRLFdBQVI7QUFDZCxRQUFBO0lBQUEsY0FBQSxHQUFpQjtJQUNqQixVQUFBLEdBQWE7QUFDYixTQUFBLHVDQUFBOztNQUNDLElBQUcsQ0FBSSxDQUFFLENBQUEsQ0FBQSxDQUFUO1FBQ0MsVUFBQSxHQUFhO1FBQ2IsY0FBYyxDQUFDLElBQWYsQ0FBb0IsQ0FBcEIsRUFGRDtPQUFBLE1BR0ssSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFMO1FBQ0osSUFBQyxDQUFDLEtBQUYsR0FBUyxJQUFDLENBQUMsS0FBRixHQUFRO1FBQ2pCLGNBQWMsQ0FBQyxJQUFmLENBQW9CLElBQUMsQ0FBQyxhQUFGLENBQWdCLENBQWhCLEVBQW1CLFVBQW5CLENBQXBCLEVBRkk7O0FBSk47SUFPQSxJQUFHLE9BQU8sV0FBUCxLQUFzQixXQUF6QjtNQUNDLElBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFDLEtBQUYsR0FBVTtBQUNwQixhQUFXLElBQUEsY0FBQSxDQUFlLGNBQWYsRUFBK0IsV0FBL0IsRUFGWjs7SUFJQSxJQUFDLENBQUMsWUFBRixDQUFlLGNBQWY7V0FDQSxJQUFDLENBQUMsTUFBRixHQUFXO0VBZkc7O3VCQWlCZixZQUFBLEdBQWMsU0FBQyxjQUFEO0FBQ2IsUUFBQTtJQUFBLFlBQUEsR0FBZTtJQUNmLFdBQUEsR0FBYztJQUNkLFVBQUEsR0FBYTtJQUNiLFVBQUEsR0FBYTtBQUViLFNBQUEsZ0RBQUE7O01BQ0MsSUFBRyxLQUFLLENBQUMsVUFBTixLQUFvQixDQUFJLElBQTNCO1FBQ0MsSUFBQyxDQUFDLFVBQUYsR0FBYSxLQUFLLENBQUMsV0FEcEI7O01BRUEsSUFBQyxDQUFDLE1BQUYsR0FBVyxJQUFDLENBQUMsTUFBRixHQUFXLEtBQUssQ0FBQztNQUM1QixZQUFZLENBQUMsSUFBYixDQUFrQixLQUFLLENBQUMsTUFBeEI7TUFDQSxXQUFXLENBQUMsSUFBWixDQUFpQixLQUFLLENBQUMsS0FBdkI7TUFDQSxVQUFVLENBQUMsSUFBWCxDQUFnQixLQUFLLENBQUMsSUFBdEI7TUFDQSxVQUFVLENBQUMsSUFBWCxDQUFnQixLQUFLLENBQUMsSUFBdEI7QUFQRDtJQVNBLElBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFULENBQWUsSUFBZixFQUFtQixXQUFuQjtJQUNWLElBQUMsQ0FBQyxNQUFGLEdBQVcsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsU0FBQyxDQUFELEVBQUcsQ0FBSDthQUFTLENBQUEsR0FBSTtJQUFiLENBQXBCO0lBRVgsSUFBQyxDQUFDLENBQUYsR0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZSxJQUFmLEVBQW1CLFVBQW5CO0lBQ04sSUFBQyxDQUFDLENBQUYsR0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZSxJQUFmLEVBQW1CLFVBQW5CO0FBRU47U0FBQSxrREFBQTs7TUFDQyxLQUFLLENBQUMsVUFBTixHQUFtQjttQkFDbkIsS0FBSyxDQUFDLEtBQU4sR0FDQztRQUFBLENBQUEsRUFBRyxLQUFLLENBQUMsQ0FBTixHQUFRLElBQUMsQ0FBQyxDQUFiO1FBQ0EsQ0FBQSxFQUFHLEtBQUssQ0FBQyxDQUFOLEdBQVEsSUFBQyxDQUFDLENBRGI7O0FBSEY7O0VBckJhOzt1QkEyQmQsWUFBQSxHQUFjLFNBQUMsVUFBRCxFQUFhLFdBQWIsRUFBMEIsTUFBMUI7QUFDYixRQUFBO0lBQUEsS0FBQSxDQUFNLDBEQUFOO0lBQ0EsS0FBQSxDQUFNLFlBQU4sRUFBb0IsVUFBcEI7SUFDQSxLQUFBLENBQU0sYUFBQSxHQUFnQixJQUFDLENBQUMsSUFBbEIsR0FBeUIsaUJBQXpCLEdBQTZDLE1BQU0sQ0FBQyxJQUExRDtJQUNBLEtBQUEsQ0FBTSxNQUFBLEdBQVMsSUFBQyxDQUFDLEVBQWpCLEVBQXFCLFVBQUEsR0FBYyxNQUFNLENBQUMsRUFBMUMsRUFBOEMsTUFBQSxHQUFTLE1BQU0sQ0FBQyxFQUFoQixLQUFzQixJQUFDLENBQUMsRUFBdEUsRUFBMEUsTUFBQSxHQUFTLFdBQVcsQ0FBQyxFQUFyQixLQUEyQixJQUFDLENBQUMsRUFBdkc7SUFDQSxJQUFHLE1BQU0sQ0FBQyxFQUFQLEtBQWEsSUFBQyxDQUFDLEVBQWxCO01BQ0MsS0FBQSxDQUFNLFlBQUEsR0FBZSxJQUFDLENBQUMsSUFBdkI7QUFDQTtBQUFBLFdBQUEscUNBQUE7O1FBQ0MsS0FBQSxDQUFNLGtCQUFBLEdBQXFCLEtBQUssQ0FBQyxJQUEzQixHQUFpQyxHQUFqQyxHQUF1QyxLQUFLLENBQUMsRUFBbkQ7UUFDQSxLQUFBLENBQU0sYUFBQSxHQUFnQixJQUFDLENBQUMsSUFBbEIsR0FBeUIsR0FBekIsR0FBK0IsSUFBQyxDQUFDLEVBQXZDO1FBQ0EsS0FBQSxDQUFNLHNCQUFBLEdBQXlCLE1BQU0sQ0FBQyxJQUF0QztRQUNBLEtBQUEsQ0FBTSxtQkFBQSxHQUFzQixXQUFXLENBQUMsSUFBeEM7UUFDQSxJQUFHLEtBQUssQ0FBQyxFQUFOLEtBQVksTUFBTSxDQUFDLEVBQW5CLElBQTBCLEtBQUssQ0FBQyxFQUFOLEtBQVksV0FBVyxDQUFDLEVBQXJEO1VBQ0MsS0FBQSxDQUFNLEtBQUssQ0FBQyxJQUFaLEVBQWtCLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBcEMsRUFBdUMsTUFBdkMsRUFBK0MsTUFBTSxDQUFDLElBQXRELEVBQTRELE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBL0UsRUFBa0YsVUFBbEY7VUFDQSxJQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBbEIsSUFBdUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUE3QztZQUNDLEtBQUEsQ0FBTSxhQUFBLEdBQWdCLEtBQUssQ0FBQyxJQUF0QixHQUE2QixNQUE3QixHQUFzQyxVQUE1QztZQUNBLEtBQUssQ0FBQyxPQUFOLENBQ0M7Y0FBQSxVQUFBLEVBQ0M7Z0JBQUEsQ0FBQSxFQUFHLEtBQUssQ0FBQyxDQUFOLEdBQVUsVUFBYjtlQUREO2NBRUEsSUFBQSxFQUFNLEdBRk47YUFERCxFQUZEO1dBRkQ7U0FBQSxNQVNLLElBQUcsS0FBSyxDQUFDLEVBQU4sS0FBWSxNQUFNLENBQUMsRUFBdEI7VUFDSixLQUFBLENBQU0sd0JBQUEsR0FBMkIsS0FBSyxDQUFDLElBQXZDLEVBREk7U0FBQSxNQUVBLElBQUcsS0FBSyxDQUFDLEVBQU4sS0FBWSxXQUFXLENBQUMsRUFBM0I7VUFDSixLQUFBLENBQU0sMkJBQU4sRUFESTtTQUFBLE1BQUE7VUFHSixRQUFBLEdBQVcsRUFIUDs7QUFoQk4sT0FGRDtLQUFBLE1BdUJLLElBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFuQixLQUF5QixJQUFDLENBQUMsRUFBOUI7TUFDSixLQUFBLENBQU0sZ0JBQUEsR0FBbUIsSUFBQyxDQUFDLElBQTNCLEVBREk7O1dBR0wsSUFBQyxDQUFDLE9BQUYsQ0FDQztNQUFBLFVBQUEsRUFDQztRQUFBLE1BQUEsRUFBUSxJQUFDLENBQUMsTUFBRixHQUFXLFVBQW5CO09BREQ7TUFFQSxJQUFBLEVBQU0sR0FGTjtLQUREO0VBL0JhOzs7O0dBcERrQjs7QUEySDNCLE9BQU8sQ0FBQztBQUNiLE1BQUE7Ozs7RUFBYSx3QkFBQyxVQUFELEVBQWEsV0FBYixFQUEwQixNQUExQjs7Ozs7O0FBQ1osUUFBQTtJQUFBLDhDQUFBO0lBQ0EsSUFBQyxDQUFDLE9BQUYsR0FBWTtJQUNaLElBQUMsQ0FBQyxnQkFBRixHQUNDO01BQUEsSUFBQSxFQUFNLEdBQU47O0lBQ0QsSUFBQyxDQUFDLE1BQU0sQ0FBQyxTQUFULEdBQ0M7TUFBQSxNQUFBLEVBQVEsQ0FBUjs7SUFDRCxJQUFDLENBQUMsTUFBTSxDQUFDLFNBQUQsQ0FBUixHQUNDO01BQUEsTUFBQSxFQUFRLENBQVI7O0lBQ0QsSUFBQyxDQUFDLE1BQUYsR0FBVztJQUNYLElBQUMsQ0FBQyxlQUFGLEdBQW9CO0lBQ3BCLElBQUcsV0FBSDtNQUNDLElBQUMsQ0FBQyxJQUFGLEdBQVMsV0FBQSxHQUFjLFdBQVcsQ0FBQztNQUNuQyxJQUFDLENBQUMsV0FBRixHQUFnQixZQUZqQjs7SUFHQSxXQUFXLENBQUMsRUFBWixDQUFlLE1BQU0sQ0FBQyxLQUF0QixFQUE2QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFHLENBQUg7ZUFDNUIsS0FBQyxDQUFDLE1BQUYsQ0FBUyxDQUFUO01BRDRCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QjtJQUlBLFlBQUEsR0FBZTtJQUNmLFdBQUEsR0FBYztJQUNkLFVBQUEsR0FBYTtJQUNiLFVBQUEsR0FBYTtBQUViLFNBQUEsNENBQUE7O01BQ0MsSUFBQyxDQUFDLFVBQUYsR0FBYSxLQUFLLENBQUM7TUFDbkIsSUFBQyxDQUFDLE1BQUYsR0FBVyxJQUFDLENBQUMsTUFBRixHQUFXLEtBQUssQ0FBQztNQUM1QixZQUFZLENBQUMsSUFBYixDQUFrQixLQUFLLENBQUMsTUFBeEI7TUFDQSxXQUFXLENBQUMsSUFBWixDQUFpQixLQUFLLENBQUMsS0FBdkI7TUFDQSxVQUFVLENBQUMsSUFBWCxDQUFnQixLQUFLLENBQUMsSUFBdEI7TUFDQSxVQUFVLENBQUMsSUFBWCxDQUFnQixLQUFLLENBQUMsSUFBdEI7QUFORDtJQVFBLElBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFULENBQWUsSUFBZixFQUFtQixXQUFuQjtJQUNWLElBQUMsQ0FBQyxNQUFGLEdBQVcsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsU0FBQyxDQUFELEVBQUcsQ0FBSDthQUFTLENBQUEsR0FBSTtJQUFiLENBQXBCO0lBQ1gsSUFBQyxDQUFDLFVBQUYsR0FBZSxJQUFDLENBQUM7SUFFakIsSUFBQyxDQUFDLENBQUYsR0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZSxJQUFmLEVBQW1CLFVBQW5CO0lBQ04sSUFBQyxDQUFDLENBQUYsR0FBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQVQsQ0FBZSxJQUFmLEVBQW1CLFVBQW5CO0FBRU4sU0FBQSw4Q0FBQTs7TUFDQyxLQUFLLENBQUMsVUFBTixHQUFtQjtNQUNuQixLQUFLLENBQUMsS0FBTixHQUNDO1FBQUEsQ0FBQSxFQUFHLEtBQUssQ0FBQyxDQUFOLEdBQVEsSUFBQyxDQUFDLENBQWI7UUFDQSxDQUFBLEVBQUcsS0FBSyxDQUFDLENBQU4sR0FBUSxJQUFDLENBQUMsQ0FEYjs7QUFIRjtJQU1BLElBQUMsQ0FBQyxVQUFGLENBQWEsVUFBYjtFQTVDWTs7MkJBK0NiLFlBQUEsR0FBYyxTQUFDLFVBQUQsRUFBYSxXQUFiLEVBQTBCLE1BQTFCO0FBQ2IsUUFBQTtJQUFBLEtBQUEsQ0FBTSwwREFBTjtJQUNBLEtBQUEsQ0FBTSxhQUFBLEdBQWdCLElBQUMsQ0FBQyxJQUFsQixHQUF5QixpQkFBekIsR0FBNkMsTUFBTSxDQUFDLElBQTFEO0lBQ0EsS0FBQSxDQUFNLElBQUMsQ0FBQyxFQUFSLEVBQVksTUFBTSxDQUFDLEVBQW5CLEVBQXVCLE1BQU0sQ0FBQyxFQUFQLEtBQWEsSUFBQyxDQUFDLEVBQXRDLEVBQTBDLE1BQU0sQ0FBQyxFQUFQLEtBQWEsSUFBQyxDQUFDLEVBQXpEO0lBQ0EsSUFBRyxNQUFNLENBQUMsRUFBUCxLQUFhLElBQUMsQ0FBQyxFQUFsQjtNQUNDLEtBQUEsQ0FBTSxZQUFBLEdBQWUsSUFBQyxDQUFDLElBQXZCO0FBQ0E7QUFBQSxXQUFBLHFDQUFBOztRQUNDLEtBQUEsQ0FBTSxrQkFBQSxHQUFxQixLQUFLLENBQUMsSUFBM0IsR0FBa0MsUUFBbEMsR0FBNkMsSUFBQyxDQUFDLElBQS9DLEdBQXNELGlCQUF0RCxHQUEwRSxNQUFNLENBQUMsSUFBdkY7UUFDQSxJQUFHLEtBQUssQ0FBQyxFQUFOLEtBQVksTUFBTSxDQUFDLEVBQXRCO1VBQ0MsUUFBQSxHQUFTO1VBQ1QsSUFBRyxLQUFLLENBQUMsQ0FBTixHQUFVLFdBQVcsQ0FBQyxDQUF6QjtZQUNDLFFBQUEsR0FBVztZQUNYLEtBQUssQ0FBQyxPQUFOLENBQ0M7Y0FBQSxVQUFBLEVBQ0M7Z0JBQUEsQ0FBQSxFQUFHLEtBQUssQ0FBQyxDQUFOLEdBQVUsVUFBYjtlQUREO2NBRUEsSUFBQSxFQUFNLEdBRk47YUFERDtZQUlBLEtBQUEsQ0FBTSxRQUFOLEVBQWdCLEtBQUssQ0FBQyxNQUF0QjtZQUNBLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBYixDQUNDO2NBQUEsVUFBQSxFQUNDO2dCQUFBLE1BQUEsRUFBUSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQWIsR0FBc0IsVUFBOUI7ZUFERDtjQUVBLElBQUEsRUFBTSxHQUZOO2FBREQsRUFQRDtXQUFBLE1BQUE7WUFXSyxLQUFBLENBQU0sd0JBQUEsR0FBMkIsTUFBTSxDQUFDLElBQXhDLEVBWEw7V0FGRDtTQUFBLE1BQUE7VUFlQyxRQUFBLEdBQVcsRUFmWjs7UUFnQkEsS0FBQSxDQUFNLGFBQUEsR0FBZ0IsS0FBSyxDQUFDLElBQXRCLEdBQTZCLE1BQTdCLEdBQXNDLFFBQTVDO0FBbEJELE9BRkQ7S0FBQSxNQXFCSyxJQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBbkIsS0FBeUIsSUFBQyxDQUFDLEVBQTlCO01BQ0osS0FBQSxDQUFNLGdCQUFBLEdBQW1CLElBQUMsQ0FBQyxJQUEzQixFQURJOztJQUVMLEtBQUEsQ0FBTSxxQkFBQSxHQUF3QixJQUFDLENBQUMsTUFBTSxDQUFDLElBQXZDO0lBQ0EsS0FBQSxDQUFNLDBEQUFOO1dBQ0EsSUFBQyxDQUFDLE1BQU0sQ0FBQyxZQUFULENBQXNCLFVBQXRCLEVBQWtDLFdBQWxDLEVBQStDLE1BQS9DO0VBN0JhOzsyQkErQmQsUUFBQSxHQUFVLFNBQUE7V0FBTSxJQUFDLENBQUMsT0FBRixDQUFVLFdBQVY7RUFBTjs7MkJBQ1YsTUFBQSxHQUFRLFNBQUE7V0FBTSxJQUFDLENBQUMsT0FBRixDQUFVLFNBQVY7RUFBTjs7MkJBQ1IsTUFBQSxHQUFRLFNBQUMsQ0FBRDtBQUNQLFFBQUE7SUFBQSxJQUFDLENBQUMsTUFBTSxDQUFDLElBQVQsQ0FBQTtJQUNBLEtBQUEsQ0FBTSxJQUFDLENBQUMsTUFBUjtJQUNBLFVBQUEsR0FBYSxJQUFDLENBQUM7SUFDZixLQUFBLENBQU0sR0FBTjtJQUNBLEtBQUEsQ0FBTSxHQUFOO0lBQ0EsS0FBQSxDQUFNLFdBQUEsR0FBYyxJQUFDLENBQUMsSUFBaEIsR0FBdUIsTUFBdkIsR0FBZ0MsSUFBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBdkQ7SUFDQSxJQUFHLElBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWpCLEtBQTJCLENBQTlCO01BQ0MsS0FBQSxDQUFNLFdBQU4sRUFBbUIsVUFBbkI7TUFDQSxVQUFBLEdBQWEsQ0FBQSxHQUFJLFdBRmxCO0tBQUEsTUFBQTtNQUlDLEtBQUEsQ0FBTSxXQUFOLEVBQW1CLFVBQW5CLEVBSkQ7O1dBS0EsSUFBQyxDQUFDLFlBQUYsQ0FBZSxVQUFmLEVBQTJCLENBQTNCLEVBQThCLElBQTlCO0VBWk87OzJCQWlCUixVQUFBLEdBQVksU0FBQyxVQUFELEdBQUE7O0VBQ1osY0FBQyxDQUFDLFlBQUYsR0FBaUI7O0FBQ2pCLE9BQUEsdUJBQUE7O0lBQ0MsY0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFmLENBQW9CLEtBQXBCO0lBQ0EsY0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFmLENBQW9CLFNBQUMsQ0FBRCxFQUFHLENBQUg7YUFBUyxDQUFDLENBQUMsQ0FBRixHQUFJLENBQUMsQ0FBQztJQUFmLENBQXBCO0FBRkQ7Ozs7R0FwR29DOzs7O0FENUhyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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
