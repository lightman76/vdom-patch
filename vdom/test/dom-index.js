var test = require("tape")
var VNode = require('virtual-dom/vnode/vnode.js');
var VText = require('virtual-dom/vnode/vtext.js');
var diff = require('virtual-dom/vtree/diff.js');

var createElement = require("../create-element")
var patch = require("../patch")

test("indexing over thunk root", function (assert) {
  var leftThunk = {
    type: "Thunk",
    render: function () {
      return new VNode("div", {
        attributes: {className: "test"}
      }, [new VText("Left")])
    }
  }

  var rightThunk = {
    type: "Thunk",
    render: function () {
      return new VNode("div", {
        attributes: {className: "test"}
      }, [new VText("Right")])
    }
  }

  var root = createElement(leftThunk)
  var patches = diff(leftThunk, rightThunk)
  var newRoot = patch(root, patches)

  assert.equal(newRoot.children[0].text, "Right")
  assert.end()
})

test("indexing over thunk child", function (assert) {
  var leftNode = new VNode("div", {
    attributes: {className: "test"}
  }, [
    new VNode("div"),
    new VText("test"),
    {
      type: "Thunk",
      render: function () {
        return new VNode("div", {
          attributes: {className: "test"}
        }, [new VText("Left")])
      }
    },
    new VNode("div"),
    new VText("test")
  ])

  var rightNode = new VNode("div", {
    attributes: {className: "test"}
  }, [
    new VNode("div"),
    new VText("test"),
    {
      type: "Thunk",
      render: function () {
        return new VNode("div", {
          attributes: {className: "test"}
        }, [new VText("Right")])
      }
    },
    new VNode("div"),
    new VText("test")
  ])

  var root = createElement(leftNode)
  var patches = diff(leftNode, rightNode)
  patch(root, patches)
  assert.equal(root.children[2].children[0].text, "Right")
  assert.end()
})
