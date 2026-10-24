(() => {
  const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
  const socialNames={whatsapp:'WhatsApp',facebook:'Facebook',instagram:'Instagram'};
  const socialDialog=document.querySelector('#social-dialog');
  document.querySelectorAll('[data-social]').forEach(button=>{
    button.addEventListener('click',()=>{
      socialDialog.querySelector('.social-demo-platform').textContent=socialNames[button.dataset.social];
      openDialog(socialDialog);
    });
  });
  function socialURL(kind,value){
    if(typeof value!=='string'||!value.trim())return null;
    if(kind==='whatsapp'){
      const number=value.replace(/[\s()+-]/g,'');
      return /^\d{7,15}$/.test(number)?`https://wa.me/${number}`:null;
    }
    try{
      const url=new URL(value);const host=url.hostname.toLowerCase();
      const hosts=kind==='facebook'?['facebook.com','www.facebook.com','m.facebook.com','fb.com','www.fb.com','fb.me']:['instagram.com','www.instagram.com'];
      return url.protocol==='https:'&&hosts.includes(host)?url.href:null;
    }catch{return null}
  }
  fetch('assets/kenny/social-links.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(links=>{
    document.querySelectorAll('[data-social]').forEach(button=>{
      const kind=button.dataset.social,url=socialURL(kind,links[kind]);if(!url)return;
      const link=document.createElement('a');link.className=button.className;link.dataset.social=kind;link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',socialNames[kind]);link.innerHTML=button.innerHTML;button.replaceWith(link);
    });
  }).catch(()=>{});

  let canvas=document.querySelector('#water-surface'),engine,raf=0,lastImpulse=0,lastFrame=0,lastMove={x:0,y:0,time:0};
  const splats=[];let mode='none',fallbackRipples=[];
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const vertex=`#version 300 es
  in vec2 aPosition;out vec2 vUV;
  void main(){vUV=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
  const simulation=`#version 300 es
  precision highp float;uniform sampler2D uState;uniform vec2 uTexel;uniform float uAspect;uniform vec4 uSplats[8];in vec2 vUV;out vec4 outState;
  void main(){vec2 state=texture(uState,vUV).rg;float h=state.x;float velocity=state.y;
   float neighbours=texture(uState,vUV-vec2(uTexel.x,0.)).r+texture(uState,vUV+vec2(uTexel.x,0.)).r+texture(uState,vUV-vec2(0.,uTexel.y)).r+texture(uState,vUV+vec2(0.,uTexel.y)).r;
   velocity=(velocity+(neighbours-4.*h)*.215)*.983;h=(h+velocity)*.995;
   for(int i=0;i<8;i++){vec4 drop=uSplats[i];vec2 d=(vUV-drop.xy)*vec2(uAspect,1.);float influence=exp(-dot(d,d)/max(drop.w*drop.w,.0000001))*drop.z;h+=influence;velocity+=influence*.08;}
   outState=vec4(clamp(h,-2.,2.),clamp(velocity,-1.,1.),0.,1.);
  }`;
  const surface=`#version 300 es
  precision highp float;uniform sampler2D uState;uniform vec2 uTexel;uniform float uOpacity;in vec2 vUV;out vec4 outColor;
  void main(){float h=texture(uState,vUV).r;float dx=texture(uState,vUV+vec2(uTexel.x,0.)).r-texture(uState,vUV-vec2(uTexel.x,0.)).r;float dy=texture(uState,vUV+vec2(0.,uTexel.y)).r-texture(uState,vUV-vec2(0.,uTexel.y)).r;
   vec3 normal=normalize(vec3(-dx*5.,-dy*5.,1.));vec3 light=normalize(vec3(-.45,.6,.7));float sheen=pow(max(dot(reflect(-light,normal),vec3(0.,0.,1.)),0.),24.);float edge=max(abs(dx)+abs(dy)-.0025,0.);float alpha=clamp(edge*2.6+abs(h)*.11+sheen*edge*1.6,0.,.56)*uOpacity;
   float facing=clamp(dot(normal,light),0.,1.);vec3 color=mix(vec3(.12,.15,.14),vec3(.87,.83,.7),facing);color=mix(color,vec3(1.,.98,.9),clamp(sheen*1.8,0.,1.));outColor=vec4(color*alpha,alpha);
  }`;
  function compile(gl,type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Water shader unavailable');return shader}
  function program(gl,fragment){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vertex),f=compile(gl,gl.FRAGMENT_SHADER,fragment);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Water shader could not link');return p}
  function initGL(){
    const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:true,depth:false,powerPreference:'low-power'});
    if(!gl||!gl.getExtension('EXT_color_buffer_float'))throw Error('Floating point water unavailable');
    const sim=program(gl,simulation),draw=program(gl,surface),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const uniforms=p=>({state:gl.getUniformLocation(p,'uState'),texel:gl.getUniformLocation(p,'uTexel'),aspect:gl.getUniformLocation(p,'uAspect'),splats:gl.getUniformLocation(p,'uSplats[0]'),opacity:gl.getUniformLocation(p,'uOpacity')});
    const simU=uniforms(sim),drawU=uniforms(draw);let buffers=[],w=0,h=0,sw=0,sh=0;
    function target(){const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,sw,sh,0,gl.RGBA,gl.HALF_FLOAT,null);const framebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Water buffer unavailable');gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);return {texture,framebuffer}}
    function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio,1.25);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);sw=Math.round(clamp(w*.24,96,320));sh=Math.max(64,Math.round(sw*h/w));buffers.forEach(b=>{gl.deleteTexture(b.texture);gl.deleteFramebuffer(b.framebuffer)});buffers=[target(),target()];gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}
    function bind(p){gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const location=gl.getAttribLocation(p,'aPosition');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0)}
    function clear(){for(const b of buffers){gl.bindFramebuffer(gl.FRAMEBUFFER,b.framebuffer);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.clear(gl.COLOR_BUFFER_BIT)}
    function frame(points,opacity,steps){
      for(let step=0;step<steps;step++){const data=new Float32Array(32);for(let i=0;i<8;i++){data[i*4]=-10;data[i*4+1]=-10}if(step===0)points.slice(0,8).forEach((p,i)=>data.set([p.x/w,1-p.y/h,p.force,p.radius/h],i*4));
        bind(sim);gl.bindFramebuffer(gl.FRAMEBUFFER,buffers[1].framebuffer);gl.viewport(0,0,sw,sh);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,buffers[0].texture);gl.uniform1i(simU.state,0);gl.uniform2f(simU.texel,1/sw,1/sh);gl.uniform1f(simU.aspect,w/h);gl.uniform4fv(simU.splats,data);gl.drawArrays(gl.TRIANGLES,0,3);buffers.reverse();}
      bind(draw);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,buffers[0].texture);gl.uniform1i(drawU.state,0);gl.uniform2f(drawU.texel,1/sw,1/sh);gl.uniform1f(drawU.opacity,opacity);gl.drawArrays(gl.TRIANGLES,0,3);
    }
    resize();return {resize,clear,frame};
  }
  function initFallback(){const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;const ctx=canvas.getContext('2d');if(!ctx)return {resize(){},clear(){},frame(){}};
    function resize(){const dpr=Math.min(devicePixelRatio,1.25);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
    function clear(){ctx.clearRect(0,0,innerWidth,innerHeight);fallbackRipples=[]}
    function frame(points,opacity){const now=performance.now();points.forEach(p=>fallbackRipples.push({...p,born:now}));fallbackRipples=fallbackRipples.filter(p=>now-p.born<1600).slice(-45);ctx.clearRect(0,0,innerWidth,innerHeight);fallbackRipples.forEach(p=>{const t=(now-p.born)/1600,r=5+t*(p.force>.4?125:65);ctx.save();ctx.globalAlpha=(1-t)*opacity*(p.force>.4?.45:.2);for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(p.x,p.y,r+i*6,(r+i*6)*.87,0,0,Math.PI*2);ctx.strokeStyle=i?'#6c796e':'#f2e4c4';ctx.lineWidth=1;ctx.stroke()}ctx.restore()})}
    resize();return {resize,clear,frame};
  }
  function initialize(){if(reducedQuery.matches){mode='reduced';document.body.dataset.waterRenderer=mode;return}try{engine=initGL();mode='webgl';canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;engine=initFallback();mode='canvas';document.body.dataset.waterRenderer=mode})}catch{engine=initFallback();mode='canvas'}document.body.dataset.waterRenderer=mode;}
  function animate(now){raf=0;if(document.hidden||reducedQuery.matches)return;const age=now-lastImpulse;if(age>2800){engine?.clear();splats.length=0;lastFrame=0;return}const minDelay=innerWidth<760?1000/30:1000/45;if(lastFrame&&now-lastFrame<minDelay){raf=requestAnimationFrame(animate);return}const dt=lastFrame?now-lastFrame:16;lastFrame=now;engine?.frame(splats.splice(0,8),clamp((2800-age)/650,0,1),clamp(Math.round(dt/16),1,2));raf=requestAnimationFrame(animate);}
  function disturb(x,y,force,radius){if(reducedQuery.matches)return;if(!engine)initialize();if(!engine)return;splats.push({x,y,force,radius});if(splats.length>16)splats.splice(0,splats.length-16);lastImpulse=performance.now();if(!raf)raf=requestAnimationFrame(animate)}
  function transient(parent,className,x,y,lifetime,style={}){const el=document.createElement('span');el.className=className;el.style.left=x+'px';el.style.top=y+'px';Object.entries(style).forEach(([k,v])=>el.style.setProperty(k,v));parent.append(el);setTimeout(()=>el.remove(),lifetime);}
  document.addEventListener('pointermove',e=>{
    if(document.hidden||reducedQuery.matches||e.target.closest?.('input,textarea,select,dialog'))return;
    const now=performance.now();if(now-lastMove.time<28||Math.hypot(e.clientX-lastMove.x,e.clientY-lastMove.y)<9)return;
    lastMove={x:e.clientX,y:e.clientY,time:now};disturb(e.clientX,e.clientY,e.pointerType==='touch'?.11:.075,8);
  },{passive:true});
  document.addEventListener('pointerdown',e=>{
    if(e.button>0||e.target.closest?.('input,textarea,select'))return;
    const x=e.clientX,y=e.clientY,parent=e.target.closest?.('dialog[open]')||document.body;
    if(reducedQuery.matches){transient(parent,'water-static-feedback',x,y,130);return}
    disturb(x,y,.85,12);transient(parent,'water-falling-drop',x,y,200);transient(parent,'water-click-ring',x,y,1000);transient(parent,'water-click-ring second',x,y,1150);
    for(let i=0;i<5;i++){const angle=(i/5)*Math.PI*2;transient(parent,'water-splash',x,y,650,{'--spray-x':`${Math.cos(angle)*(19+i*3)}px`,'--spray-y':`${Math.sin(angle)*13-17}px`})}
    window.dispatchEvent(new CustomEvent('kenny:water-drop',{detail:{x,y}}));
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;lastFrame=0;splats.length=0;engine?.clear()}});
  addEventListener('resize',()=>{cancelAnimationFrame(raf);raf=0;lastFrame=0;splats.length=0;engine?.resize()});
  reducedQuery.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;splats.length=0;engine?.clear();if(!reducedQuery.matches&&!engine)initialize();else document.body.dataset.waterRenderer=reducedQuery.matches?'reduced':mode});
  initialize();
})();
