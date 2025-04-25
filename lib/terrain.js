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
      default: 0.4
    },
    {
      name: "camDist",
      type: "float",
      default: 2.0
    },
    {
      name: "angle",
      type: "float",
      default: 0.2
    },
    {
      name: "orbitspeed",
      type: "float",
      default: 0.2
    }
  ],
  glsl: `
    // Normalize coordinates
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.y = 1.0 - uv.y;
    
    // use angle passed in for camera + automatic orbiting
    float rotationAngle = angle + time*orbitspeed; // Adjust speed by changing multiplier
    
    // rotate the camera transform
    mat3 rotY = mat3(
        cos(rotationAngle), 0.0, sin(rotationAngle),
        0.0, 1.0, 0.0,
        -sin(rotationAngle), 0.0, cos(rotationAngle)
    );
    
    // camera origin
    vec3 cameraPos = normalize(vec3(0.3, camy, 0.0))*camDist;
    
    // rotated camera ray
    vec3 ro = rotY * cameraPos;
    
    // orbit the origin
    vec3 target = vec3(0.0,0.0,0.0);
    vec3 forward = normalize(target - ro);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);

    // actually, orbit the centre of the image :)
    ro += vec3(0.5,0.0,0.5);
    
    // create actual ray directions based on the screen UVs
    vec3 rd = normalize(forward + (uv.x - .5) * right + (uv.y - 0.5) * up);
  
    const float dt = 0.01;
    const float mint = 0.01;
    const float maxt = 16.0;
    float lh = 0.0;
    float ly = 0.0;
    float resT = 0.0;
    bool hit = false;
    vec3 hitcol = vec3(0.0,0.0,0.0);
    
    for( float t=mint; t<maxt; t+=dt )
    {
        vec3 p = ro + rd*t;
        vec4 h1 = texture2D(tex0, p.xz);
        float h = length(h1.xyz)*heightScale;
        
        if( p.y < h)
        {
            // interpolate intersection distance
            resT = t-dt+dt*(lh-ly)/(p.y-ly-h+lh);
            vec3 interpos = ro + rd*(resT);
            if(interpos.x < 0.0 || interpos.x > 1.0 || interpos.z < 0.0 || interpos.z > 1.0)
            {
               hit = false;
               break;
            }
            hitcol = texture2D(tex0, interpos.xz).rgb;
            hit = true;
            break;
        }
        lh = h;
        ly = p.y;
    }
    
    
    // Output. Todo: add fog.
    if(hit == false)
       resT = 0.0;
       
    return vec4(hitcol.x,hitcol.y,hitcol.z, resT);
  `
})  
