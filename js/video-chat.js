(function () {
  const pb = typeof window.PocketBase === 'function'
    ? new window.PocketBase(window.location.origin)
    : null;

  const state = {
    session: null,
    ageAccepted: false,
    mode: 'idle',
    onlineCount: 0,
    partner: null,
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    dataChannel: null,
    signalSubscriptionBound: false,
    statusPollHandle: null,
    signalPollHandle: null,
    heartbeatHandle: null,
    onlinePollHandle: null,
    sessionPollHandle: null,
    reconnectHandle: null,
    activeMatchId: '',
    seenSignalIds: {},
    noticeText: '',
    messageLog: [],
    leaving: false,
    muteEnabled: true,
    cameraEnabled: true
  };

  if (pb) {
    pb.autoCancellation(false);
  }

  function getElements() {
    return {
      videoSection: document.getElementById('video-section'),
      videoAuthLock: document.getElementById('videoAuthLock'),
      videoApp: document.getElementById('videoApp'),
      videoAgeGate: document.getElementById('videoAgeGate'),
      videoAcceptButton: document.getElementById('videoAcceptButton'),
      videoLandingCard: document.getElementById('videoLandingCard'),
      videoStage: document.getElementById('videoStage'),
      videoStartButton: document.getElementById('videoStartButton'),
      videoOnlinePill: document.getElementById('videoOnlinePill'),
      videoStatusKicker: document.getElementById('videoStatusKicker'),
      videoStatusTitle: document.getElementById('videoStatusTitle'),
      videoStatusSubtitle: document.getElementById('videoStatusSubtitle'),
      videoOnlineCountInline: document.getElementById('videoOnlineCountInline'),
      videoLocalPreview: document.getElementById('videoLocalPreview'),
      videoRemotePreview: document.getElementById('videoRemotePreview'),
      videoLocalPlaceholder: document.getElementById('videoLocalPlaceholder'),
      videoRemotePlaceholder: document.getElementById('videoRemotePlaceholder'),
      videoRemotePlaceholderText: document.getElementById('videoRemotePlaceholderText'),
      videoLocalUsername: document.getElementById('videoLocalUsername'),
      videoRemoteUsername: document.getElementById('videoRemoteUsername'),
      videoChatLog: document.getElementById('videoChatLog'),
      videoChatForm: document.getElementById('videoChatForm'),
      videoChatInput: document.getElementById('videoChatInput'),
      videoChatSendButton: document.getElementById('videoChatSendButton'),
      videoDisconnectButton: document.getElementById('videoDisconnectButton'),
      videoNextButton: document.getElementById('videoNextButton'),
      videoMuteButton: document.getElementById('videoMuteButton'),
      videoCameraButton: document.getElementById('videoCameraButton')
    };
  }

  function syncAuthStore() {
    if (!pb || typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    let raw = null;
    const keys = ['pb_auth', 'pocketbase_auth'];

    for (let i = 0; i < keys.length; i += 1) {
      const next = window.localStorage.getItem(keys[i]);
      if (next) {
        raw = next;
        break;
      }
    }

    if (!raw) {
      pb.authStore.clear();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token) {
        pb.authStore.save(parsed.token, parsed.model || null);
      } else {
        pb.authStore.clear();
      }
    } catch (error) {
      pb.authStore.clear();
    }
  }

  function loadAgeGatePreference() {
    try {
      state.ageAccepted = window.sessionStorage.getItem('videoChatAgeAccepted') === 'true';
    } catch (error) {
      state.ageAccepted = false;
    }
  }

  function setAgeAccepted(nextValue) {
    state.ageAccepted = !!nextValue;

    try {
      if (state.ageAccepted) {
        window.sessionStorage.setItem('videoChatAgeAccepted', 'true');
      } else {
        window.sessionStorage.removeItem('videoChatAgeAccepted');
      }
    } catch (error) {
    }

    render();
  }

  async function api(path, options) {
    syncAuthStore();

    const requestOptions = Object.assign({ method: 'GET' }, options || {});
    const headers = Object.assign({}, requestOptions.headers || {});
    const hasBody = typeof requestOptions.body !== 'undefined';

    if (hasBody && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (pb && pb.authStore && pb.authStore.isValid && pb.authStore.token) {
      headers.Authorization = 'Bearer ' + pb.authStore.token;
    }

    requestOptions.headers = headers;
    const response = await fetch(path, requestOptions);
    const text = await response.text();
    let payload = {};

    try {
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      payload = text ? { message: text } : {};
    }

    if (!response.ok) {
      const message = payload && payload.message ? payload.message : 'Request failed.';
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  async function loadSession() {
    syncAuthStore();

    if (!pb || !pb.authStore.isValid) {
      state.session = null;
      if (state.mode !== 'idle') {
        fullCleanup();
      }
      render();
      return null;
    }

    try {
      const payload = await api('/api/chat/session');
      state.session = payload && payload.user ? payload.user : null;
    } catch (error) {
      state.session = null;
    }

    if (!state.session && state.mode !== 'idle') {
      fullCleanup();
    }

    render();
    return state.session;
  }

  function isVideoTabVisible() {
    const elements = getElements();
    return !!(elements.videoSection && elements.videoSection.style.display !== 'none');
  }

  function setNotice(text) {
    state.noticeText = text || '';
  }

  function clearNotice() {
    state.noticeText = '';
  }

  function getOwnUserId() {
    return state.session && state.session.id ? state.session.id : '';
  }

  function getOwnUsername() {
    if (state.session && state.session.username) {
      return state.session.username;
    }
    if (pb && pb.authStore && pb.authStore.model && pb.authStore.model.username) {
      return pb.authStore.model.username;
    }
    return 'you';
  }

  function updateOnlineCount(value) {
    state.onlineCount = Math.max(0, Number(value || 0));
    render();
  }

  async function refreshOnlineCount() {
    try {
      const payload = await api('/api/video/online-count');
      updateOnlineCount(payload && payload.onlineCount ? payload.onlineCount : 0);
    } catch (error) {
      updateOnlineCount(0);
    }
  }

  function clearMessageLog() {
    state.messageLog = [];
    renderMessages();
  }

  function appendMessage(author, body, kind) {
    const text = String(body || '').trim();
    if (!text) {
      return;
    }

    state.messageLog.push({
      author: author,
      body: text,
      kind: kind || 'incoming',
      createdAt: Date.now()
    });

    if (state.messageLog.length > 60) {
      state.messageLog = state.messageLog.slice(-60);
    }

    renderMessages();
  }

  function renderMessages() {
    const elements = getElements();
    if (!elements.videoChatLog) {
      return;
    }

    if (!state.messageLog.length) {
      elements.videoChatLog.innerHTML = '<div class="video-chat-empty">No messages yet.</div>';
      return;
    }

    elements.videoChatLog.innerHTML = state.messageLog.map(function (message) {
      const author = message.author === 'You' ? 'You' : escapeHtml(message.author || 'Stranger');
      const body = escapeHtml(message.body || '');
      return '<div class="video-chat-line is-' + escapeHtml(message.kind || 'incoming') + '">' +
        '<span class="video-chat-author">' + author + ':</span>' +
        '<span class="video-chat-body">' + body + '</span>' +
        '</div>';
    }).join('');

    elements.videoChatLog.scrollTop = elements.videoChatLog.scrollHeight;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render() {
    const elements = getElements();
    if (!elements.videoSection) {
      return;
    }

    const isAuthenticated = !!(state.session && state.session.id);
    const localTrack = state.localStream && state.localStream.getVideoTracks ? state.localStream.getVideoTracks()[0] : null;
    const remoteHasTracks = !!(state.remoteStream && state.remoteStream.getTracks && state.remoteStream.getTracks().length);
    const isConnected = state.mode === 'connected';
    const isSearching = state.mode === 'searching';
    const stageVisible = isSearching || isConnected || state.mode === 'disconnected';
    const showAgeGate = isAuthenticated && !state.ageAccepted && !stageVisible;
    const showLanding = isAuthenticated && state.ageAccepted && !stageVisible;

    if (elements.videoAuthLock) {
      elements.videoAuthLock.hidden = isAuthenticated;
    }

    if (elements.videoApp) {
      elements.videoApp.hidden = !isAuthenticated;
    }

    if (!isAuthenticated) {
      return;
    }

    if (elements.videoAgeGate) {
      elements.videoAgeGate.hidden = !showAgeGate;
    }

    if (elements.videoLandingCard) {
      elements.videoLandingCard.hidden = !showLanding;
    }

    if (elements.videoStage) {
      elements.videoStage.hidden = !stageVisible;
    }

    if (elements.videoOnlinePill) {
      elements.videoOnlinePill.textContent = state.onlineCount + ' Online';
    }

    if (elements.videoOnlineCountInline) {
      elements.videoOnlineCountInline.textContent = state.onlineCount + ' Online';
    }

    if (elements.videoLocalUsername) {
      elements.videoLocalUsername.textContent = getOwnUsername();
    }

    if (elements.videoRemoteUsername) {
      elements.videoRemoteUsername.textContent = state.partner && state.partner.username
        ? state.partner.username
        : (isConnected ? 'Connected' : 'Waiting...');
    }

    if (elements.videoLocalPreview) {
      elements.videoLocalPreview.srcObject = state.localStream || null;
    }

    if (elements.videoRemotePreview) {
      elements.videoRemotePreview.srcObject = state.remoteStream || null;
    }

    if (elements.videoLocalPlaceholder) {
      elements.videoLocalPlaceholder.hidden = !!(localTrack && state.cameraEnabled);
    }

    if (elements.videoRemotePlaceholder) {
      elements.videoRemotePlaceholder.hidden = remoteHasTracks;
    }

    if (elements.videoRemotePlaceholderText) {
      if (isConnected) {
        elements.videoRemotePlaceholderText.textContent = 'Connecting video...';
      } else if (state.onlineCount <= 1) {
        elements.videoRemotePlaceholderText.textContent = 'No one is online right now. Waiting for someone to join...';
      } else {
        elements.videoRemotePlaceholderText.textContent = 'Searching for someone...';
      }
    }

    if (elements.videoStatusKicker && elements.videoStatusTitle && elements.videoStatusSubtitle) {
      if (state.mode === 'connected') {
        elements.videoStatusKicker.textContent = 'Connected';
        elements.videoStatusTitle.textContent = state.partner && state.partner.username
          ? 'Talking with ' + state.partner.username
          : 'Connected to a stranger';
        elements.videoStatusSubtitle.textContent = state.noticeText || 'Video and chat are live.';
      } else if (state.mode === 'disconnected') {
        elements.videoStatusKicker.textContent = 'Disconnected';
        elements.videoStatusTitle.textContent = 'Stranger disconnected';
        elements.videoStatusSubtitle.textContent = state.noticeText || 'Finding someone new...';
      } else {
        elements.videoStatusKicker.textContent = state.onlineCount <= 1 ? 'Waiting' : 'Searching';
        elements.videoStatusTitle.textContent = state.onlineCount <= 1
          ? 'No one is online right now.'
          : 'Searching for someone...';
        elements.videoStatusSubtitle.textContent = state.noticeText ||
          (state.onlineCount <= 1
            ? 'Waiting for someone else to join the queue.'
            : 'Keep this tab open while we look for a match.');
      }
    }

    if (elements.videoChatForm) {
      elements.videoChatForm.hidden = !isConnected;
    }

    if (elements.videoChatInput) {
      elements.videoChatInput.disabled = !isConnected || !state.dataChannel || state.dataChannel.readyState !== 'open';
    }

    if (elements.videoChatSendButton) {
      elements.videoChatSendButton.disabled = !isConnected || !state.dataChannel || state.dataChannel.readyState !== 'open';
    }

    if (elements.videoDisconnectButton) {
      elements.videoDisconnectButton.disabled = !stageVisible;
    }

    if (elements.videoNextButton) {
      elements.videoNextButton.disabled = !stageVisible;
    }

    if (elements.videoMuteButton) {
      elements.videoMuteButton.innerHTML = state.muteEnabled
        ? '<i class="fas fa-microphone"></i><span>Mute</span>'
        : '<i class="fas fa-microphone-slash"></i><span>Unmute</span>';
    }

    if (elements.videoCameraButton) {
      elements.videoCameraButton.innerHTML = state.cameraEnabled
        ? '<i class="fas fa-video"></i><span>Camera</span>'
        : '<i class="fas fa-video-slash"></i><span>Camera Off</span>';
    }
  }

  async function ensureLocalMedia() {
    if (state.localStream) {
      return state.localStream;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 240, max: 240 },
        height: { ideal: 320, max: 320 },
        frameRate: { ideal: 10, max: 15 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1
      }
    });

    state.localStream = stream;
    state.muteEnabled = true;
    state.cameraEnabled = true;
    applyTrackToggles();
    render();
    return stream;
  }

  function stopLocalMedia() {
    if (!state.localStream) {
      return;
    }

    const tracks = state.localStream.getTracks ? state.localStream.getTracks() : [];
    tracks.forEach(function (track) {
      try {
        track.stop();
      } catch (error) {
      }
    });

    state.localStream = null;
  }

  function resetRemoteMedia() {
    if (state.remoteStream && state.remoteStream.getTracks) {
      state.remoteStream.getTracks().forEach(function (track) {
        try {
          track.stop();
        } catch (error) {
        }
      });
    }
    state.remoteStream = new MediaStream();
  }

  function clearReconnectHandle() {
    if (state.reconnectHandle) {
      window.clearTimeout(state.reconnectHandle);
      state.reconnectHandle = null;
    }
  }

  function stopTimers() {
    ['statusPollHandle', 'signalPollHandle', 'heartbeatHandle', 'onlinePollHandle', 'sessionPollHandle'].forEach(function (key) {
      if (state[key]) {
        window.clearInterval(state[key]);
        state[key] = null;
      }
    });
    clearReconnectHandle();
  }

  async function clearSignalSubscription() {
    if (!pb) {
      return;
    }

    try {
      await pb.collection('video_signaling').unsubscribe('*');
    } catch (error) {
    }

    state.signalSubscriptionBound = false;
  }

  function closePeerConnection() {
    if (state.dataChannel) {
      try {
        state.dataChannel.onopen = null;
        state.dataChannel.onclose = null;
        state.dataChannel.onmessage = null;
        state.dataChannel.onerror = null;
        state.dataChannel.close();
      } catch (error) {
      }
    }
    state.dataChannel = null;

    if (state.peerConnection) {
      try {
        state.peerConnection.onicecandidate = null;
        state.peerConnection.ontrack = null;
        state.peerConnection.ondatachannel = null;
        state.peerConnection.oniceconnectionstatechange = null;
        state.peerConnection.onconnectionstatechange = null;
        state.peerConnection.close();
      } catch (error) {
      }
    }

    state.peerConnection = null;
    state.activeMatchId = '';
    resetRemoteMedia();
  }

  function fullCleanup() {
    stopTimers();
    closePeerConnection();
    stopLocalMedia();
    clearSignalSubscription();
    state.partner = null;
    state.mode = 'idle';
    state.seenSignalIds = {};
    clearNotice();
    clearMessageLog();
    render();
  }

  function applyTrackToggles() {
    if (!state.localStream || !state.localStream.getTracks) {
      return;
    }

    const audioTracks = state.localStream.getAudioTracks ? state.localStream.getAudioTracks() : [];
    const videoTracks = state.localStream.getVideoTracks ? state.localStream.getVideoTracks() : [];

    audioTracks.forEach(function (track) {
      track.enabled = !!state.muteEnabled;
    });

    videoTracks.forEach(function (track) {
      track.enabled = !!state.cameraEnabled;
    });
  }

  async function applySenderBitrateLimits(peerConnection) {
    if (!peerConnection || !peerConnection.getSenders) {
      return;
    }

    const senders = peerConnection.getSenders();
    for (let i = 0; i < senders.length; i += 1) {
      const sender = senders[i];
      if (!sender || !sender.track || !sender.getParameters || !sender.setParameters) {
        continue;
      }

      const params = sender.getParameters() || {};
      if (!params.encodings || !params.encodings.length) {
        params.encodings = [{}];
      }

      if (sender.track.kind === 'video') {
        params.encodings[0].maxBitrate = 150000;
        params.encodings[0].scaleResolutionDownBy = 1;
        params.degradationPreference = 'balanced';
      } else if (sender.track.kind === 'audio') {
        params.encodings[0].maxBitrate = 24000;
      }

      try {
        await sender.setParameters(params);
      } catch (error) {
      }
    }
  }

  function applyCodecPreferences(peerConnection) {
    if (!peerConnection || !peerConnection.getTransceivers || !window.RTCRtpSender || !window.RTCRtpSender.getCapabilities) {
      return;
    }

    try {
      const videoCapabilities = window.RTCRtpSender.getCapabilities('video');
      const audioCapabilities = window.RTCRtpSender.getCapabilities('audio');
      const preferredVideo = videoCapabilities && videoCapabilities.codecs
        ? videoCapabilities.codecs.filter(function (codec) {
            return codec.mimeType && codec.mimeType.toLowerCase() === 'video/vp8';
          })
        : [];
      const preferredAudio = audioCapabilities && audioCapabilities.codecs
        ? audioCapabilities.codecs.filter(function (codec) {
            return codec.mimeType && codec.mimeType.toLowerCase() === 'audio/opus';
          })
        : [];

      peerConnection.getTransceivers().forEach(function (transceiver) {
        if (!transceiver || !transceiver.setCodecPreferences || !transceiver.sender || !transceiver.sender.track) {
          return;
        }

        if (transceiver.sender.track.kind === 'video' && preferredVideo.length) {
          transceiver.setCodecPreferences(preferredVideo);
        }

        if (transceiver.sender.track.kind === 'audio' && preferredAudio.length) {
          transceiver.setCodecPreferences(preferredAudio);
        }
      });
    } catch (error) {
    }
  }

  async function sendSignal(type, payload) {
    if (!state.partner || !state.partner.id) {
      return;
    }

    await api('/api/video/signal', {
      method: 'POST',
      body: JSON.stringify({
        targetId: state.partner.id,
        type: type,
        payload: payload
      })
    });
  }

  function bindDataChannel(channel) {
    if (!channel) {
      return;
    }

    state.dataChannel = channel;

    channel.onopen = function () {
      render();
    };

    channel.onclose = function () {
      render();
    };

    channel.onerror = function () {
      render();
    };

    channel.onmessage = function (event) {
      let payload = null;

      try {
        payload = JSON.parse(event.data);
      } catch (error) {
        payload = null;
      }

      if (!payload || payload.type !== 'chat' || !payload.body) {
        return;
      }

      appendMessage(state.partner && state.partner.username ? state.partner.username : 'Stranger', payload.body, 'incoming');
    };
  }

  async function createPeerConnection(isCaller) {
    closePeerConnection();
    resetRemoteMedia();

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    state.peerConnection = peerConnection;
    state.activeMatchId = state.partner && state.partner.id ? state.partner.id : '';

    const localStream = await ensureLocalMedia();
    const tracks = localStream.getTracks ? localStream.getTracks() : [];
    tracks.forEach(function (track) {
      peerConnection.addTrack(track, localStream);
    });

    applyCodecPreferences(peerConnection);
    await applySenderBitrateLimits(peerConnection);

    peerConnection.ontrack = function (event) {
      if (!state.remoteStream) {
        resetRemoteMedia();
      }

      event.streams.forEach(function (stream) {
        const streamTracks = stream.getTracks ? stream.getTracks() : [];
        streamTracks.forEach(function (track) {
          try {
            state.remoteStream.addTrack(track);
          } catch (error) {
          }
        });
      });

      if (event.track) {
        try {
          state.remoteStream.addTrack(event.track);
        } catch (error) {
        }
      }

      render();
    };

    peerConnection.onicecandidate = function (event) {
      if (!event.candidate) {
        return;
      }

      sendSignal('ice-candidate', event.candidate.toJSON ? event.candidate.toJSON() : event.candidate).catch(function () {
      });
    };

    peerConnection.ondatachannel = function (event) {
      bindDataChannel(event.channel);
    };

    peerConnection.oniceconnectionstatechange = function () {
      const nextState = peerConnection.iceConnectionState;
      if (nextState === 'failed' || nextState === 'disconnected' || nextState === 'closed') {
        handleRemoteDisconnect('Stranger disconnected.');
      }
    };

    peerConnection.onconnectionstatechange = function () {
      if (peerConnection.connectionState === 'connected') {
        state.mode = 'connected';
        clearNotice();
        render();
      }
    };

    if (isCaller) {
      bindDataChannel(peerConnection.createDataChannel('video-chat-text', {
        ordered: true
      }));
    }

    render();
    return peerConnection;
  }

  function isCallerForPartner(partnerId) {
    const ownId = getOwnUserId();
    return !!(ownId && partnerId && ownId < partnerId);
  }

  async function handleSignal(signal) {
    if (!signal || !signal.id || state.seenSignalIds[signal.id]) {
      return;
    }

    state.seenSignalIds[signal.id] = true;

    if (!state.partner || signal.userId !== state.partner.id) {
      return;
    }

    if (!state.peerConnection) {
      await createPeerConnection(false);
    }

    const peerConnection = state.peerConnection;
    if (!peerConnection) {
      return;
    }

    try {
      if (signal.type === 'offer') {
        if (peerConnection.signalingState !== 'stable') {
          return;
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await sendSignal('answer', {
          type: answer.type,
          sdp: answer.sdp
        });
      } else if (signal.type === 'answer') {
        if (!peerConnection.currentRemoteDescription) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload));
        }
      } else if (signal.type === 'ice-candidate' && signal.payload) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.payload));
      }
    } catch (error) {
      console.error('video signal handling failed', error);
    }
  }

  async function fetchPendingSignals() {
    if (!state.session || !state.partner) {
      return;
    }

    try {
      const payload = await api('/api/video/signals');
      const signals = Array.isArray(payload && payload.signals) ? payload.signals : [];
      for (let i = 0; i < signals.length; i += 1) {
        await handleSignal(signals[i]);
      }
    } catch (error) {
    }
  }

  async function ensureSignalSubscription() {
    if (!pb || !state.session || state.signalSubscriptionBound) {
      return;
    }

    try {
      await pb.collection('video_signaling').subscribe('*', function (event) {
        if (!event || event.action !== 'create' || !event.record) {
          return;
        }

        let payload = null;
        try {
          payload = JSON.parse(String(event.record.payload || '{}') || '{}');
        } catch (error) {
          payload = null;
        }

        handleSignal({
          id: event.record.id,
          userId: event.record.user_id || '',
          targetId: event.record.target_id || '',
          type: event.record.type || '',
          payload: payload,
          created: event.record.created || ''
        });
      }, {
        filter: 'target_id = "' + state.session.id + '"'
      });

      state.signalSubscriptionBound = true;
    } catch (error) {
      state.signalSubscriptionBound = false;
    }
  }

  async function adoptMatchedState(payload) {
    state.partner = payload && payload.partner ? payload.partner : null;
    state.mode = 'connected';
    clearNotice();
    clearMessageLog();
    state.seenSignalIds = {};
    render();

    await ensureSignalSubscription();
    scheduleActivePolls();

    if (!state.partner || !state.partner.id) {
      return;
    }

    if (!state.peerConnection || state.activeMatchId !== state.partner.id) {
      const caller = isCallerForPartner(state.partner.id);
      const peerConnection = await createPeerConnection(caller);

      if (caller) {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await peerConnection.setLocalDescription(offer);
        await sendSignal('offer', {
          type: offer.type,
          sdp: offer.sdp
        });
      }
    }

    await fetchPendingSignals();
  }

  async function pollStatus() {
    if (!state.session) {
      return;
    }

    try {
      const payload = await api('/api/video/status');
      state.onlineCount = Number(payload && payload.onlineCount ? payload.onlineCount : 0);

      if (!payload || payload.state === 'idle') {
        if (state.mode !== 'idle') {
          handleRemoteDisconnect('Video session ended.');
        } else {
          render();
        }
        return;
      }

      if (payload.state === 'matched' && payload.partner && payload.partner.id) {
        if (!state.partner || state.partner.id !== payload.partner.id || state.activeMatchId !== payload.partner.id) {
          await adoptMatchedState(payload);
          return;
        }

        state.partner = payload.partner;
        state.mode = 'connected';
        render();
        return;
      }

      if (state.mode === 'connected' && payload.state !== 'matched') {
        handleRemoteDisconnect('Stranger disconnected.');
        return;
      }

      state.partner = null;
      state.mode = 'searching';
      render();
    } catch (error) {
    }
  }

  async function heartbeat() {
    if (!state.session || (state.mode !== 'searching' && state.mode !== 'connected')) {
      return;
    }

    try {
      const payload = await api('/api/video/heartbeat', {
        method: 'POST',
        body: JSON.stringify({})
      });
      if (payload && typeof payload.onlineCount !== 'undefined') {
        state.onlineCount = Number(payload.onlineCount || 0);
      }
      render();
    } catch (error) {
    }
  }

  function scheduleActivePolls() {
    if (!state.statusPollHandle) {
      state.statusPollHandle = window.setInterval(pollStatus, 1500);
    }

    if (!state.signalPollHandle) {
      state.signalPollHandle = window.setInterval(fetchPendingSignals, 1200);
    }

    if (!state.heartbeatHandle) {
      state.heartbeatHandle = window.setInterval(heartbeat, 15000);
    }
  }

  async function leaveQueue(notifyServer) {
    if (!notifyServer || !state.session || state.leaving) {
      return;
    }

    state.leaving = true;
    try {
      await api('/api/video/leave', {
        method: 'POST',
        body: JSON.stringify({})
      });
    } catch (error) {
    }
    state.leaving = false;
  }

  async function startSearch() {
    clearReconnectHandle();
    syncAuthStore();
    await loadSession();

    if (!state.session) {
      render();
      return;
    }

    await leaveQueue(true);
    stopTimers();
    closePeerConnection();
    stopLocalMedia();
    clearSignalSubscription();
    clearMessageLog();
    clearNotice();

    try {
      await ensureLocalMedia();
    } catch (error) {
      setNotice(error && error.message ? error.message : 'Camera or microphone access was denied.');
      state.mode = 'idle';
      render();
      return;
    }

    state.partner = null;
    state.seenSignalIds = {};
    state.mode = 'searching';
    render();

    try {
      const payload = await api('/api/video/join', {
        method: 'POST',
        body: JSON.stringify({})
      });

      state.onlineCount = Number(payload && payload.onlineCount ? payload.onlineCount : 0);

      if (payload && payload.state === 'matched' && payload.partner) {
        await adoptMatchedState(payload);
      } else {
        await ensureSignalSubscription();
        scheduleActivePolls();
        render();
      }
    } catch (error) {
      setNotice(error && error.message ? error.message : 'Unable to start video chat right now.');
      state.mode = 'idle';
      render();
    }
  }

  async function disconnectToIdle() {
    clearReconnectHandle();
    await leaveQueue(true);
    fullCleanup();
    await refreshOnlineCount();
  }

  function handleRemoteDisconnect(message) {
    if (state.mode === 'idle') {
      return;
    }

    stopTimers();
    closePeerConnection();
    clearSignalSubscription();
    clearMessageLog();
    state.partner = null;
    state.mode = 'disconnected';
    setNotice(message || 'Stranger disconnected.');
    render();

    clearReconnectHandle();
    state.reconnectHandle = window.setTimeout(function () {
      startSearch();
    }, 1200);
  }

  async function nextPerson() {
    setNotice('Skipping to the next person...');
    render();
    await startSearch();
  }

  function toggleMute() {
    state.muteEnabled = !state.muteEnabled;
    applyTrackToggles();
    render();
  }

  function toggleCamera() {
    state.cameraEnabled = !state.cameraEnabled;
    applyTrackToggles();
    render();
  }

  function sendChatMessage(event) {
    event.preventDefault();

    const elements = getElements();
    if (!elements.videoChatInput || !state.dataChannel || state.dataChannel.readyState !== 'open') {
      return;
    }

    const body = String(elements.videoChatInput.value || '').trim();
    if (!body) {
      return;
    }

    try {
      state.dataChannel.send(JSON.stringify({
        type: 'chat',
        body: body
      }));
      appendMessage('You', body, 'outgoing');
      elements.videoChatInput.value = '';
    } catch (error) {
    }
  }

  function bindEvents() {
    const elements = getElements();

    if (elements.videoStartButton) {
      elements.videoStartButton.addEventListener('click', function () {
        if (!state.ageAccepted) {
          return;
        }
        startSearch();
      });
    }

    if (elements.videoAcceptButton) {
      elements.videoAcceptButton.addEventListener('click', function () {
        setAgeAccepted(true);
      });
    }

    if (elements.videoDisconnectButton) {
      elements.videoDisconnectButton.addEventListener('click', function () {
        disconnectToIdle();
      });
    }

    if (elements.videoNextButton) {
      elements.videoNextButton.addEventListener('click', function () {
        nextPerson();
      });
    }

    if (elements.videoMuteButton) {
      elements.videoMuteButton.addEventListener('click', function () {
        toggleMute();
      });
    }

    if (elements.videoCameraButton) {
      elements.videoCameraButton.addEventListener('click', function () {
        toggleCamera();
      });
    }

    if (elements.videoChatForm) {
      elements.videoChatForm.addEventListener('submit', sendChatMessage);
    }

    window.addEventListener('app:switch-tab', function (event) {
      const nextTab = event && event.detail ? event.detail.tab : '';
      if (nextTab === 'video') {
        loadSession();
        refreshOnlineCount();
        render();
      }
      if (nextTab && nextTab !== 'video' && (state.mode === 'searching' || state.mode === 'connected' || state.mode === 'disconnected')) {
        disconnectToIdle();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (!navigator.sendBeacon || !pb || !pb.authStore || !pb.authStore.token) {
        return;
      }

      try {
        navigator.sendBeacon('/api/video/leave', new Blob(['{}'], { type: 'application/json' }));
      } catch (error) {
      }
    });

    window.addEventListener('focus', function () {
      syncAuthStore();
      loadSession();
      refreshOnlineCount();
    });
  }

  function schedulePassivePolls() {
    if (!state.onlinePollHandle) {
      state.onlinePollHandle = window.setInterval(function () {
        if (isVideoTabVisible() || state.mode === 'idle') {
          refreshOnlineCount();
        }
      }, 10000);
    }

    if (!state.sessionPollHandle) {
      state.sessionPollHandle = window.setInterval(function () {
        syncAuthStore();
        loadSession();
      }, 5000);
    }
  }

  async function initialize() {
    if (!pb) {
      return;
    }

    loadAgeGatePreference();
    resetRemoteMedia();
    bindEvents();
    await loadSession();
    await refreshOnlineCount();
    renderMessages();
    schedulePassivePolls();
    render();
  }

  initialize();
})();
