/* Interactive parts of /industries/real-estate: hero scene, journey, lead-to-visit flow, FAQ. Ported from the design artifact. */

(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  /* section menu spy */
  var mn=$('sxMenu'),ml=mn?[].slice.call(mn.querySelectorAll('a')):[],ms=ml.map(function(a){return document.querySelector(a.getAttribute('href'));}),mlast=-1;
  function mspy(){var k=-1;ms.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.4)k=i;});if(k!==mlast){mlast=k;ml.forEach(function(a,i){a.classList.toggle('on',i===k);});if(k>=0){var a=ml[k],t=a.parentNode;t.scrollTo({left:a.offsetLeft-t.clientWidth/2+a.clientWidth/2,behavior:'smooth'});}}}
  addEventListener('scroll',mspy,{passive:true});mspy();if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',mspy);
  /* real estate page */
  var rh=$('rh');
  if(rh){var sky=$('rhSky');
    [].forEach.call(sky.querySelectorAll('.bd'),function(b){var r=+b.dataset.r,c=+b.dataset.c;b.style.setProperty('--cols',c);for(var k=0;k<r*c;k++)b.appendChild(document.createElement('s'));});
    var wins=[].slice.call(sky.querySelectorAll('.bd s'));
    function rgo(){rh.classList.add('go');[].forEach.call(rh.querySelectorAll('.rfn b'),function(b){var n=+b.dataset.n,t0=performance.now();b._n=n;(function st(t){var p=Math.min(1,(t-t0)/1600),v=Math.round(n*(1-Math.pow(1-p,3)));b.textContent=fmtR(v);if(p<1)requestAnimationFrame(st);})(t0);});}
    function fmtR(v){return v>=100000?(v/100000).toFixed(1)+'L':v.toLocaleString('en-IN');}
    if(reduce){rgo();wins.forEach(function(w,i){if(i%3===0)w.classList.add('on');});}
    else{setTimeout(rgo,700);
      setInterval(function(){if(document.hidden)return;for(var k=0;k<3;k++){var w=wins[Math.floor(Math.random()*wins.length)];w.classList.toggle('on');}},420);
      var day=1;setInterval(function(){if(document.hidden)return;day=day%60+1;$('rhDay').textContent=day;},1500);
      var bs=[].slice.call(rh.querySelectorAll('.rfn b')),PIN=['+1 enquiry','+1 site visit','Booked ✓','+1 enquiry','NRI lead'];var pk=0;
      setInterval(function(){if(document.hidden)return;var bd=sky.querySelectorAll('.bd'),t=bd[Math.floor(Math.random()*bd.length)],img=rh.querySelector('.rh-img'),ir=img.getBoundingClientRect(),tr=t.getBoundingClientRect();
        var p=document.createElement('span');p.className='rh-pin';var lab=PIN[pk++%PIN.length];p.textContent=lab;p.style.left=(tr.left-ir.left+tr.width/2)+'px';p.style.top=Math.max(6,tr.top-ir.top-26)+'px';img.appendChild(p);setTimeout(function(){p.remove();},2500);
        var idx=lab.indexOf('enquiry')>-1||lab.indexOf('NRI')>-1?1:lab.indexOf('visit')>-1?2:3;var b=bs[idx];if(b._n){b._n+=1;b.textContent=fmtR(b._n);b.classList.add('bump');setTimeout(function(){b.classList.remove('bump');},400);}
        if(Math.random()<.5){bs[0]._n+=Math.floor(Math.random()*400);bs[0].textContent=fmtR(bs[0]._n);}},2200);
      var DS=['Sat, 11:00 AM · 3 BHK','Sun, 4:30 PM · 4 BHK','Sat, 12:30 PM · 3 BHK','Sun, 10:00 AM · Villa'],di=0,rc=rh.querySelector('.rc1');
      setInterval(function(){if(document.hidden)return;di=(di+1)%DS.length;$('rcT').textContent=DS[di];},8000);}}
  var jt=$('jrTabs');
  if(jt){var jbs=[].slice.call(jt.children),jps=[].slice.call(document.querySelectorAll('.jp')),jk=0,jstop=false,jv=false,bar=$('jrBar'),jtm;
    function jset(k){jk=k;jbs.forEach(function(b,i){b.setAttribute('aria-selected',i===k);b.classList.toggle('done',i<k);b.classList.remove('run');if(i===k&&!jstop&&!reduce){void b.offsetWidth;b.classList.add('run');}});jps.forEach(function(p,i){p.hidden=i!==k;});var ab=jbs[k];if(jt.scrollWidth>jt.clientWidth)jt.scrollTo({left:ab.offsetLeft-(jt.clientWidth-ab.clientWidth)/2,behavior:'smooth'});var jn=jps[k].querySelector('.jv-num');if(jn){var N=+jn.dataset.n,t0=performance.now();(function st(t){var q=Math.min(1,(t-t0)/1400);jn.textContent=Math.round(N*(1-Math.pow(1-q,3))).toLocaleString('en-IN');if(q<1)requestAnimationFrame(st);})(t0);}bar.classList.remove('run');void bar.offsetWidth;if(!jstop&&!reduce)bar.classList.add('run');}
    jbs.forEach(function(b,i){b.addEventListener('click',function(){jstop=true;clearInterval(jtm);jset(i);});});
    if(!reduce&&'IntersectionObserver' in window){new IntersectionObserver(function(e){jv=e[0].isIntersecting;if(jv&&!jstop&&!jtm){jset(jk);jtm=setInterval(function(){if(jv&&!jstop&&!document.hidden)jset((jk+1)%jbs.length);},5000);}},{threshold:.35}).observe(jt);}}
  /* lead flow timeline */
  var lf=$('lfFlow');
  if(lf){var lis=[].slice.call(lf.querySelectorAll('li')),ck=$('lfClock'),T=[0,5,40,180,600],k=-1,lv=false;
    function fmtT(v){return v<60?v+'s':v<3600?Math.floor(v/60)+'m':v<86400?Math.floor(v/3600)+'h':Math.floor(v/86400)+'d';}
    function step(){k++;if(k>lis.length+1){k=0;}lis.forEach(function(l,i){l.classList.toggle('on',i<=k&&k<lis.length+1);});
      if(k<lis.length){var from=k?T[k-1]:0,to=T[k],t0=performance.now();(function st(n){var p=Math.min(1,(n-t0)/700);ck.textContent=fmtT(Math.round(from+(to-from)*p));if(p<1)requestAnimationFrame(st);})(t0);}
      if(k===lis.length+1){lis.forEach(function(l){l.classList.remove('on');});ck.textContent='0s';}}
    if(reduce){lis.forEach(function(l){l.classList.add('on');});ck.textContent='4m';}
    else{if('IntersectionObserver' in window)new IntersectionObserver(function(es){lv=es[0].isIntersecting;},{threshold:.35}).observe(lf);else lv=true;
      setInterval(function(){if(lv&&!document.hidden)step();},1300);}}
  /* draw charts on view */
  [['.fc'],['#vsChart']].forEach(function(x){var el=document.querySelector(x[0]);if(!el)return;if('IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){el.classList.add('go');o.disconnect();}},{threshold:.35}).observe(el);else el.classList.add('go');});
  /* FAQ one at a time */
  var fq=$('sFaq');if(fq)[].forEach.call(fq.querySelectorAll('details'),function(d){d.addEventListener('toggle',function(){if(d.open)[].forEach.call(fq.querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});});});
})();
