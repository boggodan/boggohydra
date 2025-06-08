setFunction({
  name: "marching",
  type: "src",
  inputs: [
    { name: "tex", type: "sampler2D", default: NaN},
    { name: "scale",     type: "float", default: 0.013 },
    { name: "threshold", type: "float", default: 0.707 },
    { name: "colouredness", type: "float", default: 1.0 },
    { name: "interior", type: "float", default: 0.8 },
    { name: "exterior", type: "float", default: 1.0 },
  ],
  glsl: `
    // macros for cross product and distance along a line segment
    #define CROSS(v1,v2) ((v1).x*(v2).y - (v1).y*(v2).x)
    //this the distance to the line, normalized so it works better for diagonal segs
    #define DIST(p,a,b) (CROSS((a)-(b), (p)-(a)) / length((a)-(b)))
    
    vec2 uv = _st;
    vec2 cellCenter = floor(uv/scale) * scale + scale * 0.5;
    
    // compute cell corner UVs (half‑cell offset)
    vec2 tlUV = cellCenter + vec2(-0.5,  0.5) * scale;
    vec2 trUV = cellCenter + vec2( 0.5,  0.5) * scale;
    vec2 blUV = cellCenter + vec2(-0.5, -0.5) * scale;
    vec2 brUV = cellCenter + vec2( 0.5, -0.5) * scale;
    
    // sample tex0 at cell corners
    vec3 s1 = texture2D(tex, tlUV).xyz;
    vec3 s2 = texture2D(tex, trUV).xyz;
    vec3 s3 = texture2D(tex, blUV).xyz;
    vec3 s4 = texture2D(tex, brUV).xyz;
    
    float v_tl = length(s1);
    float v_tr = length(s2);
    float v_bl = length(s3);
    float v_br = length(s4);
    
    // compute marching squares index from the binary threshold tests:
    int index = (v_tl > threshold ? 8 : 0) +
                (v_tr > threshold ? 4 : 0) +
                (v_bl > threshold ? 2 : 0) +
                (v_br > threshold ? 1 : 0);
    
    // local coordinate within the current cell (0..1)
    vec2 cellOrigin = cellCenter - 0.5 * scale;
    vec2 local = (uv - cellOrigin)/scale;
    
    // midpoints along cell edges in local coordinates
    vec2 m_top    = vec2(0.5, 1.0);
    vec2 m_right  = vec2(1.0, 0.5);
    vec2 m_bottom = vec2(0.5, 0.0);
    vec2 m_left   = vec2(0.0, 0.5);
    
    float d = 0.0;
    float d_interior = 0.0;
    
    if(index == 0){
      d = 1.0;
    } else if(index == 15){
      d = 0.0;
      d_interior = 1.0;
    } else if(index == 1){
      d = DIST(local, m_right, m_bottom);
    } else if(index == 2){
      d = DIST(local, m_bottom, m_left);
    } else if(index == 3){
      d = DIST(local, m_right, m_left);
    } else if(index == 4){
      d = DIST(local, m_top, m_right);
    } else if(index == 5){
      d = DIST(local, m_top, m_bottom);
    } else if(index == 10){
      d = DIST(local, m_bottom, m_top);
    } else if(index == 6){
      d = max(DIST(local, m_top, m_left), DIST(local, m_bottom, m_right));
    } else if(index == 7){
      d = DIST(local, m_top, m_left);
    } else if(index == 8){
      d = DIST(local, m_left, m_top);
    } else if(index == 9){
      d = max(DIST(local, m_right, m_top), DIST(local, m_left, m_bottom));
    } else if(index == 11){
      d = DIST(local, m_right, m_top);
    } else if(index == 12){
      d = DIST(local, m_left, m_right);
    } else if(index == 13){
      d = DIST(local, m_left, m_bottom);
    } else if(index == 14){
      d = DIST(local, m_bottom, m_right);
    }
    
    // use a simple test for d to set our first alpha value;
    // note: if d <= 0 then we consider that “inside”
    float d1 = (d <= 0.0) ? 1.0 : 0.0;
    float d2 = smoothstep(0.85, 0.85, 1.0 - abs(d)) - d_interior;
    
    // use the parameters interior and exterior directly
    float alpha1 = d1 * interior;
    float alpha2 = smoothstep(0.0, 1.0, d2) * exterior;
    
    // pick the maximum intensity corner color
    float mval = max(max(v_tl, v_tr), max(v_bl, v_br));
    vec3 avg_col = (mval == v_tl) ? s1 : ((mval == v_tr) ? s2 : ((mval == v_bl) ? s3 : s4));
    
    // mix white and the max color based on "colouredness",
    // then blend with black according to alpha values
    vec3 internalColor = mix(vec3(0.0), mix(vec3(1.0, 1.0, 1.0), avg_col, colouredness), alpha1);
    vec3 outlineColor  = mix(vec3(0.0), mix(vec3(1.0, 1.0, 1.0), avg_col, colouredness), alpha2);
    
    return vec4(outlineColor + internalColor, max(alpha1,alpha2));
  `
});
