These are custom shaders for hydra!

# TERRAIN

This library renders Hydra sources in 3D using a heightmap raycaster. It's tuned to look "cool" with no extra parameters (but there are some).

Simply add this to the top of your hydra code:

```
await loadScript("https://cdn.statically.io/gh/boggodan/boggohydra/main/lib/terrain.js")
```

Then you can call either terrain(), terrainCheap() or terrainVeryCheap(). Note that these functions don't work at any point in a function chain. They only read an input source directly. For example you might call:

src(o1).terrain()

Example:

```
await loadScript("https://boggo.neocities.org/terrain.js")

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
