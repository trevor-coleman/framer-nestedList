class exports.CollapseHolder extends Layer
	constructor: (layerArray, toggleLayer, sketch) ->
		super()
		@.originY = 0
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
# 			@.states.next()

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

		@.sortLayers(layerArray)


	adjustLayers: (adjustment, toggleLayer, origin) =>
		if origin.id != @.id
			for layer in @.children
				if layer.id != origin.id
					movement=0
					if layer.y > toggleLayer.y
						movement = adjustment
						layer.animate
							properties:
								y: layer.y + adjustment
							time: 0.2
						layer.parent.animate
							properties:
								height: layer.parent.height + adjustment
							time: 0.2
		@.parent.adjustLayers(adjustment, toggleLayer, origin)

	collapse: () => @.animate("collapsed")
	expand: () => @.animate("default")
	toggle: (l) =>
		@.states.next()
		adjustment = @.height
		if @.states.current.scaleY is 0
			adjustment = 0 - adjustment
		@.adjustLayers(adjustment, l, @)




	sortLayers: (layerArray) =>
    	@.sortedLayers = []
    	for layerName, layer of layerArray
    		@.sortedLayers.push(layer)
    		@.sortedLayers.sort((a,b) -> a.y-b.y)



class exports.NestedList extends Layer
	constructor: (layerList) ->
		super()
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
		if typeof toggleLayer != "undefined"
			@.depth = @.depth - 1
			return new exports.CollapseHolder(collapseLayers, toggleLayer)

		@.resizeLayers(collapseLayers)
		@.layers = collapseLayers

	resizeLayers: (collapseLayers) =>
		layerHeights = []
		layerWidths = []
		layerMinXs = []
		layerMinYs = []

		for layer in collapseLayers
			if layer.superLayer is not @
				@.superLayer=layer.superLayer
			@.height = @.height + layer.height
			layerHeights.push layer.height
			layerWidths.push layer.width
			layerMinXs.push layer.minX
			layerMinYs.push layer.minY

		@.width = Math.max.apply @, (layerWidths)
		@.height = layerHeights.reduce (t,s) -> t + s

		@.x = Math.min.apply @, (layerMinXs)
		@.y = Math.min.apply @, (layerMinYs)

		for layer in collapseLayers
			layer.superLayer = @
			layer.point =
				x: layer.x-@.x
				y: layer.y-@.y

	adjustLayers: (adjustment, toggleLayer, origin) =>
		if origin.id != @.id
			for layer in @.children
				if layer.id != origin.id and layer.id != toggleLayer.id
					if layer.screenFrame.y >= origin.screenFrame.y
						layer.animate
							properties:
								y: layer.y + adjustment
							time: 0.2
				else
					movement = 0
		@.animate
			properties:
				height: @.height + adjustment
			time: 0.2
