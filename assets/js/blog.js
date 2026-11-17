/* Blog listing (/blog): search box and topic filters. */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(i){return document.getElementById(i);}
  var q=$('blQ'),chips=[].slice.call(document.querySelectorAll('.bl-chips button')),items=[].slice.call(document.querySelectorAll('.bl-feat,.bl-c')),t='all';
  function apply(){var v=(q.value||'').trim().toLowerCase(),n=0;items.forEach(function(it){var ok=(t==='all'||it.dataset.t===t)&&(!v||(it.textContent+' '+(it.dataset.k||'')).toLowerCase().indexOf(v)>-1);it.classList.toggle('hide',!ok);if(ok){n++;it.classList.add('in');}});$('blNone').hidden=n>0;}
  chips.forEach(function(c){c.addEventListener('click',function(){t=c.dataset.t;chips.forEach(function(x){x.classList.toggle('on',x===c);x.setAttribute('aria-pressed',x===c);});apply();});});
  q.addEventListener('input',apply);
  var h=(location.hash||'').slice(1);chips.forEach(function(c){if(c.dataset.t===h)c.click();});

})();
