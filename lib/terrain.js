setFunction({
    name: "terrain",
    type: "color", 
    inputs: [
      {
        name: "heightScale",
        type: "float",
        default: 0.1 
      },
      {
        name: "camy",
        type: "float",
        default: 0.01
      },
      {
        name: "camlook",
        type: "float",
        default: 0.8
      },
      {
        name: "scale",
        type: "float",
        default: 1.0
      }
    ],
    glsl: `
      // Normalize coordinates
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      uv.y = 1.0 - uv.y;
      
      // Initialize raymarching parameters
      vec3 ro = vec3(uv + vec2(0.0,camy), 0.0); // Ray starts at screen coordinates
      vec3 rd = vec3(0.0, camlook*-1.0, 1.0); // Direction towards screen depth
  
      const float dt = 0.002;
      const float mint = 0.002;
      const float maxt = 16.0;
      float lh = 0.0;
      float ly = 0.0;
      float resT = 0.0;
      bool hit = false;
      vec3 hitcol = vec3(0.0,0.0,0.0);
      
      for( float t=mint; t<maxt; t+=dt )
      {
          vec3  p = ro + rd*t;
          
          vec2 tangential = p.xz;
          tangential *= scale;
          //tangential = fract(tangential); // Keep uv values between 0.0 and 1.0
          //tangential = tangential * 2.0 - 1.0; // Scale uv to range -1.0 to 1.0
          //tangential = abs(tangential); // Mirror coordinates at edges
          //tangential = clamp(tangential, vec2(0.01,0.01), vec2(0.99,0.99));
          
          if(tangential.x < 0.0 || tangential.x > 1.0 || tangential.y < 0.0 || tangential.y > 1.0)
          {
             break;
          }
          
          p.xz = tangential;
          float h = texture2D(tex0, p.xz).r*heightScale;
          if( p.y < h )
          {
              // interpolate intersection distance
              resT = t-dt+dt*(lh-ly)/(p.y-ly-h+lh);
              hitcol = texture2D(tex0, p.xz).rgb;
              hit = true;
              break;
          }
          lh = h;
          ly = p.y;
      }
      
      
      // Output the final color
      if(hit == false)
         resT = 0.0;
         
      hitcol *= resT;
      return vec4(hitcol.x,hitcol.y,hitcol.z, (hit == true ? 1.0 : 0.0) * (1.0 - pow(resT,4.0)));
    `
  });
  
  setFunction({
    name: "terrainCheap", 
    type: "color",
    inputs: [
      {
        name: "heightScale", 
        type: "float",
        default: 0.1 
      },
      {
        name: "camy",
        type: "float",
        default: 0.01
      },
      {
        name: "camlook",
        type: "float",
        default: 0.8
      },
      {
        name: "scale",
        type: "float",
        default: 1.0
      }
    ],
    glsl: `
      // Normalize coordinates
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      uv.y = 1.0 - uv.y;
      
      // Initialize raymarching parameters
      vec3 ro = vec3(uv + vec2(0.0,camy), 0.0); // Ray starts at screen coordinates
      vec3 rd = vec3(0.0, camlook*-1.0, 1.0); // Direction towards screen depth
  
      const float dt = 0.01;
      const float mint = 0.002;
      const float maxt = 16.0;
      float lh = 0.0;
      float ly = 0.0;
      float resT = 0.0;
      bool hit = false;
      vec3 hitcol = vec3(0.0,0.0,0.0);
      
      for( float t=mint; t<maxt; t+=dt )
      {
          vec3  p = ro + rd*t;
          
          vec2 tangential = p.xz;
          tangential *= scale;
          //tangential = fract(tangential); // Keep uv values between 0.0 and 1.0
          //tangential = tangential * 2.0 - 1.0; // Scale uv to range -1.0 to 1.0
          //tangential = abs(tangential); // Mirror coordinates at edges
          //tangential = clamp(tangential, vec2(0.01,0.01), vec2(0.99,0.99));
          
          if(tangential.x < 0.0 || tangential.x > 1.0 || tangential.y < 0.0 || tangential.y > 1.0)
          {
             break;
          }
          
          p.xz = tangential;
          float h = texture2D(tex0, p.xz).r*heightScale;
          if( p.y < h )
          {
              // interpolate intersection distance
              resT = t-dt+dt*(lh-ly)/(p.y-ly-h+lh);
              hitcol = texture2D(tex0, p.xz).rgb;
              hit = true;
              break;
          }
          lh = h;
          ly = p.y;
      }
      
      
      // Output the final color
      if(hit == false)
         resT = 0.0;
         
      hitcol *= resT;
      return vec4(hitcol.x,hitcol.y,hitcol.z, (hit == true ? 1.0 : 0.0) * (1.0 - pow(resT,4.0)));
    `
  });
  
  setFunction({
    name: "terrainVeryCheap",
    type: "color",
    inputs: [
      {
        name: "heightScale",
        type: "float",
        default: 0.1 
      },
      {
        name: "camy",
        type: "float",
        default: 0.01
      },
      {
        name: "camlook",
        type: "float",
        default: 0.8
      },
      {
        name: "scale",
        type: "float",
        default: 1.0
      }
    ],
    glsl: `
      // Normalize coordinates
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      uv.y = 1.0 - uv.y;
      
      // Initialize raymarching parameters
      vec3 ro = vec3(uv + vec2(0.0,camy), 0.0); // Ray starts at screen coordinates
      vec3 rd = vec3(0.0, camlook*-1.0, 1.0); // Direction towards screen depth
  
      const float dt = 0.05;
      const float mint = 0.002;
      const float maxt = 16.0;
      float lh = 0.0;
      float ly = 0.0;
      float resT = 0.0;
      bool hit = false;
      vec3 hitcol = vec3(0.0,0.0,0.0);
      
      for( float t=mint; t<maxt; t+=dt )
      {
          vec3  p = ro + rd*t;
          
          vec2 tangential = p.xz;
          tangential *= scale;
          //tangential = fract(tangential); // Keep uv values between 0.0 and 1.0
          //tangential = tangential * 2.0 - 1.0; // Scale uv to range -1.0 to 1.0
          //tangential = abs(tangential); // Mirror coordinates at edges
          //tangential = clamp(tangential, vec2(0.01,0.01), vec2(0.99,0.99));
          
          if(tangential.x < 0.0 || tangential.x > 1.0 || tangential.y < 0.0 || tangential.y > 1.0)
          {
             break;
          }
          
          p.xz = tangential;
          float h = length(texture2D(tex0, p.xz).rgb)*heightScale;
          if( p.y < h )
          {
              // interpolate intersection distance
              resT = t-dt+dt*(lh-ly)/(p.y-ly-h+lh);
              hitcol = texture2D(tex0, p.xz).rgb;
              hit = true;
              break;
          }
          lh = h;
          ly = p.y;
      }
      
      
      // Output the final color
      if(hit == false)
         resT = 0.0;
         
      hitcol *= resT;
      return vec4(hitcol.x,hitcol.y,hitcol.z, (hit == true ? 1.0 : 0.0) * (1.0 - pow(resT,4.0)));
    `
  });
  
  
  
  