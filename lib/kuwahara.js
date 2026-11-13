setFunction({
  name: 'kuwahara',
  type: 'src',
  inputs: [
    { type: 'sampler2D', name: 'tex', default: NaN },
    { type: 'float', name: 'radius', default: 4.0 },
    { type: 'float', name: 'spread', default: 0.004 }
  ],
  glsl: `
    //algorithm:
    //centered around the current pixel, define 4 quadrants of a given size
    //for each one, compute the mean and variance in that square/box
    //then set the output colour as the mean of the one with the least variance

    //the loops currently support a maximum radius of 4
    //rounding it here keeps the sample count and quadrant offsets consistent
    float safeRadius = clamp(floor(radius + 0.5), 0.0, 4.0);

    vec3 mean[4];
    vec3 sigma[4];
    for (int k = 0; k < 4; k++) {
      mean[k] = vec3(0.0);
      sigma[k] = vec3(0.0);
    }

    vec2 offsets[4];
    offsets[0] = vec2(-1.0, -1.0);
    offsets[1] = vec2(0.0, -1.0);
    offsets[2] = vec2(-1.0, 0.0);
    offsets[3] = vec2(0.0, 0.0);

    float samples = 0.0;
    for (int j = 0; j <= 4; j++)
    {
      if (float(j) > safeRadius)
      {
        break;
      }

      for (int i = 0; i <= 4; i++)
      {
        if (float(i) > safeRadius)
        {
          break;
        }

        vec2 pos = vec2(float(i), float(j)) * spread;
        for (int k = 0; k < 4; k++)
        {
          vec2 uv = _st + pos + (offsets[k] * safeRadius * spread);
          vec3 col = texture2D(tex, uv).rgb;
          mean[k] += col;
          sigma[k] += col * col;
        }

        samples += 1.0;
      }
    }

    float minSigma = 1e20;
    vec3 finalColor = texture2D(tex, _st).rgb;

    for (int k = 0; k < 4; k++)
    {
      mean[k] /= samples;
      sigma[k] = max(
        sigma[k] / samples - mean[k] * mean[k],
        vec3(0.0)
      );

      float totalSigma = sigma[k].r + sigma[k].g + sigma[k].b;
      if (totalSigma < minSigma)
      {
        minSigma = totalSigma;
        finalColor = mean[k];
      }
    }

    return vec4(finalColor, 1.0);
  `
})
