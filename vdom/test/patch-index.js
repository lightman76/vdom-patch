var test = require("tape")
var VNode = require('virtual-dom/vnode/vnode.js');
var VText = require('virtual-dom/vnode/vtext.js');
var diff = require('virtual-dom/vtree/diff.js');

var createElement = require("../create-element")
var patch = require("../patch")

test("overrided patch function is correctly used and received correct options", function (assert) {

  function patchCustom(rootNode, patches, renderOptions) {
    return {
      rootNode: rootNode,
      patches: patches,
      renderOptions: renderOptions
    }
  }

  function createElementCustom(vnode) {
  }

  var rootNode = new VNode("div")
  var patches = {}
  var renderOptions = {patch: patchCustom, render: createElementCustom}

  var result = patch(rootNode, patches, renderOptions)
  assert.equal(result.rootNode, rootNode)
  assert.equal(result.patches, patches)
  assert.equal(result.renderOptions, renderOptions)
  assert.end()
})