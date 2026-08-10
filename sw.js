/* KIRKE — service worker: notifiche push (prenotazioni + gestionale) */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function(event){
  var data={};
  try{ data=event.data.json(); }
  catch(_){ data={title:'KIRKE', body:(event.data&&event.data.text&&event.data.text())||'Nuova notifica'}; }
  event.waitUntil(self.registration.showNotification(data.title||'KIRKE',{
    body:data.body||'',
    icon:'https://crumhchnzebiqmbaivjt.supabase.co/storage/v1/object/public/appdist/kirke-192.png',
    badge:'https://crumhchnzebiqmbaivjt.supabase.co/storage/v1/object/public/appdist/kirke-192.png',
    tag:data.tag||'kirke-pren', renotify:true, vibrate:[90,40,90], data:{url:data.url||'./'}
  }));
});
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var url=(event.notification.data&&event.notification.data.url)||'./';
  var full=new URL(url, self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){
      var c=list[i];
      if(c.url.indexOf(self.location.origin)===0){
        // la finestra è già aperta: la porto sul deep link e la metto a fuoco
        if('navigate' in c){ return c.navigate(full).then(function(w){ return (w||c).focus(); }); }
        c.postMessage({kirkeGo:full});
        return c.focus();
      }
    }
    return self.clients.openWindow(full);
  }));
});
