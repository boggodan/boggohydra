These are custom shaders for hydra!

**TERRAIN**

This library renders Hydra sources in 3D using a heightmap raycaster. It's tuned to look "cool" with no extra parameters (but there are some).

Simply add this to the top of your hydra code:

'''
await loadScript("https://cdn.statically.io/gh/boggodan/boggohydra/main/lib/terrain.js")
'''

Then you can call either terrain(), terrainCheap() or terrainVeryCheap(). Note that these functions don't work at any point in a function chain. They only read an input source directly. For example you might call:
src(o1).terrain()

