'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const config = window.VIMAS;
const socialDescriptions={Instagram:'Fresh starts, in focus',TikTok:'Watch the clean',Facebook:'Stay connected',WhatsApp:'Chat with VIMAS',YouTube:'A closer look',Threads:'Join the conversation',Email:'Drop us a note'};
for (const [i,[name,url]] of config.socials.entries()) {
  const a=document.createElement('a');a.className='social-card';a.dataset.platform=name.toLowerCase();a.style.setProperty('--social-order',i);a.href=url;
  if(!url.startsWith('mailto:')){a.target='_blank';a.rel='noopener';a.setAttribute('aria-label',name+' — opens in a new tab');}
  const thumb=document.createElement('span');thumb.className='social-thumbnail';thumb.setAttribute('aria-hidden','true');
  const icon=document.createElement('img');icon.className='social-icon';icon.src='assets/social-'+name.toLowerCase()+'.svg';icon.alt='';icon.width=40;icon.height=40;thumb.append(icon);
  const copy=document.createElement('span');copy.className='social-copy';const title=document.createElement('strong');title.textContent=name;const description=document.createElement('small');description.textContent=socialDescriptions[name];copy.append(title,description);
  const arrow=document.createElement('span');arrow.className='social-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');a.append(thumb,copy,arrow);$('#socials').append(a);
}
$('#year').textContent=new Date().getFullYear();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
$$('[data-service]').forEach(link=>link.addEventListener('click',()=>{$('#service').value=link.dataset.service;}));
$('#quote-form').addEventListener('submit',e=>{
  e.preventDefault();const location=$('#location').value.trim();
  if(!location){$('#location').setCustomValidity('Please enter your area or postcode.');$('#location').reportValidity();return;}
  const message=`Hi VIMAS! I’d like a quote for ${$('#service').value.toLowerCase()}.\nLocation: ${location}\n${$('#details').value.trim()?`Details: ${$('#details').value.trim()}\n`:''}I can send photos of my furniture here. Please let me know availability and pricing.`;
  const url=`https://wa.me/${config.phone}?text=${encodeURIComponent(message)}`;
  window.open(url,'_blank','noopener');
  const status=$('#form-status');status.replaceChildren(document.createTextNode('Your quote request is ready. '));const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent='Continue to WhatsApp ↗';a.style.textDecoration='underline';status.append(a);
});
$('#location').addEventListener('input',()=>$('#location').setCustomValidity(''));
if('IntersectionObserver' in window){
  if(!reducedMotion.matches){document.documentElement.classList.add('js-motion');const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}},{threshold:.08});$$('.reveal').forEach(el=>revealObserver.observe(el));}

}
reducedMotion.addEventListener('change',e=>{if(e.matches)document.documentElement.classList.remove('js-motion');});

// Avoid competing WhatsApp actions in the same viewport.
if('IntersectionObserver' in window){const shown=new Set();const ctaObserver=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?shown.add(e.target):shown.delete(e.target));$('.floating-wa').classList.toggle('cta-suppressed',shown.size>0);},{threshold:.15});[$('.hero .whatsapp'),$('#quote-form'),$('.social-card[data-platform=whatsapp]')].forEach(el=>ctaObserver.observe(el));}



// Count one visit per browser session; show only a confirmed server total.
(async()=>{try{const response=await fetch('/api/visits',{method:'POST',credentials:'same-origin',cache:'no-store'});if(!response.ok)return;const data=await response.json();if(!Number.isSafeInteger(data.count)||data.count<1)return;const counter=document.querySelector('#visitor-count');counter.textContent='Website visits: '+new Intl.NumberFormat('en-MY').format(data.count);counter.hidden=false;}catch{/* Keep the counter hidden when its service is unavailable. */}})();

// Desktop photographic storytelling; mobile keeps a single stable visual.
const processPhotos=[
 ['assets/process-vacuum.jpg','Vacuum nozzle cleaning upholstery'],
 ['assets/process-spot.jpg','Illustrative stock photo of a cleaner wiping a chair'],
 ['assets/process-steam-ai.png','AI illustration of a steam nozzle treating sofa fabric'],
 ['assets/process-shampoo-ai.png','AI illustration of shampoo and a soft brush on upholstery'],
 ['assets/process-extraction.jpg','Kärcher Puzzi extracting moisture from blue sofa upholstery'],
 ['assets/process-finish.jpg','Illustrative spray bottle and cloth in a living room']
];
// Each mobile step keeps its own photograph; desktop uses the sticky photo stage.
$$('.step').forEach((step,i)=>{const img=document.createElement('img');img.className='step-mobile-photo';img.src=processPhotos[i][0];img.alt=processPhotos[i][1];img.width=900;img.height=600;img.loading='lazy';step.append(img);});
const desktop=matchMedia('(min-width:761px)');let activeStep=-1,framePending=false,visualVersion=0;
function updateStory(){
 framePending=false;
 if(!desktop.matches)return;
 const steps=$$('.step');let index=0,distance=Infinity;
 steps.forEach((step,i)=>{const rect=step.getBoundingClientRect();const d=Math.abs(rect.top+rect.height/2-innerHeight*.5);if(d<distance){distance=d;index=i;}});
 if(index!==activeStep){
  activeStep=index;steps.forEach((step,i)=>step.classList.toggle('active',i===index));
  $('#process-visual-number').textContent=String(index+1).padStart(2,'0')+' / 06';
  $('#process-visual-title').textContent=steps[index].querySelector('h3').textContent;
  const [src,alt]=processPhotos[index],base=$('#process-image'),next=$('#process-image-next');
  const version=++visualVersion;next.style.opacity='0';const preload=new Image();
  preload.onload=()=>{if(version!==visualVersion)return;next.src=src;next.style.objectPosition='center';next.style.transform='scale(1)';next.style.opacity='1';setTimeout(()=>{if(version!==visualVersion)return;base.src=src;base.alt=alt;base.style.objectPosition=next.style.objectPosition;base.style.transform=next.style.transform;next.style.opacity='0';},reducedMotion.matches?0:700);};preload.src=src;
 }
 const hero=$('.hero').getBoundingClientRect();if(!reducedMotion.matches&&hero.bottom>0&&hero.top<innerHeight){$('.hero-photo>img').style.transform='translateY('+Math.max(-18,Math.min(18,-hero.top*.04))+'px) scale(1.08)';}
}
function scheduleStory(){if(!framePending){framePending=true;requestAnimationFrame(updateStory);}}
function resetStory(){visualVersion++;activeStep=-1;if(desktop.matches){scheduleStory();}else{$$('.step').forEach(el=>el.classList.remove('active'));$('#process-image').src='assets/process-extraction.jpg';$('#process-image').alt='Kärcher Puzzi cleaning blue sofa upholstery';$('#process-image').style.transform='none';$('#process-image-next').style.opacity='0';$('#process-visual-number').textContent='THE VIMAS METHOD';$('#process-visual-title').textContent='Care in every pass.';$('.hero-photo>img').style.transform='none';}}
window.addEventListener('scroll',scheduleStory,{passive:true});window.addEventListener('resize',scheduleStory,{passive:true});desktop.addEventListener('change',resetStory);reducedMotion.addEventListener('change',resetStory);resetStory();

// Reveal social previews once, including on touch devices.
if('IntersectionObserver' in window&&!reducedMotion.matches){
 const socialReveal=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('social-arrived');socialReveal.unobserve(entry.target);}});},{threshold:.12});
 $$('.social-card').forEach(card=>{card.classList.add('social-waiting');socialReveal.observe(card);});
}
