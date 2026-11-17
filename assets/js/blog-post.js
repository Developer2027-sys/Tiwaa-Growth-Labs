/* Blog article pages: table of contents, copy link, calculator, checklist, FAQ. */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  var art=$('bpArt');
  /* toc scroll spy */
  var tl=[].slice.call(document.querySelectorAll('#bpToc a')),hs=tl.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
  function spy(){var k=0;hs.forEach(function(h,i){if(h&&h.getBoundingClientRect().top<innerHeight*.3)k=i;});tl.forEach(function(a,i){a.classList.toggle('on',i===k);if(i===k)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}
  addEventListener('scroll',spy,{passive:true});spy();
  /* copy link */
  var cp=$('bpCopy');cp.addEventListener('click',function(){var u='https://www.tiwaagrowthlab.com/blog/cut-cost-per-site-visit-meta-lead-forms',ok=function(){$('bpCopied').hidden=false;setTimeout(function(){$('bpCopied').hidden=true;},2000);};
    try{navigator.clipboard.writeText(u).then(ok,function(){prompt0(u);ok();});}catch(e){prompt0(u);ok();}});
  function prompt0(u){var t=document.createElement('textarea');t.value=u;document.body.appendChild(t);t.select();try{document.execCommand('copy');}catch(e){}t.remove();}
  /* calculator */
  function inr(n){return '₹'+Math.round(n).toLocaleString('en-IN');}
  var B=$('clB'),C=$('clC'),R=$('clR'),A=$('clA');
  function calc(){var b=+B.value,c=+C.value,r=+R.value/100,a=+A.value/100,l=b/c,v1=l*r,v2=l*a,p1=v1?b/v1:0,p2=v2?b/v2:0;
    $('clBo').textContent=inr(b);$('clCo').textContent=inr(c);$('clRo').textContent=R.value+'%';$('clAo').textContent=A.value+'%';
    $('clL').textContent=Math.round(l).toLocaleString('en-IN');$('clV1').textContent=Math.round(v1).toLocaleString('en-IN');$('clV2').textContent=Math.round(v2).toLocaleString('en-IN');
    $('clP1').textContent=inr(p1);$('clP2').textContent=inr(p2);var s=p1?Math.round((1-p2/p1)*100):0;
    $('clSave').innerHTML=s>0?'That is <b>'+s+'% less</b> per site visit, on the same budget.':s<0?'That would cost <b>'+(-s)+'% more</b> per site visit. Raise the "after" rate to see the gain.':'No change in cost per site visit.';}
  [B,C,R,A].forEach(function(i){i.addEventListener('input',calc);});calc();
  /* checklist */
  var cb=[].slice.call(document.querySelectorAll('#bpChk input'));
  function cc(){var n=cb.filter(function(x){return x.checked;}).length;$('bpChkS').textContent=n===cb.length?'All 8 done. Your form is ready to launch.':n+' of '+cb.length+' done';}
  cb.forEach(function(x){x.addEventListener('change',cc);});

})();
