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
# 			@.states.next()

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
		print "#COLL###################################################"
		print "Looking at " + @.name + " by request of " + origin.name
		print @.id, origin.id, origin.id != @.id, origin.id == @.id
		if origin.id != @.id
			print "Adjusting " + @.name
			for layer in @.children
				print " |  looking at: " + layer.name + " from " + @.name + " by request of " + origin.name
				if layer.id != origin.id
					print layer.y, toggleLayer.y
					if @.sortedLayers.indexOf(layer) > @.sortedLayers.indexOf(origin)
						layer.animate
							properties:
								y: layer.y + adjustment
							time: 0.2
						print "parent", layer.parent
						layer.parent.animate
							properties:
								height: layer.parent.height + adjustment
							time: 0.2
					else print "Not adjusting origin: " + origin.name
				else
				print " |  moving " + layer.name + " by " + adjustment
		else if origin.toggleLayer.id != @.id
			print "Not Adjusting " + @.name
		print "DONE -- MOVING TO: " + @.parent.name
		print "########################################################"
		@.parent.adjustLayers(adjustment, toggleLayer, origin)

	collapse: () => @.animate("collapsed")

	expand: () => @.animate("default")

	toggle: (l) =>
		@.states.next()
		print @.height
		adjustment = @.height
		print " "
		print " "
		print "CHANGING " + @.name + " TO " + @.states.current.name
		if @.states.current.scaleY is 0
			print "shrinking", adjustment
			adjustment = 0 - adjustment
		else
			print "expanding", adjustment
		@.adjustLayers(adjustment, l, @)

	sortLayers: (layerArray) =>
    	for layerName, layer of layerArray
    		@.sortedLayers.push(layer)
    		@.sortedLayers.sort((a,b) -> a.y-b.y)



class exports.NestedList extends Layer
	constructor: (parent, layerList) ->
		super()
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
		print toggleLayer
		if typeof toggleLayer != "undefined"
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
				print layer

	adjustLayers: (adjustment, toggleLayer, origin) =>
		print "#NEST###################################################"
		print "Adjustment", adjustment
		print "Looking at " + @.name + " by request of " + origin.name
		print "id: " + @.id, "origin: " +  origin.id, "=o: " + origin.id == @.id, "=t: " + toggleLayer.id == @.id
		if origin.id != @.id
			print "Adjusting " + @.name
			for layer in @.children
				print " |  looking at: " + layer.name+ " " + layer.id
				print " | |  from " + @.name + " " + @.id
				print " | |  by request of " + origin.name
				print " | |  clicked on " + toggleLayer.name
				if layer.id != origin.id and layer.id != toggleLayer.id
					print layer.name, layer.screenFrame.y, " -- ", origin.name, origin.screenFrame.y, adjustment
					if layer.screenFrame.y >= origin.screenFrame.y
						print " |  moving " + layer.name + " by " + adjustment, layer.y
						print layer.y, toggleLayer.y
						layer.animate
							properties:
								y: layer.y + adjustment
							time: 0.2
				else if layer.id == origin.id
					print "Not adjusting origin: " + layer.name
				else if layer.id == toggleLayer.id
					print "not adjusting toggleLayer"
				else
					movement = 0

		else if origin.toggleLayer.id != @.id
			print "Not Adjusting " + @.name

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
