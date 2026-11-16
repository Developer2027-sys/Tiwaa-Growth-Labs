/* About page (/about): hero journey, growth loop, mission flow, principles scroller, platforms tabs, office map + form. Ported from the design artifact. */

(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  /* section menu spy */
  var mn=$('sxMenu'),ml=mn?[].slice.call(mn.querySelectorAll('a')):[],ms=ml.map(function(a){return document.querySelector(a.getAttribute('href'));}),mlast=-1;
  function mspy(){var k=-1;ms.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.4)k=i;});if(k!==mlast){mlast=k;ml.forEach(function(a,i){a.classList.toggle('on',i===k);});if(k>=0){var a=ml[k],t=a.parentNode;t.scrollTo({left:a.offsetLeft-t.clientWidth/2+a.clientWidth/2,behavior:'smooth'});}}}
  addEventListener('scroll',mspy,{passive:true});mspy();if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',mspy);
  /* about v2 */
  var aps=$('apSteps');
  if(aps){var lis=[].slice.call(aps.children),nds=[].slice.call(document.querySelectorAll('.apn')),prg=$('apPrg'),core=document.querySelector('.ap-core'),ak=-1,astop=false,av=false;
    function aset(k){if(k===ak)return;ak=k;lis.forEach(function(l,i){l.classList.toggle('on',i===k);});nds.forEach(function(n,i){n.classList.toggle('on',i===k);n.classList.toggle('done',i<k);});
      prg.style.strokeDashoffset=942*(1-(k+1)/6);$('apCoreN').textContent=('0'+(k+1)).slice(-2);$('apCoreT').textContent=lis[k].querySelector('b').textContent;core.classList.remove('sw');void core.offsetWidth;core.classList.add('sw');}
    lis.concat(nds).forEach(function(e){e.addEventListener('click',function(){astop=true;aset(+e.dataset.k);});});
    aset(0);if(!reduce){if('IntersectionObserver' in window)new IntersectionObserver(function(e){av=e[0].isIntersecting;},{threshold:.35}).observe(aps);setInterval(function(){if(av&&!astop&&!document.hidden)aset((ak+1)%6);},2400);}}
  var mf=document.querySelector('.mv2-flow');
  if(mf){var mfs=[].slice.call(mf.children),mi=0,mv=false;function mstep(){mfs.forEach(function(e,i){e.classList.toggle('on',i<=mi);});mi=(mi+1)%(mfs.length+3);}
    if(reduce)mfs.forEach(function(e){e.classList.add('on');});else{if('IntersectionObserver' in window)new IntersectionObserver(function(e){mv=e[0].isIntersecting;},{threshold:.4}).observe(mf);setInterval(function(){if(mv&&!document.hidden)mstep();},450);}}
  var pft=$('pfTabs');
  if(pft){var pbs=[].slice.call(pft.children),pps=[].slice.call(document.querySelectorAll('.pfp')),pk=0,pstop=false,pv=false;
    function pset(k){pk=k;pbs.forEach(function(b,i){b.setAttribute('aria-selected',i===k);});pps.forEach(function(p,i){p.hidden=i!==k;p.classList.toggle('on',i===k);});}
    pbs.forEach(function(b,i){b.addEventListener('click',function(){pstop=true;pset(i);});});
    if(!reduce){if('IntersectionObserver' in window)new IntersectionObserver(function(e){pv=e[0].isIntersecting;},{threshold:.3}).observe(pft);setInterval(function(){if(pv&&!pstop&&!document.hidden)pset((pk+1)%2);},9000);}}
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
  /* about page */
  var abv=$('abv');
  if(abv){var pth=abv.querySelector('.abv-l'),L=pth.getTotalLength();[].forEach.call(abv.querySelectorAll('.abv-m'),function(m){var pt=pth.getPointAtLength(L*+m.dataset.t);m.style.setProperty('--x',(pt.x/480*100)+'%');m.style.setProperty('--y',(22+pt.y/300*78)+'%');});
    var cb=abv.querySelector('.c1 b'),N=+cb.dataset.n;setTimeout(function(){var t0=performance.now();(function st(t){var p=Math.min(1,(t-t0)/1800);cb.textContent=Math.round(N*(1-Math.pow(1-p,3))).toLocaleString('en-IN');if(p<1)requestAnimationFrame(st);})(t0);},reduce?0:700);
    if(!reduce){var cs=[].slice.call(abv.querySelectorAll('.abv-c')),F=[-.06,.05,-.03];function par(){var y=Math.min(scrollY,600);cs.forEach(function(c,i){c.style.transform='translateY('+(y*F[i])+'px)';});}addEventListener('scroll',par,{passive:true});if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',par);
      setInterval(function(){if(document.hidden)return;N+=1+Math.floor(Math.random()*3);cb.textContent=N.toLocaleString('en-IN');},2000);}}
  var sb=$('stBig');
  if(sb){var HL=['change','that.','seconds,','enquiries,','bookings','sales.'];sb.innerHTML=sb.textContent.trim().split(/\s+/).map(function(w){return '<span class="w'+(HL.indexOf(w)>-1?' hl':'')+'">'+w+'</span> ';}).join('');
    var ws=[].slice.call(sb.querySelectorAll('.w'));
    function stp(){var r=sb.getBoundingClientRect(),vh=innerHeight,p=(vh*.78-r.top)/(r.height+vh*.25);p=Math.max(0,Math.min(1,p));var n=Math.round(p*ws.length);ws.forEach(function(w,i){w.classList.toggle('on',i<n);});}
    if(reduce)ws.forEach(function(w){w.classList.add('on');});else{addEventListener('scroll',stp,{passive:true});if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',stp);stp();}}
  var hzs=document.querySelector('.ab-hz'),hzt=$('hzTrack');
  if(hzs&&hzt){var hzc=[].slice.call(hzt.children);
    function hzSize(){if(innerWidth<=860){hzs.style.removeProperty('--hzh');hzt.style.transform='';return;}var dist=hzt.scrollWidth-innerWidth;hzs.style.setProperty('--hzh',Math.round(innerHeight+dist+innerHeight*.3));hzMove();}
    function hzMove(){if(innerWidth<=860)return;var r=hzs.getBoundingClientRect(),tot=hzs.offsetHeight-innerHeight,p=Math.max(0,Math.min(1,-r.top/Math.max(1,tot))),dist=hzt.scrollWidth-innerWidth;hzt.style.transform='translate3d('+(-dist*p)+'px,0,0)';
      $('hzBar').style.width=(p*100)+'%';var k=Math.min(hzc.length-1,Math.round(p*(hzc.length-1)));$('hzN').textContent=('0'+(k+1)).slice(-2);hzc.forEach(function(c,i){c.classList.toggle('on',i===k);});}
    addEventListener('resize',hzSize);addEventListener('load',hzSize);hzSize();addEventListener('scroll',hzMove,{passive:true});if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',hzMove);}
})();
