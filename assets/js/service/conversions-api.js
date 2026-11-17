/* Interactive parts of /services/conversions-api: hero event label, CAPI scroll story, pixel vs CAPI bars,
   CRM event stages, stats count-up, process steps, section menu, FAQ. Ported from the design artifact. */

(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  /* process pinned steps */
  var cards=[].slice.call(document.querySelectorAll('.sp-c')),dots=[].slice.call(document.querySelectorAll('.sp-dots li'));
  function proc(){var vh=innerHeight,k=-1;cards.forEach(function(c,i){var r=c.getBoundingClientRect();var on=r.top<vh*.62&&r.bottom>vh*.3;c.classList.toggle('on',on);if(r.top<vh*.62)k=i;});
    dots.forEach(function(d,i){d.classList.toggle('on',i<=k);});}
  addEventListener('scroll',proc,{passive:true});proc();if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',proc);
  if(matchMedia('(max-width:980px)').matches)cards.forEach(function(c){c.classList.add('on');});
  /* section menu spy */
  var mn=$('sxMenu'),ml=mn?[].slice.call(mn.querySelectorAll('a')):[],ms=ml.map(function(a){return document.querySelector(a.getAttribute('href'));}),mlast=-1;
  function mspy(){var k=-1;ms.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.4)k=i;});if(k!==mlast){mlast=k;ml.forEach(function(a,i){a.classList.toggle('on',i===k);});if(k>=0){var a=ml[k],t=a.parentNode;t.scrollTo({left:a.offsetLeft-t.clientWidth/2+a.clientWidth/2,behavior:'smooth'});}}}
  addEventListener('scroll',mspy,{passive:true});mspy();if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',mspy);
  /* CAPI hero event label */
  var cpe=$('cpEv');if(cpe&&!reduce){var EVN=['SiteVisit sent','Lead sent','QualifiedLead sent','Contact sent','Purchase sent'],ei=0;setInterval(function(){if(document.hidden)return;ei=(ei+1)%EVN.length;cpe.style.opacity=0;setTimeout(function(){cpe.textContent=EVN[ei];cpe.style.opacity=1;},300);},2600);}
  /* pixel vs capi */
  var sgb=$('sgBox');
  if(sgb){var sgr=[].slice.call(sgb.querySelectorAll('.sg')),sgt=[].slice.call(sgb.querySelectorAll('.sg-tg button')),sgm=0,sgs=false,sgv=false,sgst=false,
    INS=['With pixel only, Meta never sees a single site visit or booking, so it optimises for anyone who fills a form.','With CAPI, Meta sees almost every lead plus every stage your team updates, so it can find more buyers who actually visit.'],TT=[[72,0,0,0,0],[98,100,100,100,100]];
    function sgset(m){sgm=m;sgt.forEach(function(b,i){b.setAttribute('aria-selected',i===m);});sgr.forEach(function(r){var v=JSON.parse(r.dataset.v)[m];r.querySelector('s').style.width=v+'%';r.querySelector('b').textContent=v+'%';r.classList.toggle('zero',v===0);});
      $('sgT').textContent=m?'98':'72';var p=$('sgIns');p.style.opacity=0;setTimeout(function(){p.textContent=INS[m];p.style.opacity=1;},200);
      sgb.querySelector('.sg-sum span').textContent=m?'leads, plus every later stage':'leads, and no later stages';}
    sgt.forEach(function(b,i){b.addEventListener('click',function(){sgs=true;sgset(i);});});
    if(reduce)sgset(1);else if('IntersectionObserver' in window)new IntersectionObserver(function(e){sgv=e[0].isIntersecting;if(sgv&&!sgst){sgst=true;sgset(0);setTimeout(function(){if(!sgs)sgset(1);},1800);setInterval(function(){if(sgv&&!sgs&&!document.hidden)sgset(sgm?0:1);},4200);}},{threshold:.35}).observe(sgb);else sgset(1);}
  /* event stages */
  var evb=$('evBox');
  if(evb){var evbs=[].slice.call(evb.querySelectorAll('.ev-track button')),evps=[].slice.call(evb.querySelectorAll('.evp')),evk=0,evs=false,evv=false;
    function evset(k){evk=k;evbs.forEach(function(b,i){b.setAttribute('aria-selected',i===k);b.classList.toggle('done',i<k);b.tabIndex=i===k?0:-1;});evps.forEach(function(p,i){p.classList.toggle('on',i===k);});}
    evbs.forEach(function(b,i){b.addEventListener('click',function(){evs=true;evset(i);});b.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;if(d){e.preventDefault();evs=true;var n=(evk+d+5)%5;evset(n);evbs[n].focus();}});});
    evset(0);if(!reduce){if('IntersectionObserver' in window)new IntersectionObserver(function(e){evv=e[0].isIntersecting;},{threshold:.35}).observe(evb);setInterval(function(){if(evv&&!evs&&!document.hidden)evset((evk+1)%5);},3000);}}
  /* CAPI story */
  var cst=$('csStage'),css=[].slice.call(document.querySelectorAll('.cs-s')),cap=$('csCap'),cnt=document.querySelector('.mt-cnt'),csk=0;
  var CNT=['<em>1</em> lead received','<em>7</em> of 10 leads seen','<em>10</em> of 10 leads seen','Leads, <em>site visits</em> &amp; <em>bookings</em>','Learning from <em>real buyers</em>'];
  function csSet(k){if(k===csk)return;csk=k;cst.setAttribute('data-s',k);css.forEach(function(s,i){s.classList.toggle('on',i===k-1);});cap.textContent=css[k-1].querySelector('.cs-mcap').textContent;cnt.innerHTML=CNT[k-1];}
  function csScroll(){var line=innerHeight*(matchMedia('(max-width:980px)').matches?.72:.55),k=1;css.forEach(function(s,i){if(s.getBoundingClientRect().top<line)k=i+1;});csSet(k);}
  if(cst&&cap&&cnt&&css.length){csk=0;csSet(1);addEventListener('scroll',csScroll,{passive:true});addEventListener('resize',csScroll);csScroll();}
  /* stats count-up */
  [].forEach.call(document.querySelectorAll('.cpn'),function(el){var to=+el.dataset.a,done=false;if(reduce||!('IntersectionObserver' in window)){el.textContent=to;return;}
    new IntersectionObserver(function(es,o){if(!es[0].isIntersecting||done)return;done=true;o.disconnect();var t0=performance.now();(function st(t){var p=Math.min(1,(t-t0)/1400);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(st);})(t0);},{threshold:.5}).observe(el);});
  /* FAQ one at a time */
  var fq=$('sFaq');if(fq)[].forEach.call(fq.querySelectorAll('details'),function(d){d.addEventListener('toggle',function(){if(d.open)[].forEach.call(fq.querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});});});
})();
