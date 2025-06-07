These are custom shaders for hydra!

### Terrain

This library renders Hydra sources in 3D using a heightmap raycaster. It's tuned to look "cool" with no extra parameters (but there are some, mainly the first one changes the scale of the height).

Simply add this to the top of your hydra code:

```
await loadScript("https://cdn.statically.io/gh/boggodan/boggohydra/main/lib/terrain.js")
```

Then you can call either terrain().
Note that this function only works directly on a video source - its reads an input source directly, so you cannot chain them. For example you might call:

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
src(o1).terrain(0.3).out(o2)

render(o2)
```

### Square Marching

This one takes an input source and renders it using marching square interpolation. I think it looks cool.
I tuned the defaults a bit so it's generally useful but they are:

Scale - the size of the interpolation blocks (similar to a pixelation size... hmm maybe it should work more like pixelate)

Threshold - brightness must pass this threshold to be contoured

Colouredness - how much to take the colour from the original source vs just greyscale (0 - 1)

Interior - interior brightness

Exterior (e.g. Outline) - exterior outline brightness


Simply add this to the top of your hydra code:

```
await loadScript("https://cdn.statically.io/gh/boggodan/boggohydra/main/lib/marching.js")
```
Example:

```
await loadScript("https://cdn.statically.io/gh/boggodan/boggohydra/main/lib/marching.js")

voronoi(5)
.diff(osc(5,0.3,1.0))
.out(o0)

src(o0)
.marching()
.color(1,0.3,0.9)
.out(o1)

render(o1)
```
