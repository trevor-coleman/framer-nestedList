class exports.CollapseHolder extends Layer
	constructor: (layerArray, toggleLayer, sketch) ->
		super()
		@.originY = 0
		@.sortedLayers=[]
		@.animationOptions =
			time: 0.2
		@.states.collapsed =
			scaleY: 0
		@.states.default =
			scaleY: 1
		@.height = 0
		@.backgroundColor = "transparent"
		if toggleLayer
			@.name = "collapse_" + toggleLayer.name
			@.toggleLayer = toggleLayer
		toggleLayer.on Events.Click, (e,l) =>
				@.toggle(l)

		@.resizeLayers(layerArray)

		@.sortLayers(layerArray)

	resizeLayers: (layerArray) =>
		layerHeights = []
		layerWidths = []
		layerMinXs = []
		layerMinYs = []

		for layer in layerArray
			@.superLayer=layer.superLayer
			@.height = @.height + layer.height
			layerHeights.push layer.height
			layerWidths.push layer.width
			layerMinXs.push layer.minX
			layerMinYs.push layer.minY

		@.width = Math.max.apply @, (layerWidths)
		@.height = layerHeights.reduce (t,s) -> t + s
		@.fullHeight = @.height

		@.x = Math.min.apply @, (layerMinXs)
		@.y = Math.min.apply @, (layerMinYs)

		for layer in layerArray
			layer.superLayer = @
			layer.point =
				x: layer.x-@.x
				y: layer.y-@.y

	adjustLayers: (adjustment, toggleLayer, origin) =>
		if origin.id != @.id
			for layer in @.children
				if layer.id != origin.id
					if @.sortedLayers.indexOf(layer) > @.sortedLayers.indexOf(origin)
						layer.animate
							properties:
								y: layer.y + adjustment
							time: 0.2
						layer.parent.animate
							properties:
								height: layer.parent.height + adjustment
							time: 0.2
				else
		@.parent.adjustLayers(adjustment, toggleLayer, origin)

	collapse: () => @.animate("collapsed")

	expand: () => @.animate("default")

	toggle: (l) =>
		@.states.next()
		adjustment = @.height
		if @.states.current.scaleY is 0
			adjustment = 0 - adjustment
		else
		@.adjustLayers(adjustment, l, @)

	sortLayers: (layerArray) =>
    	for layerName, layer of layerArray
    		@.sortedLayers.push(layer)
    		@.sortedLayers.sort((a,b) -> a.y-b.y)



class exports.NestedList extends Layer
	constructor: (parent, layerList) ->
		super()
		layerList.sort((a,b) -> a.y-b.y)
		@.container = parent
		@.superLayer = parent.superLayer
		@.content = @.createHolders(layerList)
		@.depth = 0
		@.size = @.content.size
		@.point = @.content.point
		@.name = "NestedList"
	createHolders: (level, toggleLayer) =>
		collapseLayers = []
		nextToggle = null
		for i in level
			if not i[0]
				nextToggle = i
				collapseLayers.push(i)
			else if i[0]
				@.depth= @.depth+1
				collapseLayers.push(@.createHolders(i, nextToggle))
		if toggleLayer instanceof Layer
			@.depth = @.depth - 1
			return new exports.CollapseHolder(collapseLayers, toggleLayer)

		@.resizeLayers(collapseLayers, true)
		@.layers = collapseLayers

	resizeLayers: (collapseLayers, firstTime) =>
		layerHeights = []
		layerWidths = []
		layerMinXs = []
		layerMinYs = []

		for layer in collapseLayers
			@.height = @.height + layer.height
			layerHeights.push layer.height
			layerWidths.push layer.width
			layerMinXs.push layer.minX
			layerMinYs.push layer.minY

		@.width = Math.max.apply @, (layerWidths)
		@.height = layerHeights.reduce (t,s) -> t + s

		if firstTime
			@.x = @.container.x
			@.y = @.container.y

			for layer in collapseLayers
				layer.parent = @
				layer.superLayer = @

	adjustLayers: (adjustment, toggleLayer, origin) =>
		if origin.id != @.id
			for layer in @.children
				if layer.id != origin.id and layer.id != toggleLayer.id
					if layer.screenFrame.y >= origin.screenFrame.y
						layer.animate
							properties:
								y: layer.y + adjustment
							time: 0.2

		@.animate
			properties:
				height: @.height + adjustment
			time: 0.2



##############################################################
# CollapseHolder( [ layerArray ] , toggleLayer )
# ############################################################
#
# ARGUMENTS
#
# layerArray
# ----------
# An array of layers to be collapsed. these are the ones that
# should all disappear in a group together.
# !!!! NOTE !!!!
# these layers all need to have the same parent for this to work !!!
#
# toggleLayer
# -----------
# the layer you want to click on to show/hide the layers in
# layerArray
#
# SKETCH FILE
#
# My file:
# https://www.dropbox.com/s/9dargtmxhhmcrsl/expandExample.sketch?dl=0
#
# In the sketch file, each row should be independent, and equal in the hierarchy. Like this:
#   |
#   +-> row_1
#   +-> row_1_1
#   +-> row_1_1_A
#   +-> row_1_2
#   +-> row_1_3
#   +-> row_2
#   etc.
#
# Create nested trees by placing CollapseHolders into CollapseHolders
