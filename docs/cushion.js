/* Simple rounded 3D cushion, restored before tufting and photographic versions. */
(() => {
 'use strict';
 const host=document.querySelector('.care-traveller');
 const canvas=document.createElement('canvas');host.replaceChildren(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
 if(!gl){host.hidden=true;return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const vertex=`attribute vec3 position;attribute vec3 normal;uniform mat4 rotation;varying vec3 n;varying vec3 p;void main(){p=position;n=mat3(rotation)*normal;vec3 v=(rotation*vec4(position,1.)).xyz;float perspective=3.8/(3.8-v.z);gl_Position=vec4(v.x*perspective*.69,v.y*perspective*.69,-v.z*.2,1.);}`;
 const fragment=`precision mediump float;varying vec3 n;varying vec3 p;void main(){vec3 N=normalize(n);float light=max(dot(N,normalize(vec3(-.65,.9,1.4))),0.);float weave=sin(p.x*225.)*sin(p.y*225.);float thread=sin(p.x*450.+sin(p.y*225.))*.024;float contour=pow(pow(abs(p.x),8.)+pow(abs(p.y),8.),.125);float seam=exp(-pow((contour-.86)*95.,2.));float edge=max(seam*.65,1.-smoothstep(.015,.075,abs(p.z)));float stitch=step(.1,sin((p.x+p.y)*180.))*edge;vec3 sage=vec3(.57,.65,.45);vec3 color=sage*(.45+.65*light)+vec3(weave*.044+thread);color=mix(color,vec3(.34,.44,.25),edge*.55);color+=vec3(stitch*.045);float rim=pow(1.-abs(N.z),3.)*.05;gl_FragColor=vec4(color+rim,1.);}`;
 function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('Shader compilation failed');return sh;}
 let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link failed');}catch{host.hidden=true;return;}gl.useProgram(program);
 const vertices=[],normals=[],indices=[],N=64;
 for(let side=0;side<2;side++)for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const u=i/N*2-1,v=j/N*2-1,puff=Math.pow(Math.max(0,(1-u*u)*(1-v*v)),.36);vertices.push(u*(1-.11*Math.pow(v,8)),v*(1-.11*Math.pow(u,8)),(side?-1:1)*.43*puff);normals.push(0,0,0);}
 for(let side=0;side<2;side++)for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=side*(N+1)*(N+1)+j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;indices.push(...(side?[a,c,b,b,c,d]:[a,b,c,b,d,c]));}
 for(let k=0;k<indices.length;k+=3){const a=indices[k]*3,b=indices[k+1]*3,c=indices[k+2]*3,ux=vertices[b]-vertices[a],uy=vertices[b+1]-vertices[a+1],uz=vertices[b+2]-vertices[a+2],vx=vertices[c]-vertices[a],vy=vertices[c+1]-vertices[a+1],vz=vertices[c+2]-vertices[a+2],cross=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx];for(const idx of [a,b,c])for(let q=0;q<3;q++)normals[idx+q]+=cross[q];}
 for(let i=0;i<normals.length;i+=3){const length=Math.hypot(...normals.slice(i,i+3))||1;for(let j=0;j<3;j++)normals[i+j]/=length;}
 function attribute(name,data){gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
 attribute('position',vertices);attribute('normal',normals);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
 const rotation=gl.getUniformLocation(program,'rotation');
 function matrix(x,y,z){const a=Math.cos(x),b=Math.sin(x),c=Math.cos(y),d=Math.sin(y),e=Math.cos(z),f=Math.sin(z);return new Float32Array([c*e,c*f,-d,0,b*d*e-a*f,b*d*f+a*e,b*c,0,a*d*e+b*f,a*d*f-b*e,a*c,0,0,0,0,1]);}
 // Read actual content bounds so the cushion can occupy only clear space.
 const stops=[['.hero',.50],['.service-card:nth-child(1)',.26],['.service-card:nth-child(2)',.79],['.service-card:nth-child(3)',.26],['#process',.27],['.area-section',.80],['#faq',.25],['#booking',.18],['footer',.79]].map(([selector,x])=>({el:document.querySelector(selector),x}));
 const obstacleSelector='h1,h2,h3,p,.step-tag,.step-number,.service-link,.service-number,.photo-caption,.visual-top,.header a,button,input,select,textarea,summary,.social-card,.footer-bottom,.booking-phone,.discover,.hero-actions a,.round-arrow,.process-visual figcaption,img';
 let bounds=[],pointer=[0,0],current=null,raf=0,lastTime=0,lastScroll=scrollY,route=[],obstacles=[],dirty=true,target=null;
 function measure(){const res=Math.round((innerWidth<1000?160:350)*Math.min(devicePixelRatio,2));canvas.width=canvas.height=res;gl.viewport(0,0,res,res);bounds=stops.map(stop=>({...stop,y:stop.el.getBoundingClientRect().top+scrollY}));dirty=true;wake();}
 function clearAt(x,y,r){return x>=r&&x<=innerWidth-r&&y>=r&&y<=innerHeight-r&&!obstacles.some(b=>x+r>b.left&&x-r<b.right&&y+r>b.top&&y-r<b.bottom);}
 function clearLine(a,b,r){const count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/10));for(let i=0;i<=count;i++){const t=i/count;if(!clearAt(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,r))return false;}return true;}
 function plan(){
  dirty=false;lastScroll=scrollY;
  obstacles=[...document.querySelectorAll(obstacleSelector)].filter(el=>!host.contains(el)).flatMap(el=>{if(el.matches('h1,h2,h3,p')){const rects=[],walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);rects.push(...range.getClientRects());}return rects;}return [el.getBoundingClientRect()];}).filter(b=>b.width>0&&b.height>0&&b.bottom>0&&b.top<innerHeight).map(b=>({left:b.left-10,right:b.right+10,top:b.top-10,bottom:b.bottom+10}));
  const focus=scrollY+innerHeight*.5;let segment=0;while(segment<bounds.length-2&&focus>bounds[segment+1].y)segment++;
  let t=Math.max(0,Math.min(1,(focus-bounds[segment].y)/(bounds[segment+1].y-bounds[segment].y)));t=t*t*(3-2*t);
  const desired={x:innerWidth*(bounds[segment].x+(bounds[segment+1].x-bounds[segment].x)*t),y:innerHeight*.58};
  const hero=document.querySelector('.hero').getBoundingClientRect();
  const photo=document.querySelector('.hero-photo').getBoundingClientRect();
  const process=document.querySelector('#process').getBoundingClientRect();
  const inProcess=process.top<innerHeight*.5&&process.bottom>innerHeight*.5;
  const mobile=innerWidth<1000;
  const atHero=scrollY<Math.max(80,bounds[0].el.offsetHeight*.45)&&(!mobile||(photo.top>60&&photo.top<innerHeight-80));
  let size=mobile?(inProcess?68:90):(atHero?235:inProcess?130:255);
  if(atHero){
   // This corner overlap is intentional, and remains present from the first frame.
   route=[{x:Math.min(innerWidth-size/2-8,photo.right-25),y:Math.max(size/2+12,photo.top+25)}];
  }else{
   if(inProcess&&!mobile){const steps=document.querySelector('.steps').getBoundingClientRect(),stage=document.querySelector('.process-sticky').getBoundingClientRect();desired.x=(steps.right+stage.left)/2;desired.y=innerHeight*.53;}
   let best=null;
   // Find a smaller clear landing when the layout cannot accommodate full scale.
   for(let candidate=size;candidate>=(mobile?30:44)&&!best;candidate-=12){
    const r=candidate*.44+10;let bestScore=Infinity;
    for(let y=r;y<=innerHeight-r;y+=18)for(let x=r;x<=innerWidth-r;x+=18){
     if(!clearAt(x,y,r))continue;
     const score=Math.hypot(x-desired.x,(y-desired.y)*1.1)+(current?Math.hypot(x-current.x,y-current.y)*.14:0);
     if(score<bestScore){bestScore=score;best={x,y,size:candidate};}
    }
   }
   // A small edge berth is always available; never toggle visibility during travel.
   if(!best)best={x:innerWidth-22,y:innerHeight*.42,size:40};
   size=best.size;route=[best];
  }
  const spin=(scrollY-bounds[4].y)*(mobile?.001:.003);
  target={size,rx:inProcess?.3:-.2,ry:inProcess?spin:(segment%2?-.55:.55),rz:inProcess?spin*.35:Math.sin((segment+t)*1.5)*.3};
  if(!current)current={...route[0],size,rx:target.rx,ry:target.ry,rz:target.rz};

 }
 function draw(time){
  raf=0;if(document.hidden||reduced.matches){host.style.opacity='0';return;}
  if(dirty)plan();if(!target||!current)return;
  const dt=Math.min(40,time-lastTime||16);lastTime=time;const smooth=1-Math.exp(-dt/135);
  if(route.length){const next=route[0],distance=Math.hypot(next.x-current.x,next.y-current.y),step=Math.min(distance,distance*(1-Math.exp(-dt/180)));if(distance<1)route.shift();else{const move={x:current.x+(next.x-current.x)*step/distance,y:current.y+(next.y-current.y)*step/distance};current.x=move.x;current.y=move.y;}}
  current.size+=(target.size-current.size)*smooth;const rotations=[target.rx+pointer[1]*.32,target.ry+pointer[0]*.35,target.rz+pointer[0]*.08];let delta=0;['rx','ry','rz'].forEach((key,i)=>{delta+=Math.abs(rotations[i]-current[key]);current[key]+=(rotations[i]-current[key])*smooth;});
  // Travel may cross content; the final destination is always an empty area.
  host.style.width=host.style.height=current.size+'px';host.style.transform='translate3d('+(current.x-current.size/2)+'px,'+(current.y-current.size/2)+'px,0)';host.style.opacity='1';
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(rotation,false,matrix(current.rx,current.ry,current.rz));gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
  if(route.length||delta>.001||Math.abs(target.size-current.size)>.05)wake();
 }
 function wake(){if(!raf)raf=requestAnimationFrame(draw);}
 addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer=[e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1];wake();},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{pointer=[0,0];wake();});
 addEventListener('scroll',()=>{dirty=true;wake();},{passive:true});addEventListener('resize',measure,{passive:true});addEventListener('load',measure);document.addEventListener('visibilitychange',wake);document.addEventListener('toggle',()=>{dirty=true;wake();},true);reduced.addEventListener('change',wake);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.hidden=true;if(raf)cancelAnimationFrame(raf);});measure();if(document.fonts)document.fonts.ready.then(measure);
})();


