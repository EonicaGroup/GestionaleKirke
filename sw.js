/* KIRKE — service worker: notifiche push (prenotazioni + gestionale) */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function(event){
  var data={};
  try{ data=event.data.json(); }
  catch(_){ data={title:'KIRKE', body:(event.data&&event.data.text&&event.data.text())||'Nuova notifica'}; }
  // Sul computer le notifiche svaniscono dopo pochi secondi e finiscono nel Centro
  // Notifiche senza che te ne accorga: lì restano finché non le tocchi.
  var desktop = !/Android|iPhone|iPad|Mobile/i.test(self.navigator && self.navigator.userAgent || '');
  // Icone servite dallo stesso sito: se arrivano da un dominio esterno il sistema
  // non le associa all'app e mostra l'icona del browser al loro posto.
  event.waitUntil(self.registration.showNotification(data.title||'KIRKE',{
    body:data.body||'',
    icon:'./icon-512.png',
    badge:'./icon-192.png',
    image:data.image||undefined,
    tag:data.tag||'kirke-pren', renotify:true, vibrate:[90,40,90],
    requireInteraction: desktop,
    silent:false,
    actions: desktop ? [{action:'apri',title:'Apri'},{action:'dopo',title:'Più tardi'}] : [],
    data:{url:data.url||'./'}
  }));
});
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  if(event.action==='dopo') return;            // "Più tardi": chiude e basta
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
