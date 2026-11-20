/* About page (/about): hero growth curve, LeadsPulse app demo, journey timeline, offer list + live preview,
   LeadsPulse flow, clean timeline, sideways "why choose us", FAQ, office map + message form. Ported from the design artifact.
   Shared behaviour (Lenis, reveal, logo band #lbRow1, testimonials #xrTrack) lives in main.js. */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  function inView(el,cb,th){if(!el)return;if(!('IntersectionObserver' in window)){cb(true);return;}new IntersectionObserver(function(e){cb(e[0].isIntersecting);},{threshold:th||.3}).observe(el);}
  var onS=[];function sc(){onS.forEach(function(f){f();});}
  var tk=false;function req(){if(!tk){tk=true;requestAnimationFrame(function(){tk=false;sc();});}}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);
  if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',req);
  function prog(el,a,b){var r=el.getBoundingClientRect(),h=innerHeight;return Math.max(0,Math.min(1,(h*a-r.top)/((h*a-h*b)+r.height)));}
  function countUp(b,to,dur){var t0=performance.now();(function st(t){var q=Math.min(1,(t-t0)/dur);b.textContent=Math.round(to*(1-Math.pow(1-q,3))).toLocaleString('en-IN');if(q<1)requestAnimationFrame(st);})(t0);}

  /* hero app: flattens as you scroll */
  var stg=$('a7Stage'),app=$('a7App');
  if(stg){setTimeout(function(){stg.classList.add('go');},600);
    if(!reduce)onS.push(function(){if(innerWidth<=980)return;var r=stg.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight*.85)));app.style.setProperty('--rx',(24-24*p).toFixed(2)+'deg');app.style.setProperty('--sc',(.9+.1*p).toFixed(3));});
    var L=$('a7L'),av=false,K0=48,K3=12,nt=$('a7N');inView(stg,function(v){av=v;},.1);
    var NL=[['PN','Pooja N.','3 BHK · ₹1.6 Cr · Meta','#5856D6'],['KJ','Karan J.','Villa · ₹4 Cr · Google','#34C759'],['SA','Sameer A.','2 BHK · ₹95 L · Website','#FF2D55'],['DR','Divya R.','4 BHK · NRI · Meta','#FF9500'],['MT','Manish T.','Plot · ₹1.2 Cr · WhatsApp','#007AFF']],ni=0;
    var SG=[['s2','→ Priya'],['s3','Called'],['s4','Visit Sat']];
    function bump(id,v){var b=$(id);b.textContent=v;b.classList.add('bump');setTimeout(function(){b.classList.remove('bump');},600);}
    if(!reduce)setInterval(function(){if(!av||document.hidden)return;var d=NL[ni];ni=(ni+1)%NL.length;
      var li=document.createElement('li');li.className='new';li.innerHTML='<i style="--c:'+d[3]+'">'+d[0]+'</i><div><b>'+d[1]+'</b><small>'+d[2]+'</small></div><span class="s1">New</span>';
      L.insertBefore(li,L.firstElementChild);while(L.children.length>4)L.removeChild(L.lastElementChild);K0++;bump('a7K0',K0);
      nt.classList.add('out');setTimeout(function(){$('a7Nt').textContent='New lead for you: '+d[1];$('a7Ns').textContent=d[2].split(' · ').slice(0,2).join(' · ')+' · tap to call';nt.classList.remove('out');},420);
      var sp=li.querySelector('span'),k=0,iv=setInterval(function(){if(!li.isConnected||k>=SG.length||(k===2&&Math.random()<.5)){clearInterval(iv);return;}sp.className=SG[k][0];sp.textContent=SG[k][1];if(k===2){K3++;bump('a7K3',K3);}k++;},1000);
    },3800);}

    /* the real numbers are in the HTML (for search engines); reset to 0 just before counting up */
  if(!reduce)[].forEach.call(document.querySelectorAll('.a7-cu'),function(b){b.textContent='0';});
  [].forEach.call(document.querySelectorAll('.a7-cu'),function(b){inView(b,function(v){if(!v||b.dataset.done)return;b.dataset.done=1;var to=+b.dataset.to;if(reduce)b.textContent=to.toLocaleString('en-IN');else countUp(b,to,1600);},.6);});

  /* journey line + events */
  var tl=$('a7Tl');
  if(tl){var evs=[].slice.call(tl.querySelectorAll('.a7-ev')),line=$('a7TlL');
    onS.push(function(){line.style.height=(prog(tl,.6,.6)*100)+'%';evs.forEach(function(e){var r=e.getBoundingClientRect();e.classList.toggle('lit',r.top+r.height/2<innerHeight*.65);});});}

  /* leadspulse flow steps: driven by scroll */
  var fl=$('a7Flow');
  if(fl){var lfs=[].slice.call(fl.children);
    function fset(p){var k=Math.min(lfs.length-1,Math.floor(p*(lfs.length-1)+.05));lfs.forEach(function(l,i){l.classList.toggle('on',i<=k);});fl.style.setProperty('--fp',p.toFixed(3));}
    if(reduce)fset(1);else{var fsc=function(){var r=fl.getBoundingClientRect(),h=innerHeight;fset(Math.max(0,Math.min(1,(h*.95-r.top)/(h*.42))));};onS.push(fsc);fsc();}}

  /* faq one at a time */
  var fqd=[].slice.call(document.querySelectorAll('#a7Fq details'));fqd.forEach(function(d){d.addEventListener('toggle',function(){if(d.open)fqd.forEach(function(o){if(o!==d)o.open=false;});});});

  /* about hero growth curve */
  var abv=$('abv');
  if(abv){var pth=abv.querySelector('.abv-l'),pLen=pth.getTotalLength();[].forEach.call(abv.querySelectorAll('.abv-m'),function(m){var pt=pth.getPointAtLength(pLen*+m.dataset.t);m.style.setProperty('--x',(pt.x/480*100)+'%');m.style.setProperty('--y',(22+pt.y/300*78)+'%');});
    var cb=abv.querySelector('.c1 b'),N=+cb.dataset.n;setTimeout(function(){var t0=performance.now();(function st(t){var p=Math.min(1,(t-t0)/1800);cb.textContent=Math.round(N*(1-Math.pow(1-p,3))).toLocaleString('en-IN');if(p<1)requestAnimationFrame(st);})(t0);},reduce?0:700);
    if(!reduce){var cs=[].slice.call(abv.querySelectorAll('.abv-c')),F=[-.06,.05,-.03];function par(){var y=Math.min(scrollY,600);cs.forEach(function(c,i){c.style.transform='translateY('+(y*F[i])+'px)';});}addEventListener('scroll',par,{passive:true});if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',par);
      setInterval(function(){if(document.hidden)return;N+=1+Math.floor(Math.random()*3);cb.textContent=N.toLocaleString('en-IN');},2000);}}
  /* clean timeline */
  var tsw=$('a10Steps');
  if(tsw){var tss=[].slice.call(tsw.querySelectorAll('.ts'));
    if(reduce){tsw.style.setProperty('--tp','100%');tss.forEach(function(s){s.classList.add('on');});}
    else onS.push(function(){var p=prog(tsw,.85,.45);tsw.style.setProperty('--tp',(p*100).toFixed(1)+'%');tss.forEach(function(s,i){s.classList.toggle('on',p>=i/(tss.length)-.02);});});}
  sc();
  /* offer: list + live preview (scroll-driven on desktop) */
  var sv=$('sv2'),svSec=$('offer');
  if(sv){var sb=[].slice.call(sv.querySelectorAll('.sv2-b')),ss=[].slice.call(sv.querySelectorAll('.sv2-sc')),st=sv.querySelector('.sv2-st'),sk=-1,svv=false,svT=null,DUR=3400,
      pinQ=function(){return !reduce&&innerWidth>900&&innerHeight>=640;},pinned=false;
    sv.style.setProperty('--dur',DUR+'ms');
    function svShow(k){if(k===sk)return;sk=k;sb.forEach(function(b,i){var on=i===k;b.classList.toggle('on',on);b.classList.toggle('done',i<k);b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;});
      ss.forEach(function(s,i){s.classList.toggle('on',i===k);});st.style.setProperty('--sc',sb[k].style.getPropertyValue('--c'));
      var l=sv.querySelector('.sv2-l');if(l.scrollWidth>l.clientWidth+4){var b=sb[k];l.scrollTo({left:b.offsetLeft-l.offsetLeft-8,behavior:'smooth'});}}
    function auto(k){clearTimeout(svT);sb.forEach(function(b){b.classList.remove('run');});if(pinned||reduce||!svv)return;void sb[k].offsetWidth;sb[k].classList.add('run');svT=setTimeout(function(){if(sv.classList.contains('hold')||document.hidden){auto(sk);return;}svShow((sk+1)%sb.length);auto(sk);},DUR);}
    function svSize(){pinned=pinQ();svSec.classList.toggle('pin',pinned);if(pinned){svSec.style.setProperty('--svh',Math.round(innerHeight+sb.length*innerHeight*.42)+'px');clearTimeout(svT);sb.forEach(function(b){b.classList.remove('run');});svScroll();}else{svSec.style.removeProperty('--svh');sb.forEach(function(b){b.style.removeProperty('--pp');});}}
    function svScroll(){if(!pinned)return;var r=svSec.getBoundingClientRect(),run=svSec.offsetHeight-innerHeight,p=run>0?Math.max(0,Math.min(.9999,-r.top/run)):0,f=p*sb.length,k=Math.floor(f);
      svShow(k);sb.forEach(function(b,i){b.style.setProperty('--pp',i<k?1:i===k?(f-k).toFixed(3):0);});}
    sb.forEach(function(b,i){b.addEventListener('click',function(){if(pinned){var run=svSec.offsetHeight-innerHeight,y=svSec.getBoundingClientRect().top+scrollY+run*(i+.5)/sb.length;if(window.__lenis&&window.__lenis.scrollTo)window.__lenis.scrollTo(y);else scrollTo({top:y,behavior:'smooth'});}else{svShow(i);auto(i);}});
      b.addEventListener('keydown',function(e){var d=e.key==='ArrowDown'||e.key==='ArrowRight'?1:e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();var n=(sk+d+sb.length)%sb.length;sb[n].click();sb[n].focus();}});});
    st.addEventListener('mouseenter',function(){sv.classList.add('hold');});st.addEventListener('mouseleave',function(){sv.classList.remove('hold');});
    inView(sv,function(v){var was=svv;svv=v;if(v&&!was)auto(sk);else if(!v)clearTimeout(svT);},.35);
    svShow(0);onS.push(svScroll);addEventListener('resize',svSize);svSize();}
  /* why: sideways scroll */
  var wy3=document.querySelector('.wy3'),wtr=$('wy3T'),wvw=$('wy3V');
  if(wy3&&wtr){var wcs=[].slice.call(wtr.children),wmq=matchMedia('(max-width:900px)'),wd=0;
    function wsize(){if(wmq.matches||reduce){wy3.style.removeProperty('--wyh');wd=0;wtr.style.setProperty('--wx',0);return;}
      wd=Math.max(0,wtr.scrollWidth-wvw.clientWidth);
      wy3.style.setProperty('--wyh',(innerHeight+wd*1.1)+'px');wscr();}
    function wact(k){$('wy3N').textContent=('0'+(k+1)).slice(-2);wcs.forEach(function(c,i){c.classList.toggle('dim',i<k);});}
    function wscr(){if(wmq.matches||reduce)return;var r=wy3.getBoundingClientRect(),run=wy3.offsetHeight-innerHeight,p=run>0?Math.max(0,Math.min(1,-r.top/run)):0;
      wtr.style.setProperty('--wx',(p*wd).toFixed(1));wy3.style.setProperty('--wp',p.toFixed(3));wact(Math.min(wcs.length-1,Math.round(p*(wcs.length-1))));}
    onS.push(wscr);addEventListener('resize',wsize);if(wmq.addEventListener)wmq.addEventListener('change',wsize);if(document.fonts)document.fonts.ready.then(wsize);wsize();
    if(wmq.matches||reduce){wvw.addEventListener('scroll',function(){var k=Math.round(wvw.scrollLeft/(wcs[0].offsetWidth+18));wy3.style.setProperty('--wp',(k/(wcs.length-1)).toFixed(3));$('wy3N').textContent=('0'+(Math.min(wcs.length,k+1))).slice(-2);},{passive:true});}}
  var lm2=$('locMap');if(lm2&&window.top===window.self){var f2=document.createElement('iframe');f2.title='Tiwaa Growth Labs on Google Maps';f2.loading='lazy';f2.referrerPolicy='no-referrer-when-downgrade';f2.src='https://www.google.com/maps?q=Spaze+I+Tech+Park,+Sector+49,+Sohna+Road,+Gurugram&z=16&output=embed';f2.addEventListener('load',function(){var fb=lm2.querySelector('.loc-fb');if(fb)fb.style.display='none';});lm2.insertBefore(f2,lm2.firstChild);}
  /* office form -> lead API (assets/js/leads.js) */
  var off=$('ofForm');
  if(off){var ofb=off.querySelector('button[type=submit]');
    [].forEach.call(off.querySelectorAll('input,textarea'),function(x){x.addEventListener('input',function(){x.classList.remove('bad');$('ofE').textContent='';});});
    off.addEventListener('submit',function(e){e.preventDefault();var n=$('ofN'),p=$('ofP'),er=$('ofE'),ok=$('ofOk');n.classList.remove('bad');p.classList.remove('bad');ok.hidden=true;
      if(n.value.trim().length<2){n.classList.add('bad');er.textContent='Please enter your name.';n.focus();return;}
      if(!/^[+\d][\d\s-]{7,}$/.test(p.value.trim())){p.classList.add('bad');er.textContent='Please enter a valid phone number, for example +91 98765 43210.';p.focus();return;}
      er.textContent='';if(!window.TGLLeads||ofb.disabled)return;
      window.TGLLeads.submit({form:'contact',cta:'About page: send us a message',name:n.value.trim(),phone:p.value.trim(),message:$('ofM').value.trim(),hp:($('ofHp')||{}).value||'',extra:{}},{button:ofb,err:er,ok:ok,form:off});});}
})();
