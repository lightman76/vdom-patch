var VNode = require('virtual-dom/vnode/vnode.js');
var VText = require('virtual-dom/vnode/vtext.js');

var applyProperties = require("./apply-properties")

var isWidget = require('virtual-dom/vnode/is-widget.js');
var VPatch = require('virtual-dom/vnode/vpatch.js');

var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, targetVdomNode, targetVdomParentNode, renderOptions) {
  var type = vpatch.type
  var vNode = vpatch.vNode
  var patch = vpatch.patch

  switch (type) {
    case VPatch.REMOVE:
      return removeNode(targetVdomNode, targetVdomParentNode, vNode)
    case VPatch.INSERT:
      return insertNode(targetVdomNode, targetVdomParentNode, patch, renderOptions)
    case VPatch.VTEXT:
      return stringPatch(targetVdomNode, targetVdomParentNode, vNode, patch, renderOptions)
    case VPatch.WIDGET:
      return widgetPatch(targetVdomNode, targetVdomParentNode, vNode, patch, renderOptions)
    case VPatch.VNODE:
      return vNodePatch(targetVdomNode, targetVdomParentNode, vNode, patch, renderOptions)
    case VPatch.ORDER:
      reorderChildren(targetVdomNode, targetVdomParentNode, patch)
      return targetVdomNode
    case VPatch.PROPS:
      applyProperties(targetVdomNode, targetVdomParentNode, patch, vNode.properties)
      return targetVdomNode
    case VPatch.THUNK:
      return replaceRoot(targetVdomNode, targetVdomParentNode,
          renderOptions.patch(targetVdomNode, patch, renderOptions))
    default:
      return targetVdomNode
  }
}

function removeNode(targetVdomNode, targetVdomParentNode, vNode) {
  var parentNode = targetVdomParentNode;

  if (parentNode) {
    var idx = parentNode.children.indexOf(targetVdomNode)
    if (idx >= 0) parentNode.children.splice(idx, 1);
  }

  destroyWidget(targetVdomNode, vNode);

  return null
}

function insertNode(targetVdomNode, targetVdomParentNode, vNode, renderOptions) {
  var newNode = renderOptions.render(vNode, renderOptions)

  if (targetVdomNode) {
    targetVdomNode.children.push(newNode)
  }

  return targetVdomNode
}

function stringPatch(targetVdomNode, targetVdomParentNode, leftVNode, vText, renderOptions) {
  var newNode

  if (targetVdomNode.type === "VirtualText") {
    targetVdomNode.text = vText.text;
    newNode = targetVdomNode
  } else {
    var parentNode = targetVdomParentNode
    newNode = renderOptions.render(vText, renderOptions)

    if (parentNode && newNode !== targetVdomNode) {
      var idx = parentNode.children.indexOf(targetVdomNode);
      if (idx >= 0) parentNode.children[idx] = newNode;
    }
  }

  return newNode
}

function widgetPatch(targetVdomNode, targetVdomParentNode, leftVNode, widget, renderOptions) {
  var updating = updateWidget(leftVNode, widget)
  var newNode

  if (updating) {
    newNode = widget.update(leftVNode, targetVdomNode) || targetVdomNode
  } else {
    newNode = renderOptions.render(widget, renderOptions)
  }

  var parentNode = targetVdomParentNode

  if (parentNode && newNode !== targetVdomNode) {
    var idx = parentNode.children.indexOf(targetVdomNode);
    if (idx >= 0) parentNode.children[idx] = newNode;
  }

  if (!updating) {
    destroyWidget(targetVdomNode, leftVNode)
  }

  return newNode
}

function vNodePatch(targetVdomNode, targetVdomParentNode, leftVNode, vNode, renderOptions) {
  var parentNode = targetVdomParentNode
  var newNode = renderOptions.render(vNode, renderOptions)

  if (parentNode && newNode !== targetVdomNode) {
    var idx = parentNode.children.indexOf(targetVdomNode);
    if (idx >= 0) parentNode.children[idx] = newNode;
  }

  return newNode
}

function destroyWidget(targetVdomNode, w) {
  if (typeof w.destroy === "function" && isWidget(w)) {
    w.destroy(targetVdomNode)
  }
}

function reorderChildren(targetVdomNode, targetVdomParentNode, moves) {
  var childNodes = targetVdomNode.children
  var keyMap = {}
  var node
  var remove
  var insert

  for (var i = 0; i < moves.removes.length; i++) {
    remove = moves.removes[i]
    node = childNodes[remove.from]
    if (remove.key) {
      keyMap[remove.key] = node
    }
    targetVdomNode.removeChild(node)
    var idx = targetVdomNode.children.indexOf(node);
    if (idx >= 0) targetVdomNode.splice(idx, 1)
  }

  var length = childNodes.length
  for (var j = 0; j < moves.inserts.length; j++) {
    insert = moves.inserts[j]
    node = keyMap[insert.key]
    if (insert.to >= length++) {
      targetVdomNode.children.push(node);
    } else {
      targetVdomNode.children.splice(insert.to, 0, node)
    }
  }
}

function replaceRoot(oldRootVNode, targetVdomParentNode, newRootVNode) {
  if (oldRootVNode && newRootVNode && oldRootVNode !== newRootVNode && targetVdomParentNode) {
    var idx = targetVdomParentNode.children.indexOf(oldRootVNode);
    if (idx >= 0) {
      targetVdomParentNode.children.splice(idx, 1, newRootVNode)
    }

  }

  return newRootVNode;
}
