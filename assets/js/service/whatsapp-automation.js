/* Interactive parts of /services/... (whatsapp-automation): hero card, mockups, charts, FAQ. Ported from the design artifact. */

(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  /* audit card */
  var au=document.querySelector('.sx-audit'),num=$('auN'),ring=document.querySelector('.au-score .r');
  function runAudit(score){au.classList.add('run');ring.style.strokeDashoffset=327*(1-score/100);ring.style.stroke=score<50?'#FF3B30':score<75?'#FF9500':'#34C759';
    var t0=performance.now();(function st(t){var p=Math.min(1,(t-t0)/1400);num.textContent=Math.round(score*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(st);})(t0);}
  if(au){setTimeout(function(){runAudit(54);},900);
    $('auForm').addEventListener('submit',function(e){e.preventDefault();var u=$('auUrl').value.trim();if(!u){$('auUrl').focus();return;}
      au.classList.remove('run');ring.style.strokeDashoffset=327;num.textContent='0';
      var h=0;for(var i=0;i<u.length;i++)h=(h*31+u.charCodeAt(i))%997;var sc=38+h%34;
      setTimeout(function(){runAudit(sc);},300);
      $('auNote').innerHTML='Sample score for <b>'+u.replace(/[<>&"]/g,'')+'</b>. <a href="#contact" data-cta="Get my full SEO audit">Get the full audit →</a>';});}
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
  /* results charts draw */
  var cg=document.querySelector('.cs-grid');
  if(cg&&'IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){cg.classList.add('go');o.disconnect();}},{threshold:.3}).observe(cg);else if(cg)cg.classList.add('go');
  /* section menu spy */
  var mn=$('sxMenu'),ml=mn?[].slice.call(mn.querySelectorAll('a')):[],ms=ml.map(function(a){return document.querySelector(a.getAttribute('href'));}),mlast=-1;
  function mspy(){var k=-1;ms.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.4)k=i;});if(k!==mlast){mlast=k;ml.forEach(function(a,i){a.classList.toggle('on',i===k);});if(k>=0){var a=ml[k],t=a.parentNode;t.scrollTo({left:a.offsetLeft-t.clientWidth/2+a.clientWidth/2,behavior:'smooth'});}}}
  addEventListener('scroll',mspy,{passive:true});mspy();if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',mspy);
  /* keyword finder */
  var KW={re:[['flats in {c}',2400,58],['3 bhk flats in {c}',1900,46],['new projects in {c}',1600,52],['ready to move flats {c}',880,38],['luxury apartments {c}',720,61]],
    lux:[['luxury apartments in {c}',1300,61],['villas in {c}',1000,52],['penthouse in {c}',590,44],['golf course road apartments',880,63],['4 bhk flats in {c}',720,49]],
    plot:[['plots in {c}',2900,47],['residential plots {c}',1300,42],['plots on sohna road',590,33],['township plots {c}',480,36],['sco plots {c}',390,40]],
    com:[['office space in {c}',1900,58],['retail shops for sale {c}',880,46],['commercial property {c}',1300,55],['co-working space {c}',1000,52],['sco plots for sale',480,41]],
    cp:[['new projects in {c}',1600,52],['pre launch projects {c}',1000,48],['upcoming projects {c}',880,45],['property dealer in {c}',720,39],['resale flats {c}',590,35]],
    aff:[['affordable housing {c}',1600,44],['2 bhk flats in {c}',2400,50],['flats under 50 lakh {c}',880,37],['dwarka expressway flats',1000,53],['ready to move 2 bhk {c}',590,38]]};
  var CM={Gurugram:1,Delhi:1.6,Noida:.9,Faridabad:.6,Mumbai:1.8,Bengaluru:1.7};
  function kwDraw(){var ind=$('kwInd').value,c=$('kwCity').value,m=CM[c]||1,tot=0;
    $('kwList').innerHTML=KW[ind].map(function(k,i){var v=Math.round(k[1]*(k[0].indexOf('{c}')>-1?m:1)/10)*10;tot+=v;var d=k[2],col=d<40?'#34C759':d<55?'#FF9500':'#FF3B30',lab=d<40?'Easy':d<55?'Medium':'Hard';
      return '<li style="animation-delay:'+(i*60)+'ms"><span>'+k[0].replace('{c}',c.toLowerCase())+'</span><b>'+v.toLocaleString('en-IN')+'</b><span class="kw-d" style="--w:'+d+'%;--k:'+col+'"><i></i><span>'+lab+'</span></span></li>';}).join('');
    $('kwTot').textContent=tot.toLocaleString('en-IN');}
  if($('kwInd')){$('kwInd').addEventListener('change',kwDraw);$('kwCity').addEventListener('change',kwDraw);kwDraw();}
  /* before/after search */
  var b2=$('ba2'),b2r=$('ba2R');if(b2&&b2r){b2r.addEventListener('input',function(){b2.style.setProperty('--x',b2r.value+'%');});
    if(!reduce&&'IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(!es[0].isIntersecting)return;o.disconnect();var t0=performance.now();
      (function st(t){var p=Math.min(1,(t-t0)/2200),v=50+Math.sin(p*Math.PI*2)*35*(1-p);b2.style.setProperty('--x',v+'%');b2r.value=v;if(p<1)requestAnimationFrame(st);})(t0);},{threshold:.6}).observe(b2);}
  /* draw charts on view */
  [['.fc'],['#vsChart']].forEach(function(x){var el=document.querySelector(x[0]);if(!el)return;if('IntersectionObserver' in window)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){el.classList.add('go');o.disconnect();}},{threshold:.35}).observe(el);else el.classList.add('go');});
  /* hero ad journey */
  var mh=$('mh2');
  if(mh){var ST=[1800,3000,3400,3600],si=0,mv=true,rN=45200,rEl=$('mh2R');
    function go(){if(!mv||document.hidden){setTimeout(go,600);return;}
      if(si===0){mh.classList.add('reset');mh.setAttribute('data-s','0');void mh.offsetWidth;mh.classList.remove('reset');}
      else mh.setAttribute('data-s',String(si));
      var d=ST[si];si=(si+1)%4;setTimeout(go,d);}
    if(reduce)mh.setAttribute('data-s','3');else{go();setInterval(function(){if(mh.getAttribute('data-s')==='0'||mh.getAttribute('data-s')==='1'){rN+=7+Math.floor(Math.random()*20);rEl.textContent=rN.toLocaleString('en-IN');}},500);
      if('IntersectionObserver' in window)new IntersectionObserver(function(e){mv=e[0].isIntersecting;}).observe(mh);}}
  /* hero whatsapp chat */
  var wb=$('whBody');
  if(wb){var st=$('whStat'),ch=[].slice.call(document.querySelectorAll('.wh-vis .mh2-chip')),wv=true;
    var S=[['in','Hi! I saw your ad. What\'s the price for a 3 BHK?'],['typ'],['out','Hi Priya 👋 3 BHK homes start at ₹1.6 Cr. Here\'s the brochure:',0],['doc','Sector65_Brochure.pdf'],['out','What budget are you looking at?'],['qr',['₹1–1.5 Cr','₹1.5–2 Cr','₹2 Cr+'],1],['in','₹1.5–2 Cr',null,1],['typ'],['out','Great choice! Would you like a site visit this weekend?'],['qr',['Sat 11 AM','Sun 4 PM'],1],['in','Sun 4 PM',null,2],['out','Booked ✓ See you Sunday at 4 PM. Rahul from our team will call to confirm.']];
    var i=0,tm=function(){var d=new Date();return d.getHours()+':'+('0'+d.getMinutes()).slice(-2);};
    function add(node){wb.appendChild(node);while(wb.children.length>9)wb.removeChild(wb.firstChild);}
    function step(){if(!wv||document.hidden){setTimeout(step,700);return;}
      if(i>=S.length){setTimeout(function(){wb.innerHTML='';ch.forEach(function(c){c.classList.remove('on');});i=0;step();},2600);return;}
      var s=S[i++],t=wb.querySelector('.wtyp');if(t&&s[0]!=='typ')t.remove();
      if(s[0]==='typ'){var e=document.createElement('div');e.className='wtyp';e.innerHTML='<i></i><i></i><i></i>';add(e);st.textContent='typing…';setTimeout(step,900);return;}
      st.textContent='online';
      if(s[0]==='qr'){var q=document.createElement('div');q.className='wqr';q.innerHTML=s[1].map(function(x){return '<span>'+x+'</span>';}).join('');add(q);setTimeout(step,1100);return;}
      if(s[0]==='in'&&s[3]){var qs=wb.querySelectorAll('.wqr');var last=qs[qs.length-1];if(last)[].forEach.call(last.children,function(x){if(x.textContent===s[1])x.classList.add('pick');});}
      var b=document.createElement('div');b.className='wb2 '+(s[0]==='doc'?'out doc':s[0]);b.innerHTML=(s[0]==='doc'?'<span>PDF</span>':'')+s[1]+'<time>'+tm()+'</time>';add(b);
      if(i===3)ch[0].classList.add('on');if(s[3]===1)ch[1].classList.add('on');if(i===S.length)ch[2].classList.add('on');
      setTimeout(step,s[0]==='in'?1000:1300);}
    if(reduce){S.forEach(function(s){if(s[0]==='in'||s[0]==='out'){var b=document.createElement('div');b.className='wb2 '+s[0];b.textContent=s[1];add(b);}});ch.forEach(function(c){c.classList.add('on');});}
    else{if('IntersectionObserver' in window)new IntersectionObserver(function(e){wv=e[0].isIntersecting;}).observe(wb);setTimeout(step,600);}}
  /* automation flow */
  var wf=$('wfFlow');
  if(wf){var wn=[].slice.call(wf.querySelectorAll('[data-n]')),wk=-1,wfv=false;
    function wstep(){wk=(wk+1)%6;wn.forEach(function(e){var n=+e.dataset.n;var on=n<=wk&&wk<5;e.classList.toggle('on',on);});}
    if(reduce)wn.forEach(function(e){e.classList.add('on');});else{if('IntersectionObserver' in window)new IntersectionObserver(function(e){wfv=e[0].isIntersecting;},{threshold:.3}).observe(wf);setInterval(function(){if(wfv&&!document.hidden)wstep();},1100);}}
  /* ad formats */
  var FT=$('fmtTabs'),FI=$('fmtInfo'),FD={"lead": ["Lead qualification", "Enquiries", "The bot replies instantly, shares the brochure and asks budget and timing, then sends hot leads to your sales team."], "book": ["Site visits", "Visit booking", "Buyers pick a site visit slot in chat and get automatic reminders, so fewer people miss their visit."], "bc": ["Broadcasts", "Offers & launches", "Send launches, price updates and offers to thousands of opted-in buyers and channel partners, with images, buttons and read tracking."], "shop": ["Brochure & price sheet", "Project info on chat", "Buyers get the brochure, price sheet, floor plans and location map in chat, then book a site visit without leaving WhatsApp."], "rem": ["Reminders & updates", "Follow-ups", "Site visit reminders, construction updates and payment plan reminders sent automatically at the right time."]},fk=Object.keys(FD),fi=0,ft=null,fvis=false;
  function fset(k){fi=fk.indexOf(k);[].forEach.call(FT.children,function(b){b.setAttribute('aria-selected',b.dataset.f===k);});
    [].forEach.call(document.querySelectorAll('.pf'),function(p){p.classList.remove('on');if(p.dataset.f===k){void p.offsetWidth;p.classList.add('on');}});
    var b=FT.querySelector('[data-f="'+k+'"]');FI.style.setProperty('--c',b.style.getPropertyValue('--c'));FI.innerHTML='<b>'+FD[k][0]+' · '+FD[k][1].toLowerCase()+'.</b> '+FD[k][2];FI.style.animation='none';void FI.offsetWidth;FI.style.animation='';}
  if(FT){fset(fk[0]);FT.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;fset(b.dataset.f);clearInterval(ft);ft=null;});
    if(!reduce&&'IntersectionObserver' in window)new IntersectionObserver(function(es){fvis=es[0].isIntersecting;if(fvis&&ft===undefined)return;},{threshold:.4}).observe(FT);
    var auto=setInterval(function(){if(!ft&&ft!==undefined){}if(fvis&&document.visibilityState==='visible'&&auto&&!FT._stop)fset(fk[(fi+1)%fk.length]);},4200);
    FT.addEventListener('click',function(){FT._stop=1;});}
  /* lead flow timeline */
  var lf=$('lfFlow');
  if(lf){var lis=[].slice.call(lf.querySelectorAll('li')),ck=$('lfClock'),T=[0,3,5,45,52],k=-1,lv=false;
    function fmtT(v){return v<60?v+'s':Math.floor(v/60)+'m '+(v%60)+'s';}
    function step(){k++;if(k>lis.length+1){k=0;}lis.forEach(function(l,i){l.classList.toggle('on',i<=k&&k<lis.length+1);});
      if(k<lis.length){var from=k?T[k-1]:0,to=T[k],t0=performance.now();(function st(n){var p=Math.min(1,(n-t0)/700);ck.textContent=fmtT(Math.round(from+(to-from)*p));if(p<1)requestAnimationFrame(st);})(t0);}
      if(k===lis.length+1){lis.forEach(function(l){l.classList.remove('on');});ck.textContent='0s';}}
    if(reduce){lis.forEach(function(l){l.classList.add('on');});ck.textContent='52s';}
    else{if('IntersectionObserver' in window)new IntersectionObserver(function(es){lv=es[0].isIntersecting;},{threshold:.35}).observe(lf);else lv=true;
      setInterval(function(){if(lv&&!document.hidden)step();},1300);}}
  /* FAQ one at a time */
  var fq=$('sFaq');if(fq)[].forEach.call(fq.querySelectorAll('details'),function(d){d.addEventListener('toggle',function(){if(d.open)[].forEach.call(fq.querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});});});
})();

