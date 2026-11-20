/* Tiwaa Growth Labs: services hub page interactions */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* index scroll-spy */
  var idx=document.getElementById('svIndex'),links=idx?[].slice.call(idx.querySelectorAll('a')):[],secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
  var last=-1;
  function spy(){var k=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.4)k=i;});
    if(k!==last){last=k;links.forEach(function(a,i){a.classList.toggle('on',i===k);});
      if(k>=0){var a=links[k],t=a.parentNode;t.scrollTo({left:a.offsetLeft-t.clientWidth/2+a.clientWidth/2,behavior:reduce?'auto':'smooth'});}}}
  addEventListener('scroll',spy,{passive:true});spy();
  if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',spy);
  /* scroll trigger: play each service preview once it is in view */
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}});},{threshold:.3});
    document.querySelectorAll('.svd').forEach(function(s){io.observe(s);});}
  else document.querySelectorAll('.svd').forEach(function(s){s.classList.add('in-view');});
  /* differentiator flow: light each step in turn */
  var fl=document.querySelector('.df-flow');
  if(fl&&!reduce){var st=[].slice.call(fl.querySelectorAll('span')),fi=0,fv=false;
    setInterval(function(){if(!fv||document.hidden)return;st.forEach(function(x,j){x.classList.toggle('lit',j<=fi);});fi=(fi+1)%(st.length+1);},900);
    if('IntersectionObserver' in window)new IntersectionObserver(function(e){fv=e[0].isIntersecting;}).observe(fl);else fv=true;}
  else if(fl)fl.querySelectorAll('span').forEach(function(x){x.classList.add('lit');});
  /* service scroll flow: pinned copy, panels scroll, progress line */
  var svds=[].slice.call(document.querySelectorAll('.svd'));
  function flow(){var vh=innerHeight;
    svds.forEach(function(sec){var r=sec.getBoundingClientRect();if(r.bottom<-50||r.top>vh+50)return;
      var tot=r.height-vh*.6,p=Math.max(0,Math.min(1,(vh*.35-r.top)/Math.max(1,tot)));sec.style.setProperty('--sp',p.toFixed(3));
      [].forEach.call(sec.querySelectorAll('.svp'),function(pn){var q=pn.getBoundingClientRect();var on=q.top<vh*.72&&q.bottom>vh*.22;pn.classList.toggle('on',on);
        if(on&&pn.classList.contains('svp-1'))sec.classList.add('in-view');
        if(on&&pn.classList.contains('svp-2')&&!pn._done){pn._done=1;[].forEach.call(pn.querySelectorAll('li'),function(li,k){setTimeout(function(){li.classList.add('on');},250+k*450);});}});});}
  addEventListener('scroll',flow,{passive:true});addEventListener('resize',flow);flow();
  if(window.__lenis&&window.__lenis.on)window.__lenis.on('scroll',flow);
  if(matchMedia('(max-width:980px)').matches||reduce){svds.forEach(function(s){s.classList.add('in-view');s.querySelectorAll('.svp,.svd-flow li').forEach(function(x){x.classList.add('on');});});}
  /* offer filter */
  var ot=document.getElementById('ofTabs'),og=document.getElementById('ofGrid');
  if(ot&&og)ot.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var g=b.dataset.g;
    [].forEach.call(ot.children,function(x){x.setAttribute('aria-selected',x===b);});
    og.classList.toggle('filtered',g!=='all');[].forEach.call(og.children,function(c){c.classList.toggle('match',g!=='all'&&(' '+c.dataset.goal+' ').indexOf(' '+g+' ')>-1);});});
  /* quiz */
  var qz=document.getElementById('qz');
  if(qz){var A={},steps=[].slice.call(qz.querySelectorAll('.qz-step')),prog=[].slice.call(qz.querySelectorAll('.qz-prog li')),
    INFO={'seo':['SEO for Real Estate','Free enquiries from project searches'],'google-ads':['Google Ads for Real Estate','High-intent buyers fast'],'meta-ads':['Meta Ads for Real Estate','Buyer leads at scale'],'social-media':['Social Media for Real Estate','Visibility and buyer trust'],'whatsapp':['WhatsApp Automation','Reply to buyers in under 60 seconds'],'website':['Project Websites & Landing Pages','Turn visits into site visit requests'],'content':['Real Estate Content & Video','Films and creatives that stop the scroll'],'analytics':['Real Estate CRM & Analytics','Track every lead to booking'],'capi':['Conversions API','Ads that learn from site visits']};
    function show(n){steps.forEach(function(s,i){s.classList.toggle('on',i===n);});prog.forEach(function(p,i){p.classList.toggle('on',i<=Math.min(n,2));});}
    function rec(){var g=A.goal,b=+A.bud,biz=A.biz,r=[];
      if(g==='lead')r=['google-ads','meta-ads','whatsapp'];else if(g==='sell')r=['google-ads','website','meta-ads'];else if(g==='brand')r=['social-media','content','seo'];else r=['whatsapp','analytics','website'];
      if(biz==='local'&&r.indexOf('seo')<0)r[2]='seo';if(biz==='b2b'&&g==='lead')r[1]='seo';
      if(b>=2&&r.indexOf('analytics')<0)r.push('analytics');if(b>=2&&(g==='lead'||g==='sell')&&r.indexOf('capi')<0)r.push('capi');if(b>=3&&r.indexOf('seo')<0)r.push('seo');
      document.getElementById('qzTitle').textContent=b>=3?'A full-funnel growth plan':b>=2?'A multi-channel growth plan':'A focused starter plan';
      document.getElementById('qzRecs').innerHTML=r.map(function(id,i){var sec=document.getElementById(id),ni=sec?sec.querySelector('.svd-eb .ni'):null,ic=ni?ni.innerHTML:'',nc=ni?ni.className:'ni',c=sec?sec.style.getPropertyValue('--c'):'';
        return '<a class="qz-rec" href="#'+id+'" style="--c:'+c+';animation-delay:'+(i*80)+'ms"><span class="'+nc+'">'+ic+'</span><span><b>'+INFO[id][0]+'</b><small>'+INFO[id][1]+'</small></span><em>See details →</em></a>';}).join('');
      document.getElementById('qzCta').dataset.cta='Get my plan: '+r.map(function(id){return INFO[id][0];}).slice(0,3).join(', ');}
    steps.forEach(function(s,i){var o=s.querySelector('.qz-opts');if(o)o.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;A[s.dataset.q]=b.dataset.v;if(i===2)rec();show(i+1);});});
    var qa=document.getElementById('qzAgain');if(qa)qa.addEventListener('click',function(){A={};show(0);});}
  /* sticky audit button */
  var fb=document.createElement('a');fb.className='sv-float';fb.href='#contact';fb.dataset.cta='Get a Free Growth Audit';fb.innerHTML='<i></i>Get a free audit';document.body.appendChild(fb);
  var hero=document.querySelector('.sv-hero'),ct=document.getElementById('contact');
  function svFl(){var on=hero&&hero.getBoundingClientRect().bottom<0&&!(ct&&ct.getBoundingClientRect().top<innerHeight);fb.classList.toggle('on',!!on);}
  addEventListener('scroll',svFl,{passive:true});svFl();
  /* FAQ: one open at a time */
  var fq=document.getElementById('sFaq');
  if(fq)[].forEach.call(fq.querySelectorAll('details'),function(d){d.addEventListener('toggle',function(){if(d.open)[].forEach.call(fq.querySelectorAll('details[open]'),function(o){if(o!==d)o.open=false;});});});
  /* open the right service when arriving with #hash */
  if(location.hash){var t=null;try{t=document.querySelector(location.hash);}catch(e){}if(t)setTimeout(function(){var y=t.getBoundingClientRect().top+scrollY-120;if(window.__lenis)window.__lenis.scrollTo(y,{immediate:true});else scrollTo(0,y);},300);}
})();
