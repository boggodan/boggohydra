These are custom shaders for hydra!

### Terrain

This library renders Hydra sources in 3D using a heightmap raycaster. It's tuned to look "cool" with no extra parameters (but there are some, mainly the first one changes the scale of the height).

Simply add this to the top of your hydra code:

```
await loadScript("https://cdn.statically.io/gh/boggodan/boggohydra/main/lib/terrain.js")
```

Then you can call either terrain(), terrainCheap() or terrainVeryCheap(). 
Note that these functions only work directly on a video source - they only read an input source directly, so you cannot chain them. For example you might call:

src(o1).terrain()

The best place to call it is probably in a function chain dedicated to rendering out an image created in a previous pass.

Example:

```
await loadScript("https://cdn.statically.io/gh/boggodan/boggohydra/main/lib/terrain.js")

shape(3,0.3,0.0)
.sub(shape(3,0.26,0.0))
.pixelate(8,8)
.color(1.0,1.0,0.5)
.rotate(0.0,0.3)
.add(src(o1).scrollX(()=>Math.cos(time)*0.2),0.9)
.rotate(0.9)
.hue(0.1)
.out(o1)

// heightmap render
src(o1).terrainCheap(0.3).out(o2)

render(o2)
```
