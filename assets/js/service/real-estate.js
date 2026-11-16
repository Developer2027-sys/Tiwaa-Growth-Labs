/* Interactive parts of /industries/real-estate: hero dashboard feed, "how it works" tabs, lead-to-visit chat, services hub, case-study toggle, FAQ. Ported from the design artifact. */

(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  /* real estate · v4 */
  var dw=document.querySelector('.rp-dw');
  if(dw){setTimeout(function(){dw.classList.add('go');},500);
    var fd=$('rdFeed'),FL=[['PN','Pooja N.','3 BHK · ₹1.8 Cr','Meta','Replied 5s','#5856D6'],['KJ','Karan J.','Villa · ₹4 Cr+','Google','Visit Sun','#34C759'],['SA','Sameer A.','2 BHK · ₹95 L','Portal','Replied 8s','#FF2D55'],['DR','Divya R.','4 BHK · NRI · UK','YouTube','Replied 7s','#FF9500'],['MT','Manish T.','3 BHK · ₹1.6 Cr','Meta','Visit Sat','#007AFF']],fi=0;
    if(fd&&!reduce)setInterval(function(){if(document.hidden)return;var r=dw.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var d=FL[fi],li=document.createElement('li');fi=(fi+1)%FL.length;
      li.className='new';li.innerHTML='<span class="fa" style="--c:'+d[5]+'">'+d[0]+'</span><div><b>'+d[1]+'</b><small>'+d[2]+'</small></div><em class="src">'+d[3]+'</em><span class="st'+(d[4].indexOf('Visit')===0?' vis':'')+'">'+d[4]+'</span>';
      fd.insertBefore(li,fd.firstChild);if(fd.children.length>3)fd.removeChild(fd.lastElementChild);},3200);}
  /* how it works tabs */
  var hwt=$('hwTabs');
  if(hwt){var hts=[].slice.call(hwt.querySelectorAll('.hw-t')),hps=[].slice.call(document.querySelectorAll('.hw-p')),hk=0,hvis=false,htm2=null,HD=6000,hman=false;
    function hwset(k){hk=k;hts.forEach(function(t,i){var o=i===k;t.classList.toggle('on',o);t.setAttribute('aria-selected',o);t.tabIndex=o?0:-1;var s=t.querySelector('.hw-bar s');if(s){s.style.animation='none';void s.offsetWidth;s.style.animation='';}});hps.forEach(function(p,i){p.classList.toggle('on',i===k);});
      var c=hps[k].querySelector('.ctr');if(c){var to=+c.dataset.to,t0=performance.now();(function st(t){var q=Math.min(1,(t-t0)/1200);c.textContent=Math.round(to*(1-Math.pow(1-q,3))).toLocaleString('en-IN');if(q<1)requestAnimationFrame(st);})(t0);}}
    function hwtick(){clearTimeout(htm2);if(reduce||hman)return;htm2=setTimeout(function(){if(hvis&&!document.hidden){hwset((hk+1)%hts.length);}hwtick();},HD);}
    hwt.style.setProperty('--hwd',HD+'ms');
    hts.forEach(function(t,i){t.addEventListener('click',function(){hwset(i);hwtick();});t.addEventListener('keydown',function(e){var d=e.key==='ArrowDown'||e.key==='ArrowRight'?1:e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();var n=(hk+d+hts.length)%hts.length;hwset(n);hts[n].focus();hwtick();}});});
    if('IntersectionObserver' in window)new IntersectionObserver(function(e){var v=e[0].isIntersecting;if(v&&!hvis){hvis=true;hwset(hk);hwtick();}else hvis=v;},{threshold:.35}).observe(hwt.parentNode);else hvis=true;
    if(reduce)hwt.classList.add('paused');}
  /* chat flow */
  var tlb=$('lqTl');
  if(tlb){var tls=[].slice.call(tlb.children),lqM=[].slice.call(document.querySelectorAll('#lqChat .m')),ck=$('lqClock'),g1=document.querySelector('.rp-f2.g1'),g2=document.querySelector('.rp-f2.g2'),fv=false,ftm=null,ckb=$('lqCkBar');
    function fmt(v){return v<60?v+'s':Math.round(v/60)+'m';}
    function fset(k){tls.forEach(function(l,i){l.classList.toggle('on',i<=k);l.classList.toggle('cur',i===k);});tlb.style.setProperty('--tp',k<=0?0:k/(tls.length-1));if(ckb)ckb.style.width=(k<0?0:Math.max(4,+tls[k].dataset.t/6))+'%';lqM.forEach(function(m){m.classList.toggle('on',+m.dataset.s<=k);});ck.textContent=k<0?'0s':fmt(+tls[k].dataset.t);g1.classList.toggle('on',k>=2);g2.classList.toggle('on',k>=3);}
    function frun(){fset(0);var k=1;clearInterval(ftm);ftm=setInterval(function(){if(!fv||document.hidden)return;if(k<tls.length){fset(k);k++;}else if(k<tls.length+3){k++;}else{fset(0);k=1;}},1500);}
    fset(0);if(reduce)fset(tls.length-1);else if('IntersectionObserver' in window)new IntersectionObserver(function(e){fv=e[0].isIntersecting;if(fv&&!ftm)frun();},{threshold:.2}).observe($('re-flow'));else fset(tls.length-1);}
  /* services hub */
  var sgl=document.querySelectorAll('.sv2'),hns=document.querySelectorAll('.hub-n'),hl=$('hubLbl'),hi=0,hon=false;
  function hset(k){[].forEach.call(sgl,function(c,i){c.classList.toggle('hot',i===k);});[].forEach.call(hns,function(n,i){n.classList.toggle('hot',i===k);});if(hl)hl.textContent=k<0?'8 channels live':(sgl[k].querySelector('b').textContent);}
  [].forEach.call(sgl,function(c,i){c.addEventListener('mouseenter',function(){hon=true;hset(i);});c.addEventListener('mouseleave',function(){hon=false;});});
  if(sgl.length&&!reduce){setInterval(function(){if(hon||document.hidden)return;var r=sgl[0].getBoundingClientRect();if(r.top>innerHeight||r.bottom<-600)return;hi=(hi+1)%sgl.length;hset(hi);},2200);}
  /* case toggle */
  var csw=$('csSw');
  if(csw){var lqCms=$('csMs'),cbs=[].slice.call(csw.querySelectorAll('button')),cv=1,cst=false,cvis=false;
    function cset(v){cv=v;cbs.forEach(function(b,i){b.setAttribute('aria-selected',i===v);});csw.classList.toggle('b',v===1);lqCms.classList.toggle('a',v===0);
      [].forEach.call(lqCms.querySelectorAll('b'),function(b){if(b.dataset.at){b.textContent=v?b.dataset.bt:b.dataset.at;return;}var to=+(v?b.dataset.b:b.dataset.a),fr=+(v?b.dataset.a:b.dataset.b),t0=performance.now(),pp=b.dataset.p||'',ss=b.dataset.s||'';(function st(t){var q=Math.min(1,(t-t0)/800);b.textContent=pp+Math.round(fr+(to-fr)*q).toLocaleString('en-IN')+ss;if(q<1)requestAnimationFrame(st);})(t0);});}
    cbs.forEach(function(b,i){b.addEventListener('click',function(){cst=true;cset(i);});});
    var chs=document.querySelector('.rc-ch');
    if('IntersectionObserver' in window)new IntersectionObserver(function(e){cvis=e[0].isIntersecting;if(cvis)chs.classList.add('go');},{threshold:.3}).observe(chs);else chs.classList.add('go');
    if(!reduce){cset(0);setInterval(function(){if(cvis&&!cst&&!document.hidden)cset(cv?0:1);},3200);}else cset(1);}
  /* faq */
  var fqs=[].slice.call(document.querySelectorAll('.rp .fq'));fqs.forEach(function(q){q.querySelector('.fq-q').addEventListener('click',function(){var o=!q.classList.contains('open');fqs.forEach(function(x){x.classList.remove('open');x.querySelector('.fq-q').setAttribute('aria-expanded','false');});if(o){q.classList.add('open');q.querySelector('.fq-q').setAttribute('aria-expanded','true');}});});
})();
