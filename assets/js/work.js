/* Our Work page (/our-work): counters, filters, card tilt and the case study dialog. Shared behaviour lives in main.js. */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  function inView(el,cb,th){if(!el)return;if(!('IntersectionObserver' in window)){cb(true);return;}new IntersectionObserver(function(e){cb(e[0].isIntersecting);},{threshold:th||.3}).observe(el);}
  /* count up */
  [].forEach.call(document.querySelectorAll('.wk-cu'),function(el){var to=+el.dataset.to,done=false;
    function fmt(n){return Math.round(n).toLocaleString('en-IN');}
    if(reduce){el.textContent=fmt(to);return;}
    el.textContent='0'; // real number is in the HTML for search engines and no-JS visitors
    inView(el,function(v){if(!v||done)return;done=true;var t0=performance.now();(function st(t){var p=Math.min(1,(t-t0)/1600);el.textContent=fmt(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(st);})(t0);},.6);});
  /* hero deck */
  var deck=$('wkDeck');
  if(deck){var dks=[].slice.call(deck.querySelectorAll('.wk-dk')),di=0,dv=true;
    function dset(){dks.forEach(function(d,i){d.dataset.p=(i-di+dks.length)%dks.length;});$('wkDkN').textContent='0'+(di+1);$('wkDkB').style.width=((di+1)/dks.length*100)+'%';}
    dset();
    if(!reduce){inView(deck,function(v){dv=v;},.2);
      setInterval(function(){if(!dv||document.hidden)return;var cur=dks[di];cur.classList.add('out');
        setTimeout(function(){cur.classList.remove('out');},700);di=(di+1)%dks.length;dset();},3600);
      deck.addEventListener('mousemove',function(e){var r=deck.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;deck.style.transform='rotateY('+(x*8)+'deg) rotateX('+(-y*6)+'deg)';});
      deck.addEventListener('mouseleave',function(){deck.style.transform='';});deck.style.transition='transform .4s';}}
  /* filters */
  var grid=$('wkGrid'),cs=[].slice.call(grid.querySelectorAll('.wk-c')),fb=[].slice.call(document.querySelectorAll('.wk-f'));
  fb.forEach(function(b){b.addEventListener('click',function(){var f=b.dataset.f;fb.forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on);});
    var k=0;cs.forEach(function(c){var show=f==='all'||(' '+c.dataset.cat+' ').indexOf(' '+f+' ')>-1;c.classList.toggle('hide',!show);c.classList.remove('wk-pop');
      if(show){c.classList.add('in');void c.offsetWidth;c.style.animationDelay=(k++*60)+'ms';c.classList.add('wk-pop');}});});});
  /* card tilt */
  if(!reduce&&matchMedia('(hover:hover)').matches)cs.forEach(function(c){var b=c.querySelector('.wk-cb');
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*6+'deg');b.style.setProperty('--rx',(-(e.clientY-r.top)/r.height+.5)*6+'deg');});
    b.addEventListener('mouseleave',function(){b.style.setProperty('--ry','0deg');b.style.setProperty('--rx','0deg');});});
  /* modal */
  var D=JSON.parse($('wkData').textContent),md=$('wkMd'),mi=0,last=null;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function fill(i){mi=(i+D.length)%D.length;var d=D[mi],p=md.querySelector('.md-p');p.style.setProperty('--c1',d.c1);p.style.setProperty('--c2',d.c2);
    $('mdK').textContent=d.k+' · '+d.wk;$('mdT').textContent=d.t;$('mdL').textContent=d.loc+' · '+d.ty;$('mdC').textContent=d.ch;
    $('mdD').innerHTML=d.did.map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
    $('mdR').innerHTML=d.res.map(function(x){return '<div><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>';}).join('');
    $('mdG').innerHTML=d.tags.map(function(x){return '<i>'+esc(x)+'</i>';}).join('');p.scrollTop=0;}
  function open(i){last=document.activeElement;fill(i);md.hidden=false;document.documentElement.classList.add('wk-lock');if(window.__lenis&&window.__lenis.stop)window.__lenis.stop();md.querySelector('.md-p').focus();}
  function close(){md.hidden=true;document.documentElement.classList.remove('wk-lock');if(window.__lenis&&window.__lenis.start)window.__lenis.start();if(last&&last.focus)last.focus();}
  cs.forEach(function(c){var b=c.querySelector('.wk-cb');b.addEventListener('click',function(){open(+b.dataset.case);});});
  [].forEach.call(document.querySelectorAll('[data-open]'),function(b){b.addEventListener('click',function(){open(+b.dataset.open);});});
  /* featured parallax */
  var fw=document.querySelector('.wk-fw');if(fw&&!reduce&&matchMedia('(hover:hover)').matches){fw.addEventListener('mousemove',function(e){var r=fw.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;fw.style.setProperty('--px',x.toFixed(3));fw.style.setProperty('--py',y.toFixed(3));});fw.addEventListener('mouseleave',function(){fw.style.setProperty('--px',0);fw.style.setProperty('--py',0);});}
  [].forEach.call(md.querySelectorAll('[data-close]'),function(x){x.addEventListener('click',close);});
  $('mdPv').addEventListener('click',function(){fill(mi-1);});$('mdNx').addEventListener('click',function(){fill(mi+1);});
  document.addEventListener('keydown',function(e){if(md.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')fill(mi+1);else if(e.key==='ArrowLeft')fill(mi-1);
    else if(e.key==='Tab'){var f=[].slice.call(md.querySelectorAll('button,a[href]')).filter(function(x){return x.offsetParent;});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
  /* launch player */
  var LP=$('wkLp');
  if(LP){var L=[60,95,140,210,320,280,240,250,230,215,205,195],V=[0,2,6,14,32,30,28,31,30,29,30,30],BK=[0,0,0,2,5,4,5,6,5,6,6,7],SP=[0.3,0.4,0.5,0.8,1.6,1.4,1.3,1.4,1.3,1.2,1.2,1.2],
      N=['Teaser film and EOI page go live. First buyers register interest.','EOI ads widen to NRI audiences in Dubai and London.','Price reveal Reel. EOI list crosses 400.','Launch week: Meta, Google and YouTube go live together.','Peak week: 320 leads, every one called within minutes through LeadsPulse.','Weak ad sets are paused. Budget moves to the walkthrough Reel.','Weekend site-visit drive with cab pickups.','Google Search adds locality keywords for late searchers.','A second walkthrough film for the 4 BHK.','WhatsApp reminders cut visit no-shows.','Channel partner push for the remaining 3 BHK units.','Week 12: budget now sits behind the two Reels and the Google campaign with the lowest cost per site visit.'];
    var mx=Math.max.apply(null,L),bars=$('lpBars'),R=$('lpR'),pl=$('lpPlay'),tm=null,lpDone=false;
    bars.innerHTML=L.map(function(v){return '<i style="--h:'+(v/mx*100)+'%"></i>';}).join('');var bi=[].slice.call(bars.children);
    function sum(a,w){var s=0;for(var i=0;i<w;i++)s+=a[i];return s;}
    function draw(w){bi.forEach(function(b,i){b.classList.toggle('off',i>=w);b.classList.toggle('cur',i===w-1);});
      var vm=40,pts=[];for(var i=0;i<w;i++){pts.push(((i+.5)/12*1200).toFixed(1)+' '+(260-V[i]/vm*240).toFixed(1));}
      $('lpPath').setAttribute('d',pts.length?'M'+pts.join(' L'):'');
      var l=sum(L,w),v=sum(V,w),sp=sum(SP,w)*100000;$('lpL').textContent=l.toLocaleString('en-IN');$('lpV').textContent=v;$('lpB').textContent=sum(BK,w);
      $('lpC').textContent=v?'₹'+(Math.round(sp/v/100)*100).toLocaleString('en-IN'):'–';
      $('lpW').textContent='Week '+w;$('lpNote').textContent='Week '+w+': '+N[w-1].replace(/^Week 12: /,'');R.setAttribute('aria-valuetext','Week '+w);}
    function stop(){clearInterval(tm);tm=null;pl.classList.remove('on');pl.innerHTML='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';pl.setAttribute('aria-label','Play the 12 weeks');}
    function play(){if(tm){stop();return;}var w=+R.value>=12?0:+R.value;pl.classList.add('on');pl.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';pl.setAttribute('aria-label','Pause');
      tm=setInterval(function(){w++;R.value=w;draw(w);if(w>=12)stop();},700);}
    R.addEventListener('input',function(){stop();draw(+R.value);});pl.addEventListener('click',play);
    draw(12);if(!reduce)inView(LP,function(v){if(v&&!lpDone){lpDone=true;R.value=1;draw(1);setTimeout(play,500);}},.45);}
  /* creative rail drag */
  var rl=$('wkRl');
  if(rl){var dn=false,sx=0,sl=0,moved=false,auto=!reduce,rv=false;
    rl.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;dn=true;moved=false;sx=e.clientX;sl=rl.scrollLeft;rl.classList.add('drag');});
    addEventListener('pointermove',function(e){if(!dn)return;var dx=e.clientX-sx;if(Math.abs(dx)>4)moved=true;rl.scrollLeft=sl-dx;});
    addEventListener('pointerup',function(){dn=false;rl.classList.remove('drag');});
    rl.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){rl.scrollBy({left:260,behavior:'smooth'});}else if(e.key==='ArrowLeft'){rl.scrollBy({left:-260,behavior:'smooth'});}});
    ['pointerdown','wheel','touchstart','keydown'].forEach(function(ev){rl.addEventListener(ev,function(){auto=false;},{passive:true});});
    inView(rl,function(v){rv=v;},.2);
    (function drift(){if(auto&&rv&&!dn&&!document.hidden){if(rl.scrollLeft>=rl.scrollWidth-rl.clientWidth-1)auto=false;else rl.scrollLeft+=0.5;}requestAnimationFrame(drift);})();}

})();
