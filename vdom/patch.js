var isArray = require("x-is-array")

var render = require("./create-element")
var domIndex = require("./dom-index")
var patchOp = require("./patch-op")

var vnodePatch = patch
module.exports = vnodePatch

function patch(vRootNode, patches, renderOptions) {
  renderOptions = renderOptions || {}
  renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
      ? renderOptions.patch
      : patchRecursive
  renderOptions.render = renderOptions.render || render

  return renderOptions.patch(vRootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
  var indices = patchIndices(patches)

  if (indices.length === 0) {
    return rootNode
  }

  var index = domIndex(rootNode, patches.a, indices)

  for (var i = 0; i < indices.length; i++) {
    var nodeIndex = indices[i]
    rootNode = applyPatch(rootNode,
        index[nodeIndex],
        patches[nodeIndex],
        renderOptions)
  }

  return rootNode
}

function applyPatch(rootNode, targetVdomNode, patchList, renderOptions) {
  if (!targetVdomNode) {
    return rootNode
  }

  var newNode

  if (isArray(patchList)) {
    for (var i = 0; i < patchList.length; i++) {
      newNode = patchOp(patchList[i], targetVdomNode, renderOptions)

      if (targetVdomNode === rootNode) {
        rootNode = newNode
      }
    }
  } else {
    newNode = patchOp(patchList, targetVdomNode, renderOptions)

    if (targetVdomNode === rootNode) {
      rootNode = newNode
    }
  }

  return rootNode
}

function patchIndices(patches) {
  var indices = []

  for (var key in patches) {
    if (key !== "a") {
      indices.push(Number(key))
    }
  }

  return indices
}
