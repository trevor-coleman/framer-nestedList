# framer-nestedList
Module to turn a collection of sketch layers into a nested collapsible list. 

## Sketch File Setup:
* The rows each need to be an individual layer, and all at the same layer of the hierarchy.
* The rows can be different sizes. 
* Not sure if they need to be touching or aligned..... _try at your own risk!_ (and let me know)
* The layers should all be grouped together in a single group with nothing else in it. (the "containterGroup")
* See the sketch file for an example. "fileTree" is the containerGroup, and the "row" layers are the ones that will be collapsed.

## Instructions
1. Put nestedList.coffee into your modules folder

2. Add `{NestedList} = require "nestedList"` at the top of your file, under the import statement.

3. Create the structure you want using a nested array. Each sub-array will become a collapsible group.

**For example:**

if your layers are:
```
header_1
subhead_1_1
subhead_1_2
header_2
subhead_2_1
subhead_2_1_A
subhead_2_2
header_3
```  

then

```
    nestedArray = [header_1, [subhead_1_1, subhead_1_2], header2, [subhead_2_1, [subhead_2_1_A], subhead_2.2], header_3]
```    

would create a structure like this:

```
    +
    |
    +--+- header_1
    |       |
    |       +--+- subhead_1_1
    |       |
    |       +--+- subhead_1_2
    |
    +--+- header_2
    |       |
    |       +--+- subhead_2_1
    |       |     | 
    |       |     +--+- subhead_2_1_A
    |       |
    |       +- Subhead_2_2
    |
    +--+- header_3
 ```
Any layers that in an array together will be collapsed together by clicking on their parent. 

In the tree above:
* clicking on `header_1` would collapse `subhead_1_1` and `subhead_1_2`
* clicking on `header_2` would collapse `subhead_2_1` and `subhead_2_1_A`

4. Call the contstructor and watch the magic happen: `nestedList = new NestedList(containerGroup, nestedArray`
  * `containerGroup` is the group that contains all of the row layers
  * `nestedArray` is the the array we created in **Step 3**
