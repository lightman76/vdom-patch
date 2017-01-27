# vdom-patch
A patch operation which applies a VPatch to a VNode tree from the 
[Virtual-Dom](https://github.com/Matt-Esch/virtual-dom) tree instead of live DOM tree.
This allows you to do things like apply multiple patches to the vdom and then compute a single diff to apply to the live
DOM.  

I've probably got a fairly unusual case where this is needed.  I'm dealing with just VNode/VText trees
so my use case doesn't use thunks/widgets so that 
codepath isn't really tested, but happy to accept PRs if that's something anyone else needs.

