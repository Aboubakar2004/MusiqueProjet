/**
 * Page HTML chargée dans une WebView invisible.
 * Elle reprend la logique du prototype : widget officiel + getSounds(),
 * puis envoie la liste à l'app avec window.ReactNativeWebView.postMessage().
 *
 * Messages envoyés : { type: 'progress', loaded, total }
 *                    { type: 'sounds', sounds: [...] }
 *                    { type: 'error', message }
 */
export function buildWidgetHtml(playlistUrl: string): string {
  const widgetSrc =
    'https://w.soundcloud.com/player/?url=' + encodeURIComponent(playlistUrl) + '&auto_play=false';

  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body>
<iframe id="sc" src=${JSON.stringify(widgetSrc)} allow="autoplay" width="300" height="300"></iframe>
<script src="https://w.soundcloud.com/player/api.js"></script>
<script>
  function send(msg) { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  if (!window.SC) {
    send({ type: 'error', message: 'Impossible de charger le script SoundCloud (connexion ?)' });
  } else {
    var widget = SC.Widget(document.getElementById('sc'));
    var finished = false;

    function getSounds() {
      return new Promise(function (resolve) { widget.getSounds(resolve); });
    }

    // On ne garde que les champs utiles pour limiter la taille du message
    function slim(s) {
      return {
        id: s.id, title: s.title, duration: s.duration, artwork_url: s.artwork_url,
        permalink_url: s.permalink_url,
        user: s.user ? { username: s.user.username, avatar_url: s.user.avatar_url } : undefined
      };
    }

    async function loadAll() {
      // 1. Attendre que la liste arrive (le widget peut être "prêt" avant)
      var sounds = [];
      for (var i = 0; i < 8 && sounds.length === 0; i++) {
        sounds = await getSounds();
        if (sounds.length === 0) await wait(1000);
      }
      if (sounds.length === 0) {
        finished = true;
        return send({ type: 'error', message: 'Playlist vide ou introuvable (est-elle publique ?)' });
      }

      // 2. Les titres arrivent par paquets : sauter (en muet) sur le premier titre
      //    incomplet force le widget à charger le paquet suivant.
      widget.setVolume(0);
      for (var round = 0; round < 50; round++) {
        var idx = sounds.findIndex(function (s) { return !s.title; });
        send({ type: 'progress', loaded: sounds.filter(function (s) { return s.title; }).length, total: sounds.length });
        if (idx < 0) break;
        widget.skip(idx);
        await wait(1500);
        widget.pause();
        sounds = await getSounds();
      }
      widget.pause();
      finished = true;
      send({ type: 'sounds', sounds: sounds.map(slim) });
    }

    widget.bind(SC.Widget.Events.READY, function () { loadAll(); });
    widget.bind(SC.Widget.Events.ERROR, function () {
      finished = true;
      send({ type: 'error', message: 'Le widget SoundCloud refuse cette adresse.' });
    });
    // Sécurité : si rien n'arrive au bout de 60 s, on prévient l'app
    setTimeout(function () {
      if (!finished) send({ type: 'error', message: 'SoundCloud ne répond pas (délai dépassé).' });
    }, 60000);
  }
</script>
</body></html>`;
}
