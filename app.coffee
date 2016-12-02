# Project Info
# This info is presented in a widget when you share.
# http://framerjs.com/docs/#info.info

Framer.Info =
	title: "CollapseHolder Class w/ Example"
	author: "Trevor Coleman"
	twitter: "@trevorcoleman"
	description: "Example of nestedList class to allow for easy collapsing menus"


# Import file "nestedList"
sketch = Framer.Importer.load("imported/nestedList@1x")


shortcuts = require "shortcuts"
shortcuts.initialize(sketch)

{NestedList} = require "nestedList"

nestedLayers = [row_1,[row_1_1,[row_1_1_A],row_1_2,row_1_3],row_2,[row_2_1,[row_2_1_A,row_2_1_B], row_2_2, [row_2_2_B]]]

thisNestedList = new NestedList(fileTree, nestedLayers)
	
console.log(Framer.CurrentContext.layers)

print row_2.y

		 