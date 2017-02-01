var applyProperties = require("./apply-properties")

var VNode = require('virtual-dom/vnode/vnode.js');
var VText = require('virtual-dom/vnode/vtext.js');
var isVNode = require('virtual-dom/vnode/is-vnode.js');
var isVText = require('virtual-dom/vnode/is-vtext.js');
var isWidget = require('virtual-dom/vnode/is-widget.js');
var handleThunk = require('virtual-dom/vnode/handle-thunk.js');

module.exports = createElement

function createElement(vnode, opts) {
  var warn = opts ? opts.warn : null
  var render = opts ? opts.render : createElement

  vnode = handleThunk(vnode).a

  if (isWidget(vnode)) {
    return vnode.init()
  } else if (isVText(vnode)) {
    return new VText(vnode.text)
  } else if (!isVNode(vnode)) {
    if (warn) {
      warn("Item is not a valid virtual dom node", vnode)
    }
    return null
  }

  var targetVNode = new VNode(vnode.tagName, {attributes: {}}, [], vnode.key, vnode.namespace);


  var props = vnode.properties
  applyProperties(targetVNode, null, props)

  var children = vnode.children

  for (var i = 0; i < children.length; i++) {
    var childNode = render(children[i], opts)
    if (childNode) {
      targetVNode.children.push(childNode)
    }
  }

  return targetVNode
}
