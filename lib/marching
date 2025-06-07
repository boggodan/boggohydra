setFunction({
  name: "marchingSquares",
  type: "color",
  inputs: [
    { name: "threshold", type: "float", default: 0.5 },
    { name: "scale",     type: "float", default: 0.05 },
    { name: "lineWidth", type: "float", default: 0.02 },
    { name: "colouredness", type: "float", default: 1.0 }
  ],
  glsl: `
    // define a macro for computing the distance from point p to the line segment from a to b.
    // we can't define functions easily in hydra here so macro will have to do
    #define SEG_DIST(p,a,b) (length((p) - (a) - ((b) - (a)) * clamp(dot((p) - (a), (b) - (a)) / dot((b) - (a), (b) - (a)), 0.0, 1.0)))
    
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    vec2 cellCenter = floor(uv / scale) * scale + scale * 0.5;
    
    //  cell corner UVs (using a half‑cell offset)
    vec2 tlUV = cellCenter + vec2(-0.5,  0.5) * scale;
    vec2 trUV = cellCenter + vec2( 0.5,  0.5) * scale;
    vec2 blUV = cellCenter + vec2(-0.5, -0.5) * scale;
    vec2 brUV = cellCenter + vec2( 0.5, -0.5) * scale;
    
    // sample the src texture at the cell corners
    vec3 s1 = texture2D(tex0, tlUV).xyz;
    vec3 s2 = texture2D(tex0, trUV).xyz;
    vec3 s3 = texture2D(tex0, blUV).xyz;
    vec3 s4 = texture2D(tex0, brUV).xyz;

    float v_tl = length(s1);
    float v_tr = length(s2);
    float v_bl = length(s3);
    float v_br = length(s4);
    
    // convert the sampled values into binary states using the threshold
    // bit order: top-left (8), top-right (4), bottom-left (2), bottom-right (1)
    int b_tl = v_tl > threshold ? 1 : 0;
    int b_tr = v_tr > threshold ? 1 : 0;
    int b_bl = v_bl > threshold ? 1 : 0;
    int b_br = v_br > threshold ? 1 : 0;
    
    // compute the marching squares index (0–15)
    int index = b_tl * 8 + b_tr * 4 + b_bl * 2 + b_br;
    
    // get the local (cell-relative) coordinate in [0, 1]
    vec2 cellOrigin = cellCenter - 0.5 * scale;
    vec2 local = (uv - cellOrigin) / scale;
    
    // define midpoints along the cell edges (in local coordinates)
    vec2 m_top    = vec2(0.5, 1.0);
    vec2 m_right  = vec2(1.0, 0.5);
    vec2 m_bottom = vec2(0.5, 0.0);
    vec2 m_left   = vec2(0.0, 0.5);
    
    float d = 1e5;
    
    // check a bunch of cases
    if(index == 0 || index == 15) {
      d = 1e5;
    }
    else if(index == 1) {
      // 0001
      d = SEG_DIST(local, m_bottom, m_right);
    }
    else if(index == 2) {
      // 0010
      d = SEG_DIST(local, m_bottom, m_left);
    }
    else if(index == 3) {
      // 0011
      d = abs(local.y - 0.5);
    }
    else if(index == 4) {
      // 0100
      d = SEG_DIST(local, m_top, m_right);
    }
    else if(index == 5 || index == 10) {
      // 0101
      float vc = texture2D(tex0, cellCenter).r;
      d = SEG_DIST(local, m_top,m_bottom);
    }
    else if(index == 6) {
      // 0110
      d = min(SEG_DIST(local, m_top, m_right), SEG_DIST(local, m_left, m_bottom)); 
    }
    else if(index == 7) {
      // 0111
      d = SEG_DIST(local, m_top, m_left);
    }
    else if(index == 8) {
      // 1000
      d = SEG_DIST(local, m_top, m_left);
    }
    else if(index == 9) {
      // 1001
      d = min(SEG_DIST(local, m_top, m_right), SEG_DIST(local, m_left, m_bottom)); 
    }
    else if(index == 11) {
      // 1011
      d = SEG_DIST(local, m_top, m_right);
    }
    else if(index == 12) {
      // 1100
      d = abs(local.y - 0.5);
    }
    else if(index == 13) {
      // 1101
      d = SEG_DIST(local, m_bottom, m_left);
    }
    else if(index == 14) {
      // 1110
      d = SEG_DIST(local, m_bottom, m_right);
    }
    
    // this is the alpha to draw the line with
    float alpha = smoothstep(lineWidth, 0.0, d);

    vec3 avg_col = s1 + s2 + s3 + s4;
    vec3 finalColor = mix(vec3(0.0), mix(vec3(1.0,1.0,1.0), avg_col, colouredness), alpha);
    return vec4(finalColor, 1.0);
  `
});
