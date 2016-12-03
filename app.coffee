# Project Info
# This info is presented in a widget when you share.
# http://framerjs.com/docs/#info.info

Framer.Info =
	title: "CollapseHolder Class w/ Example"
	author: "Trevor Coleman"
	twitter: "@trevorcoleman"
	description: "Example of nestedList class to allow for easy collapsing menus"


# Import file "nestedList" (sizes and positions are scaled 1:2)
sketch = Framer.Importer.load("imported/nestedList@2x")


shortcuts = require "shortcuts"
shortcuts.initialize(sketch)

{NestedList} = require "nestedList"

nestedLayers = 
	[row_1,
		[row_1_1,
			[row_1_1_A],
		row_1_2,
		row_1_3],
	row_2,
		[row_2_1,
			[row_2_1_A,
			row_2_1_B],
		row_2_2,
			[row_2_2_A]],
	row_3,
		[row_3_1,
			[row_3_1_A],
		row_3_2,
			[row_3_2_B]
	]]

thisNestedList = new NestedList(fileTree, nestedLayers)

