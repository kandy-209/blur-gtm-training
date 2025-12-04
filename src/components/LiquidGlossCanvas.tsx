"use client";

import { useEffect, useRef } from "react";

export const LiquidGlossCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
    if (!gl) {
      console.error("[LiquidGloss] WebGL2 not supported. Trying WebGL fallback...");
      const gl1 = canvas.getContext("webgl");
      if (!gl1) {
        console.error("[LiquidGloss] WebGL not supported. Effect disabled.");
        return;
      }
      // WebGL1 fallback would require different shaders, so just return
      console.warn("[LiquidGloss] WebGL2 required for this effect. Please use a modern browser.");
      return;
    }

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + "px";
      canvas.style.height = container.clientHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const vertexShader = `#version 300 es
    in vec2 aPosition;
    out vec2 vUv;

    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
    `;

    const fragmentShader = `#version 300 es
    precision highp float;
    
    in vec2 vUv;
    out vec4 fragColor;
    
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    
    #define MAX_STEPS 100
    #define MAX_DIST 100.0
    #define SURF_DIST 0.001
    
    // Noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for(int i = 0; i < 4; i++) {
        value += amplitude * snoise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    // Smooth min for blending shapes
    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }
    
    // Box SDF
    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }
    
    // Rounded box SDF - Cursor logo shape
    float sdRoundBox(vec3 p, vec3 b, float r) {
      vec3 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
    }
    
    // Scene SDF - liquid blob with organic displacement
    float map(vec3 p) {
      float t = uTime * 0.06;
      
      // Base rounded box shape (Cursor-like cube)
      float box = sdRoundBox(p, vec3(0.8), 0.15);
      
      // Organic liquid displacement
      float noise1 = fbm(p * 1.2 + t * 0.5) * 0.25;
      float noise2 = snoise(p * 2.0 - t * 0.3) * 0.12;
      float noise3 = snoise(p * 0.8 + t * 0.2) * 0.18;
      
      // Slow breathing
      float breathe = sin(t * 0.4) * 0.05;
      
      // Mouse interaction - create a bulge
      vec3 mousePos = vec3(uMouse.x * 1.5, uMouse.y * 1.5, 0.8);
      float mouseDist = length(p - mousePos);
      float mouseEffect = exp(-mouseDist * mouseDist * 0.8) * 0.25;
      
      float liquid = box - noise1 - noise2 - noise3 - breathe - mouseEffect;
      
      return liquid;
    }
    
    // Normal calculation
    vec3 getNormal(vec3 p) {
      float d = map(p);
      vec2 e = vec2(0.001, 0.0);
      vec3 n = d - vec3(
        map(p - e.xyy),
        map(p - e.yxy),
        map(p - e.yyx)
      );
      return normalize(n);
    }
    
    // Ray marching
    float rayMarch(vec3 ro, vec3 rd) {
      float dO = 0.0;
      
      for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = map(p);
        dO += dS;
        if(dO > MAX_DIST || abs(dS) < SURF_DIST) break;
      }
      
      return dO;
    }
    
    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
      
      // Camera setup
      vec3 ro = vec3(0.0, 0.0, 3.5);
      vec3 rd = normalize(vec3(uv, -1.0));
      
      // Rotate camera slightly for interesting angle
      float angleY = 0.4;
      float angleX = 0.25;
      
      mat3 rotY = mat3(
        cos(angleY), 0.0, sin(angleY),
        0.0, 1.0, 0.0,
        -sin(angleY), 0.0, cos(angleY)
      );
      
      mat3 rotX = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(angleX), -sin(angleX),
        0.0, sin(angleX), cos(angleX)
      );
      
      rd = rotX * rotY * rd;
      ro = rotX * rotY * ro;
      
      float d = rayMarch(ro, rd);
      
      // Background - white/light for Cursor theme
      vec3 col = vec3(1.0);
      
      if(d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = getNormal(p);
        vec3 viewDir = normalize(ro - p);
        
        // Multiple light sources
        vec3 light1 = normalize(vec3(1.0, 1.0, 1.0));
        vec3 light2 = normalize(vec3(-0.5, 0.5, 0.8));
        vec3 light3 = normalize(vec3(0.0, -0.8, 0.5));
        
        // Very dark base - Cursor black
        vec3 baseColor = vec3(0.008);
        
        // Subtle diffuse
        float diff = max(dot(n, light1), 0.0) * 0.02;
        
        // Sharp glossy specular highlights
        vec3 r1 = reflect(-light1, n);
        vec3 r2 = reflect(-light2, n);
        vec3 r3 = reflect(-light3, n);
        
        float spec1 = pow(max(dot(r1, viewDir), 0.0), 400.0) * 3.0;
        float spec2 = pow(max(dot(r2, viewDir), 0.0), 250.0) * 1.5;
        float spec3 = pow(max(dot(r3, viewDir), 0.0), 180.0) * 0.8;
        
        float specular = spec1 + spec2 + spec3;
        
        // Fresnel for edge glow
        float fresnel = 1.0 - max(dot(viewDir, n), 0.0);
        fresnel = pow(fresnel, 4.5) * 0.15;
        
        col = baseColor;
        col += baseColor * diff;
        col += vec3(1.0) * specular;
        col += vec3(1.0) * fresnel;
      }
      
      // Gamma correction
      col = pow(col, vec3(0.9));
      
      fragColor = vec4(col, 1.0);
    }
    `;

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("[LiquidGloss] Shader error:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(vertexShader, gl.VERTEX_SHADER);
    const fragShader = compileShader(fragmentShader, gl.FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[LiquidGloss] Link error:", gl.getProgramInfoLog(program));
      return;
    }

    // Fullscreen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    
    // Create VAO (Vertex Array Object) - WebGL2 feature
    const vao = gl.createVertexArray();
    if (!vao) {
      console.error("[LiquidGloss] Failed to create VAO");
      return;
    }
    
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    if (!buffer) {
      console.error("[LiquidGloss] Failed to create buffer");
      return;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "aPosition");
    if (posLoc === -1) {
      console.error("[LiquidGloss] Failed to get attribute location");
      return;
    }
    
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    
    if (!uTime || !uMouse || !uResolution) {
      console.error("[LiquidGloss] Failed to get uniform locations");
      return;
    }

    let lastMouse = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.vx = x - lastMouse.x;
      mouseRef.current.vy = y - lastMouse.y;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      lastMouse = { x, y };
    };

    window.addEventListener("mousemove", onMouseMove);

    let time = 0;
    let animationId: number | null = null;
    let isRunning = true;

    const render = () => {
      if (!isRunning || !vao || !uTime || !uMouse || !uResolution) {
        return;
      }
      
      try {
        time += 0.016;
        gl.clearColor(1.0, 1.0, 1.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        gl.uniform1f(uTime, time);
        gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        animationId = requestAnimationFrame(render);
      } catch (error) {
        console.error("[LiquidGloss] Render error:", error);
        isRunning = false;
      }
    };

    render();

    return () => {
      isRunning = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

