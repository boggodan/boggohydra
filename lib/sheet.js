setFunction({
  name: 'sheet',
  type: 'combineCoord',
  inputs: [
    { name: 'sourceres', type: 'float', default: 64.0 },
    { name: 'spriteresw', type: 'float', default: 32.0 },
    { name: 'spriteresh', type: 'float', default: 32.0 },
    { name: 'multiplier', type: 'float', default: 1.0 },
  ],
  glsl: `
    vec2 pos = fract(_st * sourceres) / vec2(spriteresw, spriteresh);
    float cells = spriteresw * spriteresh - 1.0;
    float idx = min(floor(dot(_c0.rgb, vec3(0.2126, 0.7152, 0.0722)) * multiplier * cells), cells);
    pos += vec2(
      mod(idx, spriteresw) / spriteresw,
      floor(idx / spriteresw) / spriteresh
    );
    return pos;
  `
})
