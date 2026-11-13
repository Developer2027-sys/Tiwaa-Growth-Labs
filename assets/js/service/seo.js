/* Interactive parts of /services/... (seo): hero card, mockups, charts, FAQ. Ported from the design artifact. */

(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  function countUp(el,from,to,ms,fmt){var t0=performance.now();(function st(t){var p=Math.min(1,(t-t0)/ms),v=from+(to-from)*(1-Math.pow(1-p,3));el.textContent=fmt?fmt(v):Math.round(v);if(p<1)requestAnimationFrame(st);})(t0);}

  /* hero: a client's site climbs Google from #27 to #1, then gets cited in the AI Overview.
     The markup shows the finished state, so without JS (or with reduced motion) it still reads well. */
  var sx=$('sxr');
  if(sx&&!reduce){
    var list=$('sxrList'),me=list.querySelector('.me'),others=[].filter.call(list.children,function(x){return x!==me;}),
      q=$('sxrQ'),pos=$('sxrPos'),rank=$('sxrRank'),leads=$('sxrLeads'),dom=$('sxrDom'),title=$('sxrTitle'),
      ai=sx.querySelector('.sxr-ai'),rk=sx.querySelector('.sxr-rank');
    var SC=[
      {f:'YP',q:'3 bhk flats sector 65 gurugram',d:'yourproject.com › sector-65',t:'3 & 4 BHK Homes in Sector 65 | Your Project',l:[40,132]},
      {f:'SC',q:'best dentist in gurugram',d:'smileclinic.in › gurugram',t:'Painless Dental Care in Gurugram | Smile Clinic',l:[18,74]},
      {f:'BA',q:'ielts coaching near me',d:'brightacademy.in › ielts',t:'IELTS Coaching in Gurugram, Band 7+ | Bright Academy',l:[25,96]}
    ];
    var RANKS=[27,18,9,4,1],si=0,seen=true;
    function place(k){me.style.setProperty('--i',k);var j=0;others.forEach(function(o){if(j===k)j++;o.style.setProperty('--i',j);j++;});}
    function cycle(){
      if(!seen||document.hidden){setTimeout(cycle,700);return;}
      var s=SC[si++%SC.length];
      sx.classList.add('run');sx.classList.remove('won');ai.classList.remove('show');me.classList.remove('top');rk.classList.add('low');
      list.classList.add('hide');
      setTimeout(function(){
        place(4);me.querySelector('.fav').textContent=s.f;dom.textContent=s.d;title.textContent=s.t;pos.textContent=rank.textContent='#'+RANKS[0];leads.textContent=s.l[0];
        q.textContent='';var i=0;
        var iv=setInterval(function(){i++;q.textContent=s.q.slice(0,i);if(i<s.q.length)return;clearInterval(iv);
          setTimeout(function(){
            list.classList.remove('hide');
            [1,2,3,4].forEach(function(n){setTimeout(function(){
              place(4-n);pos.textContent=rank.textContent='#'+RANKS[n];
              if(n===4){me.classList.add('top');rk.classList.remove('low');sx.classList.add('won');ai.classList.add('show');countUp(leads,s.l[0],s.l[1],1200);}
            },600+n*850);});
            setTimeout(cycle,600+4*850+3800);
          },300);
        },45);
      },450);
    }
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){seen=es[0].isIntersecting;},{threshold:.2}).observe(sx);
    setTimeout(cycle,1000);
  }
  /* AI answer typing */
  var at=document.querySelector('.ai-t');
  if(at&&!reduce&&'IntersectionObserver' in window){var full=at.innerHTML;at.innerHTML='';var done=false;
    new IntersectionObserver(function(es,o){if(!es[0].isIntersecting||done)return;done=true;o.disconnect();var txt=full.replace(/<[^>]+>/g,''),i=0;
      var iv=setInterval(function(){i+=2;at.textContent=txt.slice(0,i);if(i>=txt.length){clearInterval(iv);at.innerHTML=full;}},22);},{threshold:.5}).observe(at);}
  /* process pinned steps */
  var cards=[].slice.call(document.querySelectorAll('.sp-c')),dots=[].slice.call(document.querySelectorAll('.sp-dots li'));
  function proc(){var vh=innerHeight,k=-1;cards.forEach(function(c,i){var r=c.getBoundingClientRect();var on=r.top<vh*.62&&r.bottom>vh*.3;c.classList.toggle('on',on);if(r.top<vh*.62)k=i;});
    dots.forEach(function(d,i){d.classList.toggle('on',i<=k);});}
  addEventListener('scroll',proc,{passive:true});proc();if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',proc);
  if(matchMedia('(max-width:980px)').matches)cards.forEach(function(c){c.classList.add('on');});
  /* results: draw the charts and count the numbers up when the cards come into view */
  var rg=$('rzGrid');
  function rzGo(){rg.classList.add('go');if(reduce)return;
    [].forEach.call(rg.querySelectorAll('.rz-n b[data-to]'),function(b){var d=b.dataset,dec=+(d.dec||0);
      countUp(b,0,+d.to,1600,function(v){return (d.pre||'')+v.toFixed(dec)+(d.suf||'');});});}
  if(rg){if('IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){rzGo();o.disconnect();}},{threshold:.25}).observe(rg);else rzGo();}
  /* section menu spy */
  var mn=$('sxMenu'),ml=mn?[].slice.call(mn.querySelectorAll('a')):[],ms=ml.map(function(a){return document.querySelector(a.getAttribute('href'));}),mlast=-1;
  function mspy(){var k=-1;ms.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.4)k=i;});if(k!==mlast){mlast=k;ml.forEach(function(a,i){a.classList.toggle('on',i===k);});if(k>=0){var a=ml[k],t=a.parentNode;t.scrollTo({left:a.offsetLeft-t.clientWidth/2+a.clientWidth/2,behavior:'smooth'});}}}
  addEventListener('scroll',mspy,{passive:true});mspy();if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',mspy);
  /* before/after search */
  var b2=$('ba2'),b2r=$('ba2R');if(b2&&b2r){b2r.addEventListener('input',function(){b2.style.setProperty('--x',b2r.value+'%');});
    if(!reduce&&'IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(!es[0].isIntersecting)return;o.disconnect();var t0=performance.now();
      (function st(t){var p=Math.min(1,(t-t0)/2200),v=50+Math.sin(p*Math.PI*2)*35*(1-p);b2.style.setProperty('--x',v+'%');b2r.value=v;if(p<1)requestAnimationFrame(st);})(t0);},{threshold:.6}).observe(b2);}
  /* draw charts on view */
  [['.fc'],['#vsChart']].forEach(function(x){var el=document.querySelector(x[0]);if(!el)return;if('IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){el.classList.add('go');o.disconnect();}},{threshold:.35}).observe(el);else el.classList.add('go');});
  /* FAQ one at a time */
  var fq=$('sFaq');if(fq)[].forEach.call(fq.querySelectorAll('details'),function(d){d.addEventListener('toggle',function(){if(d.open)[].forEach.call(fq.querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});});});
})();

