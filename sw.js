/* KIRKE — service worker: notifiche push delle prenotazioni */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function(event){
  var data={};
  try{ data=event.data.json(); }
  catch(_){ data={title:'KIRKE', body:(event.data&&event.data.text&&event.data.text())||'Nuova prenotazione'}; }
  event.waitUntil(self.registration.showNotification(data.title||'KIRKE — Prenotazioni',{
    body:data.body||'Nuova prenotazione',
    icon:'https://crumhchnzebiqmbaivjt.supabase.co/storage/v1/object/public/appdist/kirke-192.png',
    badge:'https://crumhchnzebiqmbaivjt.supabase.co/storage/v1/object/public/appdist/kirke-192.png',
    tag:'kirke-pren', renotify:true, vibrate:[90,40,90], data:{url:data.url||'./'}
  }));
});
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var url=(event.notification.data&&event.notification.data.url)||'./';
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){ if(list[i].url.indexOf(self.location.origin)===0){ list[i].focus(); return; } }
    return self.clients.openWindow(url);
  }));
});
