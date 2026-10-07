const C='afrowriter-v25',F=['./','index.html','manifest.json','icon-192.png','icon-512.png','maskable-512.png','apple-touch-icon.png','favicon-32.png','logo-badge.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// Pages and the manifest: try the network first so updates show up straight away,
// fall back to the saved copy when offline or slow. Everything else: saved copy first.
function netFirst(req){
  return new Promise(res=>{
    const slow=setTimeout(()=>caches.match(req).then(r=>r&&res(r)),3000);
    fetch(req,{cache:'no-cache'}).then(n=>{clearTimeout(slow);const cp=n.clone();caches.open(C).then(c=>c.put(req,cp));res(n)})
      .catch(()=>{clearTimeout(slow);caches.match(req).then(r=>res(r||caches.match('index.html')))});
  });
}
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  if(r.mode==='navigate'||/\.(html|json)$/.test(u.pathname)||u.pathname.endsWith('/')){e.respondWith(netFirst(r));return}
  e.respondWith(caches.match(r).then(c=>c||fetch(r).then(n=>{const cp=n.clone();caches.open(C).then(x=>x.put(r,cp));return n})));
});
