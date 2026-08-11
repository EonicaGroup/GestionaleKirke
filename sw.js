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
        // Finestra già aperta. Su iPhone navigate() spesso non fa nulla e la app resta
        // dov'era: perciò mando SEMPRE anche il messaggio, che l'app sa applicare da sola.
        try{ c.postMessage({kirkeGo:full}); }catch(e){}
        var p=c.focus();
        if('navigate' in c){ try{ c.navigate(full).catch(function(){}); }catch(e){} }
        return p;
      }
    }
    return self.clients.openWindow(full);
  }));
});
