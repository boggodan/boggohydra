setFunction({
  name: "vhs",
  type: "src",
  inputs: [
    {name: 'tex', type: 'sampler2D' },
    {name: 'strength', type: 'float', default: 0.85 },
    {name: 'scanlineStrength', type: 'float', default: 0.8 },
    {name: 'wobble', type: 'float', default: 2.0 },
    {name: 'wear', type: 'float', default: 2.3 },
    {name: 'colourFringe', type: 'float', default: 1.5 },
    {name: 'headswitching', type: 'float', default: 0.05 },
    {name: 'blur', type: 'float', default: 2.0 }
  ],
  glsl: `
    vec2 uv = _st;
    vec2 px = 1.0 / resolution.xy; //size of one pixel
	
	  float line = floor(uv.y * resolution.y);
	  float slowLinePos = line * 0.055;
	  float slowLine = floor(slowLinePos);
    //this makes sort of "coarse" bands that are the interpolated to be smooth
	  float slowLineFrac = fract(slowLinePos);
    //and more smooth
	  slowLineFrac = smoothstep(0.0, 1.0, slowLineFrac);	
    
	  float frame = floor(time * 23.976);

	  //various noise based on line
	  float lineNoiseA = fract(sin(dot(vec2(slowLine, frame), vec2(127.1, 311.7))) * 43758.5453);
	  float lineNoiseB = fract(sin(dot(vec2(slowLine + 1.0, frame), vec2(127.1, 311.7))) * 43758.5453);
	  float lineNoise = mix(lineNoiseA, lineNoiseB, slowLineFrac);
	  float fineNoise = fract(sin(dot(vec2(line, frame), vec2(269.5, 183.3))) * 43758.5453);

	  //tracking distortion
    float trackY = uv.y * 9.0 + time * 0.55;
    float trackCell = floor(trackY);
    float trackFrac = fract(trackY);
    trackFrac = trackFrac * trackFrac * (3.0 - 2.0 * trackFrac);

	  //I dunno just flop it around based on sine waves, just mess it all up
    float trackA = fract(sin(dot(vec2(trackCell, floor(time * 2.0)), vec2(419.2, 171.9))) * 43758.5453);
    float trackB = fract(sin(dot(vec2(trackCell + 1.0, floor(time * 2.0)), vec2(419.2, 171.9))) * 43758.5453);
    float trackC = fract(sin(dot(vec2(trackCell, floor(time * 2.0) + 1.0), vec2(419.2, 171.9))) * 43758.5453);
    float trackD = fract(sin(dot(vec2(trackCell + 1.0, floor(time * 2.0) + 1.0), vec2(419.2, 171.9))) * 43758.5453);

    float timeFrac = fract(time * 2.0);
    timeFrac = timeFrac * timeFrac * (3.0 - 2.0 * timeFrac);

    float trackNow = mix(trackA, trackB, trackFrac);
    float trackNext = mix(trackC, trackD, trackFrac);
    float tearNoise = mix(trackNow, trackNext, timeFrac);

    float broadTracking = smoothstep(0.62, 0.92, tearNoise);
    float lowerBias = smoothstep(0.10, 0.96, 1.0-uv.y);
    
    //more trakcing distortion closer to the top
    float headBias = 1.0 - smoothstep(0.05, 0.28, 1.0-uv.y);

    float trackingRipple = sin(uv.y * 38.0 + time * 4.0) * 0.5 + 0.5;
    float tracking = broadTracking * lowerBias;
    tracking *= mix(0.72, 1.22, trackingRipple);
    tracking += headBias * 0.18;
    tracking = clamp(tracking, 0.0, 1.0);

  	float headSwitch = 1.0 - smoothstep(0.035, 0.16, 1.0 - uv.y); //"head switch" distortion stronger at the bottom
    headSwitch = headSwitch * headswitching;
  	float edgeWobble = sin(uv.y * 45.0 + time * 7.0) + sin(uv.y * 113.0 - time * 2.4);

  	float wobblePixels = strength * wobble * (lineNoise - 0.5) * 7.0;
  	wobblePixels += strength * wobble * edgeWobble * 1.6;
  	wobblePixels += strength * wobble * tracking * (tearNoise - 0.5) * 34.0;
  	wobblePixels += strength * wobble * headSwitch * sin(time * 19.0 + uv.y * 190.0) * 10.0;
	
  	float fieldOffset = mod(line, 2.0) * px.y * 0.35 * strength;
  	vec2 signalUv = clamp(uv + vec2(wobblePixels * px.x, fieldOffset), 0.0, 1.0);

	  float blurNoiseA = fract(sin(dot(vec2(slowLine, frame * 0.37), vec2(41.7, 289.1))) * 43758.5453);
	  float blurNoiseB = fract(sin(dot(vec2(slowLine + 1.0, frame * 0.37), vec2(41.7, 289.1))) * 43758.5453);
	  float blurNoise = mix(blurNoiseA, blurNoiseB, slowLineFrac);

    float lumaBlur = strength * wear * (0.65 + 1.25 * blurNoise + 2.5 * tracking) * blur;
    float chromaBlur = strength * wear * (2.5 + 3.5 * blurNoise + 8.0 * tracking) * blur;

    vec3 center = texture2D(tex, signalUv).rgb;
    
	  // not the best blur... just kind of jank but importantly applied separately to luma vs chroma
    // also notice it's horizontal only! tbh you might want to further blur the input signal with another 
    //hydra function
    vec3 lumaSmear =
      texture2D(tex, clamp(signalUv - vec2(px.x * lumaBlur * 1.5, 0.0), 0.0, 1.0)).rgb * 0.12 +
      texture2D(tex, clamp(signalUv - vec2(px.x * lumaBlur * 0.7, 0.0), 0.0, 1.0)).rgb * 0.23 +
      center * 0.30 +
      texture2D(tex, clamp(signalUv + vec2(px.x * lumaBlur * 0.9, 0.0), 0.0, 1.0)).rgb * 0.23 +
      texture2D(tex, clamp(signalUv + vec2(px.x * lumaBlur * 1.8, 0.0), 0.0, 1.0)).rgb * 0.12;

    vec3 chromaSmear =
      texture2D(tex, clamp(signalUv - vec2(px.x * chromaBlur * 2.0, 0.0), 0.0, 1.0)).rgb * 0.16 +
      texture2D(tex, clamp(signalUv - vec2(px.x * chromaBlur * 0.85, 0.0), 0.0, 1.0)).rgb * 0.24 +
      center * 0.20 +
      texture2D(tex, clamp(signalUv + vec2(px.x * chromaBlur * 1.1, 0.0), 0.0, 1.0)).rgb * 0.24 +
      texture2D(tex, clamp(signalUv + vec2(px.x * chromaBlur * 2.4, 0.0), 0.0, 1.0)).rgb * 0.16;
	
  	float chromaAmount = strength * colourFringe;
  	float chromaDelay = chromaAmount * (1.0 + 0.35 * fineNoise + 1.8 * tracking) * px.x;

	  //fringe! 
    vec2 redUv = clamp(signalUv + vec2(chromaDelay, chromaDelay * 0.08), 0.0, 1.0);
    vec2 blueUv = clamp(signalUv - vec2(chromaDelay * 1.15, chromaDelay * 0.05), 0.0, 1.0);

  	vec3 rgbR = texture2D(tex, redUv).rgb;
  	vec3 rgbG = center;
  	vec3 rgbB = texture2D(tex, blueUv).rgb;

  	vec3 fringed = vec3(rgbR.r, rgbG.g, rgbB.b);
    vec3 chromaSource = mix(fringed, chromaSmear, strength * wear * 0.35);

	  //convert to vhs style yiq and smear colour separately from brightness
    //this is basically the key effect of the whole thing
  	float lumaBleed = dot(lumaSmear, vec3(0.299, 0.587, 0.114));
	
  	vec3 yiq = vec3(
  	  lumaBleed,
  	  dot(chromaSource, vec3(0.596, -0.274, -0.322)),
  	  dot(chromaSource, vec3(0.211, -0.523, 0.312))
  	);
	
  	float chromaLoss = 1.0 - strength * (0.16 + tracking * 0.32 + headSwitch * 0.14);
  	yiq.y = yiq.y * chromaLoss;
  	yiq.z = yiq.z * chromaLoss;
	
  	vec3 color = vec3(
  	  yiq.x + 0.956 * yiq.y + 0.621 * yiq.z,
  	  yiq.x - 0.272 * yiq.y - 0.647 * yiq.z,
  	  yiq.x - 1.106 * yiq.y + 1.703 * yiq.z
  	);
	
  	float scanline = 0.88 + 0.12 * sin((uv.y * resolution.y + time * 8.0));
  	float dropoutMask = smoothstep(0.835, 1.0, lineNoise) * smoothstep(0.18, 0.98, uv.y); //some lines randmly lose signal
  	float dropout = dropoutMask * strength * wear * (0.08 + 0.22 * fineNoise); 
  	float vignette = smoothstep(0.92, 0.15, length((uv - 0.5) * vec2(1.2, 0.9)));
	
  	color *= mix(1.0, scanline, scanlineStrength * strength);
  	color = mix(color, vec3(0.02), dropout);
  	color *= mix(0.74, 1.05, vignette);
  	color += headSwitch * strength * wear * vec3(0.05, 0.045, 0.035);
	
  	return vec4(clamp(color, 0.0, 1.0), 1.0);
  `
});
