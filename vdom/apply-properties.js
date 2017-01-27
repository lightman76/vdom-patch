var isObject = require("is-object")
var isHook = require('virtual-dom/vnode/is-vhook.js');

module.exports = applyProperties

function applyProperties(targetVNode, props, previous) {
  for (var propName in props) {
    var propValue = props[propName]

    if (propValue === undefined) {
      removeProperty(targetVNode, propName, propValue, previous);
    } else if (isHook(propValue)) {
      removeProperty(targetVNode, propName, propValue, previous)
      if (propValue.hook) {
        propValue.hook(targetVNode,
            propName,
            previous ? previous[propName] : undefined)
      }
    } else {
      if (isObject(propValue)) {
        patchObject(targetVNode, props, previous, propName, propValue);
      } else {
        targetVNode[propName] = propValue
      }
    }
  }
}

function removeProperty(targetVNode, propName, propValue, previous) {
  if (previous) {
    var previousValue = previous[propName]

    if (!isHook(previousValue)) {
      if (propName === "attributes") {
        for (var attrName in previousValue) {
          delete targetVNode.properties[propName][attrName]
        }
      } else if (propName === "style") {
        for (var i in previousValue) {
          delete targetVNode.properties[propName][i]
        }
      } else if (typeof previousValue === "string") {
        targetVNode.properties[propName] = ""
      } else {
        delete targetVNode.properties[propName]
      }
    } else if (previousValue.unhook) {
      previousValue.unhook(targetVNode, propName, propValue)
    }
  }
}

function patchObject(targetVNode, props, previous, propName, propValue) {
  var previousValue = previous ? previous[propName] : undefined

  // Set attributes
  if (propName === "attributes") {
    for (var attrName in propValue) {
      var attrValue = propValue[attrName]

      if (attrValue === undefined) {
        delete targetVNode.properties[propName][attrName]
      } else {
        targetVNode.properties[propName][attrName] = attrValue;
      }
    }

    return
  }

  if (previousValue && isObject(previousValue) &&
      getPrototype(previousValue) !== getPrototype(propValue)) {
    targetVNode.properties[propName] = propValue
    return
  }

  if (!isObject(targetVNode[propName])) {
    targetVNode.properties[propName] = {}
  }

  var replacer = propName === "style" ? "" : undefined

  for (var k in propValue) {
    var value = propValue[k]
    targetVNode.properties[propName][k] = (value === undefined) ? replacer : value
  }
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}
