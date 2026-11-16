/* Tiwaa Growth Labs: shared site interactions (theme, nav, hero, ROI calculator, carousels, popup, booking). */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, root=document.documentElement;
  // Performance: know which heavy parts are on screen; pause everything that isn't
  var visIO=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){e.target._vis=e.isIntersecting;if(e.target.dataset.pause!==undefined)e.target.classList.toggle('is-off',!e.isIntersecting);});},{rootMargin:'120px 0px'}):null;
  function track(el,pause){if(!el)return;if(!visIO){el._vis=true;return;}if(pause)el.dataset.pause='';visIO.observe(el);}
  ['.hero','.logo-band','#about','.vault-in','#process','.why','#roi','#clients','#work'].forEach(function(q){track(document.querySelector(q),true);});
  ['reach','whyRail','jyTrack','feed'].forEach(function(id){track(document.getElementById(id));});
  function $(id){return document.getElementById(id);}
  function inr(n){return '₹'+Math.round(n).toLocaleString('en-IN');}
  function num(n){return Math.round(n).toLocaleString('en-IN');}

  // Smooth, eased page scrolling (falls back to native scrolling if the library can't load)
  if(window.Lenis && !reduce){
    var lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));},smoothWheel:true,touchMultiplier:1.4});
    window.__lenis=lenis;
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf);})(performance.now());
    document.addEventListener('click',function(e){
      if(e.defaultPrevented)return;
      var a=e.target.closest&&e.target.closest('a[href^="#"]'); if(!a)return;
      var id=a.getAttribute('href'); if(id.length<2)return; if(id==='#contact'&&!a.closest('nav.main')&&!a.closest('footer'))return;
      var t=id==='#top'?document.body:document.querySelector(id); if(!t)return;
      e.preventDefault(); if(window.__pipeFinish&&id!=='#top'&&id!=='#about'&&id!=='#services')window.__pipeFinish();
      lenis.scrollTo(id==='#top'?0:t,{offset:-(document.querySelector('header.site').offsetHeight+10),duration:1.4});
    });
  }

  // Theme toggle
  var dm=matchMedia('(prefers-color-scheme: dark)');
  try{var saved=localStorage.getItem('tgl-theme'); if(saved) root.setAttribute('data-mode',saved);}catch(e){}
  function curMode(){var m=root.getAttribute('data-mode')||root.getAttribute('data-theme');return m==='dark'||m==='light'?m:(dm.matches?'dark':'light');}
  $('themeBtn').addEventListener('click',function(){
    var next=curMode()==='dark'?'light':'dark';
    root.setAttribute('data-mode',next); try{localStorage.setItem('tgl-theme',next);}catch(e){}
    if(window.__drawRoi) window.__drawRoi(); if(window.__reachTheme) window.__reachTheme();
  });

  // Mobile menu
  var btn=$('menuBtn'), nav=$('nav');
  btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o);});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');btn.setAttribute('aria-expanded','false');}});

  // Scroll progress + active nav
  var bar=$('progress'), links=[].slice.call(document.querySelectorAll('nav.main a.nv-top')), secs=links.map(function(a){var h=a.getAttribute('href')||'';return h.charAt(0)==='#'&&h.length>1?document.querySelector(h):null;});
  function onScroll(){var h=root.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?scrollY/h:0)+')';
    var idx=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.35)idx=i;});links.forEach(function(a,i){a.classList.toggle('on',i===idx);});}
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Hero rotating audience
  var swap=($('swap')||{}).firstElementChild, aud=['Real Estate Developers','Builders','Channel Partners','Property Brokers'], ai=0;
  if(false) setInterval(function(){swap.classList.add('out');setTimeout(function(){ai=(ai+1)%aud.length;swap.textContent=aud[ai];swap.classList.remove('out');},350);},2600);

  // Brands (stand-in wordmarks until real logos are supplied)
  var BR=[['Godrej Properties','a','re'],['Emaar','e','re'],['Shapoorji Pallonji','b','re'],['SOBHA','c','re'],['Brigade','d','re'],['Provident','f','re'],['Central Park','b','re'],['Capital Avenue','a','re'],['Nanded City','e','re'],
          ['Hotel RR Galaxy','f','hos'],['Dreamland Realtors','d','re'],['My Wear Hub','d','ret'],['Printek','a','ret'],['ShipKaro','d','b2b'],['BVEG','f','ret']];
  function wm(b){return '<span class="wm '+b[1]+'">'+b[0]+'</span>';}
  var half=Math.ceil(BR.length/2), r1=BR.slice(0,half).map(function(b){return '<li>'+wm(b)+'</li>';}).join(''), r2=BR.slice(half).concat(BR.slice(0,3)).map(function(b){return '<li>'+wm(b)+'</li>';}).join('');
  if($('lbRow1'))$('lbRow1').innerHTML=r1+r1+r1.replace(/<li>/g,'<li aria-hidden="true">')+r1.replace(/<li>/g,'<li aria-hidden="true">');
  if($('lbRow2'))$('lbRow2').innerHTML=r2+r2+r2.replace(/<li>/g,'<li aria-hidden="true">')+r2.replace(/<li>/g,'<li aria-hidden="true">');
  [$('lbRow1'),$('lbRow2')].forEach(function(ul){if(!ul)return;[].forEach.call(ul.children,function(li,i){if(i>=ul.children.length/2)li.setAttribute('aria-hidden','true');});});

  var CAT={all:'All',re:'Real Estate',hos:'Hospitality & Lifestyle',ret:'Retail & D2C',b2b:'Logistics & B2B'};
  var tabs=$('btabs'), grid=$('bgrid');
  if(tabs&&grid){Object.keys(CAT).forEach(function(k,i){var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=CAT[k];b.dataset.k=k;b.setAttribute('aria-selected',i===0);tabs.appendChild(b);});
  function showBrands(k){
    var list=BR.filter(function(b){return k==='all'||b[2]===k;}), cols=innerWidth<=480?2:innerWidth<=900?3:6, html='';
    list.forEach(function(b,i){html+='<div class="bcell" style="--i:'+i+'"><div>'+wm(b)+'<small>'+CAT[b[2]]+'</small></div></div>';});
    if(k==='all')html+='<a class="bcell bmore" href="#contact" data-cta="Become our next success story" style="--i:'+list.length+'"><div><span class="bm-n">75+</span><small>more brands across India</small><span class="bm-go">Be our next story →</span></div></a>';
    grid.innerHTML=html;
  }
  tabs.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;[].forEach.call(tabs.children,function(x){x.setAttribute('aria-selected',x===b);});showBrands(b.dataset.k);});
  showBrands('all');}

  // Count-up numbers
  function fmtN(v){return Math.round(v).toLocaleString('en-IN');}
  function countUp(el){var n=+el.dataset.count,s=el.dataset.suffix||'',t0=performance.now();
    (function tick(t){var k=Math.min(1,(t-t0)/1800);el.textContent=fmtN(n*(1-Math.pow(1-k,4)))+s;if(k<1)requestAnimationFrame(tick);else goLive(el);})(t0);}
  // after the count-up, keep the number running so it reads as live
  function goLive(el){if(!el.dataset.live||el._live||reduce)return;el._live=1;var v=+el.dataset.count,s=el.dataset.suffix||'',max=+el.dataset.live,ev=+el.dataset.every;
    setInterval(function(){v+=1+Math.floor(Math.random()*max);el.textContent=fmtN(v)+s;el.classList.remove('tickup');void el.offsetWidth;el.classList.add('tickup');},ev);}

  // Reveal on scroll (content stays visible if JS or observers are unavailable)
  if('IntersectionObserver' in window && !reduce){
    var vh=innerHeight;
    // entrance variants for service pages: tag blocks that have no reveal yet and give grids a stagger
    (function(){function tag(sel,v,stag){document.querySelectorAll(sel).forEach(function(el,i){if(el.closest('[aria-hidden="true"] .rv'))return;el.classList.add('rv');if(v)el.classList.add(v);if(stag)el.style.setProperty('--d',i%stag);});}
      tag('.sx-hero-in > :last-child','rv-z');
      tag('.fmt > .hold, .sx-ai-in > .lf2, .st-in > .st-card, .cal-in > .smcal, .fc > .fc-vis','rv-r');
      tag('.fc > .fc-story','rv-l');
      tag('.jn','rv-z');
      tag('.fc-kpi > div',null,3);tag('.cr > .cr-c',null,2);tag('.sfaq > details',null,4);tag('.jn-steps > li',null,4);
      tag('.fmt-tabs > button',null,5);tag('.sx-tools > span','rv-f',6);
      ['.ss-grid','.mo-grid','.si-grid','.rl-grid','.sw-grid','.wk-grid','.pb'].forEach(function(g){document.querySelectorAll(g).forEach(function(w){[].forEach.call(w.children,function(c,i){if(c.classList.contains('rv'))c.style.setProperty('--d',i%4);});});});
    })();
    var first=[];document.querySelectorAll('.rv').forEach(function(el){if(el.getBoundingClientRect().top<vh)first.push(el);});
    requestAnimationFrame(function(){requestAnimationFrame(function(){first.forEach(function(el){el.classList.add('in');});});});
    root.classList.add('anim');
    var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target);}});},{threshold:.1,rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.rv:not(.in)').forEach(function(el){ro.observe(el);});
    document.addEventListener('transitionend',function(e){var t=e.target;if(t.classList&&t.classList.contains('rv')&&t.classList.contains('in')&&e.propertyName==='transform'){t.classList.remove('rv','in');}});
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){co.unobserve(e.target);countUp(e.target);}});},{threshold:.4});
    document.querySelectorAll('[data-count]').forEach(function(el){el.textContent='0'+(el.dataset.suffix||'');co.observe(el);});
  }

  // Autopilot phone feed
  (function(){
    if(!$('feed'))return;var list=$('feed'),cnt=$('avCount'),kt=$('kTasks'),n=128,k=1284,ti=0;
    var IC={lead:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',wa:'<path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.2-4.6A9 9 0 1 1 21 12z"/>',
      post:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>',seo:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
      bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>',ad:'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',web:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18"/>'};
    var T=[['lead','New lead from Google Ads','Added to CRM and assigned'],['wa','WhatsApp auto-reply','Brochure sent in 12 seconds'],['post','Instagram reel','Scheduled for 6:00 PM'],
      ['seo','SEO report ready','Weekly rankings emailed'],['bell','Follow-up reminders','Sent to 24 warm leads'],['ad','Ad budget optimised','₹2,000 moved to best ad'],['web','Website enquiry','Callback booked for 4 PM']];
    function row(t,done){var li=document.createElement('li');li.className=done?'done':'run';
      li.innerHTML='<span class="fi"><svg viewBox="0 0 24 24">'+IC[t[0]]+'</svg></span><span class="ft"><b>'+t[1]+'</b><small>'+t[2]+'</small></span><span class="fs"></span>';return li;}
    for(var i=0;i<5;i++) list.appendChild(row(T[i],true));
    ti=5;
    function next(){if(list._vis===false)return;var li=row(T[ti%T.length],false);ti++;list.insertBefore(li,list.firstChild);
      while(list.children.length>6)list.removeChild(list.lastChild);
      setTimeout(function(){li.className='done';n++;k++;cnt.textContent=n;kt.textContent=num(k);cnt.classList.remove('bump');void cnt.offsetWidth;cnt.classList.add('bump');},1300);}
    if(!reduce)setInterval(next,2600);
  })();

  // Top funnel: interactive reach simulator (toggle channels, watch the audience light up)
  (function(){
    var P={"google": ["4285F4", "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"], "instagram": ["E4405F", "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"], "youtube": ["FF0000", "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"], "facebook": ["0866FF", "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"], "whatsapp": ["25D366", "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"], "googleads": ["4285F4", "M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998zm19.4643-6.0004L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644zM7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z"], "googlemaps": ["4285F4", "M19.527 4.799c1.212 2.608.937 5.678-.405 8.173-1.101 2.047-2.744 3.74-4.098 5.614-.619.858-1.244 1.75-1.669 2.727-.141.325-.263.658-.383.992-.121.333-.224.673-.34 1.008-.109.314-.236.684-.627.687h-.007c-.466-.001-.579-.53-.695-.887-.284-.874-.581-1.713-1.019-2.525-.51-.944-1.145-1.817-1.79-2.671L19.527 4.799zM8.545 7.705l-3.959 4.707c.724 1.54 1.821 2.863 2.871 4.18.247.31.494.622.737.936l4.984-5.925-.029.01c-1.741.601-3.691-.291-4.392-1.987a3.377 3.377 0 0 1-.209-.716c-.063-.437-.077-.761-.004-1.198l.001-.007zM5.492 3.149l-.003.004c-1.947 2.466-2.281 5.88-1.117 8.77l4.785-5.689-.058-.05-3.607-3.035zM14.661.436l-3.838 4.563a.295.295 0 0 1 .027-.01c1.6-.551 3.403.15 4.22 1.626.176.319.323.683.377 1.045.068.446.085.773.012 1.22l-.003.016 3.836-4.561A8.382 8.382 0 0 0 14.67.439l-.009-.003zM9.466 5.868L14.162.285l-.047-.012A8.31 8.31 0 0 0 11.986 0a8.439 8.439 0 0 0-6.169 2.766l-.016.018 3.665 3.084z"], "gmail": ["EA4335", "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"]};
    if(!$('reach'))return;var CH=[['google','Google Search',48000,'#4285F4',-90],['instagram','Instagram',62000,'#E4405F',-10],['youtube','YouTube',35000,'#FF0000',70],['facebook','Facebook',41000,'#1877F2',150],['googlemaps','Google Maps',18000,'#34A853',215]];
    var box=$('reach'), cv=$('reachCv'), ctx=cv.getContext('2d'), wrap=$('reachCh'), out=$('reachN'), on={google:1,instagram:1}, touched=false;
    CH.forEach(function(c){var a=c[4]*Math.PI/180,b=document.createElement('button');b.type='button';b.className='rch';b.style.setProperty('--c',c[3]);
      b.style.left=(50+46*Math.cos(a))+'%';b.style.top=(50+46*Math.sin(a))+'%';b.setAttribute('aria-pressed',!!on[c[0]]);b.dataset.k=c[0];
      b.innerHTML='<i><svg viewBox="0 0 24 24" fill="'+c[3]+'"><path d="'+P[c[0]][1]+'"/></svg></i><span class="lb">'+c[1]+'</span>';
      b.addEventListener('click',function(){touched=true;toggle(c[0]);});wrap.appendChild(b);});
    function toggle(k){on[k]=!on[k];if(!Object.keys(on).some(function(x){return on[x];}))on[k]=1;
      [].forEach.call(wrap.children,function(b){b.setAttribute('aria-pressed',!!on[b.dataset.k]);});ripples.push({t:0,c:CH.filter(function(c){return c[0]===k;})[0][3]});}
    var dots=[],W=0,H=0,dpr=1,ripples=[],shown=0;
    function build(){var r=box.getBoundingClientRect();dpr=Math.min(1.5,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      dots=[];if(W<40||H<40)return;var R=W*.41,step=W/30;for(var y=-R;y<=R;y+=step)for(var x=-R;x<=R;x+=step){var d=Math.hypot(x,y);if(d<R&&d>W*.19){var ch=CH[Math.floor(Math.random()*CH.length)];dots.push({x:W/2+x,y:H/2+y,d:d,ch:ch[0],col:ch[3],a:0,s:Math.random()});}}}
    build(); if(window.ResizeObserver) new ResizeObserver(build).observe(box);
    function off(){return getComputedStyle(document.documentElement).getPropertyValue('--x-line').trim()||'#D2D2D7';}
    var offCol=off(), last=performance.now(), rippleT=0;
    function frame(t){
      var dt=Math.min(50,t-last);last=t;rippleT+=dt;
      if(!W||!box._vis){requestAnimationFrame(frame);return;}
      if(rippleT>1300){rippleT=0;var act=CH.filter(function(c){return on[c[0]];});if(act.length)ripples.push({t:0,c:act[Math.floor(Math.random()*act.length)][3]});}
      ctx.clearRect(0,0,W,H);
      ripples.forEach(function(r){r.t+=dt/2200;var rad=W*.17+r.t*W*.3;ctx.beginPath();ctx.arc(W/2,H/2,rad,0,7);ctx.strokeStyle=r.c;ctx.globalAlpha=Math.max(0,.55*(1-r.t));ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;});
      ripples=ripples.filter(function(r){return r.t<1;});
      var total=0;
      dots.forEach(function(p){var target=on[p.ch]?1:0;p.a+=(target-p.a)*Math.min(1,dt/(220+p.d*1.4));
        ctx.beginPath();ctx.arc(p.x,p.y,W/150+p.a*W/260,0,7);ctx.fillStyle=offCol;ctx.fill();
        if(p.a>.02){ctx.globalAlpha=p.a;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,W/150+p.a*W/260+(Math.sin(t/400+p.s*6)*.6),0,7);ctx.fill();ctx.globalAlpha=1;}});
      CH.forEach(function(c){if(on[c[0]])total+=c[2];});
      shown+=(total-shown)*Math.min(1,dt/350); out.textContent=Math.round(shown).toLocaleString('en-IN');
      requestAnimationFrame(frame);
    }
    if(reduce){on={google:1,instagram:1,youtube:1,facebook:1,googlemaps:1};[].forEach.call(wrap.children,function(b){b.setAttribute('aria-pressed','true');});
      dots.forEach(function(p){p.a=1;});var tot=0;CH.forEach(function(c){tot+=c[2];});shown=tot;}
    requestAnimationFrame(frame);
    window.__reachTheme=function(){offCol=off();};
    // demo the toggles until the visitor tries it
    var order=['youtube','facebook','googlemaps','instagram','youtube','facebook','googlemaps','instagram'],oi=0;
    if(!reduce) setInterval(function(){if(touched)return;toggle(order[oi%order.length]);oi++;},2400);
  })();

  // Mid funnel: interactive WhatsApp AI assistant
  (function(){
    if(!$('waBody'))return;var body=$('waBody'), qr=$('waQr'), timer=null;
    var F={
      start:{bot:['Hi! Thanks for checking out Skyline Homes, Sector 65. What are you looking for?'],opts:[['3 BHK','bhk3'],['4 BHK','bhk4'],['Just exploring','explore']]},
      bhk3:{bot:['Great choice. 3 BHK homes start at ₹2.4 Cr with possession in 2027.','Would you like the brochure or a site visit?'],opts:[['Send brochure','bro'],['Book a site visit','visit']]},
      bhk4:{bot:['Our 4 BHK sky villas start at ₹3.6 Cr, with private decks.','Would you like the brochure or a site visit?'],opts:[['Send brochure','bro'],['Book a site visit','visit']]},
      explore:{bot:['No problem. Here is a 60-second walkthrough video of the project.','Want me to share prices too?'],opts:[['Yes, share prices','bhk3'],['Book a site visit','visit']]},
      bro:{bot:['Brochure sent. It has floor plans, price list and payment plans.'],sys:'Lead scored HOT · added to CRM',opts:[['Book a site visit','visit'],['Restart demo','start']]},
      visit:{bot:['Done! Your site visit is booked for Sunday, 11:00 AM. Our advisor Priya will call you to confirm.'],sys:'Site visit booked · sales team notified',opts:[['Restart demo','start']]}};
    function now(){var d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}
    function add(cls,txt){var m=document.createElement('div');m.className='wm-b '+cls;m.textContent=txt;if(cls!=='sys'){var s=document.createElement('small');s.textContent=now()+(cls==='me'?' ✓✓':'');m.appendChild(s);}
      body.appendChild(m);while(body.children.length>7)body.removeChild(body.firstChild);}
    function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}
    var busy=false;
    async function go(key,label){
      if(busy)return;busy=true;clearTimeout(timer);qr.innerHTML='';
      if(key==='start'&&label){body.innerHTML='';}
      if(label&&key!=='start')add('me',label);
      var st=F[key];
      for(var i=0;i<st.bot.length;i++){var ty=document.createElement('div');ty.className='wm-typing';ty.innerHTML='<i></i><i></i><i></i>';body.appendChild(ty);await wait(reduce?0:850);ty.remove();add('bot',st.bot[i]);await wait(reduce?0:250);}
      if(st.sys){await wait(300);add('sys',st.sys);}
      st.opts.forEach(function(o,j){var b=document.createElement('button');b.type='button';b.textContent=o[0];b.style.animationDelay=(j*80)+'ms';if(j===0)b.classList.add('auto');
        b.addEventListener('click',function(){userTouched=true;busy=false;go(o[1],o[0]);});qr.appendChild(b);});
      busy=false;
      if(!reduce) timer=setTimeout(function(){var f=qr.querySelector('button');if(f&&isVisible())f.click();else timer=setTimeout(arguments.callee,1500);},userTouched?9000:3600);
    }
    var userTouched=false;
    function isVisible(){var r=body.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
    go('start');
  })();

  // Mid funnel: nurture journey (a lead travels from ad to enquiry)
  (function(){
    if(!$('jyTrack'))return;var track=$('jyTrack'), nodes=[].slice.call(track.querySelectorAll('.jy-node')), fill=$('jyFill'), dot=$('jyDot'), nums=nodes.map(function(n){return n.querySelector('.n');}), base=nums.map(function(n){return +n.dataset.v;});
    var p=0, speed=1/5200, last=performance.now(), hold=0;
    function vertical(){return innerWidth<=640;}
    function place(){
      var a=nodes[0].querySelector('.jy-ic').getBoundingClientRect(), b=nodes[nodes.length-1].querySelector('.jy-ic').getBoundingClientRect(), t=track.getBoundingClientRect();
      if(vertical()){var y0=a.top+a.height/2-t.top,y1=b.top+b.height/2-t.top,y=y0+(y1-y0)*p;dot.style.top=y+'px';dot.style.left='';fill.style.height=(p*100)+'%';fill.style.width='';}
      else{var x0=a.left+a.width/2-t.left,x1=b.left+b.width/2-t.left;dot.style.left=(x0+(x1-x0)*p)+'px';dot.style.top='';fill.style.width=(p*100)+'%';fill.style.height='';}
      nodes.forEach(function(n,i){n.classList.toggle('on',p>=i/(nodes.length-1)-.001);});
    }
    function frame(t){var dt=Math.min(50,t-last);last=t;
      if(!track._vis){requestAnimationFrame(frame);return;}
      if(hold>0){hold-=dt;}else{p+=dt*speed;if(p>=1){p=1;hold=1600;setTimeout(function(){bump();p=0;},1500);}}
      place();requestAnimationFrame(frame);}
    function bump(){nums.forEach(function(n,i){base[i]+=Math.max(1,Math.round(base[i]*.004));n.textContent=base[i].toLocaleString('en-IN');});}
    nums.forEach(function(n,i){n.textContent=base[i].toLocaleString('en-IN');});
    $('jyGo').addEventListener('click',function(){p=0;hold=0;speed=1/2600;setTimeout(function(){speed=1/5200;},2700);});
    if(reduce){p=1;place();}else requestAnimationFrame(frame);
  })();

  // Why: infinite autoplay carousel with centre focus
  (function(){
    if(!$('whyTrack'))return;var rail=$('whyRail'), track=$('whyTrack'), cards=[].slice.call(track.children), barI=$('wBar');
    cards.forEach(function(c){var k=c.cloneNode(true);k.setAttribute('aria-hidden','true');track.appendChild(k);});
    var all=[].slice.call(track.children), off=0, vel=.045, boost=0, last=performance.now(), sw=0, cw=0, gap=18, rw=0;
    function measure(){sw=track.scrollWidth/2;cw=all[0].offsetWidth;rw=rail.clientWidth;}
    measure(); addEventListener('resize',measure);
    function frame(t){var dt=Math.min(50,t-last);last=t;
      if(!rail._vis){requestAnimationFrame(frame);return;}
      if(!sw||!rw){measure();requestAnimationFrame(frame);return;}
      off+=dt*(vel+boost); boost*=.92; if(Math.abs(boost)<.001)boost=0;
      off=((off%sw)+sw)%sw; track.style.transform='translateX('+(-off)+'px)';
      var cx=rw/2;
      for(var i=0;i<all.length;i++){var c=all[i],center=i*(cw+gap)+cw/2-off;var d=Math.abs(center-cx)/(rw/2);var dd=Math.min(1,d);
        c.style.transform='scale('+(1-dd*.12)+')';c.style.opacity=(1-dd*.45);var on=d<.22;if(on!==c._on){c._on=on;c.classList.toggle('ctr',on);}}
      var w=Math.max(.2,rw/sw);barI.style.width=(w*100)+'%';barI.style.left=((off/sw)*(1-w)*100)+'%';
      requestAnimationFrame(frame);}
    $('wPrev').addEventListener('click',function(){boost=-1.1;});
    $('wNext').addEventListener('click',function(){boost=1.1;});
    var sx=null;rail.addEventListener('pointerdown',function(e){sx=e.clientX;});addEventListener('pointerup',function(e){if(sx!==null){var d=sx-e.clientX;if(Math.abs(d)>20)boost=d>0?1.1:-1.1;sx=null;}});
    if(reduce){track.style.transform='none';}else requestAnimationFrame(frame);
  })();

  // Before / after slider
  (function(){
    if(!$('ba'))return;var ba=$('ba'), rng=$('baRange'), touched=false;
    function set(v){ba.style.setProperty('--x',v+'%');}
    rng.addEventListener('input',function(){touched=true;set(rng.value);});
    set(50);
    if(!reduce&&'IntersectionObserver' in window){var o=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;o.disconnect();
      var t0=performance.now();(function sweep(t){if(touched)return;var k=(t-t0)/2600;if(k>1){set(50);rng.value=50;return;}var v=50+40*Math.sin(k*Math.PI*2)*(1-k);set(v);rng.value=v;requestAnimationFrame(sweep);})(t0);},{threshold:.5});o.observe(ba);}
  })();

  // Low funnel: search typing with ad-first suggestions
  (function(){
    if(!$('sq'))return;var sq=$('sq'), sugg=$('sugg'), Q=[
      ['3 bhk flats in gurugram','Skyline Homes · 3 BHK from ₹2.4 Cr'],
      ['best dental clinic near me','SmileCare Dental · Same-day visit'],
      ['digital marketing agency gurugram','Tiwaa Growth Labs · Free audit'],
      ['handloom sarees online','Loomwear · Flat 15% off']], qi=0;
    function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}
    async function loop(){
      while(true){
        var q=Q[qi%Q.length]; qi++; sugg.classList.add('hide'); sq.textContent='';
        for(var i=1;i<=q[0].length;i++){sq.textContent=q[0].slice(0,i);await wait(55);}
        sugg.innerHTML='<li><b>'+q[1]+'</b><span class="ad">Ad</span></li><li>'+q[0]+' <b>price</b></li><li>'+q[0]+' <b>reviews</b></li>';
        await wait(250); sugg.classList.remove('hide'); await wait(2600);
      }
    }
    if(reduce){sq.textContent=Q[0][0];} else loop();
  })();

  // Rails (carousels)
  document.querySelectorAll('.rail-btn').forEach(function(b){b.addEventListener('click',function(){var r=$(b.dataset.rail);r.scrollBy({left:(+b.dataset.dir)*r.clientWidth*.7,behavior:'smooth'});});});

  // Our Work cards
  (function(){
    var GA='<svg viewBox="0 0 24 24" fill="#4285F4"><path d="M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998zm19.4643-6.0004L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644zM7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z"/></svg>', ME='<svg viewBox="0 0 24 24" fill="#0467DF"><path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></svg>', IG='<svg viewBox="0 0 24 24" fill="#E4405F"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>', GO='<svg viewBox="0 0 24 24" fill="#4285F4"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>';
    var C=[
      ['Godrej Properties','a','Google Performance Max with offline conversion tracking to drive qualified site visits.','linear-gradient(140deg,#0B1A0E,#0F2A14 60%,#1C4D1F)','linear-gradient(140deg,var(--p),#5856D6)',[['32%','lower CPL'],['2.4x','qualified leads']],GA,'Google Ads','Real Estate',''],
      ['Luxury Villas, Sohna','f','Walkthrough films and Instagram Reels that filled the EOI list before bookings opened.','linear-gradient(140deg,#16110A,#2A1D0E 60%,#4A3212)','linear-gradient(140deg,#FFB347,#FF6B3D)',[['3.1x','EOI sign-ups'],['+48%','site visits']],IG,'Instagram','Real Estate','Film Case Study'],
      ['Sobha','c','Hyperlocal SEO and project landing pages ranking for high-intent property searches.','linear-gradient(140deg,#0A1420,#10233A 60%,#173A5E)','linear-gradient(140deg,var(--p-l),var(--p))',[['#1','for 18 keywords'],['+160%','organic leads']],GO,'SEO','Real Estate','SEO Case Study'],
      ['Channel Partner, NCR','d','Lead ads for 12 projects with LeadsPulse auto-assignment, so every buyer got a call within minutes.','linear-gradient(140deg,#1A0B16,#2D1026 60%,#4A1840)','linear-gradient(140deg,#FF5FA2,#FF9B3D)',[['4 min','to first call'],['3x','follow-ups']],ME,'Meta + LeadsPulse','Real Estate','CRM Case Study'],
      ['Emaar','e','Meta lead-form campaigns with WhatsApp follow-ups within 60 seconds of every enquiry.','linear-gradient(140deg,#0B0F0C,#14211A 60%,#20402E)','linear-gradient(140deg,var(--p2),var(--p))',[['25%','lower CPL'],['15%','lower CPQL']],ME,'Meta Ads','Real Estate',''],
      ['Plotted Township','d','A fast project landing page with plot maps and price, plus Google Search for investors.','linear-gradient(140deg,#0D0D10,#1A1A24 60%,#26263A)','linear-gradient(140deg,#8C7CFF,var(--p))',[['+210%','visit requests'],['1.8s','page load']],GA,'Web + Google','Real Estate','Web Case Study']];
    var html='';
    C.forEach(function(c){html+='<a class="case rv" href="#contact" data-cta="Talk to an expert"><div class="case-art" style="--g:'+c[3]+';--arc:'+c[4]+'">'+(c[9]?'<span class="case-tag">'+c[9]+'</span>':'')+
      '<span class="case-glass">View case study <svg viewBox="0 0 16 16"><path d="M5 11L11 5M6 5h5v5"/></svg></span><div class="case-in"><div style="padding-top:'+(c[9]?'30px':'0')+'"><span class="wm '+c[1]+' case-brand">'+c[0]+'</span><p class="case-desc" style="margin-top:10px">'+c[2]+'</p></div>'+
      '<div class="case-stats">'+c[5].map(function(s){return '<div><b>'+s[0]+'</b><small>'+s[1]+'</small></div>';}).join('')+'<span class="case-ch">'+c[6]+c[7]+'</span></div></div></div>'+
      '<div class="case-name">'+c[0]+'<em>'+c[8]+'</em></div></a>';});
    if($('workGrid'))$('workGrid').innerHTML=html;
    if(root.classList.contains('anim')&&'IntersectionObserver' in window){var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target);}});},{threshold:.1});
      document.querySelectorAll('#workGrid .rv').forEach(function(el,i){el.style.setProperty('--d',i%2);o.observe(el);});}
    else document.querySelectorAll('#workGrid .rv').forEach(function(el){el.classList.remove('rv');});
  })();

  // ROI calculator
  (function(){
    if(!document.getElementById('r-biz'))return;
    // benchmark CPL (₹, metro, Google+Meta), qualify %, mid-step %, close % per business
    var B={re:{cpl:900,q:.22,v:.35,c:.12,vl:['Site visits','Cost / visit'],bl:['Bookings','Cost / booking']},
           health:{cpl:350,q:.45,v:.55,c:.5,vl:['Appointments','Cost / appt'],bl:['Patients','Cost / patient']},
           edu:{cpl:420,q:.38,v:.45,c:.28,vl:['Counselling','Cost / session'],bl:['Admissions','Cost / admission']},
           ecom:{cpl:120,q:.5,v:.4,c:.45,vl:['Add to carts','Cost / cart'],bl:['Orders','Cost / order']},
           local:{cpl:150,q:.55,v:.6,c:.55,vl:['Calls & visits','Cost / visit'],bl:['Customers','Cost / customer']},
           b2b:{cpl:1400,q:.3,v:.4,c:.2,vl:['Meetings','Cost / meeting'],bl:['Deals','Cost / deal']}};
    var MIX={g:{c:1.12,q:1.15},m:{c:.78,q:.82},gm:{c:1,q:1},gmw:{c:.92,q:1.18}};
    var GOAL={leads:{c:.95,q:.95},sales:{c:1.1,q:1.12},calls:{c:1,q:1.05}};
    var el={biz:$('r-biz'),city:$('r-city'),goal:$('r-goal'),mix:$('r-mix'),dur:$('r-dur'),bud:$('r-budget')};
    function fmtB(v){return v>=100000?'₹'+(v/100000).toFixed(v%100000?2:0).replace(/\.?0+$/,'')+' L':'₹'+(v/1000)+'K';}
    function calc(){
      var b=B[el.biz.value], mx=MIX[el.mix.value], gl=GOAL[el.goal.value], city=+el.city.value, months=+el.dur.value, bud=+el.bud.value;
      var cpl=b.cpl*city*mx.c*gl.c, ramp=[.75,.9,1,1.08,1.14,1.18], series=[], L=0;
      for(var m=0;m<months;m++){var f=ramp[Math.min(m,ramp.length-1)]+(m>=6?.02*(m-5):0);var l=bud/cpl*f;L+=l;series.push(l);}
      var Q=L*Math.min(.9,b.q*mx.q*gl.q), V=Q*b.v, K=V*b.c, tot=bud*months;
      $('o-leads').textContent=num(L);$('o-cpl').textContent=inr(tot/L);
      $('o-ql').textContent=num(Q);$('o-cpql').textContent=inr(tot/Q);
      $('o-sv').textContent=num(V);$('o-cpsv').textContent=inr(tot/V);
      $('o-bk').textContent=num(K);$('o-cpb').textContent=inr(tot/Math.max(1,K));
      $('o-vl').textContent=b.vl[0];$('o-cvl').textContent=b.vl[1];$('o-bl').textContent=b.bl[0];$('o-cbl').textContent=b.bl[1];$('o-leg3').textContent=b.bl[0];
      $('o-tot').textContent=inr(tot);$('o-note').textContent='Over '+months+' months at '+fmtB(bud)+'/month';
      $('bOut').textContent=inr(bud);
      draw(series.map(function(l){return [l,l*Math.min(.9,b.q*mx.q*gl.q),l*Math.min(.9,b.q*mx.q*gl.q)*b.v*b.c];}));
    }
    var last=null;
    function draw(rows){
      last=rows||last; rows=last; if(!rows)return;
      var svg=$('roiChart'), W=560,H=230,pl=44,pr=10,pt=10,pb=26, max=0;
      rows.forEach(function(r){max=Math.max(max,r[0]);}); var nice=Math.pow(10,Math.floor(Math.log10(max||1))), top=Math.ceil(max/nice)*nice||1;
      var x=function(i){return pl+(rows.length===1?0:i/(rows.length-1))*(W-pl-pr);}, y=function(v){return pt+(1-v/top)*(H-pt-pb);};
      var ink=getComputedStyle(root).getPropertyValue('--ink').trim()||'#1D1D1F';
      var g='';
      for(var t=0;t<=4;t++){var v=top*t/4;g+='<line class="gridl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text class="axl" x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+(v>=1000?(v/1000).toFixed(v%1000?1:0)+'K':Math.round(v))+'</text>';}
      var step=Math.ceil(rows.length/6);
      rows.forEach(function(r,i){if(i%step===0||i===rows.length-1)g+='<text class="axl" x="'+x(i)+'" y="'+(H-6)+'" text-anchor="middle">M'+(i+1)+'</text>';});
      function area(k,col,op){var d='M'+x(0)+' '+y(rows[0][k]);rows.forEach(function(r,i){d+=' L'+x(i)+' '+y(r[k]);});
        return '<path d="'+d+' L'+x(rows.length-1)+' '+y(0)+' L'+x(0)+' '+y(0)+' Z" fill="'+col+'" fill-opacity="'+op+'"/><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2.5" stroke-linejoin="round"/>'+
          '<circle cx="'+x(rows.length-1)+'" cy="'+y(rows[rows.length-1][k])+'" r="4" fill="'+col+'"/>';}
      var cs=getComputedStyle(root),P1=cs.getPropertyValue('--hl').trim()||'#635BFF',P2=cs.getPropertyValue('--p2').trim()||'#00D4FF';svg.innerHTML=g+area(0,P1,.28)+area(1,P2,.3)+area(2,ink,.35);
    }
    window.__drawRoi=function(){draw();};
    ['biz','city','goal','mix','dur'].forEach(function(k){el[k].addEventListener('change',calc);});
    el.bud.addEventListener('input',calc);
    function stepB(d){var v=Math.min(1000000,Math.max(25000,+el.bud.value+d*25000));el.bud.value=v;calc();}
    $('bMinus').addEventListener('click',function(){stepB(-1);}); $('bPlus').addEventListener('click',function(){stepB(1);});
    calc();
  })();

  // FAQ + structured data
  var faqs=[
    ["What does Tiwaa Growth Labs do for real estate?","We run marketing for real estate projects: pre-launch and launch campaigns, Meta and Google lead ads, walkthrough films, project landing pages, WhatsApp follow-up, social media and SEO. Our goal is site visits and bookings, not just leads."],
    ["Who do you work with?","Developers and builders, channel partners, brokers, and the marketing and sales teams behind them. We market apartments, villas, plots, offices and retail across Delhi NCR and other Indian cities."],
    ["How soon will we start getting leads?","Most campaigns go live in the second or third week, once the plan, film and landing page are ready. Leads start the day the ads run."],
    ["How do you make sure leads are genuine buyers?","Every lead form asks budget, configuration and timeline, ads are targeted by micro-market, and every enquiry gets an instant WhatsApp reply so serious buyers move ahead quickly."],
    ["What is LeadsPulse, and do we get it?","LeadsPulse is the real estate CRM we built. Our marketing clients use it to get every lead assigned to the right salesperson in about 3 seconds, with a WhatsApp alert in about 5 seconds and a weekly report of leads and site visits."],
    ["What budget do we need to start?","Most projects start with an ad budget of ₹1,00,000 to ₹5,00,000 per month, depending on the city and price point. Use the ROI calculator above to see what different budgets can deliver."]
  ];
  if($('faqList'))faqs.forEach(function(f,i){var d=document.createElement('details');if(i===0)d.open=true;var s=document.createElement('summary');s.textContent=f[0];var p=document.createElement('p');p.textContent=f[1];d.appendChild(s);d.appendChild(p);$('faqList').appendChild(d);d.addEventListener('toggle',function(){if(d.open)[].forEach.call($('faqList').querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});});});
  if($('faq-ld'))$('faq-ld').textContent=JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqs.map(function(f){return {"@type":"Question","name":f[0],"acceptedAnswer":{"@type":"Answer","text":f[1]}};})});

  // Hero form
  if($('heroForm'))$('heroForm').addEventListener('submit',function(e){e.preventDefault();
    var n=$('h-name').value.trim(),ph=$('h-phone').value.trim(),er=$('h-err');
    if(!n){er.textContent='Please enter your name.';return;}
    if(!/^[+\d][\d\s-]{7,}$/.test(ph)){er.textContent='Please enter a valid mobile number, for example +91 98765 43210.';return;}
    er.textContent='';
    TGLLeads.submit({form:'hero',name:n,phone:ph,service:$('h-svc').value,cta:'Talk to Us',hp:$('h-hp').value},{button:this.querySelector('button[type=submit]'),err:er,ok:$('h-ok'),form:this});});


  // Liquid glass: specular highlight follows the pointer (one write per frame)
  (function(){var pend=null,q=false;
    document.querySelectorAll('.lg').forEach(function(g){var sw=document.createElement('span');sw.className='lg-sweep';sw.setAttribute('aria-hidden','true');g.appendChild(sw);});
    if(!matchMedia('(hover:hover)').matches)return;
    document.addEventListener('pointermove',function(e){var g=e.target.closest&&e.target.closest('.lg');if(!g)return;pend=[g,e.clientX,e.clientY];
      if(q)return;q=true;requestAnimationFrame(function(){q=false;if(!pend)return;var r=pend[0].getBoundingClientRect();pend[0].style.setProperty('--mx',(pend[1]-r.left)+'px');pend[0].style.setProperty('--my',(pend[2]-r.top)+'px');pend=null;});},{passive:true});})();

  // Button ripple
  document.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('.btn');if(!b||reduce)return;
    var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height),sp=document.createElement('span');sp.className='rip';
    sp.style.width=sp.style.height=s+'px';sp.style.left=(e.clientX-r.left-s/2)+'px';sp.style.top=(e.clientY-r.top-s/2)+'px';b.appendChild(sp);setTimeout(function(){sp.remove();},650);});

  // Automation pipeline: section pins in place while scrolling drives the flow.
  // Runs once; after it completes the pin is released and scrolling up never rewinds it.
  (function(){
    if(!document.getElementById('pinWrap'))return;var wrap=document.getElementById('pinWrap'), sec=document.getElementById('process'), flow=document.getElementById('flow'),
        steps=[].slice.call(flow.querySelectorAll('li')), n=steps.length, hint=document.getElementById('pinHint'),
        fill=document.getElementById('pfill'), packet=document.getElementById('packet'), clog=document.getElementById('clog'),
        hdr=document.querySelector('header.site');
    var logs=['› crawling site & competitor data','› building channel plan & budgets','› deploying pages, ads & tracking','› A/B testing creatives & keywords','› compiling report · scaling winners'];
    var autoP=0, FILL=.7, best=0, done=false, completing=false, ticking=false, lastStage=-2, pinned=false, extra=0, stickTop=0;
    function render(p){
      var sN=p*n;
      steps.forEach(function(li,k){
        var isDone=sN>=k+1, isRun=!isDone&&sN>k;
        li.classList.toggle('done',isDone); li.classList.toggle('run',isRun);
        var st=li.querySelector('.status'), txt=isDone?'Done ✓':isRun?'Running…':'Queued';
        if(st.textContent!==txt) st.textContent=txt;
      });
      var pos=Math.min(sN,n-1)/(n-1)*100;
      fill.style.width=pos+'%'; packet.style.left=pos+'%';
      var stage=p>=1?n:(sN>0?Math.floor(sN):-1);
      if(stage!==lastStage){lastStage=stage;
        clog.textContent=stage<0?'› scroll down to run the growth pipeline':stage>=n?'✓ pipeline complete · growth on autopilot':logs[stage];}
    }
    function docTop(el){return el.getBoundingClientRect().top+scrollY;}
    // Pin only when the whole section fits on screen under the header (desktop/tablet landscape)
    function setup(){
      if(done) return;
      var hh=hdr.offsetHeight, vh=innerHeight, sh=sec.offsetHeight;
      pinned = sh+hh <= vh;
      wrap.classList.toggle('pinned',pinned);
      if(pinned){
        stickTop=hh+Math.max(0,Math.floor((vh-hh-sh)/2));
        extra=Math.round(vh*1.1);
        sec.style.setProperty('--pin-top',stickTop+'px');
        wrap.style.height=(sh+extra)+'px';
      } else { wrap.style.height=''; extra=0; }
      hint.hidden=!pinned;
    }
    function progress(){
      if(pinned){ var start=docTop(wrap)-stickTop; return (scrollY-start)/(extra*FILL); }
      var r=flow.getBoundingClientRect(), vh=innerHeight, A=vh*.8, B=vh*.65;
      return (A-r.top)/((A-B)+r.height);
    }
    // Release the pin: drop the extra scroll room and shift the scroll position so nothing on screen jumps
    function release(){
      if(!pinned){return;}
      var start=docTop(wrap)-stickTop, past=Math.max(0,Math.min(extra,scrollY-start));
      wrap.classList.remove('pinned'); wrap.style.height=''; pinned=false; hint.classList.add('gone');
      if(past>0){
        var y=scrollY-past;
        if(window.__lenis){ window.__lenis.scrollTo(y,{immediate:true,force:true}); }
        else window.scrollTo(0,y);
      }
      if(window.__lenis&&window.__lenis.resize) window.__lenis.resize();
    }
    function finish(){
      if(done) return; done=true; best=1; render(1);
      removeEventListener('scroll',onScroll); removeEventListener('resize',onResize);
      release();
    }
    window.__pipeFinish=function(){ finish(); };
    function measure(){
      ticking=false; if(done) return;
      var p=Math.max(autoP,Math.max(0,Math.min(1,progress())));
      if(p>best){best=p; render(best);}            // only moves forward
      if(best>=1&&!completing){ completing=true; render(1); hint.classList.add('gone'); if(!pinned) finish(); }
      // flow is already complete at 70% of the pin; release once the reader scrolls past the hold
      if(completing&&pinned&&scrollY>=docTop(wrap)-stickTop+extra) finish();
    }
    function onScroll(){ if(!ticking){ticking=true; requestAnimationFrame(measure);} }
    function onResize(){ setup(); onScroll(); }
    // Autoplay: once the section is on screen the flow plays by itself (~1s per step); scrolling can still push it faster
    if(!reduce&&'IntersectionObserver' in window){
      var started=false;
      new IntersectionObserver(function(es){es.forEach(function(e){
        if(!e.isIntersecting||started||done)return; started=true;
        var t0=performance.now();
        (function play(t){ if(done)return; autoP=Math.min(1,(t-t0)/5200); measure(); if(autoP<1)requestAnimationFrame(play); })(t0);
      });},{threshold:.55}).observe(flow);
    }
    if(reduce){ render(1); done=true; return; }
    render(0); setup();
    addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onResize,{passive:true});
    addEventListener('load',function(){ if(!done){setup(); measure();} });
    measure();
  })();


  // Floating contact button: hover on desktop, tap on touch
  var fab=document.getElementById('fab'),fabMain=document.getElementById('fabMain');
  fabMain.addEventListener('click',function(e){e.stopPropagation();var o=fab.classList.toggle('open');fabMain.setAttribute('aria-expanded',o);});
  fab.addEventListener('mouseleave',function(){fab.classList.remove('open');fabMain.setAttribute('aria-expanded','false');});
  fab.addEventListener('click',function(e){if(e.target.closest('.fab-item'))setTimeout(function(){fab.classList.remove('open');},50);});
  document.addEventListener('click',function(e){if(!fab.contains(e.target))fab.classList.remove('open');});


  // ===== Popup: opens once on scroll past 50px, and from every CTA button =====
  var pop=document.getElementById('pop'),autoShown=false,lastFocus=null,
      popEb=document.getElementById('pop-eb'),popH=document.getElementById('pop-h'),popT=document.getElementById('pop-t'),
      popS=document.getElementById('pop-s'),popB=document.getElementById('pop-b'),popL=document.getElementById('pop-list'),popG=document.getElementById('p-goal');
  var ARROW='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  var SV={
    seo:['Search Engine Optimization','Rank higher on Google for the searches that bring buyers',['Technical & on-page SEO audit','Keyword gap vs your competitors','Local SEO and Google Business Profile']],
    social:['Social Media Optimization','Turn followers into customers on every platform',['Profile and content audit','Monthly content calendar','Reels, creatives and community care']],
    ppc:['Google / Meta Ads (PPC)','Spend less per lead and scale the ads that convert',['Ad account and tracking review','Audience and keyword strategy','Landing pages built to convert']],
    wa:['WhatsApp & SMS Marketing','Reach customers instantly where they already chat',['Broadcasts and drip campaigns','Chatbot and auto-replies','Lead follow-up automation']],
    content:['Content Marketing','Content that explains your value and wins trust',['Content and SEO gap review','Blog and web copy plan','Distribution across channels']],
    re:['Real Estate Marketing','Bring serious buyers to your next project launch',['Project launch campaigns','Property listing ads','Lead qualification on WhatsApp']],
    web:['Website Design & Development','A fast, SEO-ready website that turns visitors into leads',['Custom responsive design','Speed and SEO built in','Easy to update yourself']],
    gfx:['Graphic Designing','Visuals that make your brand instantly recognisable',['Logo and brand identity','Social and ad creatives','Brochures and marketing collateral']],
    ecom:['E-Commerce Solution','An online store that is easy to buy from',['Catalogue and payment setup','Conversion-focused product pages','Marketplace and ads integration']],
    care:['Website Maintenance','Keep your website secure, updated and fast',['Updates and backups','Malware protection','Uptime and speed monitoring']]};
  function keyFor(t){t=t.toLowerCase();
    if(/seo|search engine/.test(t))return 'seo'; if(/social/.test(t))return 'social'; if(/ppc|pay-per|google ads|facebook|meta|campaign/.test(t))return 'ppc';
    if(/whatsapp|sms/.test(t))return 'wa'; if(/content/.test(t))return 'content'; if(/real estate|property/.test(t))return 're';
    if(/graphic|designer/.test(t))return 'gfx'; if(/e-commerce|store/.test(t))return 'ecom'; if(/maintenance|care plan/.test(t))return 'care';
    if(/website/.test(t))return 'web'; return null;}
  function fillPop(cfg){
    popEb.textContent=cfg.eb; popH.textContent=cfg.h; popT.textContent='Send us an enquiry'; popS.textContent='Fill in your details and our team will call you within 24 hours.'; popB.innerHTML='Send enquiry '+ARROW;
    popL.innerHTML=''; cfg.l.forEach(function(x){var li=document.createElement('li');li.textContent=x;popL.appendChild(li);});
    [].forEach.call(popG.options,function(o){if(o.text===cfg.g)popG.value=o.value;});
    document.getElementById('p-ok').hidden=true; document.getElementById('p-err').textContent='';
  }
  var DEFAULT={eb:'Free growth audit',h:'Find out where your next 100 leads are hiding',t:'Get your free audit',s:'Takes 30 seconds. Our strategist replies within 24 hours.',
    b:'Claim My Free Audit',l:['Website speed & SEO health check','Ad account and landing page review','A 90-day plan with clear targets'],g:'Free growth audit'};
  function openPop(cfg){
    fillPop(cfg||DEFAULT); if(!pop.hidden)return;
    lastFocus=document.activeElement; pop.hidden=false; document.body.style.overflow='hidden'; if(window.__lenis)window.__lenis.stop();
    requestAnimationFrame(function(){requestAnimationFrame(function(){pop.classList.add('show');document.getElementById('p-name').focus({preventScroll:true});});});
  }
  window.__openPop=openPop;
  function closePop(){pop.classList.remove('show');document.body.style.overflow='';if(window.__lenis)window.__lenis.start();
    setTimeout(function(){pop.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});},450);}
  pop.addEventListener('click',function(e){if(e.target.closest('[data-close]'))closePop();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pop.hidden)closePop();});

    function scrolled(){var se=document.scrollingElement||document.documentElement;
    return Math.max(window.scrollY||0,window.pageYOffset||0,se.scrollTop||0,document.documentElement.scrollTop||0,document.body.scrollTop||0);}
  // Auto-open once per visit when the "What we do" (services) section reaches the middle of the screen
  var thirdSec=document.getElementById('services')||document.getElementById('google-ads')||document.getElementById('seo-services');
  function checkAuto(){if(autoShown||!thirdSec)return; if(thirdSec.getBoundingClientRect().top<innerHeight*0.55){autoShown=true;setTimeout(function(){if(pop.hidden)openPop();},350);}}
  if(thirdSec&&'IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)checkAuto();});},{threshold:[0,.25,.5]}).observe(thirdSec);}
  window.addEventListener('scroll',checkAuto,{passive:true}); document.addEventListener('scroll',checkAuto,{passive:true,capture:true});
  window.addEventListener('wheel',function(){setTimeout(checkAuto,120);},{passive:true}); window.addEventListener('touchmove',function(){setTimeout(checkAuto,120);},{passive:true});

  // Every CTA that points at #contact (except the nav link) opens the matching popup
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href="#contact"]'); if(!a)return;
    if(a.classList.contains('nv-promo')||a.hasAttribute('data-audit')){e.preventDefault();autoShown=true;var nv=document.getElementById('nav'),mb=document.getElementById('menuBtn');
      if(nv)nv.classList.remove('open');if(mb)mb.setAttribute('aria-expanded','false');
      [].forEach.call(document.querySelectorAll('.nv-item.open,.nv-item.dd-open'),function(li){li.classList.remove('open','dd-open');});
      [].forEach.call(document.querySelectorAll('.nv-caret[aria-expanded="true"]'),function(c){c.setAttribute('aria-expanded','false');});
      if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
      openPop(DEFAULT);return;}
    if(a.closest('nav.main'))return;
    e.preventDefault(); autoShown=true;
    var label=(a.dataset.cta||a.textContent).replace(/[→›]/g,'').trim(), card=a.closest('.svc,.feature'),
        ctx=card?card.querySelector('h3').textContent:label, k=keyFor(ctx)||keyFor(label);
    if(k){var v=SV[k];openPop({eb:v[0],h:v[1],t:label,s:'Share a few details and our '+v[0]+' expert will call you within 24 hours.',b:label,l:v[2],g:v[0]});}
    else{var expert=/expert|talk/i.test(label);
      openPop({eb:expert?'Talk to an expert':'Free consultation',h:expert?'Speak with a senior growth strategist':'Get a growth plan built for your business',
        t:label,s:'Leave your number and we will call you back within 24 hours.',b:expert?'Request a Call Back':'Book My Free Consultation',
        l:['A 30-minute call, no obligation','Honest review of what is working now','Clear next steps and budget guidance'],g:'Free growth audit'});}
  });

  document.getElementById('popForm').addEventListener('submit',function(e){e.preventDefault();
    var n=document.getElementById('p-name').value.trim(),ph=document.getElementById('p-phone').value.trim(),er=document.getElementById('p-err');
    if(!n){er.textContent='Please enter your name.';return;}
    if(!/^[+\d][\d\s-]{7,}$/.test(ph)){er.textContent='Please enter a valid phone number, for example +91 98765 43210.';return;}
    er.textContent='';
    var em=document.getElementById('p-email');if(em&&em.value.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())){er.textContent='Please check your email address.';return;}
    TGLLeads.submit({form:'popup',name:n,phone:ph,service:document.getElementById('p-goal').value,email:document.getElementById('p-email').value.trim(),cta:document.getElementById('pop-t').textContent.trim(),hp:document.getElementById('p-hp').value},{button:document.getElementById('pop-b'),err:er,ok:document.getElementById('p-ok'),form:this});});

})();
;
(function(){var r=document.documentElement,names={indigo:'Indigo',blue:'Apple Blue',ocean:'Ocean Teal',violet:'Violet',sunset:'Sunset Orange'};
function set(k){r.setAttribute('data-pal',k);document.querySelectorAll('.palx button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.pal===k)});var n=document.getElementById('palName');if(n)n.textContent=names[k];try{localStorage.setItem('tgl-pal',k)}catch(e){}if(window.__drawRoi)window.__drawRoi();if(window.__reachTheme)window.__reachTheme();}
names.ocean2='Ocean Blue';var k='ocean2';set(k);
document.querySelectorAll('.palx button').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.pal)})});})();
;
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id){return document.getElementById(id);}
  function fmt(n){return Math.round(n).toLocaleString('en-IN');}
  function onVisible(el,cb,thr){if(!el)return;if(!('IntersectionObserver' in window)){cb(true);return;}
    new IntersectionObserver(function(es){es.forEach(function(e){cb(e.isIntersecting);});},{threshold:thr||0.25}).observe(el);}

  /* ---------- Nav dropdowns ---------- */
  var nav=$('nav');
  if(nav){
    nav.querySelectorAll('.nv-caret').forEach(function(b){
      b.addEventListener('click',function(e){e.stopPropagation();var li=b.parentNode,o=!li.classList.contains('open');
        nav.querySelectorAll('.has-dd.open').forEach(function(x){if(x!==li){x.classList.remove('open');x.querySelector('.nv-caret').setAttribute('aria-expanded','false');}});
        li.classList.toggle('open',o);b.setAttribute('aria-expanded',o);});
    });
    document.addEventListener('click',function(e){if(!nav.contains(e.target))nav.querySelectorAll('.has-dd.open').forEach(function(x){x.classList.remove('open');x.querySelector('.nv-caret').setAttribute('aria-expanded','false');});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')nav.querySelectorAll('.has-dd.open').forEach(function(x){x.classList.remove('open');});});
    nav.querySelectorAll('.nv-dd a').forEach(function(a){a.addEventListener('click',function(){
      nav.querySelectorAll('.has-dd.open').forEach(function(x){x.classList.remove('open');});
      var k=a.dataset.svc,sel=k?'#services [data-svc="'+k+'"]':(a.dataset.ind?'.y-ind-c[data-ind="'+a.dataset.ind+'"]':null);
      if(sel){var t=document.querySelector(sel);if(t)setTimeout(function(){t.classList.add('flash');setTimeout(function(){t.classList.remove('flash');},1800);},700);}
    });});
  }

  /* ---------- Brand + platform band ---------- */
  var CL=[['Godrej Properties','GP','#1F6FEB','godrej-properties.svg'],['Emaar','EM','#B8860B','emaar.png'],['Shapoorji Pallonji','SP','#C8102E','shapoorji-pallonji.png'],['SOBHA','SO','#7A5C2E','sobha.png'],['Brigade','BR','#E35205','brigade.png'],['Provident','PH','#00A3A1','provident.png'],['Central Park','CP','#2E7D32','central-park.png'],['Capital Avenue','CA','#5856D6','capital-avenue.webp'],['Nanded City','NC','#0E7490','nanded-city.png'],['Hotel RR Galaxy','RR','#AF52DE','hotel-rr-galaxy.webp'],['Dreamland Realtors','DL','#FF2D55','dreamland.webp'],['My Wear Hub','MW','#FF9500','mywear.webp'],['Printek','PT','#30B0C7','printek.webp'],['ShipKaro','SK','#007AFF','shipkaro.webp'],['BVEG','BV','#2E7D32','bveg.webp']];
  var PL=[['Google Ads','G','#4285F4','google-ads.svg'],['Meta Ads','M','#0866FF','meta.svg'],['Instagram','IG','#E1306C','instagram.png'],['YouTube','YT','#FF0000','youtube.png'],['WhatsApp Business','WA','#25D366','whatsapp-business.png'],['Google Analytics 4','GA','#F9AB00','google-analytics.svg'],['LinkedIn Ads','in','#0A66C2','linkedin.png'],['Shopify','S','#5E8E3E','shopify.png'],['WordPress','W','#21759B','wordpress.png'],['HubSpot','H','#FF7A59','hubspot.png'],['Zoho CRM','Z','#E42527','zoho-crm.svg'],['LeadSquared','LS','#1F6FEB','leadsquared.png'],['Razorpay','R','#0C2451','razorpay.png']];
  /* b = [name, initials, colour, logo file in assets/images/brands/ (optional)]. No logo file = coloured initials tile. */
  var LOGO_DIR=(window.TGL&&window.TGL.brands)||'/assets/images/brands/';
  var FULL=/^(emaar|sobha|instagram|hubspot|linkedin|leadsquared)./; /* logos that already have their own square background */
  var DARK=/^(capital-avenue|dreamland)./; /* white logos on transparent: dark tile */
  function item(b){var t=b[3]?'<span class="lb-t lb-logo'+(FULL.test(b[3])?' lb-full':'')+(DARK.test(b[3])?' lb-dark':'')+'"><img src="'+LOGO_DIR+b[3]+'" alt="" width="38" height="38" loading="lazy" decoding="async"></span>':'<span class="lb-t" style="--c:'+b[2]+'">'+b[1]+'</span>';return '<li><span class="lb-i">'+t+b[0]+'</span></li>';}
  function fill(id,arr){var ul=$(id);if(!ul)return;var h=arr.map(item).join('');ul.innerHTML=h+h.replace(/<li>/g,'<li aria-hidden="true">');}
  fill('lbRow1',CL);fill('lbRow2',PL);

  /* ---------- Impact: dashboard feed + counters ---------- */
  var feed=$('xdFeed');
  if(feed){
    var N=[['Rohit S.','3 BHK enquiry · Sector 65','Google','#4285F4'],['Priya K.','Booked a site visit','WhatsApp','#25D366'],['Aman V.','Downloaded brochure','Meta','#0866FF'],['Neha G.','Dental consultation','Google','#4285F4'],['Karan M.','Admission counselling call','Instagram','#E1306C'],['Simran P.','Added to cart · ₹4,280','Meta','#0866FF'],['Vikas R.','Requested a demo','LinkedIn','#0A66C2'],['Anjali T.','Table booking for 6','Google Maps','#34A853']];
    var fi=0,leads=148,cpl=412,box=$('xdLeads'),cbox=$('xdCpl'),big=$('xsLeads'),bigN=45000,dash=feed.closest('.xi-dash'),bento=feed.closest('.xi-bento'),vis=false;
    function push(){var n=N[fi%N.length];fi++;var li=document.createElement('li');li.style.setProperty('--c',n[3]);
      li.innerHTML='<span class="av">'+n[0].split(' ').map(function(w){return w[0];}).join('')+'</span><span class="who"><b>'+n[0]+'</b><small>'+n[1]+'</small></span><span class="src">'+n[2]+'</span>';
      feed.insertBefore(li,feed.firstChild);while(feed.children.length>5)feed.removeChild(feed.lastChild);
      leads+=1;if(box)box.textContent=leads;if(Math.random()<.4&&cbox){cpl=Math.max(380,cpl-1);cbox.textContent='₹'+cpl;}
      bigN+=Math.ceil(Math.random()*3);if(big)big.textContent=fmt(bigN);}
    for(var k=0;k<4;k++)push();
    setInterval(function(){if(vis&&!document.hidden&&!reduce)push();},2200);
    onVisible(bento,function(v){vis=v;if(v)bento.classList.add('x-in');},0.15);
  }
  document.querySelectorAll('[data-xcount]').forEach(function(el){var done=false;
    onVisible(el,function(v){if(!v||done)return;done=true;var to=+el.dataset.xcount,t0=performance.now();
      (function step(t){var p=Math.min(1,(t-t0)/1400),e=1-Math.pow(1-p,3);el.textContent=fmt(to*e);if(p<1)requestAnimationFrame(step);})(t0);},0.5);});

  /* ---------- Funnel ---------- */
  var xf=document.querySelector('.xf'), cv=$('xfCv');
  if(xf&&cv){
    var S=[
      {c:'#007AFF',items:['SEO &amp; local search visibility','Social media content calendars','Brand films, reels &amp; creatives','YouTube &amp; display awareness ads','Google Business Profile','Graphic design &amp; brand identity'],note:'Goal: be found by people who are ready to care.'},
      {c:'#AF52DE',items:['Retargeting with custom messaging','Landing pages that convert','WhatsApp AI assistant &amp; broadcasts','Email &amp; SMS nurture flows','Lead magnets &amp; brochures','Instant lead-form follow-ups'],note:'Goal: no enquiry goes cold. Every lead gets a reply in under 60 seconds.'},
      {c:'#FF9500',items:['Google Search &amp; Performance Max','Meta lead-form &amp; conversion ads','Lead scoring &amp; CRM sync','Call-back &amp; WhatsApp nudges','Checkout &amp; conversion optimisation','Monthly ROI reporting'],note:'Goal: more closed deals at a lower cost per sale.'}];
    var tabs=[].slice.call(xf.querySelectorAll('.xf-tab')),det=$('xfDetail'),lbls=[].slice.call(xf.querySelectorAll('.xf-lbls div')),cur=0,timer=null,fvis=false,DUR=5200;
    xf.style.setProperty('--dur',DUR+'ms');
    function show(i){cur=i;tabs.forEach(function(t,j){t.setAttribute('aria-selected',j===i);var bi=t.querySelector('.xf-bar i');bi.style.animation='none';bi.offsetWidth;bi.style.animation='';});
      det.style.setProperty('--c',S[i].c);
      det.innerHTML='<ul>'+S[i].items.map(function(x,k){return '<li style="--i:'+k+'">'+x+'</li>';}).join('')+'</ul><p>'+S[i].note+'</p>';
      lbls.forEach(function(l,j){l.classList.toggle('on',j===i||(i===2&&j===3));});}
    function auto(){clearTimeout(timer);if(!fvis||reduce)return;timer=setTimeout(function(){show((cur+1)%3);auto();},DUR);}
    tabs.forEach(function(t,i){t.addEventListener('click',function(){show(i);auto();});});
    xf.addEventListener('mouseenter',function(){xf.classList.add('paused');clearTimeout(timer);});
    xf.addEventListener('mouseleave',function(){xf.classList.remove('paused');auto();});
    show(0);
    // canvas funnel with flowing particles
    var ctx=cv.getContext('2d'),W=0,H=0,dpr=Math.min(2,devicePixelRatio||1),P=[],last=0;
    var LAYER=['#32ADE6','#007AFF','#5856D6','#AF52DE'];
    function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;if(W<40||H<40)return;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
    function halfW(y){var t=Math.max(0,Math.min(1,y/H));return W*(0.48-0.33*t);}
    function spawn(){P.push({y:H*0.02,x:(Math.random()*2-1),v:0.35+Math.random()*0.5,a:1,drop:Math.random(),c:'#fff'});}
    function draw(t){
      if(!W){size();}
      if(W<40||H<40){return;}
      ctx.clearRect(0,0,W,H);
      var gap=6,lh=(H-gap*3)/4,cx=W/2;
      for(var i=0;i<4;i++){var y0=i*(lh+gap),y1=y0+lh,a=halfW(y0),b=halfW(y1);
        ctx.beginPath();ctx.moveTo(cx-a,y0);ctx.lineTo(cx+a,y0);ctx.lineTo(cx+b,y1);ctx.lineTo(cx-b,y1);ctx.closePath();
        var g=ctx.createLinearGradient(cx-a,y0,cx+a,y1);g.addColorStop(0,LAYER[i]);g.addColorStop(1,LAYER[Math.min(3,i+1)]);
        ctx.globalAlpha=(i===cur||(cur===2&&i===3))?1:0.55;ctx.fillStyle=g;ctx.fill();}
      ctx.globalAlpha=1;
      if(!reduce){if(Math.random()<0.55)spawn();
        for(var k=P.length-1;k>=0;k--){var p=P[k];p.y+=p.v*(H/260);var hw=halfW(p.y)-6;var px=cx+p.x*hw;
          var layer=Math.floor(p.y/(lh+gap));if(p.drop<0.18*layer){p.a-=0.04;p.x*=1.03;}
          if(p.y>H||p.a<=0){P.splice(k,1);continue;}
          ctx.globalAlpha=Math.max(0,p.a)*0.9;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px,p.y,1.8,0,6.283);ctx.fill();}
        ctx.globalAlpha=1;}
    }
    function loop(t){if(fvis&&!document.hidden)draw(t);requestAnimationFrame(loop);}
    addEventListener('resize',function(){W=0;});
    onVisible(xf,function(v){fvis=v;if(v){W=0;auto();}else clearTimeout(timer);},0.2);
    requestAnimationFrame(loop);
    // count-up funnel numbers once
    var NUMS=[[ 'xfN0',120000],['xfN1',8400],['xfN2',1240],['xfN3',186]],counted=false;
    onVisible(xf,function(v){if(!v||counted)return;counted=true;var t0=performance.now();
      (function st(t){var p=Math.min(1,(t-t0)/1600),e=1-Math.pow(1-p,3);NUMS.forEach(function(n){var el=$(n[0]);if(el)el.textContent=fmt(n[1]*e);});if(p<1)requestAnimationFrame(st);})(t0);},0.3);
  }

  /* ---------- Service art: pause when off screen ---------- */
  var sg=$('svcGrid');
  if(sg){onVisible(sg,function(v){sg.classList.toggle('is-off',!v);},0);}

  /* ---------- Process stepper ---------- */
  var xp=$('xp');
  if(xp){
    var D=[
      {t:'Discovery &amp; Audit',p:'We study your business, competitors and current marketing to find the fastest wins.',l:['Website speed, SEO and tracking audit','Competitor ads and keyword gap review','Funnel and lead-handling check','Goals and budget agreed with you'],o:'You get: a 1-page growth plan'},
      {t:'Strategy',p:'A channel plan built around your goal, with budgets, targets and timelines you sign off on.',l:['Channel mix and budget split','Monthly lead and cost targets','Audience, keyword and creative plan','90-day roadmap'],o:'You get: targets you can hold us to'},
      {t:'Build &amp; Launch',p:'We set up everything: campaigns, landing pages, tracking and WhatsApp automation.',l:['Ad campaigns and creatives','Landing pages or website updates','Conversion tracking and CRM sync','WhatsApp auto-replies go live'],o:'You get: campaigns live in 2–3 weeks'},
      {t:'Optimise',p:'Weekly testing of keywords, audiences and creatives to bring your cost per lead down.',l:['A/B tests on ads and pages','Negative keywords and audience pruning','Budget moved to what converts','Lead quality feedback loop'],o:'You get: lower cost per lead, month on month'},
      {t:'Report &amp; Scale',p:'Plain-language reports every month, then more budget behind what is working.',l:['Live dashboard access','Monthly review call','Scale winning channels','Add new channels when ready'],o:'You get: growth that compounds'}];
    var btns=[].slice.call(xp.querySelectorAll('.xp-steps button')),copy=$('xpCopy'),scenes=[].slice.call(xp.querySelectorAll('.sc')),ci=0,pt=null,pvis=false,PD=4800;
    xp.style.setProperty('--dur',PD+'ms');
    function step(i){ci=i;btns.forEach(function(b,j){b.setAttribute('aria-selected',j===i);b.classList.toggle('done',j<i);var pi=b.querySelector('.xp-p i');pi.style.animation='none';pi.offsetWidth;pi.style.animation='';});
      var c=btns[i].style.getPropertyValue('--c');copy.style.setProperty('--c',c);
      copy.innerHTML='<h3>'+D[i].t+'</h3><p>'+D[i].p+'</p><ul>'+D[i].l.map(function(x,k){return '<li style="--i:'+k+'">'+x+'</li>';}).join('')+'</ul><span class="xp-out"><b>●</b>'+D[i].o+'</span>';
      scenes.forEach(function(s,j){s.classList.remove('on');if(j===i){s.offsetWidth;s.classList.add('on');}});
      var row=btns[i].parentNode.parentNode;if(row.scrollWidth>row.clientWidth){row.scrollTo({left:btns[i].parentNode.offsetLeft-12,behavior:'smooth'});}}
    function pauto(){clearTimeout(pt);if(!pvis||reduce)return;pt=setTimeout(function(){step((ci+1)%5);pauto();},PD);}
    btns.forEach(function(b,i){b.addEventListener('click',function(){step(i);pauto();});});
    xp.addEventListener('mouseenter',function(){xp.classList.add('paused');clearTimeout(pt);});
    xp.addEventListener('mouseleave',function(){xp.classList.remove('paused');pauto();});
    step(0);
    onVisible(xp,function(v){var was=pvis;pvis=v;if(v&&!was){step(ci);pauto();}if(!v)clearTimeout(pt);},0.35);
  }
})();
;
(function(){
  var loop=document.getElementById('xrLoop'),track=document.getElementById('xrTrack');if(!loop||!track)return;
  var R=[
    ['Our site visits tripled in the first quarter, and WhatsApp follow-ups mean no enquiry goes cold.','Marketing Head','Real-estate developer, Gurugram','#007AFF','Real Estate','3.2x','site visits'],
    ['Clear monthly reports and a team that picks up the phone. Cost per booking dropped within six weeks.','Clinic Director','Multi-speciality clinic, Delhi NCR','#FF2D55','Healthcare','-38%','cost per booking'],
    ['They rebuilt our store pages and ads together. ROAS went from 2x to over 4x in the festive season.','Founder','D2C fashion brand','#34C759','E-commerce','4.6x','ROAS'],
    ['Admission enquiries more than doubled this intake, and the counselling team finally gets quality leads.','Admissions Head','Coaching institute, Noida','#FF9500','Education','2.4x','enquiries'],
    ['Direct bookings are up and our Google rating keeps climbing. We rely far less on OTAs now.','General Manager','Boutique hotel, Jaipur','#AF52DE','Hospitality','+55%','direct bookings'],
    ['A proper B2B funnel for the first time. Demo requests are steady and sales knows where each one came from.','Head of Growth','Logistics startup','#30B0C7','B2B','+210%','demo requests']];
  function card(r){var ini=r[1].split(' ').map(function(w){return w[0];}).join('').slice(0,2);
    return '<figure class="xr" style="--c:'+r[3]+'"><div class="xr-top"><span class="xr-stars" aria-label="5 out of 5">★★★★★</span><span class="xr-res"><b>'+r[5]+'</b> '+r[6]+'</span></div><blockquote>“'+r[0]+'”</blockquote><figcaption><i>'+ini+'</i><span><b>'+r[1]+'</b><small>'+r[2]+'</small></span></figcaption></figure>';}
  var one=R.map(card).join('');track.innerHTML=one+one.replace(/<figure class="xr"/g,'<figure aria-hidden="true" class="xr"');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,x=0,half=0,speed=0.045,hover=false,paused=reduce,vis=false,last=performance.now(),nudge=0,drag=null;
  function measure(){half=track.scrollWidth/2;}
  measure();addEventListener('resize',measure);
  function stepW(){var c=track.querySelector('.xr');return c?c.getBoundingClientRect().width+18:320;}
  function frame(t){var dt=Math.min(64,t-last);last=t;
    if(vis){ if(nudge){var d=nudge*0.12;if(Math.abs(nudge)<0.5){d=nudge;}x-=d;nudge-=d;}
      else if(!hover&&!paused&&!drag){x-=speed*dt;}
      if(half){while(x<=-half)x+=half;while(x>0)x-=half;}
      track.style.transform='translate3d('+x+'px,0,0)';}
    requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;},{threshold:0}).observe(loop);else vis=true;
  loop.addEventListener('pointerdown',function(e){drag={x0:e.clientX,s:x};loop.classList.add('drag');loop.setPointerCapture(e.pointerId);});
  loop.addEventListener('pointermove',function(e){if(drag){x=drag.s+(e.clientX-drag.x0);}});
  function end(){drag=null;loop.classList.remove('drag');}
  loop.addEventListener('pointerup',end);loop.addEventListener('pointercancel',end);
})();
;
(function(){var el=document.getElementById('ySteps');if(!el)return;if(!('IntersectionObserver' in window)){el.classList.add('on');return;}
new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){el.classList.add('on');o.disconnect();}});},{threshold:.35}).observe(el);})();
;
(function(){
  function $(i){return document.getElementById(i);}
  /* journey loop */
  var wrap=$('yStages');
  if(wrap){var cards=[].slice.call(wrap.querySelectorAll('.y-stage')),ci=-1,t=null,vis=false,D=2800,counted={};
    wrap.style.setProperty('--yd',D+'ms');
    function count(el){var to=+el.dataset.to,t0=performance.now();(function st(n){var p=Math.min(1,(n-t0)/1200),e=1-Math.pow(1-p,3);el.textContent=Math.round(to*e).toLocaleString('en-IN');if(p<1)requestAnimationFrame(st);})(t0);}
    function go(){ci=(ci+1)%cards.length;if(ci===0)cards.forEach(function(c){c.classList.remove('done','act','pass');});
      cards.forEach(function(c,j){if(j<ci){c.classList.remove('act');c.classList.add('done');}});
      var c=cards[ci];c.classList.add('act');[].forEach.call(document.querySelectorAll('.yf-node'),function(n,j){n.classList.toggle('on',j===ci);});var bi=c.querySelector('.y-bar i');if(bi){bi.style.animation='none';bi.offsetWidth;bi.style.animation='';}
      if(!counted[ci]){counted[ci]=1;var b=c.querySelector('[data-to]');if(b)count(b);}
      t=setTimeout(function(){c.classList.add('pass');setTimeout(function(){c.classList.remove('pass');},800);next();},D);}
    function next(){clearTimeout(t);if(vis)go();}
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){cards.forEach(function(c){c.classList.add('done');var b=c.querySelector('[data-to]');if(b)b.textContent=(+b.dataset.to).toLocaleString('en-IN');});}
    else if('IntersectionObserver' in window){new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!vis){vis=true;if(ci<0)go();else next();}else if(!v){vis=false;clearTimeout(t);}},{threshold:.35}).observe(wrap);}
  }
  /* our work slider */
  var g=$('workGrid'),pv=$('wkPrev'),nx=$('wkNext'),bar=$('wkBar');
  if(g&&pv&&nx){
    function stp(){var c=g.querySelector('.case');return c?c.getBoundingClientRect().width+20:400;}
    function upd(){var m=g.scrollWidth-g.clientWidth;pv.disabled=g.scrollLeft<4;nx.disabled=g.scrollLeft>m-4;
      if(bar){var w=Math.max(12,g.clientWidth/g.scrollWidth*100);bar.style.width=w+'%';bar.style.transform='translateX('+(m>0?g.scrollLeft/m*(100/w*100-100):0)+'%)';}}
    pv.addEventListener('click',function(){g.scrollBy({left:-stp(),behavior:'smooth'});hold();});
    nx.addEventListener('click',function(){g.scrollBy({left:stp(),behavior:'smooth'});hold();});
    g.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);setTimeout(upd,300);
    var auto=null,hovered=false,wv=false,held=0;
    function hold(){held=performance.now();}
    function tick(){if(wv&&!hovered&&performance.now()-held>6000&&!document.hidden){var m=g.scrollWidth-g.clientWidth;if(g.scrollLeft>m-4)g.scrollTo({left:0,behavior:'smooth'});else g.scrollBy({left:stp(),behavior:'smooth'});}}
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){auto=setInterval(tick,4500);}
    g.addEventListener('mouseenter',function(){hovered=true;});g.addEventListener('mouseleave',function(){hovered=false;});
    g.addEventListener('touchstart',hold,{passive:true});
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){wv=es[0].isIntersecting;},{threshold:.4}).observe(g);
  }
})();
;
(function(){var ul=document.getElementById('lpList');if(!ul)return;
var L=[['Rohit S.','3 BHK · Meta lead form','Assigned','#0A84FF'],['Priya K.','Site visit · Google Ads','Called','#34C759'],['Aman V.','Villa · Website form','New','#FF9500'],['Neha G.','Plot · WhatsApp','Assigned','#AF52DE'],['Karan M.','Office · 99acres','Duplicate','#FF3B30']],i=0,vis=false;
function add(){var l=L[i%L.length];i++;var li=document.createElement('li');li.style.setProperty('--c',l[3]);li.innerHTML='<span class="av">'+l[0].split(' ').map(function(w){return w[0]}).join('')+'</span><span><b>'+l[0]+'</b><small>'+l[1]+'</small></span><em>'+l[2]+'</em>';ul.insertBefore(li,ul.firstChild);while(ul.children.length>4)ul.removeChild(ul.lastChild);}
for(var k=0;k<4;k++)add();
setInterval(function(){if(vis&&!document.hidden)add();},2600);
if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting;}).observe(ul);else vis=true;})();
;
(function(){
  function $(i){return document.getElementById(i);}
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* single-step enquiry form */
  var f=$('popForm'),pop=$('pop');
  if(f&&pop)new MutationObserver(function(){if(!pop.hidden)setTimeout(function(){var el=$('p-name');if(el)el.focus({preventScroll:true});},80);}).observe(pop,{attributes:true,attributeFilter:['hidden']});
  /* exit intent, once per visit */
  var exitDone=false;
  try{exitDone=sessionStorage.getItem('tgl-exit')==='1';}catch(e){}
  if(matchMedia('(hover:hover) and (min-width:900px)').matches){
    document.addEventListener('mouseout',function(e){if(exitDone||e.relatedTarget||e.clientY>8)return;if(!pop||!pop.hidden||!window.__openPop)return;
      exitDone=true;try{sessionStorage.setItem('tgl-exit','1');}catch(x){}
      window.__openPop({eb:'Before you go',h:'Take a free 1-page growth plan with you',t:'Get my free growth plan',s:'Tell us about your business and we will send a 1-page plan within 48 hours.',b:'Send My Growth Plan',l:['Where your next leads will come from','Quick wins for your website and ads','A realistic budget and timeline'],g:'Free growth audit'});});
  }
  /* WhatsApp peek */
  var peek=$('waPeek');
  if(peek){var closed=false;try{closed=sessionStorage.getItem('tgl-peek')==='1';}catch(e){}
    $('wpX').addEventListener('click',function(){peek.classList.remove('on');try{sessionStorage.setItem('tgl-peek','1');}catch(e){}});
    if(!closed)setTimeout(function(){if(pop&&!pop.hidden)return;peek.classList.add('on');setTimeout(function(){peek.classList.remove('on');},14000);},15000);
    var fm=$('fabMain');if(fm)fm.addEventListener('click',function(){peek.classList.remove('on');});
  }
  /* before -> after metric on case cards */
  var BA=[['Cost per lead','₹1,180','₹410'],['Monthly bookings','64','98'],['Organic leads','40','132'],['ROAS','2.1x','4.4x'],['Site visits','28','90'],['Demo requests','12','37']];
  [].forEach.call(document.querySelectorAll('#workGrid .case-art'),function(a,i){var b=BA[i%BA.length];var el=document.createElement('span');el.className='case-ba';el.innerHTML=b[0]+': <s>'+b[1]+'</s> → <b>'+b[2]+'</b>';a.appendChild(el);});
  /* integrations */
  var ig=$('intGrid');
  if(ig){var I=[['Meta Lead Ads','M','#0866FF'],['Google Ads','G','#4285F4'],['WhatsApp API','WA','#25D366'],['Website forms','W','#FF9500'],['WordPress','WP','#21759B'],['Webflow','WF','#4353FF'],['Wix','Wx','#1D1D1F'],['Google Sheets','GS','#0F9D58'],['Zapier','Z','#FF4F00'],['CSV import','CSV','#8E8E93']];
    ig.innerHTML=I.map(function(x){return '<span><i style="--c:'+x[2]+'">'+x[1]+'</i>'+x[0]+'</span>';}).join('');}
})();
;
(function(){var sel=document.getElementById('p-goal'),box=document.getElementById('pgChips'),pop=document.getElementById('pop');if(!sel||!box)return;
var BASE=['Free growth audit','Search Engine Optimization','Google / Meta Ads (PPC)','Social Media Optimization','WhatsApp & SMS Marketing','Website Design & Development'];
var NICE={'Free growth audit':'Free growth audit','Search Engine Optimization':'SEO','Google / Meta Ads (PPC)':'Google / Meta Ads','Social Media Optimization':'Social media','WhatsApp & SMS Marketing':'WhatsApp marketing','Website Design & Development':'Website'};
function opt(t){return [].filter.call(sel.options,function(o){return o.text===t;})[0];}
function draw(){var cur=sel.options[sel.selectedIndex]?sel.options[sel.selectedIndex].text:BASE[0],list=BASE.slice();if(list.indexOf(cur)<0)list[5]=cur;
box.innerHTML=list.map(function(t){return '<button type="button" role="radio" aria-checked="'+(t===cur)+'" data-t="'+t.replace(/"/g,'&quot;')+'"><i></i>'+(NICE[t]||t)+'</button>';}).join('');}
box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var o=opt(b.dataset.t);if(o)sel.value=o.value;[].forEach.call(box.children,function(x){x.setAttribute('aria-checked',x===b);});});
draw();if(pop)new MutationObserver(function(){if(!pop.hidden)setTimeout(draw,0);}).observe(pop,{attributes:true,attributeFilter:['hidden']});})();
;
(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var els=[].slice.call(document.querySelectorAll('#services,#process,#reviews,.why,#insights,#roi'));
if(!els.length)return;els.forEach(function(e){e.classList.add('xpand');});
var ticking=false;
function upd(){ticking=false;var vh=innerHeight,big=innerWidth>=900,max=big?Math.min(64,innerWidth*.045):Math.min(14,innerWidth*.04);
  els.forEach(function(e){var r=e.getBoundingClientRect();if(r.top>vh||r.bottom<0){return;}
    var p=Math.max(0,Math.min(1,(vh-r.top)/(vh*.7)));var k=1-p;
    e.style.clipPath=k>0.001?'inset(0 '+(k*max).toFixed(1)+'px round '+(k*36).toFixed(1)+'px)':'none';});}
function req(){if(!ticking){ticking=true;requestAnimationFrame(upd);}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);upd();
if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',req);
})();
;
(function(){if(!('IntersectionObserver' in window))return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var b=e.target;io.unobserve(b);if(b.textContent!=='0')return;var to=+b.dataset.to,t0=performance.now();
(function st(n){var p=Math.min(1,(n-t0)/1200),k=1-Math.pow(1-p,3);b.textContent=Math.round(to*k).toLocaleString('en-IN');if(p<1)requestAnimationFrame(st);})(t0);});},{threshold:1});
document.querySelectorAll('.y-foot [data-to]').forEach(function(b){io.observe(b);});})();
