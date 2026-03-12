(function () {
  const CONNECT_TOPIC = 'PB_CONNECT';
  const PRESENCE_TOPIC = 'site-presence';
  const SNAPSHOT_PATH = '/api/live/presence';

  let lastKnownCount = null;
  let pocketBaseClient = null;

  function getCounterElements() {
    return {
      root: document.getElementById('liveCounter'),
      value: document.getElementById('liveCounterValue')
    };
  }

  function formatCount(count) {
    return new Intl.NumberFormat('en-US').format(Math.max(0, Math.floor(Number(count) || 0)));
  }

  function setCounterState(state, count, meta) {
    const elements = getCounterElements();
    if (!elements.root || !elements.value) return;

    elements.root.dataset.state = state;
    elements.value.textContent = count === null || count === undefined ? '...' : formatCount(count);
    if (meta) {
      elements.root.title = meta;
    }
  }

  function applyPresenceCount(count, meta) {
    lastKnownCount = count;
    setCounterState('live', count, meta || 'live users');
  }

  function parsePresenceMessage(message) {
    if (message && typeof message.count === 'number') {
      return message;
    }

    if (message && typeof message.data === 'object' && typeof message.data.count === 'number') {
      return message.data;
    }

    if (message && typeof message.data === 'string') {
      try {
        const parsed = JSON.parse(message.data);
        if (parsed && typeof parsed.count === 'number') {
          return parsed;
        }
      } catch (error) {
        console.error('Presence payload parse error:', error);
      }
    }

    return null;
  }

  async function refreshPresenceSnapshot() {
    if (!pocketBaseClient) return;

    try {
      const snapshot = await pocketBaseClient.send(SNAPSHOT_PATH, {
        method: 'GET',
        requestKey: null
      });

      if (snapshot && typeof snapshot.count === 'number') {
        applyPresenceCount(snapshot.count, 'live users');
      }
    } catch (error) {
      console.error('Presence snapshot request failed:', error);
      if (lastKnownCount === null) {
        setCounterState('syncing', null, 'syncing');
      }
    }
  }

  async function initOnlineCounter() {
    const elements = getCounterElements();
    if (!elements.root) return;

    if (typeof window.PocketBase !== 'function') {
      setCounterState('error', null, 'counter unavailable');
      return;
    }

    pocketBaseClient = new window.PocketBase(window.location.origin);
    pocketBaseClient.autoCancellation(false);

    pocketBaseClient.realtime.onDisconnect = function (activeSubscriptions) {
      const hasPresenceSubscriptions = Array.isArray(activeSubscriptions) &&
        activeSubscriptions.some(function (subscription) {
          return typeof subscription === 'string' &&
            (subscription === CONNECT_TOPIC || subscription.indexOf(PRESENCE_TOPIC) === 0);
        });

      setCounterState(hasPresenceSubscriptions ? 'syncing' : 'offline', lastKnownCount, hasPresenceSubscriptions ? 'reconnecting' : 'offline');
    };

    setCounterState('loading', null, 'connecting');

    try {
      await pocketBaseClient.realtime.subscribe(CONNECT_TOPIC, function () {
        refreshPresenceSnapshot();
      });

      await pocketBaseClient.realtime.subscribe(PRESENCE_TOPIC, function (message) {
        const payload = parsePresenceMessage(message);
        if (!payload || typeof payload.count !== 'number') return;
        applyPresenceCount(payload.count, 'live users');
      });

      await refreshPresenceSnapshot();
    } catch (error) {
      console.error('Presence counter failed to initialize:', error);
      setCounterState('error', lastKnownCount, 'counter offline');
      return;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        refreshPresenceSnapshot();
      }
    });

    window.addEventListener('pagehide', function () {
      if (pocketBaseClient) {
        pocketBaseClient.realtime.unsubscribe().catch(function () { });
      }
    }, { once: true });
  }

  document.addEventListener('DOMContentLoaded', initOnlineCounter);
}());
