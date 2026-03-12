(function () {
  const pb = typeof window.PocketBase === 'function'
    ? new window.PocketBase(window.location.origin)
    : null;

  const state = {
    session: null,
    bootstrap: null,
    activeView: 'groups',
    activeRoomId: '',
    activeRoom: null,
    transientDmRoom: null,
    roomPollHandle: null,
    bootstrapPollHandle: null,
    sessionPollHandle: null,
    siteStateHandle: null,
    adminReportsHandle: null,
    adminReports: [],
    pendingReportMessage: null,
    pendingGroupAvatarFile: null,
    pendingManageGroupAvatarFile: null,
    pendingChatImageFile: null,
    pendingReply: null,
    mentionSuggestions: [],
    mentionSelectedIndex: 0,
    mentionQuery: '',
    mentionAnchorIndex: -1,
    mentionLookupHandle: null,
    manageGroupRoomId: '',
    openMessageMenuId: '',
    activeAudio: null,
    activeAudioStopHandle: null,
    broadcastToastHandle: null,
    broadcastHideHandle: null,
    mentionToastHandle: null,
    mentionHideHandle: null,
    mentionToastQueue: [],
    mentionToastRoomId: '',
    mentionToastRoomType: '',
    trollMediaHandle: null,
    trollMediaHideHandle: null,
    flashbangHandle: null,
    flashbangFadeHandle: null,
    bustHandle: null,
    bustFadeHandle: null,
    nukeSequenceHandle: null,
    nukeHideHandle: null,
    activeFlashbangNonce: '',
    activeBustNonce: '',
    activeNukeNonce: '',
    lastBroadcastKey: '',
    hasSeenSiteState: false,
    siteState: {
      broadcastMessage: '',
      pinnedMessage: '',
      trollRollNonce: '',
      trollSoundNonce: '',
      trollSoundUrl: '',
      trollMediaNonce: '',
      trollMediaUrl: '',
      trollFlashbangNonce: '',
      trollFlashbangTriggeredAt: '',
      trollBustNonce: '',
      trollBustTriggeredAt: '',
      trollNukeNonce: '',
      trollNukeTriggeredAt: '',
      updated: ''
    },
    crop: {
      image: null,
      objectUrl: '',
      zoom: 1,
      baseScale: 1,
      offsetX: 0,
      offsetY: 0,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      target: ''
    }
  };

  if (pb) {
    pb.autoCancellation(false);
  }

  function getElements() {
    return {
      mainContainer: document.getElementById('main-container'),
      chatSection: document.getElementById('chat-section'),
      chatTab: document.getElementById('chatTab'),
      accountTab: document.getElementById('accountTab'),
      adminTab: document.getElementById('adminTab'),
      siteBroadcastBanner: document.getElementById('siteBroadcastBanner'),
      siteMentionToast: document.getElementById('siteMentionToast'),
      siteMentionToastAvatar: document.getElementById('siteMentionToastAvatar'),
      siteMentionToastAvatarImage: document.getElementById('siteMentionToastAvatarImage'),
      siteMentionToastAvatarFallback: document.getElementById('siteMentionToastAvatarFallback'),
      siteMentionToastTitle: document.getElementById('siteMentionToastTitle'),
      siteMentionToastBody: document.getElementById('siteMentionToastBody'),

      chatAppShell: document.getElementById('chatAppShell'),
      chatAppLock: document.getElementById('chatAppLock'),
      videoAuthLock: document.getElementById('videoAuthLock'),
      videoApp: document.getElementById('videoApp'),
      chatModeTabs: document.getElementById('chatModeTabs'),
      chatSidebarKicker: document.getElementById('chatSidebarKicker'),
      chatSidebarHeading: document.getElementById('chatSidebarHeading'),
      chatSidebarPrimaryButton: document.getElementById('chatSidebarPrimaryButton'),
      chatAddFriendForm: document.getElementById('chatAddFriendForm'),
      chatAddFriendInput: document.getElementById('chatAddFriendInput'),
      chatIncomingRequestsSection: document.getElementById('chatIncomingRequestsSection'),
      chatIncomingRequestsList: document.getElementById('chatIncomingRequestsList'),
      chatOutgoingRequestsSection: document.getElementById('chatOutgoingRequestsSection'),
      chatOutgoingRequestsList: document.getElementById('chatOutgoingRequestsList'),
      chatBlockedSection: document.getElementById('chatBlockedSection'),
      chatBlockedList: document.getElementById('chatBlockedList'),
      chatConversationList: document.getElementById('chatConversationList'),
      chatMainEmpty: document.getElementById('chatMainEmpty'),
      chatRoomPanel: document.getElementById('chatRoomPanel'),
      chatRoomAvatar: document.getElementById('chatRoomAvatar'),
      chatRoomAvatarImage: document.getElementById('chatRoomAvatarImage'),
      chatRoomAvatarFallback: document.getElementById('chatRoomAvatarFallback'),
      chatRoomTitle: document.getElementById('chatRoomTitle'),
      chatRoomSubtitle: document.getElementById('chatRoomSubtitle'),
      chatRoomActions: document.getElementById('chatRoomActions'),
      chatClearBanner: document.getElementById('chatClearBanner'),
      chatPinnedBanner: document.getElementById('chatPinnedBanner'),
      chatMessageList: document.getElementById('chatMessageList'),
      chatStatusBanner: document.getElementById('chatStatusBanner'),
      chatComposer: document.getElementById('chatComposer'),
      chatImageInput: document.getElementById('chatImageInput'),
      chatImageButton: document.getElementById('chatImageButton'),
      chatComposerMeta: document.getElementById('chatComposerMeta'),
      chatMentionMenu: document.getElementById('chatMentionMenu'),
      chatReplyChip: document.getElementById('chatReplyChip'),
      chatReplyAuthor: document.getElementById('chatReplyAuthor'),
      chatReplyPreview: document.getElementById('chatReplyPreview'),
      chatReplyClear: document.getElementById('chatReplyClear'),
      chatAttachmentChip: document.getElementById('chatAttachmentChip'),
      chatAttachmentName: document.getElementById('chatAttachmentName'),
      chatAttachmentClear: document.getElementById('chatAttachmentClear'),
      chatMessageInput: document.getElementById('chatMessageInput'),
      chatSendButton: document.getElementById('chatSendButton'),

      accountAuthCard: document.getElementById('accountAuthCard'),
      accountProfileCard: document.getElementById('accountProfileCard'),
      accountStatusCard: document.getElementById('accountStatusCard'),
      accountUsernameCard: document.getElementById('accountUsernameCard'),
      accountPasswordCard: document.getElementById('accountPasswordCard'),
      accountDangerCard: document.getElementById('accountDangerCard'),
      accountSignupForm: document.getElementById('accountSignupForm'),
      accountLoginForm: document.getElementById('accountLoginForm'),
      accountUsernameForm: document.getElementById('accountUsernameForm'),
      accountPasswordForm: document.getElementById('accountPasswordForm'),
      signupUsername: document.getElementById('signupUsername'),
      signupPassword: document.getElementById('signupPassword'),
      signupPasswordConfirm: document.getElementById('signupPasswordConfirm'),
      loginUsername: document.getElementById('loginUsername'),
      loginPassword: document.getElementById('loginPassword'),
      accountProfileUsername: document.getElementById('accountProfileUsername'),
      accountProfileCreated: document.getElementById('accountProfileCreated'),
      accountWarningsCount: document.getElementById('accountWarningsCount'),
      accountUsernameChangeTime: document.getElementById('accountUsernameChangeTime'),
      accountModerationDetail: document.getElementById('accountModerationDetail'),
      accountUsernameDescription: document.getElementById('accountUsernameDescription'),
      accountUsernameInput: document.getElementById('accountUsernameInput'),
      accountCurrentPassword: document.getElementById('accountCurrentPassword'),
      accountNewPassword: document.getElementById('accountNewPassword'),
      accountNewPasswordConfirm: document.getElementById('accountNewPasswordConfirm'),
      accountAvatarPreview: document.getElementById('accountAvatarPreview'),
      accountAvatarImage: document.getElementById('accountAvatarImage'),
      accountAvatarFallback: document.getElementById('accountAvatarFallback'),
      avatarUploadInput: document.getElementById('avatarUploadInput'),
      avatarUploadButton: document.getElementById('avatarUploadButton'),
      accountLogoutButton: document.getElementById('accountLogoutButton'),
      accountDeleteButton: document.getElementById('accountDeleteButton'),
      accountAuthFeedback: document.getElementById('accountAuthFeedback'),
      accountAvatarFeedback: document.getElementById('accountAvatarFeedback'),
      accountUsernameFeedback: document.getElementById('accountUsernameFeedback'),
      accountPasswordFeedback: document.getElementById('accountPasswordFeedback'),
      accountDangerFeedback: document.getElementById('accountDangerFeedback'),

      adminSection: document.getElementById('admin-section'),
      adminOwnerCard: document.getElementById('adminOwnerCard'),
      adminUserCard: document.getElementById('adminUserCard'),
      adminTrollCard: document.getElementById('adminTrollCard'),
      adminReportsCard: document.getElementById('adminReportsCard'),
      adminBroadcastInput: document.getElementById('adminBroadcastInput'),
      adminPinnedInput: document.getElementById('adminPinnedInput'),
      adminTargetUsernameInput: document.getElementById('adminTargetUsernameInput'),
      adminRenameCurrentInput: document.getElementById('adminRenameCurrentInput'),
      adminRenameNewInput: document.getElementById('adminRenameNewInput'),
      adminBroadcastSetButton: document.getElementById('adminBroadcastSetButton'),
      adminBroadcastClearButton: document.getElementById('adminBroadcastClearButton'),
      adminPinnedSetButton: document.getElementById('adminPinnedSetButton'),
      adminPinnedClearButton: document.getElementById('adminPinnedClearButton'),
      adminWipeChatButton: document.getElementById('adminWipeChatButton'),
      adminTimeoutUserButton: document.getElementById('adminTimeoutUserButton'),
      adminBanUserButton: document.getElementById('adminBanUserButton'),
      adminDeleteUserButton: document.getElementById('adminDeleteUserButton'),
      adminRenameUserButton: document.getElementById('adminRenameUserButton'),
      adminSoundInput: document.getElementById('adminSoundInput'),
      adminChooseSoundButton: document.getElementById('adminChooseSoundButton'),
      adminMediaInput: document.getElementById('adminMediaInput'),
      adminChooseMediaButton: document.getElementById('adminChooseMediaButton'),
      adminPlaySoundButton: document.getElementById('adminPlaySoundButton'),
      adminShowMediaButton: document.getElementById('adminShowMediaButton'),
      adminFlashbangButton: document.getElementById('adminFlashbangButton'),
      adminBustButton: document.getElementById('adminBustButton'),
      adminRollButton: document.getElementById('adminRollButton'),
      adminNukeButton: document.getElementById('adminNukeButton'),
      adminSoundName: document.getElementById('adminSoundName'),
      adminMediaName: document.getElementById('adminMediaName'),
      adminFeedback: document.getElementById('adminFeedback'),
      adminReportsFilter: document.getElementById('adminReportsFilter'),
      adminReportsList: document.getElementById('adminReportsList'),

      chatGroupModal: document.getElementById('chatGroupModal'),
      chatGroupForm: document.getElementById('chatGroupForm'),
      chatGroupNameInput: document.getElementById('chatGroupNameInput'),
      chatGroupUsersInput: document.getElementById('chatGroupUsersInput'),
      chatGroupAvatarInput: document.getElementById('chatGroupAvatarInput'),
      chatGroupAvatarButton: document.getElementById('chatGroupAvatarButton'),
      chatGroupAvatarName: document.getElementById('chatGroupAvatarName'),
      chatGroupCancelButton: document.getElementById('chatGroupCancelButton'),

      chatGroupManageModal: document.getElementById('chatGroupManageModal'),
      chatGroupManageForm: document.getElementById('chatGroupManageForm'),
      chatManageGroupNameInput: document.getElementById('chatManageGroupNameInput'),
      chatManageGroupUsersInput: document.getElementById('chatManageGroupUsersInput'),
      chatManageGroupAvatarInput: document.getElementById('chatManageGroupAvatarInput'),
      chatManageGroupAvatarButton: document.getElementById('chatManageGroupAvatarButton'),
      chatManageGroupAvatarName: document.getElementById('chatManageGroupAvatarName'),
      chatManageGroupCancelButton: document.getElementById('chatManageGroupCancelButton'),
      chatManageGroupSaveButton: document.getElementById('chatManageGroupSaveButton'),

      chatReportModal: document.getElementById('chatReportModal'),
      chatReportForm: document.getElementById('chatReportForm'),
      chatReportPreview: document.getElementById('chatReportPreview'),
      chatReportReasonInput: document.getElementById('chatReportReasonInput'),
      chatReportCancelButton: document.getElementById('chatReportCancelButton'),

      avatarCropModal: document.getElementById('avatarCropModal'),
      avatarCropCanvas: document.getElementById('avatarCropCanvas'),
      avatarCropZoom: document.getElementById('avatarCropZoom'),
      avatarCropApprove: document.getElementById('avatarCropApprove'),
      avatarCropCancel: document.getElementById('avatarCropCancel'),

      trollMediaOverlay: document.getElementById('trollMediaOverlay'),
      trollMediaImage: document.getElementById('trollMediaImage'),
      siteFlashbangOverlay: document.getElementById('siteFlashbangOverlay'),
      siteBustOverlay: document.getElementById('siteBustOverlay'),
      siteBustImage: document.getElementById('siteBustImage'),
      siteNukeOverlay: document.getElementById('siteNukeOverlay'),
      siteNukeTitle: document.getElementById('siteNukeTitle'),
      siteNukeTimer: document.getElementById('siteNukeTimer'),
      siteNukeNote: document.getElementById('siteNukeNote')
    };
  }

  function nowMs() {
    return Date.now();
  }

  function extractErrorMessage(error, fallback) {
    if (!error) {
      return fallback;
    }

    if (typeof error.message === 'string' && error.message) {
      return error.message;
    }

    if (error.response && typeof error.response.message === 'string' && error.response.message) {
      return error.response.message;
    }

    if (error.data && typeof error.data.message === 'string' && error.data.message) {
      return error.data.message;
    }

    return fallback;
  }

  function isAuthenticated() {
    return !!(pb && pb.authStore && pb.authStore.isValid && pb.authStore.model);
  }

  function isOwner() {
    const roleFromSession = state.session && state.session.user ? state.session.user.role : '';
    const roleFromAuth = pb && pb.authStore && pb.authStore.model ? pb.authStore.model.role : '';
    return roleFromSession === 'owner' || roleFromAuth === 'owner';
  }

  function normalizeUsernameValue(value) {
    let normalized = String(value || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const firstUnderscore = normalized.indexOf('_');

    if (firstUnderscore !== -1) {
      normalized = normalized.slice(0, firstUnderscore + 1) +
        normalized.slice(firstUnderscore + 1).replace(/_/g, '');
    }

    return normalized.slice(0, 16);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isOwnerUsername(username) {
    const normalized = normalizeUsernameValue(username || '');
    return normalized === 'noah' || normalized === 'builder';
  }

  function createUsernameDisplayNode(username, options) {
    const config = options || {};
    const value = username || 'User';
    const wrapper = document.createElement('span');
    wrapper.className = 'chat-owner-badge';

    const label = document.createElement('span');
    label.className = 'chat-owner-badge-label';
    label.textContent = value;
    wrapper.appendChild(label);

    if (isOwnerUsername(value)) {
      wrapper.classList.add('is-owner');

      const crown = document.createElement('span');
      crown.className = 'chat-owner-crown';
      crown.innerHTML = '<i class="fas fa-crown" aria-hidden="true"></i>';
      wrapper.appendChild(crown);

      if (config.tooltip) {
        const tooltip = document.createElement('span');
        tooltip.className = 'chat-owner-tooltip';
        tooltip.textContent = 'Co-Owner';
        wrapper.appendChild(tooltip);
      }
    }

    return wrapper;
  }

  function setUsernameDisplay(element, username, options) {
    if (!element) {
      return;
    }

    element.textContent = '';
    element.appendChild(createUsernameDisplayNode(username, options));
  }

  function collapseWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function setElementVisibility(element, visible) {
    if (!element) {
      return;
    }

    if (visible) {
      element.removeAttribute('hidden');
    } else {
      element.setAttribute('hidden', 'hidden');
    }
  }

  function setFeedback(element, type, message) {
    if (!element) {
      return;
    }

    if (!message) {
      element.hidden = true;
      element.textContent = '';
      element.className = 'account-feedback';
      return;
    }

    element.hidden = false;
    element.textContent = message;
    element.className = 'account-feedback';

    if (type) {
      element.classList.add('is-' + type);
    }
  }

  function clearFeedbacks() {
    const elements = getElements();
    [
      elements.accountAuthFeedback,
      elements.accountAvatarFeedback,
      elements.accountUsernameFeedback,
      elements.accountPasswordFeedback,
      elements.accountDangerFeedback,
      elements.adminFeedback
    ].forEach(function (element) {
      setFeedback(element, '', '');
    });
  }

  function formatAbsoluteTime(isoValue) {
    if (!isoValue) {
      return '';
    }

    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
      }).format(new Date(isoValue));
    } catch (error) {
      return '';
    }
  }

  function formatListPreviewTime(isoValue) {
    if (!isoValue) {
      return '';
    }

    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }).format(new Date(isoValue));
    } catch (error) {
      return '';
    }
  }

  function formatRelativeDay(isoValue) {
    if (!isoValue) {
      return 'Offline';
    }

    const target = new Date(isoValue).getTime();
    if (!Number.isFinite(target)) {
      return 'Offline';
    }

    const diff = nowMs() - target;
    if (diff < 5 * 60 * 1000) {
      return 'Online now';
    }
    if (diff < 24 * 60 * 60 * 1000) {
      return 'Seen today';
    }
    if (diff < 48 * 60 * 60 * 1000) {
      return 'Seen yesterday';
    }

    return 'Seen ' + Math.max(2, Math.floor(diff / (24 * 60 * 60 * 1000))) + 'd ago';
  }

  function formatDurationUntil(isoValue) {
    if (!isoValue) {
      return 'Now';
    }

    const target = new Date(isoValue).getTime();
    if (!Number.isFinite(target)) {
      return 'Now';
    }

    const diff = target - nowMs();
    if (diff <= 0) {
      return 'Now';
    }

    const totalSeconds = Math.ceil(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
      return days + 'd ' + hours + 'h';
    }

    if (hours > 0) {
      return hours + 'h ' + minutes + 'm';
    }

    return Math.max(1, minutes) + 'm';
  }

  function buildCollectionFileUrl(collectionName, recordId, fileName) {
    if (!collectionName || !recordId || !fileName) {
      return '';
    }

    return '/api/files/' + collectionName + '/' + recordId + '/' + encodeURIComponent(fileName);
  }

  function getAvatarFallbackText(label) {
    const value = String(label || '').trim();
    return value ? value.charAt(0).toUpperCase() : '?';
  }

  function setAvatarImageSource(container, fallback, image, label, url) {
    if (fallback) {
      fallback.textContent = getAvatarFallbackText(label);
    }

    if (!image) {
      return;
    }

    image.alt = (label || 'User') + ' avatar';
    image.onload = function () {
      if (container) {
        container.classList.add('has-image');
      }
    };
    image.onerror = function () {
      image.onload = null;
      image.onerror = null;
      image.removeAttribute('src');
      if (container) {
        container.classList.remove('has-image');
      }
    };

    if (url) {
      if (container) {
        container.classList.add('has-image');
      }
      image.src = url;
      return;
    }

    image.removeAttribute('src');
    if (container) {
      container.classList.remove('has-image');
    }
  }

  function createInlineAvatarElement(label, url, imageClass, fallbackClass) {
    if (!url) {
      const fallback = document.createElement('div');
      fallback.className = imageClass + ' ' + fallbackClass;
      fallback.textContent = getAvatarFallbackText(label);
      return fallback;
    }

    const image = document.createElement('img');
    image.className = imageClass;
    image.src = url;
    image.alt = (label || 'User') + ' avatar';
    image.addEventListener('error', function () {
      const fallback = document.createElement('div');
      fallback.className = imageClass + ' ' + fallbackClass;
      fallback.textContent = getAvatarFallbackText(label);
      image.replaceWith(fallback);
    }, { once: true });
    return image;
  }

  function buildUserAvatarUrl(user) {
    if (!user) {
      return '';
    }

    if (user.avatarUrl) {
      return user.avatarUrl;
    }

    return buildCollectionFileUrl('users', user.id, user.avatar);
  }

  function buildRoomAvatarUrl(room) {
    if (!room) {
      return '';
    }

    if (room.avatarUrl) {
      return room.avatarUrl;
    }

    return buildCollectionFileUrl('chat_rooms', room.id, room.avatar);
  }

  function getChatMessageImageUrl(message) {
    if (!message) {
      return '';
    }

    if (message.imageUrl) {
      return message.imageUrl;
    }

    return buildCollectionFileUrl('chat_room_messages', message.id, message.imageAttachment);
  }

  function getMessagePreviewText(message) {
    if (!message) {
      return '';
    }

    const body = String(message.body || '').trim();
    if (body) {
      return body;
    }

    return getChatMessageImageUrl(message) ? 'Sent an image' : '';
  }

  function findKnownUserSummary(userId, username) {
    const normalizedId = String(userId || '').trim();
    const normalizedUsername = normalizeUsernameValue(username || '');
    const data = getBootstrapData();
    const candidates = []
      .concat(state.session && state.session.user ? [state.session.user] : [])
      .concat(data.mentionDirectory || [])
      .concat(data.friends || [])
      .concat(data.blockedUsers || [])
      .concat((data.incomingRequests || []).map(function (request) { return request.user; }))
      .concat((data.outgoingRequests || []).map(function (request) { return request.user; }))
      .concat((data.dmRooms || []).map(function (room) { return room && room.peer ? room.peer : null; }))
      .concat(state.activeRoom && Array.isArray(state.activeRoom.members) ? state.activeRoom.members : []);

    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      if (!candidate) {
        continue;
      }

      if (normalizedId && candidate.id === normalizedId) {
        return candidate;
      }

      if (normalizedUsername && normalizeUsernameValue(candidate.username || '') === normalizedUsername) {
        return candidate;
      }
    }

    return null;
  }

  function clearMentionSuggestions() {
    if (state.mentionLookupHandle) {
      clearTimeout(state.mentionLookupHandle);
      state.mentionLookupHandle = null;
    }

    state.mentionSuggestions = [];
    state.mentionSelectedIndex = 0;
    state.mentionQuery = '';
    state.mentionAnchorIndex = -1;

    const elements = getElements();
    setElementVisibility(elements.chatMentionMenu, false);
    if (elements.chatMentionMenu) {
      elements.chatMentionMenu.innerHTML = '';
    }
  }

  function getActiveMentionState() {
    const elements = getElements();
    if (!elements.chatMessageInput) {
      return null;
    }

    const input = elements.chatMessageInput;
    const caret = typeof input.selectionStart === 'number'
      ? input.selectionStart
      : String(input.value || '').length;
    const beforeCaret = String(input.value || '').slice(0, caret);
    const match = beforeCaret.match(/(^|[\s(])@([a-z0-9_]*)$/i);

    if (!match) {
      return null;
    }

    return {
      prefix: normalizeUsernameValue(match[2] || ''),
      caret: caret,
      start: caret - (match[2] || '').length - 1
    };
  }

  function renderMentionSuggestions() {
    const elements = getElements();
    if (!elements.chatMentionMenu) {
      return;
    }

    elements.chatMentionMenu.innerHTML = '';

    if (!state.mentionSuggestions.length) {
      setElementVisibility(elements.chatMentionMenu, false);
      return;
    }

    state.mentionSuggestions.forEach(function (entry, index) {
      const button = document.createElement('button');
      button.className = 'chat-mention-option' + (index === state.mentionSelectedIndex ? ' is-active' : '');
      button.type = 'button';
      button.dataset.mentionUsername = entry.username || '';

      const avatarUrl = buildUserAvatarUrl(entry);
      const avatarHolder = createInlineAvatarElement(
        entry.username || 'User',
        avatarUrl,
        'chat-mention-avatar',
        'chat-mention-avatar-fallback'
      );

      const label = document.createElement('span');
      label.className = 'chat-mention-label';
      setUsernameDisplay(label, entry.username || 'user', { tooltip: false });

      button.appendChild(avatarHolder);
      button.appendChild(label);
      elements.chatMentionMenu.appendChild(button);
    });

    setElementVisibility(elements.chatMentionMenu, true);
  }

  function applyMentionSuggestion(username) {
    const elements = getElements();
    if (!elements.chatMessageInput || !username) {
      return;
    }

    const mentionState = getActiveMentionState();
    if (!mentionState) {
      clearMentionSuggestions();
      return;
    }

    const input = elements.chatMessageInput;
    const value = String(input.value || '');
    const insertion = '@' + normalizeUsernameValue(username) + ' ';
    input.value = value.slice(0, mentionState.start) + insertion + value.slice(mentionState.caret);

    const nextCaret = mentionState.start + insertion.length;
    input.focus();
    input.setSelectionRange(nextCaret, nextCaret);
    clearMentionSuggestions();
  }

  function collectMentionCandidates(prefix) {
    const requestedPrefix = prefix || '';
    const data = getBootstrapData();
    const byUsername = new Map();

    function addCandidate(candidate) {
      if (!candidate) {
        return;
      }

      const username = normalizeUsernameValue(candidate.username || candidate.fromUsername || candidate.toUsername || candidate.authorUsername || '');
      if (!username) {
        return;
      }

      if (requestedPrefix && username.indexOf(requestedPrefix) !== 0) {
        return;
      }

      if (byUsername.has(username)) {
        return;
      }

      byUsername.set(username, {
        id: candidate.id || candidate.userId || candidate.fromUserId || candidate.toUserId || candidate.authorId || '',
        username: username,
        avatar: candidate.avatar || candidate.avatarSnapshot || candidate.fromAvatar || candidate.toAvatar || candidate.authorAvatar || '',
        avatarUrl: candidate.avatarUrl || ''
      });
    }

    if (Array.isArray(data.mentionDirectory) && data.mentionDirectory.length) {
      data.mentionDirectory.forEach(addCandidate);
    } else {
      (data.friends || []).forEach(addCandidate);
      (data.blockedUsers || []).forEach(addCandidate);
      (data.incomingRequests || []).forEach(addCandidate);
      (data.outgoingRequests || []).forEach(addCandidate);
      (data.dmRooms || []).forEach(function (room) {
        if (room && room.peer) {
          addCandidate(room.peer);
        }
      });

      if (state.activeRoom && Array.isArray(state.activeRoom.members)) {
        state.activeRoom.members.forEach(addCandidate);
      }

      if (state.activeRoom && Array.isArray(state.activeRoom.messages)) {
        state.activeRoom.messages.forEach(addCandidate);
      }
    }

    return Array.from(byUsername.values())
      .sort(function (left, right) {
        return left.username.localeCompare(right.username);
      })
      .slice(0, requestedPrefix ? 5 : 10);
  }

  function updateMentionSuggestions() {
    const mentionState = getActiveMentionState();
    if (!mentionState) {
      clearMentionSuggestions();
      return;
    }

    state.mentionQuery = mentionState.prefix || '';
    state.mentionAnchorIndex = mentionState.start;

    if (state.mentionLookupHandle) {
      clearTimeout(state.mentionLookupHandle);
    }

    state.mentionLookupHandle = window.setTimeout(function () {
      state.mentionLookupHandle = null;
      state.mentionSuggestions = collectMentionCandidates(mentionState.prefix || '');
      state.mentionSelectedIndex = 0;
      renderMentionSuggestions();
    }, 90);
  }

  function getReplyPreviewText(message) {
    if (!message) {
      return '';
    }

    if (message.replyTo && typeof message.replyTo === 'object') {
      const storedBody = String(message.replyTo.body || '').trim();
      if (storedBody) {
        return storedBody;
      }
      return message.replyTo.hasImage ? 'Sent an image' : '';
    }

    return getMessagePreviewText(message);
  }

  function clearPendingReply(shouldFocus) {
    state.pendingReply = null;
    renderChatComposerAttachmentState();

    if (shouldFocus) {
      const elements = getElements();
      if (elements.chatMessageInput) {
        elements.chatMessageInput.focus();
      }
    }
  }

  function setPendingReply(message) {
    if (!message || !message.id) {
      return;
    }

    state.pendingReply = {
      messageId: message.id,
      authorUsername: message.authorUsername || 'User',
      body: getMessagePreviewText(message),
      hasImage: !!getChatMessageImageUrl(message)
    };

    renderChatComposerAttachmentState();

    const elements = getElements();
    if (elements.chatMessageInput) {
      elements.chatMessageInput.focus();
    }
  }

  function clearPendingChatImage() {
    const elements = getElements();
    state.pendingChatImageFile = null;

    if (elements.chatImageInput) {
      elements.chatImageInput.value = '';
    }

    renderChatComposerAttachmentState();
  }

  function renderChatComposerAttachmentState() {
    const elements = getElements();
    const room = state.activeRoom && state.activeRoom.room ? state.activeRoom.room : null;
    const canAttachImage = !!room && room.type !== 'global';
    const hasReply = !!(state.pendingReply && state.pendingReply.messageId);
    const hasImage = !!state.pendingChatImageFile;

    setElementVisibility(elements.chatImageButton, canAttachImage);
    setElementVisibility(elements.chatReplyChip, hasReply);
    setElementVisibility(elements.chatAttachmentChip, canAttachImage && hasImage);
    setElementVisibility(elements.chatComposerMeta, hasReply || (canAttachImage && hasImage));

    if (elements.chatImageButton) {
      elements.chatImageButton.disabled = !canAttachImage;
    }

    if (elements.chatAttachmentName) {
      elements.chatAttachmentName.textContent = state.pendingChatImageFile ? state.pendingChatImageFile.name : 'Image ready';
    }

    if (elements.chatReplyAuthor) {
      elements.chatReplyAuthor.textContent = hasReply ? ('Replying to ' + (state.pendingReply.authorUsername || 'User')) : 'Replying';
    }

    if (elements.chatReplyPreview) {
      const preview = hasReply
        ? (String(state.pendingReply.body || '').trim() || (state.pendingReply.hasImage ? 'Sent an image' : 'Original message'))
        : 'Message preview';
      elements.chatReplyPreview.textContent = preview;
    }

    if (!canAttachImage && state.pendingChatImageFile) {
      state.pendingChatImageFile = null;
      if (elements.chatImageInput) {
        elements.chatImageInput.value = '';
      }
      setElementVisibility(elements.chatAttachmentChip, false);
      setElementVisibility(elements.chatComposerMeta, hasReply);
    }
  }

  function getModerationSnapshot() {
    const moderation = state.session && state.session.moderation ? state.session.moderation : null;

    if (!moderation) {
      return {
        warnings: 0,
        muteUntil: null,
        banUntil: null,
        isBanned: false,
        warningExpirations: []
      };
    }

    return {
      warnings: Number(moderation.activeWarnings || 0),
      muteUntil: moderation.muteUntil || null,
      banUntil: moderation.banUntil || null,
      isBanned: !!moderation.isBanned,
      warningExpirations: Array.isArray(moderation.warningsExpireAt) ? moderation.warningsExpireAt : []
    };
  }

  function canUseAccountActions() {
    return !getModerationSnapshot().isBanned;
  }

  function stopActiveAudio() {
    if (state.activeAudioStopHandle) {
      clearTimeout(state.activeAudioStopHandle);
      state.activeAudioStopHandle = null;
    }

    if (state.activeAudio) {
      try {
        state.activeAudio.pause();
      } catch (error) {
      }
      state.activeAudio = null;
    }
  }

  function playAdminSound(url, options) {
    if (!url) {
      return;
    }

    const settings = options || {};
    stopActiveAudio();
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.loop = !!settings.loop;
    state.activeAudio = audio;

    audio.play().catch(function () {
      state.activeAudio = null;
    });

    if (!audio.loop) {
      audio.addEventListener('ended', function () {
        if (state.activeAudio === audio) {
          state.activeAudio = null;
        }
        if (state.activeAudioStopHandle) {
          clearTimeout(state.activeAudioStopHandle);
          state.activeAudioStopHandle = null;
        }
      }, { once: true });
    }

    if (settings.maxDurationMs && Number.isFinite(settings.maxDurationMs) && settings.maxDurationMs > 0) {
      state.activeAudioStopHandle = window.setTimeout(function () {
        if (state.activeAudio === audio) {
          stopActiveAudio();
        }
      }, settings.maxDurationMs);
    }
  }

  function prepareSiteOverlayLayer() {
    const elements = getElements();
    [
      elements.trollMediaOverlay,
      elements.siteFlashbangOverlay,
      elements.siteBustOverlay,
      elements.siteNukeOverlay
    ].forEach(function (overlay) {
      if (overlay && overlay.parentElement === document.body) {
        document.body.appendChild(overlay);
      }
    });

    document.querySelectorAll('.game-frame.fullscreen').forEach(function (frame) {
      frame.classList.remove('fullscreen');
    });

    const exitFullscreen = document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen ||
      document.mozCancelFullScreen;

    if (exitFullscreen && (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement ||
      document.mozFullScreenElement
    )) {
      try {
        const result = exitFullscreen.call(document);
        if (result && typeof result.catch === 'function') {
          result.catch(function () { });
        }
      } catch (error) {
      }
    }
  }

  function triggerBarrelRoll() {
    const elements = getElements();
    if (!elements.mainContainer) {
      return;
    }

    elements.mainContainer.classList.remove('site-troll-roll');
    void elements.mainContainer.offsetWidth;
    elements.mainContainer.classList.add('site-troll-roll');

    window.setTimeout(function () {
      elements.mainContainer.classList.remove('site-troll-roll');
    }, 1300);
  }

  function hideBroadcastToast(immediate) {
    const elements = getElements();

    if (state.broadcastToastHandle) {
      clearTimeout(state.broadcastToastHandle);
      state.broadcastToastHandle = null;
    }

    if (state.broadcastHideHandle) {
      clearTimeout(state.broadcastHideHandle);
      state.broadcastHideHandle = null;
    }

    if (!elements.siteBroadcastBanner) {
      return;
    }

    elements.siteBroadcastBanner.classList.remove('visible');

    if (immediate) {
      elements.siteBroadcastBanner.hidden = true;
      return;
    }

    state.broadcastHideHandle = window.setTimeout(function () {
      elements.siteBroadcastBanner.hidden = true;
      state.broadcastHideHandle = null;
    }, 260);
  }

  function showBroadcastToast(message, durationMs) {
    const elements = getElements();
    if (!elements.siteBroadcastBanner || !message) {
      return;
    }

    if (state.broadcastToastHandle) {
      clearTimeout(state.broadcastToastHandle);
      state.broadcastToastHandle = null;
    }

    if (state.broadcastHideHandle) {
      clearTimeout(state.broadcastHideHandle);
      state.broadcastHideHandle = null;
    }

    elements.siteBroadcastBanner.textContent = message;
    elements.siteBroadcastBanner.hidden = false;
    window.requestAnimationFrame(function () {
      elements.siteBroadcastBanner.classList.add('visible');
    });

    state.broadcastToastHandle = window.setTimeout(function () {
      hideBroadcastToast(false);
    }, durationMs || 5200);
  }

  function hideMentionToast(immediate) {
    const elements = getElements();

    if (state.mentionToastHandle) {
      clearTimeout(state.mentionToastHandle);
      state.mentionToastHandle = null;
    }

    if (state.mentionHideHandle) {
      clearTimeout(state.mentionHideHandle);
      state.mentionHideHandle = null;
    }

    if (!elements.siteMentionToast) {
      return;
    }

    elements.siteMentionToast.classList.remove('visible');

    if (immediate) {
      elements.siteMentionToast.hidden = true;
      return;
    }

    state.mentionHideHandle = window.setTimeout(function () {
      elements.siteMentionToast.hidden = true;
      state.mentionHideHandle = null;
      if (state.mentionToastQueue.length) {
        const nextNotification = state.mentionToastQueue.shift();
        showMentionToast(nextNotification);
      }
    }, 260);
  }

  function showMentionToast(notification) {
    const elements = getElements();
    if (!elements.siteMentionToast || !notification) {
      return;
    }

    if (!elements.siteMentionToast.hidden && state.mentionToastHandle) {
      state.mentionToastQueue.push(notification);
      return;
    }

    if (state.mentionToastHandle) {
      clearTimeout(state.mentionToastHandle);
      state.mentionToastHandle = null;
    }

    if (state.mentionHideHandle) {
      clearTimeout(state.mentionHideHandle);
      state.mentionHideHandle = null;
    }

    setAvatarImageSource(
      elements.siteMentionToastAvatar,
      elements.siteMentionToastAvatarFallback,
      elements.siteMentionToastAvatarImage,
      notification.actorUsername || 'User',
      notification.actorAvatarUrl || ''
    );

    if (elements.siteMentionToastTitle) {
      elements.siteMentionToastTitle.textContent = 'New mention';
    }

    if (elements.siteMentionToastBody) {
      elements.siteMentionToastBody.textContent = formatMentionNotificationText(notification);
    }

    state.mentionToastRoomId = notification.roomId || '';
    state.mentionToastRoomType = notification.roomType || '';

    elements.siteMentionToast.hidden = false;
    window.requestAnimationFrame(function () {
      elements.siteMentionToast.classList.add('visible');
    });

    state.mentionToastHandle = window.setTimeout(function () {
      state.mentionToastHandle = null;
      hideMentionToast(false);
    }, 5000);
  }

  function formatMentionNotificationText(notification) {
    if (!notification || !notification.actorUsername) {
      return '';
    }

    const roomType = String(notification.roomType || '').toLowerCase();
    let roomLabel = notification.roomName || 'chat';

    if (roomType === 'global') {
      roomLabel = 'Global Chat';
    } else if (roomType === 'dm') {
      roomLabel = 'Direct Message';
    } else if (!roomLabel) {
      roomLabel = 'group chat';
    }

    return notification.actorUsername + ' mentioned you in ' + roomLabel + '.';
  }

  function consumeMentionNotifications(notifications) {
    if (!Array.isArray(notifications) || !notifications.length) {
      return;
    }

    notifications.slice(0, 3).forEach(function (notification, index) {
      if (!notification || !formatMentionNotificationText(notification)) {
        return;
      }

      window.setTimeout(function () {
        showMentionToast(notification);
      }, index * 5300);
    });
  }

  function hideTrollMedia(immediate) {
    const elements = getElements();

    if (state.trollMediaHandle) {
      clearTimeout(state.trollMediaHandle);
      state.trollMediaHandle = null;
    }

    if (state.trollMediaHideHandle) {
      clearTimeout(state.trollMediaHideHandle);
      state.trollMediaHideHandle = null;
    }

    if (!elements.trollMediaOverlay || !elements.trollMediaImage) {
      return;
    }

    elements.trollMediaOverlay.classList.remove('visible');

    if (immediate) {
      elements.trollMediaOverlay.hidden = true;
      elements.trollMediaImage.removeAttribute('src');
      return;
    }

    state.trollMediaHideHandle = window.setTimeout(function () {
      elements.trollMediaOverlay.hidden = true;
      elements.trollMediaImage.removeAttribute('src');
      state.trollMediaHideHandle = null;
    }, 260);
  }

  function showTrollMedia(url) {
    const elements = getElements();
    if (!elements.trollMediaOverlay || !elements.trollMediaImage || !url) {
      return;
    }

    prepareSiteOverlayLayer();

    if (state.trollMediaHandle) {
      clearTimeout(state.trollMediaHandle);
      state.trollMediaHandle = null;
    }

    if (state.trollMediaHideHandle) {
      clearTimeout(state.trollMediaHideHandle);
      state.trollMediaHideHandle = null;
    }

    elements.trollMediaImage.src = url;
    elements.trollMediaOverlay.hidden = false;
    window.requestAnimationFrame(function () {
      elements.trollMediaOverlay.classList.add('visible');
    });

    state.trollMediaHandle = window.setTimeout(function () {
      hideTrollMedia(false);
    }, 6000);
  }

  function hideFlashbangOverlay(immediate) {
    const elements = getElements();

    if (state.flashbangHandle) {
      clearTimeout(state.flashbangHandle);
      state.flashbangHandle = null;
    }

    if (state.flashbangFadeHandle) {
      clearTimeout(state.flashbangFadeHandle);
      state.flashbangFadeHandle = null;
    }

    if (!elements.siteFlashbangOverlay) {
      return;
    }

    if (immediate) {
      elements.siteFlashbangOverlay.classList.remove('visible', 'is-fading');
      elements.siteFlashbangOverlay.style.transition = '';
      elements.siteFlashbangOverlay.hidden = true;
      return;
    }

    state.flashbangFadeHandle = window.setTimeout(function () {
      elements.siteFlashbangOverlay.hidden = true;
      elements.siteFlashbangOverlay.classList.remove('visible', 'is-fading');
      elements.siteFlashbangOverlay.style.transition = '';
      state.flashbangFadeHandle = null;
    }, 2450);
  }

  function startFlashbangSequence(triggeredAt, nonce) {
    const elements = getElements();
    if (!elements.siteFlashbangOverlay || !nonce) {
      return;
    }

    prepareSiteOverlayLayer();

    if (state.activeFlashbangNonce === nonce && (state.flashbangHandle || state.flashbangFadeHandle)) {
      return;
    }

    hideFlashbangOverlay(true);
    state.activeFlashbangNonce = nonce;
    playAdminSound('/Flash%20Bang.mp3');

    elements.siteFlashbangOverlay.hidden = false;
    elements.siteFlashbangOverlay.style.transition = 'none';
    window.requestAnimationFrame(function () {
      elements.siteFlashbangOverlay.classList.remove('is-fading');
      elements.siteFlashbangOverlay.classList.add('visible');
      void elements.siteFlashbangOverlay.offsetWidth;
      elements.siteFlashbangOverlay.style.transition = '';
    });

    state.flashbangHandle = window.setTimeout(function () {
      elements.siteFlashbangOverlay.classList.remove('visible');
      elements.siteFlashbangOverlay.classList.add('is-fading');
      state.flashbangHandle = null;
      hideFlashbangOverlay(false);
    }, Math.max(0, 5000 - Math.min(5000, Math.max(0, nowMs() - (Date.parse(triggeredAt || '') || nowMs())))));
  }

  function hideBustOverlay(immediate) {
    const elements = getElements();

    if (state.bustHandle) {
      clearTimeout(state.bustHandle);
      state.bustHandle = null;
    }

    if (state.bustFadeHandle) {
      clearTimeout(state.bustFadeHandle);
      state.bustFadeHandle = null;
    }

    if (!elements.siteBustOverlay) {
      return;
    }

    if (immediate) {
      elements.siteBustOverlay.classList.remove('visible', 'is-fading');
      elements.siteBustOverlay.hidden = true;
      stopActiveAudio();
      return;
    }

    state.bustFadeHandle = window.setTimeout(function () {
      elements.siteBustOverlay.hidden = true;
      elements.siteBustOverlay.classList.remove('visible', 'is-fading');
      stopActiveAudio();
      state.bustFadeHandle = null;
    }, 900);
  }

  function startBustSequence(triggeredAt, nonce) {
    const elements = getElements();
    if (!elements.siteBustOverlay || !elements.siteBustImage || !nonce) {
      return;
    }

    prepareSiteOverlayLayer();

    if (state.activeBustNonce === nonce && (state.bustHandle || state.bustFadeHandle)) {
      return;
    }

    hideBustOverlay(true);
    state.activeBustNonce = nonce;
    playAdminSound('/splooge-made-with-Voicemod.mp3', { loop: true });
    elements.siteBustOverlay.hidden = false;
    elements.siteBustImage.src = 'bust.gif?v=' + encodeURIComponent(nonce);

    window.requestAnimationFrame(function () {
      elements.siteBustOverlay.classList.remove('is-fading');
      elements.siteBustOverlay.classList.add('visible');
    });

    state.bustHandle = window.setTimeout(function () {
      elements.siteBustOverlay.classList.remove('visible');
      elements.siteBustOverlay.classList.add('is-fading');
      state.bustHandle = null;
      hideBustOverlay(false);
    }, Math.max(0, 7000 - Math.min(7000, Math.max(0, nowMs() - (Date.parse(triggeredAt || '') || nowMs())))));
  }

  function hideNukeOverlay(immediate) {
    const elements = getElements();

    if (state.nukeSequenceHandle) {
      clearInterval(state.nukeSequenceHandle);
      state.nukeSequenceHandle = null;
    }

    if (state.nukeHideHandle) {
      clearTimeout(state.nukeHideHandle);
      state.nukeHideHandle = null;
    }

    state.activeNukeNonce = '';

    if (!elements.siteNukeOverlay) {
      return;
    }

    elements.siteNukeOverlay.classList.remove('visible', 'is-flash-phase');
    elements.siteNukeOverlay.style.background = '#020202';
    elements.siteNukeOverlay.style.color = '#ff5e5e';

    if (elements.siteNukeTitle) {
      elements.siteNukeTitle.textContent = 'If you have epilepsy or are photosensitive, leave the page now.';
    }

    if (elements.siteNukeTimer) {
      elements.siteNukeTimer.textContent = '5.00';
    }

    if (elements.siteNukeNote) {
      elements.siteNukeNote.textContent = 'Sitewide admin takeover in progress.';
    }

    if (immediate) {
      elements.siteNukeOverlay.hidden = true;
      return;
    }

    state.nukeHideHandle = window.setTimeout(function () {
      elements.siteNukeOverlay.hidden = true;
      state.nukeHideHandle = null;
    }, 220);
  }

  function startNukeSequence(triggeredAt, nonce) {
    const elements = getElements();
    if (!elements.siteNukeOverlay || !elements.siteNukeTitle || !elements.siteNukeTimer || !elements.siteNukeNote || !nonce) {
      return;
    }

    prepareSiteOverlayLayer();

    if (state.activeNukeNonce === nonce && state.nukeSequenceHandle) {
      return;
    }

    hideNukeOverlay(true);
    state.activeNukeNonce = nonce;
    playAdminSound('/freesound_community-n-o-t-i-f-y-c-a-r-69566.mp3', { maxDurationMs: 11000 });

    const triggerMs = Date.parse(triggeredAt || '') || nowMs();
    const countdownEndMs = triggerMs + 5000;
    const flashEndMs = countdownEndMs + 6000;
    const flashPalette = ['#4f0000', '#040404', '#ffffff', '#5e0000', '#050505', '#ffffff'];

    elements.siteNukeOverlay.hidden = false;

    const render = function () {
      const currentMs = nowMs();

      if (currentMs < countdownEndMs) {
        const secondsLeft = Math.max(0, (countdownEndMs - currentMs) / 1000);
        elements.siteNukeOverlay.classList.add('visible');
        elements.siteNukeOverlay.classList.remove('is-flash-phase');
        elements.siteNukeOverlay.style.background = '#020202';
        elements.siteNukeOverlay.style.color = '#ff5e5e';
        elements.siteNukeTitle.textContent = 'If you have epilepsy or are photosensitive, leave the page now.';
        elements.siteNukeTimer.textContent = secondsLeft.toFixed(2);
        elements.siteNukeNote.textContent = 'Admin takeover starts in 5 seconds.';
        return;
      }

      if (currentMs < flashEndMs) {
        const phaseIndex = Math.floor((currentMs - countdownEndMs) / 95) % flashPalette.length;
        const background = flashPalette[phaseIndex];
        const darkBackground = background !== '#ffffff';
        elements.siteNukeOverlay.classList.add('visible', 'is-flash-phase');
        elements.siteNukeOverlay.style.background = background;
        elements.siteNukeOverlay.style.color = darkBackground ? '#ffffff' : '#111111';
        elements.siteNukeTitle.textContent = '';
        elements.siteNukeTimer.textContent = '';
        elements.siteNukeNote.textContent = '';
        return;
      }

      hideNukeOverlay(false);
    };

    render();
    state.nukeSequenceHandle = window.setInterval(render, 1);
  }

  function normalizeSiteState(siteState) {
    return {
      broadcastMessage: siteState && siteState.broadcastMessage ? String(siteState.broadcastMessage) : '',
      pinnedMessage: siteState && siteState.pinnedMessage ? String(siteState.pinnedMessage) : '',
      trollRollNonce: siteState && siteState.trollRollNonce ? String(siteState.trollRollNonce) : '',
      trollSoundNonce: siteState && siteState.trollSoundNonce ? String(siteState.trollSoundNonce) : '',
      trollSoundUrl: siteState && siteState.trollSoundUrl ? String(siteState.trollSoundUrl) : '',
      trollMediaNonce: siteState && siteState.trollMediaNonce ? String(siteState.trollMediaNonce) : '',
      trollMediaUrl: siteState && siteState.trollMediaUrl ? String(siteState.trollMediaUrl) : '',
      trollFlashbangNonce: siteState && siteState.trollFlashbangNonce ? String(siteState.trollFlashbangNonce) : '',
      trollFlashbangTriggeredAt: siteState && siteState.trollFlashbangTriggeredAt ? String(siteState.trollFlashbangTriggeredAt) : '',
      trollBustNonce: siteState && siteState.trollBustNonce ? String(siteState.trollBustNonce) : '',
      trollBustTriggeredAt: siteState && siteState.trollBustTriggeredAt ? String(siteState.trollBustTriggeredAt) : '',
      trollNukeNonce: siteState && siteState.trollNukeNonce ? String(siteState.trollNukeNonce) : '',
      trollNukeTriggeredAt: siteState && siteState.trollNukeTriggeredAt ? String(siteState.trollNukeTriggeredAt) : '',
      updated: siteState && siteState.updated ? String(siteState.updated) : ''
    };
  }

  function applySiteState(siteState) {
    const elements = getElements();
    const nextState = normalizeSiteState(siteState);
    const broadcastKey = nextState.broadcastMessage
      ? nextState.broadcastMessage + '|' + nextState.updated
      : '';
    const shouldShowBroadcast = !!nextState.broadcastMessage && broadcastKey !== state.lastBroadcastKey;
    const shouldTriggerRoll = state.hasSeenSiteState &&
      nextState.trollRollNonce &&
      nextState.trollRollNonce !== state.siteState.trollRollNonce;
    const shouldTriggerSound = state.hasSeenSiteState &&
      nextState.trollSoundNonce &&
      nextState.trollSoundNonce !== state.siteState.trollSoundNonce &&
      nextState.trollSoundUrl;
    const shouldTriggerMedia = state.hasSeenSiteState &&
      nextState.trollMediaNonce &&
      nextState.trollMediaNonce !== state.siteState.trollMediaNonce &&
      nextState.trollMediaUrl;
    const flashbangExpiryMs = (Date.parse(nextState.trollFlashbangTriggeredAt || '') || 0) + 5000;
    const shouldTriggerFlashbang = !!nextState.trollFlashbangNonce &&
      nextState.trollFlashbangTriggeredAt &&
      flashbangExpiryMs > nowMs() &&
      (
        nextState.trollFlashbangNonce !== state.siteState.trollFlashbangNonce ||
        (!state.hasSeenSiteState && nextState.trollFlashbangNonce !== state.activeFlashbangNonce)
      );
    const bustExpiryMs = (Date.parse(nextState.trollBustTriggeredAt || '') || 0) + 7000;
    const shouldTriggerBust = !!nextState.trollBustNonce &&
      nextState.trollBustTriggeredAt &&
      bustExpiryMs > nowMs() &&
      (
        nextState.trollBustNonce !== state.siteState.trollBustNonce ||
        (!state.hasSeenSiteState && nextState.trollBustNonce !== state.activeBustNonce)
      );
    const nukeExpiryMs = (Date.parse(nextState.trollNukeTriggeredAt || '') || 0) + 11000;
    const shouldTriggerNuke = !!nextState.trollNukeNonce &&
      nextState.trollNukeTriggeredAt &&
      nukeExpiryMs > nowMs() &&
      (
        nextState.trollNukeNonce !== state.siteState.trollNukeNonce ||
        (!state.hasSeenSiteState && nextState.trollNukeNonce !== state.activeNukeNonce)
      );

    state.siteState = nextState;
    state.hasSeenSiteState = true;
    state.lastBroadcastKey = broadcastKey;

    if (elements.siteBroadcastBanner) {
      if (!nextState.broadcastMessage) {
        hideBroadcastToast(true);
      } else if (shouldShowBroadcast) {
        showBroadcastToast(nextState.broadcastMessage);
      }
    }

    if (isOwner()) {
      if (elements.adminBroadcastInput && document.activeElement !== elements.adminBroadcastInput) {
        elements.adminBroadcastInput.value = nextState.broadcastMessage;
      }

      if (elements.adminPinnedInput && document.activeElement !== elements.adminPinnedInput) {
        elements.adminPinnedInput.value = nextState.pinnedMessage;
      }

      if (elements.adminSoundName) {
        elements.adminSoundName.textContent = nextState.trollSoundUrl ? 'Uploaded sound ready' : 'No sound uploaded';
      }

      if (elements.adminMediaName) {
        elements.adminMediaName.textContent = nextState.trollMediaUrl ? 'Uploaded image ready' : 'No image uploaded';
      }
    }

    if (shouldTriggerRoll) {
      triggerBarrelRoll();
    }

    if (shouldTriggerSound) {
      playAdminSound(nextState.trollSoundUrl);
    }

    if (shouldTriggerMedia) {
      showTrollMedia(nextState.trollMediaUrl);
    }

    if (shouldTriggerFlashbang) {
      startFlashbangSequence(nextState.trollFlashbangTriggeredAt, nextState.trollFlashbangNonce);
    }

    if (shouldTriggerBust) {
      startBustSequence(nextState.trollBustTriggeredAt, nextState.trollBustNonce);
    }

    if (shouldTriggerNuke) {
      startNukeSequence(nextState.trollNukeTriggeredAt, nextState.trollNukeNonce);
    }

    renderRoomChrome();
  }

  function resetCropState() {
    const elements = getElements();
    const crop = state.crop;

    if (crop.objectUrl) {
      URL.revokeObjectURL(crop.objectUrl);
    }

    crop.image = null;
    crop.objectUrl = '';
    crop.zoom = 1;
    crop.baseScale = 1;
    crop.offsetX = 0;
    crop.offsetY = 0;
    crop.dragging = false;
    crop.target = '';

    if (elements.avatarCropZoom) {
      elements.avatarCropZoom.value = '1';
    }

    if (elements.avatarCropModal) {
      elements.avatarCropModal.classList.remove('visible');
      elements.avatarCropModal.setAttribute('aria-hidden', 'true');
    }
  }

  function drawCropPreview() {
    const elements = getElements();
    const crop = state.crop;

    if (!elements.avatarCropCanvas || !crop.image) {
      return;
    }

    const context = elements.avatarCropCanvas.getContext('2d');
    const width = elements.avatarCropCanvas.width;
    const height = elements.avatarCropCanvas.height;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#0f1115';
    context.fillRect(0, 0, width, height);

    const scale = crop.baseScale * crop.zoom;
    const drawWidth = crop.image.width * scale;
    const drawHeight = crop.image.height * scale;
    const x = (width - drawWidth) / 2 + crop.offsetX;
    const y = (height - drawHeight) / 2 + crop.offsetY;

    context.drawImage(crop.image, x, y, drawWidth, drawHeight);
  }

  function openCropperForFile(file, target) {
    const elements = getElements();
    const crop = state.crop;

    if (!elements.avatarCropModal || !elements.avatarCropCanvas || !file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = function () {
      if (crop.objectUrl && crop.objectUrl !== objectUrl) {
        URL.revokeObjectURL(crop.objectUrl);
      }

      crop.image = image;
      crop.objectUrl = objectUrl;
      crop.zoom = 1;
      crop.baseScale = Math.max(
        elements.avatarCropCanvas.width / image.width,
        elements.avatarCropCanvas.height / image.height
      );
      crop.offsetX = 0;
      crop.offsetY = 0;
      crop.target = target;

      if (elements.avatarCropZoom) {
        elements.avatarCropZoom.value = '1';
      }

      drawCropPreview();
      elements.avatarCropModal.classList.add('visible');
      elements.avatarCropModal.setAttribute('aria-hidden', 'false');
    };

    image.onerror = function () {
      URL.revokeObjectURL(objectUrl);
      setFeedback(getElements().accountAvatarFeedback, 'error', 'Unable to read that image.');
    };

    image.src = objectUrl;
  }

  function buildCroppedBlob() {
    return new Promise(function (resolve, reject) {
      const elements = getElements();
      if (!elements.avatarCropCanvas) {
        reject(new Error('No crop canvas available.'));
        return;
      }

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = 256;
      outputCanvas.height = 256;
      const context = outputCanvas.getContext('2d');
      context.drawImage(elements.avatarCropCanvas, 0, 0, 256, 256);

      outputCanvas.toBlob(function (blob) {
        if (!blob) {
          reject(new Error('Unable to export the crop.'));
          return;
        }
        resolve(blob);
      }, 'image/png', 0.92);
    });
  }

  async function uploadProfileAvatar(blob, fileName) {
    const formData = new FormData();
    formData.append('avatar', blob, fileName || 'avatar.png');
    const response = await pb.send('/api/chat/avatar', {
      method: 'POST',
      body: formData,
      requestKey: null
    });

    if (response && response.user) {
      await refreshSession();
      await loadBootstrap();
    }

    setFeedback(getElements().accountAvatarFeedback, 'success', 'Profile picture updated.');
  }

  async function uploadGroupAvatar(roomId, blob) {
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('avatar', blob, 'group-avatar.png');
    await pb.send('/api/chat/group/avatar', {
      method: 'POST',
      body: formData,
      requestKey: null
    });
  }

  async function approveCropUpload() {
    const elements = getElements();
    if (!state.crop.image || !pb || !isAuthenticated()) {
      resetCropState();
      return;
    }

    if (elements.avatarCropApprove) {
      elements.avatarCropApprove.disabled = true;
    }

    try {
      const blob = await buildCroppedBlob();

      if (state.crop.target === 'profile') {
        await uploadProfileAvatar(blob, 'avatar.png');
      } else if (state.crop.target === 'group-create') {
        state.pendingGroupAvatarFile = new File([blob], 'group-avatar.png', { type: 'image/png' });
        if (elements.chatGroupAvatarName) {
          elements.chatGroupAvatarName.textContent = 'Group image ready';
        }
      } else if (state.crop.target === 'group-manage' && state.manageGroupRoomId) {
        await uploadGroupAvatar(state.manageGroupRoomId, blob);
        state.pendingManageGroupAvatarFile = null;
        if (elements.chatManageGroupAvatarName) {
          elements.chatManageGroupAvatarName.textContent = 'Group image updated';
        }
        await loadBootstrap();
        if (state.activeRoomId === state.manageGroupRoomId) {
          await loadActiveRoom();
        }
      }
    } catch (error) {
      setFeedback(elements.accountAvatarFeedback, 'error', extractErrorMessage(error, 'Unable to upload that image.'));
    } finally {
      if (elements.avatarCropApprove) {
        elements.avatarCropApprove.disabled = false;
      }
      resetCropState();
    }
  }

  async function api(path, method, body) {
    const options = {
      method: method || 'GET',
      requestKey: null
    };

    if (body instanceof FormData) {
      options.body = body;
    } else if (body !== undefined) {
      options.body = JSON.stringify(body || {});
    }

    return pb.send(path, options);
  }

  function getBootstrapData() {
    return state.bootstrap || {
      user: null,
      moderation: null,
      globalRoom: null,
      groupRooms: [],
      dmRooms: [],
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      blockedUsers: [],
      mentionDirectory: [],
      mentionNotifications: []
    };
  }

  function findRoomSummaryById(roomId) {
    const data = getBootstrapData();
    const allRooms = []
      .concat(data.globalRoom ? [data.globalRoom] : [])
      .concat(data.groupRooms || [])
      .concat(data.dmRooms || [])
      .concat(state.transientDmRoom ? [state.transientDmRoom] : []);

    for (let i = 0; i < allRooms.length; i += 1) {
      if (allRooms[i] && allRooms[i].id === roomId) {
        return allRooms[i];
      }
    }

    return null;
  }

  function mergeRoomSummaryIntoBootstrap(roomId, patch) {
    if (!roomId || !patch) {
      return;
    }

    if (state.bootstrap) {
      if (state.bootstrap.globalRoom && state.bootstrap.globalRoom.id === roomId) {
        state.bootstrap.globalRoom = Object.assign({}, state.bootstrap.globalRoom, patch);
      }

      if (Array.isArray(state.bootstrap.groupRooms)) {
        state.bootstrap.groupRooms = state.bootstrap.groupRooms.map(function (room) {
          return room && room.id === roomId ? Object.assign({}, room, patch) : room;
        });
      }

      if (Array.isArray(state.bootstrap.dmRooms)) {
        state.bootstrap.dmRooms = state.bootstrap.dmRooms.map(function (room) {
          return room && room.id === roomId ? Object.assign({}, room, patch) : room;
        });
      }
    }

    if (state.transientDmRoom && state.transientDmRoom.id === roomId) {
      state.transientDmRoom = Object.assign({}, state.transientDmRoom, patch);
    }
  }

  function syncRoomSummaryFromState(roomState) {
    if (!roomState || !roomState.room || !roomState.room.id) {
      return;
    }

    const messages = Array.isArray(roomState.messages) ? roomState.messages : [];
    const latestMessage = messages.length ? messages[messages.length - 1] : null;
    const patch = {
      lastMessagePreview: latestMessage ? getMessagePreviewText(latestMessage) : (roomState.room.lastMessagePreview || ''),
      lastMessageAt: latestMessage ? (latestMessage.created || '') : (roomState.room.lastMessageAt || '')
    };

    roomState.room = Object.assign({}, roomState.room, patch);
    mergeRoomSummaryIntoBootstrap(roomState.room.id, patch);
  }

  function ensureActiveRoomFromBootstrap() {
    const data = getBootstrapData();
    const availableRoom = findRoomSummaryById(state.activeRoomId);

    if (state.activeView === 'groups') {
      if (!availableRoom) {
        state.activeRoomId = data.globalRoom ? data.globalRoom.id : '';
      }
      return;
    }

    if (state.activeView === 'dms' && state.activeRoomId) {
      return;
    }

    if (state.activeView === 'dms' && data.dmRooms && data.dmRooms.length && !state.activeRoomId) {
      state.activeRoomId = data.dmRooms[0].id;
      return;
    }

    if (state.activeView === 'friends') {
      state.activeRoomId = '';
      state.activeRoom = null;
    }
  }

  function renderListAvatar(container, label, url) {
    const fallback = container.querySelector('span');
    const image = container.querySelector('img');
    setAvatarImageSource(container, fallback, image, label, url);
  }

  function createListItem(config) {
    const item = document.createElement('button');
    item.className = 'chat-list-item' + (config.active ? ' is-active' : '');
    item.type = 'button';
    item.dataset.kind = config.kind || '';
    item.dataset.id = config.id || '';

    const avatar = document.createElement('div');
    avatar.className = 'chat-list-avatar';
    avatar.innerHTML = '<span>?</span><img alt="">';
    renderListAvatar(avatar, config.title || '', config.avatarUrl || '');

    const copy = document.createElement('div');
    copy.className = 'chat-list-copy';

    const titleRow = document.createElement('div');
    titleRow.className = 'chat-list-title-row';

    const title = document.createElement('div');
    title.className = 'chat-list-title';
    if (config.userTitle) {
      setUsernameDisplay(title, config.title || 'Conversation');
    } else {
      title.textContent = config.title || 'Conversation';
    }

    const meta = document.createElement('div');
    meta.className = 'chat-list-meta';
    meta.textContent = config.meta || '';

    titleRow.appendChild(title);
    titleRow.appendChild(meta);

    const preview = document.createElement('div');
    preview.className = 'chat-list-preview';
    preview.textContent = config.preview || '';

    const subline = document.createElement('div');
    subline.className = 'chat-list-subline';
    subline.textContent = config.subline || '';

    copy.appendChild(titleRow);
    if (config.preview) {
      copy.appendChild(preview);
    }
    if (config.subline) {
      copy.appendChild(subline);
    }

    item.appendChild(avatar);
    item.appendChild(copy);

    if (config.tag) {
      const tag = document.createElement('div');
      tag.className = 'chat-list-tag';
      tag.textContent = config.tag;
      item.appendChild(tag);
    }

    return item;
  }

  function renderConversationList() {
    const elements = getElements();
    const data = getBootstrapData();
    const list = elements.chatConversationList;

    if (!list) {
      return;
    }

    list.innerHTML = '';

    if (state.activeView === 'groups') {
      const rooms = [];
      if (data.globalRoom) {
        rooms.push({
          id: data.globalRoom.id,
          title: data.globalRoom.name || 'Global Chat',
          avatarUrl: buildRoomAvatarUrl(data.globalRoom),
          preview: data.globalRoom.lastMessagePreview || 'The main room for everyone.',
          meta: data.globalRoom.lastMessageAt ? formatListPreviewTime(data.globalRoom.lastMessageAt) : '',
          subline: '',
          tag: 'Global'
        });
      }

      (data.groupRooms || []).forEach(function (room) {
        rooms.push({
          id: room.id,
          title: room.name,
          avatarUrl: buildRoomAvatarUrl(room),
          preview: room.lastMessagePreview || 'No messages yet',
          meta: room.lastMessageAt ? formatListPreviewTime(room.lastMessageAt) : '',
          subline: room.memberCount ? room.memberCount + ' members' : 'Group chat',
          tag: 'Group'
        });
      });

      if (!rooms.length) {
        const empty = document.createElement('div');
        empty.className = 'chat-empty-state';
        empty.textContent = 'No group chats yet.';
        list.appendChild(empty);
        return;
      }

      rooms.forEach(function (room) {
        const item = createListItem({
          kind: 'room',
          id: room.id,
          title: room.title,
          avatarUrl: room.avatarUrl,
          preview: room.preview,
          meta: room.meta,
          subline: room.subline,
          tag: room.tag,
          active: state.activeRoomId === room.id
        });
        list.appendChild(item);
      });
      return;
    }

    if (state.activeView === 'friends') {
      (data.friends || []).forEach(function (friend) {
        const item = createListItem({
          kind: 'friend',
          id: friend.id,
          title: friend.username,
          userTitle: true,
          avatarUrl: buildUserAvatarUrl(friend),
          preview: formatRelativeDay(friend.lastSeenAt),
          meta: '',
          subline: friend.created ? 'Joined ' + formatAbsoluteTime(friend.created) : '',
          tag: 'Friend'
        });
        item.dataset.username = friend.username;
        list.appendChild(item);
      });

      if (!(data.friends || []).length) {
        const empty = document.createElement('div');
        empty.className = 'chat-empty-state';
        empty.textContent = 'No friends yet. Send a request to start building your list.';
        list.appendChild(empty);
      }
      return;
    }

    if (state.activeView === 'dms') {
      const rooms = (data.dmRooms || []).slice();
      if (state.transientDmRoom && !rooms.some(function (room) { return room.id === state.transientDmRoom.id; })) {
        rooms.unshift(state.transientDmRoom);
      }

      if (!rooms.length) {
        const empty = document.createElement('div');
        empty.className = 'chat-empty-state';
        empty.textContent = 'No DMs yet. Open one from the friends tab or a message menu.';
        list.appendChild(empty);
        return;
      }

      rooms.forEach(function (room) {
        const peer = room.peer || null;
        const item = createListItem({
          kind: 'room',
          id: room.id,
          title: peer ? peer.username : room.name,
          userTitle: !!peer,
          avatarUrl: peer ? buildUserAvatarUrl(peer) : buildRoomAvatarUrl(room),
          preview: room.lastMessagePreview || 'No messages yet',
          meta: room.lastMessageAt ? formatListPreviewTime(room.lastMessageAt) : '',
          subline: peer ? formatRelativeDay(peer.lastSeenAt) : 'Direct message',
          tag: 'DM',
          active: state.activeRoomId === room.id
        });
        list.appendChild(item);
      });
    }
  }

  function renderFriendRequests() {
    const elements = getElements();
    const data = getBootstrapData();
    const showFriends = state.activeView === 'friends';

    setElementVisibility(elements.chatAddFriendForm, showFriends);
    setElementVisibility(elements.chatIncomingRequestsSection, showFriends && (data.incomingRequests || []).length > 0);
    setElementVisibility(elements.chatOutgoingRequestsSection, showFriends && (data.outgoingRequests || []).length > 0);
    setElementVisibility(elements.chatBlockedSection, showFriends && (data.blockedUsers || []).length > 0);

    if (elements.chatIncomingRequestsList) {
      elements.chatIncomingRequestsList.innerHTML = '';
      (data.incomingRequests || []).forEach(function (request) {
        const card = document.createElement('div');
        card.className = 'chat-request-card';
        card.innerHTML = '' +
          '<div class="chat-request-head">' +
            '<div class="chat-list-avatar"><span>?</span><img alt=""></div>' +
              '<div class="chat-list-copy">' +
              '<div class="chat-list-title"></div>' +
              '<div class="chat-list-subline">' + formatRelativeDay(request.user.lastSeenAt) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="chat-request-actions">' +
            '<button class="community-btn community-btn-primary" data-request-action="accept" data-request-id="' + request.id + '" type="button">Accept</button>' +
            '<button class="community-btn community-btn-secondary" data-request-action="decline" data-request-id="' + request.id + '" type="button">Decline</button>' +
          '</div>';
        renderListAvatar(card.querySelector('.chat-list-avatar'), request.user.username, buildUserAvatarUrl(request.user));
        setUsernameDisplay(card.querySelector('.chat-list-title'), request.user.username);
        elements.chatIncomingRequestsList.appendChild(card);
      });
    }

    if (elements.chatOutgoingRequestsList) {
      elements.chatOutgoingRequestsList.innerHTML = '';
      (data.outgoingRequests || []).forEach(function (request) {
        const card = document.createElement('div');
        card.className = 'chat-request-card';
        card.innerHTML = '' +
          '<div class="chat-request-head">' +
            '<div class="chat-list-avatar"><span>?</span><img alt=""></div>' +
              '<div class="chat-list-copy">' +
              '<div class="chat-list-title"></div>' +
              '<div class="chat-list-subline">Waiting for a response</div>' +
            '</div>' +
          '</div>';
        renderListAvatar(card.querySelector('.chat-list-avatar'), request.user.username, buildUserAvatarUrl(request.user));
        setUsernameDisplay(card.querySelector('.chat-list-title'), request.user.username);
        elements.chatOutgoingRequestsList.appendChild(card);
      });
    }

    if (elements.chatBlockedList) {
      elements.chatBlockedList.innerHTML = '';
      (data.blockedUsers || []).forEach(function (user) {
        const card = document.createElement('div');
        card.className = 'chat-request-card';
        card.innerHTML = '' +
          '<div class="chat-request-head">' +
            '<div class="chat-list-avatar"><span>?</span><img alt=""></div>' +
              '<div class="chat-list-copy">' +
              '<div class="chat-list-title"></div>' +
              '<div class="chat-list-subline">Friend requests are still allowed.</div>' +
            '</div>' +
          '</div>' +
          '<div class="chat-request-actions">' +
            '<button class="community-btn community-btn-secondary" data-block-action="unblock" data-username="' + user.username + '" type="button">Unblock</button>' +
          '</div>';
        renderListAvatar(card.querySelector('.chat-list-avatar'), user.username, buildUserAvatarUrl(user));
        setUsernameDisplay(card.querySelector('.chat-list-title'), user.username);
        elements.chatBlockedList.appendChild(card);
      });
    }
  }

  function renderSidebarMeta() {
    const elements = getElements();
    if (!elements.chatSidebarHeading || !elements.chatSidebarKicker || !elements.chatSidebarPrimaryButton) {
      return;
    }

    let kickerText = '';
    let headingText = '';
    let showPrimaryButton = false;

    if (state.activeView === 'groups') {
      headingText = 'Groupchats';
      showPrimaryButton = true;
    } else if (state.activeView === 'friends') {
      kickerText = 'Requests + list';
      headingText = 'Friends';
    } else {
      kickerText = 'Private';
      headingText = 'DMs';
    }

    elements.chatSidebarKicker.textContent = kickerText;
    setElementVisibility(elements.chatSidebarKicker, !!kickerText);
    elements.chatSidebarHeading.textContent = headingText;
    elements.chatSidebarPrimaryButton.textContent = 'New Group';
    elements.chatSidebarPrimaryButton.hidden = !showPrimaryButton;
  }

  function syncChatModeTabs(view) {
    const elements = getElements();
    if (!elements.chatModeTabs) {
      return;
    }

    Array.prototype.forEach.call(elements.chatModeTabs.querySelectorAll('[data-chat-view]'), function (button) {
      button.classList.toggle('is-active', button.dataset.chatView === view);
    });
  }

  function renderRoomIdentity(room, roomMembers) {
    const elements = getElements();
    if (!elements.chatRoomTitle || !elements.chatRoomSubtitle || !elements.chatRoomAvatar) {
      return;
    }

    let label = room.name || 'Conversation';
    let subtitle = 'No conversation selected.';
    let avatarUrl = buildRoomAvatarUrl(room);

    if (room.type === 'global') {
      subtitle = 'Global chat clears every 2 hours.';
    } else if (room.type === 'dm') {
      const peer = room.peer || (roomMembers || []).filter(function (member) {
        return !state.session || !state.session.user || member.id !== state.session.user.id;
      })[0];
      if (peer) {
        label = peer.username;
        subtitle = formatRelativeDay(peer.lastSeenAt) + ' · 24 hour history';
        avatarUrl = buildUserAvatarUrl(peer);
      } else {
        subtitle = '24 hour history';
      }
    } else if (room.type === 'group') {
      subtitle = (roomMembers || []).length + ' members · oldest 500 trim after 1000';
    }

    if (room.type === 'dm') {
      setUsernameDisplay(elements.chatRoomTitle, label, { tooltip: true });
    } else {
      elements.chatRoomTitle.textContent = label;
    }
    elements.chatRoomSubtitle.textContent = subtitle;
    renderListAvatar(elements.chatRoomAvatar, label, avatarUrl);
  }

  function setChatStatus(message, type) {
    const elements = getElements();
    if (!elements.chatStatusBanner) {
      return;
    }

    if (!message) {
      elements.chatStatusBanner.hidden = true;
      elements.chatStatusBanner.textContent = '';
      elements.chatStatusBanner.className = 'chat-status-banner';
      return;
    }

    elements.chatStatusBanner.hidden = false;
    elements.chatStatusBanner.textContent = message;
    elements.chatStatusBanner.className = 'chat-status-banner';
    if (type) {
      elements.chatStatusBanner.classList.add('is-' + type);
    }
  }

  function renderRoomChrome() {
    const elements = getElements();
    const room = state.activeRoom && state.activeRoom.room ? state.activeRoom.room : null;
    const members = state.activeRoom && Array.isArray(state.activeRoom.members) ? state.activeRoom.members : [];
    const moderation = getModerationSnapshot();

    setElementVisibility(elements.chatMainEmpty, !room);
    setElementVisibility(elements.chatRoomPanel, !!room);

    if (!room) {
      clearMentionSuggestions();
      clearPendingReply(false);
      clearPendingChatImage();
      return;
    }

    renderRoomIdentity(room, members);
    setElementVisibility(elements.chatClearBanner, !!room.lastClearedLabel);
    if (elements.chatClearBanner) {
      elements.chatClearBanner.textContent = room.lastClearedLabel || '';
    }

    const pinnedMessage = room.type === 'global' ? state.siteState.pinnedMessage : '';
    setElementVisibility(elements.chatPinnedBanner, !!pinnedMessage);
    if (elements.chatPinnedBanner) {
      elements.chatPinnedBanner.textContent = pinnedMessage || '';
    }

    const canSend = !moderation.isBanned && !(moderation.muteUntil && new Date(moderation.muteUntil).getTime() > nowMs());
    if (elements.chatComposer) {
      elements.chatComposer.classList.toggle('disabled', !canSend);
    }
    if (elements.chatMessageInput) {
      elements.chatMessageInput.disabled = !canSend;
      elements.chatMessageInput.placeholder = moderation.isBanned
        ? 'This account is banned from sending messages.'
        : moderation.muteUntil && new Date(moderation.muteUntil).getTime() > nowMs()
          ? 'You are timed out right now.'
          : room.type === 'global'
            ? 'Say something to Global Chat...'
            : room.type === 'group'
              ? 'Send a message to the group...'
              : 'Send a DM...';
    }
    if (elements.chatSendButton) {
      elements.chatSendButton.disabled = !canSend;
    }
    if (elements.chatImageButton) {
      elements.chatImageButton.disabled = !canSend || room.type === 'global';
    }

    renderChatComposerAttachmentState();

    let bannerMessage = '';
    let bannerType = '';
    if (moderation.isBanned) {
      bannerMessage = 'Your account is banned. Unbans in ' + formatDurationUntil(moderation.banUntil) + '.';
      bannerType = 'danger';
    } else if (moderation.muteUntil && new Date(moderation.muteUntil).getTime() > nowMs()) {
      bannerMessage = 'Timeout active. You can talk again in ' + formatDurationUntil(moderation.muteUntil) + '.';
      bannerType = 'warning';
    } else if (moderation.warnings > 0) {
      bannerMessage = 'Warnings active: ' + moderation.warnings + '.';
      bannerType = 'warning';
    }
    setChatStatus(bannerMessage, bannerType);

    renderRoomActions(room, members);
  }

  function renderRoomActions(room, members) {
    const elements = getElements();
    if (!elements.chatRoomActions) {
      return;
    }

    elements.chatRoomActions.innerHTML = '';

    if (room.type === 'group') {
      const manage = document.createElement('button');
      manage.className = 'community-btn community-btn-secondary';
      manage.type = 'button';
      manage.textContent = 'Manage Group';
      manage.dataset.roomAction = 'manage-group';
      manage.dataset.roomId = room.id;
      elements.chatRoomActions.appendChild(manage);

      if (room.ownerId === (state.session && state.session.user ? state.session.user.id : '')) {
        const remove = document.createElement('button');
        remove.className = 'community-btn community-btn-danger';
        remove.type = 'button';
        remove.textContent = 'Delete Group';
        remove.dataset.roomAction = 'delete-group';
        remove.dataset.roomId = room.id;
        elements.chatRoomActions.appendChild(remove);
      } else {
        const leave = document.createElement('button');
        leave.className = 'community-btn community-btn-secondary';
        leave.type = 'button';
        leave.textContent = 'Leave Group';
        leave.dataset.roomAction = 'leave-group';
        leave.dataset.roomId = room.id;
        elements.chatRoomActions.appendChild(leave);
      }

      return;
    }

    if (room.type === 'dm') {
      const peer = room.peer || (members || []).filter(function (member) {
        return !state.session || !state.session.user || member.id !== state.session.user.id;
      })[0];
      if (peer) {
        const badge = document.createElement('button');
        badge.className = 'community-btn community-btn-secondary';
        badge.type = 'button';
        badge.textContent = 'Friend: ' + peer.username;
        badge.disabled = true;
        elements.chatRoomActions.appendChild(badge);
      }
    }
  }

  function renderMessages() {
    const elements = getElements();
    const roomState = state.activeRoom;
    const room = roomState && roomState.room ? roomState.room : null;
    const messages = roomState && Array.isArray(roomState.messages) ? roomState.messages : [];

    if (!elements.chatMessageList) {
      return;
    }

    elements.chatMessageList.innerHTML = '';

    if (!room) {
      return;
    }

    if (!messages.length) {
      const emptyState = document.createElement('div');
      emptyState.className = 'chat-empty-state';
      emptyState.textContent = room.type === 'dm'
        ? 'No messages yet. Start the DM to make it show up in your DM list.'
        : 'No messages yet. Start the conversation.';
      elements.chatMessageList.appendChild(emptyState);
      return;
    }

    const authId = state.session && state.session.user ? state.session.user.id : '';
    const ownerMode = isOwner();

    messages.forEach(function (message) {
      const row = document.createElement('article');
      row.className = 'chat-message';
      if (message.authorId && message.authorId === authId) {
        row.classList.add('own');
      }

      const messageAuthor = findKnownUserSummary(message.authorId, message.authorUsername);
      const avatarUrl = messageAuthor
        ? buildUserAvatarUrl(messageAuthor)
        : (message.authorAvatar
          ? buildCollectionFileUrl('users', message.authorId, message.authorAvatar)
          : '');
      const avatarHolder = createInlineAvatarElement(
        message.authorUsername || 'User',
        avatarUrl,
        'chat-avatar',
        'chat-avatar-fallback'
      );

      const content = document.createElement('div');
      content.className = 'chat-message-content';

      const replyData = message.replyTo && message.replyTo.messageId
        ? message.replyTo
        : null;

      if (replyData) {
        const reply = document.createElement('div');
        reply.className = 'chat-message-reply';

        const replyLabel = document.createElement('div');
        replyLabel.className = 'chat-message-reply-label';
        replyLabel.textContent = replyData.authorUsername || 'User';

        const replyPreview = document.createElement('div');
        replyPreview.className = 'chat-message-reply-preview';
        replyPreview.textContent = String(replyData.body || '').trim() || (replyData.hasImage ? 'Sent an image' : 'Original message');

        reply.appendChild(replyLabel);
        reply.appendChild(replyPreview);
        content.appendChild(reply);
      }

      const meta = document.createElement('div');
      meta.className = 'chat-message-meta';

      const user = document.createElement('div');
      user.className = 'chat-message-user';
      setUsernameDisplay(user, message.authorUsername || 'User', { tooltip: true });

      const time = document.createElement('time');
      time.className = 'chat-message-time';
      time.dateTime = message.created || '';
      time.textContent = formatAbsoluteTime(message.created);

      meta.appendChild(user);
      meta.appendChild(time);

      const actions = document.createElement('div');
      actions.className = 'chat-message-actions';

      const replyButton = document.createElement('button');
      replyButton.className = 'chat-message-reply-button';
      replyButton.type = 'button';
      replyButton.dataset.chatAction = 'reply-message';
      replyButton.dataset.messageId = message.id;
      replyButton.dataset.username = message.authorUsername || '';
      replyButton.innerHTML = '<i class="fas fa-reply"></i><span class="chat-message-reply-tooltip">Reply</span>';
      actions.appendChild(replyButton);

      const menu = document.createElement('div');
      menu.className = 'chat-message-admin';
      const isMenuOpen = state.openMessageMenuId === message.id;
      menu.classList.toggle('is-open', isMenuOpen);

      const toggle = document.createElement('button');
      toggle.className = 'chat-message-menu-toggle';
      toggle.type = 'button';
      toggle.dataset.chatMenuToggle = message.id;
      toggle.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');
      toggle.innerHTML = '<i class="fas fa-ellipsis"></i>';
      menu.appendChild(toggle);

      const menuBody = document.createElement('div');
      menuBody.className = 'chat-message-menu';

      function appendMenuItem(label, action, danger) {
        const button = document.createElement('button');
        button.className = 'chat-message-menu-item' + (danger ? ' is-danger' : '');
        button.type = 'button';
        button.textContent = label;
        button.dataset.chatAction = action;
        button.dataset.messageId = message.id;
        button.dataset.username = message.authorUsername || '';
        button.dataset.userId = message.authorId || '';
        menuBody.appendChild(button);
      }

      if (message.authorId && message.authorId !== authId) {
        appendMenuItem('Add Friend', 'friend-request', false);
        appendMenuItem('Direct Message', 'open-dm', false);
        appendMenuItem('Report', 'report-message', false);
        appendMenuItem('Block User', 'block-user', true);
      }

      if (ownerMode) {
        appendMenuItem('Delete Message', 'admin-delete-message', true);
        if (message.authorId && message.authorId !== authId) {
          appendMenuItem('Delete All From User', 'admin-delete-user-messages', true);
          if (!isOwnerUsername(message.authorUsername)) {
            appendMenuItem('Timeout 30m', 'admin-timeout-user', false);
            appendMenuItem('Ban 3d', 'admin-ban-user', false);
            appendMenuItem('Delete Account', 'admin-delete-user', true);
          }
        }
      }

      if (menuBody.children.length) {
        menu.appendChild(menuBody);
        actions.appendChild(menu);
      }

      meta.appendChild(actions);

      const bubble = document.createElement('div');
      bubble.className = 'chat-message-bubble';

      const imageUrl = getChatMessageImageUrl(message);
      if (imageUrl) {
        const imageLink = document.createElement('a');
        imageLink.className = 'chat-message-image-link';
        imageLink.href = imageUrl;
        imageLink.target = '_blank';
        imageLink.rel = 'noopener noreferrer';

        const image = document.createElement('img');
        image.className = 'chat-message-image';
        image.src = imageUrl;
        image.alt = 'Shared image';
        image.loading = 'lazy';

        imageLink.appendChild(image);
        bubble.appendChild(imageLink);
      }

      if (message.body) {
        const body = document.createElement('div');
        body.className = 'chat-message-body';
        body.textContent = message.body || '';
        bubble.appendChild(body);
      }

      content.appendChild(meta);
      content.appendChild(bubble);
      row.appendChild(avatarHolder);
      row.appendChild(content);
      elements.chatMessageList.appendChild(row);
    });

    if (!elements.chatMessageList._userScrolledUp) {
      elements.chatMessageList.scrollTop = elements.chatMessageList.scrollHeight;
    }
  }

  function renderAdminReports() {
    const elements = getElements();
    if (!elements.adminReportsList) {
      return;
    }

    elements.adminReportsList.innerHTML = '';
    const filterValue = elements.adminReportsFilter ? (elements.adminReportsFilter.value || 'open') : 'open';
    const filteredReports = state.adminReports
      .slice()
      .sort(function (left, right) {
        const leftStatus = normalizeAdminReportStatus(left.status);
        const rightStatus = normalizeAdminReportStatus(right.status);
        if (leftStatus !== rightStatus) {
          return leftStatus === 'open' ? -1 : 1;
        }
        return new Date(right.updated || right.created || 0).getTime() - new Date(left.updated || left.created || 0).getTime();
      })
      .filter(function (report) {
        if (filterValue === 'all') {
          return true;
        }
        return normalizeAdminReportStatus(report.status) === filterValue;
      });

    if (!filteredReports.length) {
      const empty = document.createElement('div');
      empty.className = 'chat-empty-state';
      empty.textContent = filterValue === 'closed'
        ? 'No closed reports.'
        : (filterValue === 'all' ? 'No reports yet.' : 'No open reports.');
      elements.adminReportsList.appendChild(empty);
      return;
    }

    filteredReports.forEach(function (report) {
      const card = document.createElement('div');
      card.className = 'admin-report-card';

      const status = normalizeAdminReportStatus(report.status);
      const controlsDisabled = status !== 'open' ? ' disabled' : '';
      const statusLabel = status === 'open' ? 'Open' : 'Closed';
      const actionLine = report.actionNote
        ? '<div class="admin-report-copy">Action: ' + escapeHtml(report.actionNote) + '</div>'
        : '';

      card.innerHTML = '' +
        '<div class="admin-report-head">' +
          '<div>' +
            '<div class="admin-report-title-line">' +
              '<div class="admin-report-title">' + escapeHtml(report.reportedUsername) + ' · ' + escapeHtml((report.roomType || '').toUpperCase()) + '</div>' +
              '<div class="admin-report-tag ' + (status === 'open' ? 'is-open' : 'is-closed') + '">' + statusLabel + '</div>' +
            '</div>' +
            '<div class="admin-report-meta">Reporter: ' + escapeHtml(report.reporterUsername) + ' · Room: ' + escapeHtml(report.roomName) + ' · ' + formatAbsoluteTime(report.created) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-report-snapshot">' + escapeHtml(report.messageSnapshot) + '</div>' +
        '<div class="admin-report-copy">Reason: ' + escapeHtml(report.reason) + '</div>' +
        '<div class="admin-report-controls">' +
          '<select class="text-input" data-report-select="' + report.id + '"' + controlsDisabled + '>' +
            '<option value="timeout">Timeout</option>' +
            '<option value="ban">Ban</option>' +
            '<option value="delete_account">Delete Account</option>' +
          '</select>' +
          '<input class="text-input" data-report-duration="' + report.id + '" min="1" placeholder="30" type="number"' + controlsDisabled + '>' +
          '<select class="text-input" data-report-unit="' + report.id + '"' + controlsDisabled + '>' +
            '<option value="minutes">Minutes</option>' +
            '<option value="hours">Hours</option>' +
            '<option value="days">Days</option>' +
          '</select>' +
        '</div>' +
        '<div class="admin-report-actions">' +
          '<button class="community-btn community-btn-primary" data-report-action="apply" data-report-id="' + report.id + '"' + controlsDisabled + ' type="button">Apply</button>' +
          '<button class="community-btn community-btn-secondary" data-report-action="dismiss" data-report-id="' + report.id + '"' + controlsDisabled + ' type="button">Dismiss</button>' +
        '</div>' +
        actionLine;

      elements.adminReportsList.appendChild(card);
    });
  }

  function renderAvatarPreview() {
    const elements = getElements();
    const session = state.session;
    const username = session && session.user ? session.user.username : '';
    const avatarUrl = session && session.user ? buildUserAvatarUrl(session.user) : '';

    if (!elements.accountAvatarPreview || !elements.accountAvatarImage || !elements.accountAvatarFallback) {
      return;
    }

    setAvatarImageSource(
      elements.accountAvatarPreview,
      elements.accountAvatarFallback,
      elements.accountAvatarImage,
      username || 'User',
      avatarUrl
    );
  }

  function normalizeAdminReportStatus(status) {
    return status === 'pending' ? 'open' : 'closed';
  }

  function renderAuthState() {
    const elements = getElements();
    const authenticated = isAuthenticated();
    const session = state.session;
    const ownerMode = isOwner();
    const moderation = getModerationSnapshot();
    const usernameChangeAvailableAt = session && session.account ? session.account.usernameChangeAvailableAt : null;

    setElementVisibility(elements.accountAuthCard, !authenticated);
    setElementVisibility(elements.accountProfileCard, authenticated);
    setElementVisibility(elements.accountStatusCard, authenticated && !ownerMode);
    setElementVisibility(elements.accountUsernameCard, authenticated && !ownerMode && canUseAccountActions());
    setElementVisibility(elements.accountPasswordCard, authenticated && !ownerMode && canUseAccountActions());
    setElementVisibility(elements.accountDangerCard, authenticated);

    setElementVisibility(elements.adminTab, authenticated && ownerMode);
    if (elements.adminTab) {
      elements.adminTab.style.display = authenticated && ownerMode ? '' : 'none';
    }
    [
      elements.adminOwnerCard,
      elements.adminUserCard,
      elements.adminTrollCard,
      elements.adminReportsCard
    ].forEach(function (card) {
      setElementVisibility(card, authenticated && ownerMode);
    });

    if (!ownerMode && elements.adminSection && elements.adminSection.style.display !== 'none' && window.switchTab) {
      window.switchTab(authenticated ? 'account' : 'lessons');
    }

    if (elements.accountProfileUsername) {
      elements.accountProfileUsername.textContent = authenticated && session && session.user
        ? session.user.username
        : 'guest';
    }

    if (elements.accountProfileCreated) {
      const createdAt = session && session.user ? session.user.created : '';
      elements.accountProfileCreated.textContent = createdAt ? 'Joined ' + formatAbsoluteTime(createdAt) : 'New account';
    }

    if (elements.accountWarningsCount) {
      elements.accountWarningsCount.textContent = String(moderation.warnings || 0);
    }

    if (elements.accountUsernameChangeTime) {
      elements.accountUsernameChangeTime.textContent = usernameChangeAvailableAt && new Date(usernameChangeAvailableAt).getTime() > nowMs()
        ? formatDurationUntil(usernameChangeAvailableAt)
        : 'Now';
    }

    if (elements.accountModerationDetail) {
      if (!authenticated) {
        elements.accountModerationDetail.textContent = 'Create an account to unlock chat and track your moderation status.';
      } else if (moderation.isBanned) {
        elements.accountModerationDetail.textContent = 'Account banned. Chat unlocks in ' + formatDurationUntil(moderation.banUntil) + '.';
      } else if (moderation.muteUntil && new Date(moderation.muteUntil).getTime() > nowMs()) {
        elements.accountModerationDetail.textContent = 'Timeout active for ' + formatDurationUntil(moderation.muteUntil) + '.';
      } else if (moderation.warnings > 0) {
        elements.accountModerationDetail.textContent = moderation.warnings + ' warning' + (moderation.warnings === 1 ? '' : 's') + ' active. They clear after 24 hours.';
      } else {
        elements.accountModerationDetail.textContent = 'No active penalties on your account.';
      }
    }

    if (elements.accountUsernameDescription) {
      elements.accountUsernameDescription.textContent = moderation.isBanned
        ? 'Banned accounts cannot change usernames.'
        : 'Usernames are unique and can only be changed once every 7 days.';
    }

    if (elements.accountUsernameInput) {
      elements.accountUsernameInput.disabled = !authenticated || ownerMode || !canUseAccountActions();
    }

    if (elements.avatarUploadButton) {
      elements.avatarUploadButton.disabled = !authenticated || !canUseAccountActions();
    }

    if (elements.accountDeleteButton) {
      elements.accountDeleteButton.disabled = !authenticated || ownerMode || !canUseAccountActions();
    }

    if (elements.accountLogoutButton) {
      elements.accountLogoutButton.disabled = !authenticated || moderation.isBanned;
    }

    renderAvatarPreview();

    const chatLocked = !authenticated;
    if (elements.chatAppShell) {
      elements.chatAppShell.classList.toggle('is-locked', chatLocked);
    }

    if (elements.videoAuthLock) {
      elements.videoAuthLock.style.display = authenticated ? 'none' : '';
    }
    if (elements.videoApp) {
      elements.videoApp.hidden = !authenticated;
    }
  }

  async function refreshSession() {
    if (!pb || !pb.authStore || !pb.authStore.isValid) {
      state.session = null;
      renderAuthState();
      return null;
    }

    try {
      const session = await api('/api/chat/session', 'GET');
      state.session = session;
      if (session && session.user) {
        pb.authStore.save(pb.authStore.token, Object.assign({}, pb.authStore.model || {}, session.user));
      }
      renderAuthState();
      if (isOwner()) {
        loadAdminReports();
      } else {
        state.adminReports = [];
        renderAdminReports();
      }
      return session;
    } catch (error) {
      var status = error && error.status ? error.status : 0;
      if (status === 401 || status === 403) {
        pb.authStore.clear();
        state.session = null;
        state.bootstrap = null;
        state.activeRoom = null;
        state.activeRoomId = '';
        state.transientDmRoom = null;
        state.adminReports = [];
        renderAuthState();
        renderConversationList();
        renderFriendRequests();
        renderRoomChrome();
        renderMessages();
        renderAdminReports();
      }
      return null;
    }
  }

  async function fetchSiteState() {
    if (!pb) {
      return;
    }

    try {
      applySiteState(await api('/api/site/state', 'GET'));
    } catch (error) {
    }
  }

  async function loadBootstrap() {
    if (!pb || !isAuthenticated()) {
      state.bootstrap = null;
      renderConversationList();
      renderFriendRequests();
      renderRoomChrome();
      renderMessages();
      return null;
    }

    try {
      state.bootstrap = await api('/api/chat/bootstrap', 'GET');
      consumeMentionNotifications(state.bootstrap && state.bootstrap.mentionNotifications);
      if (state.activeRoom && state.activeRoom.room) {
        syncRoomSummaryFromState(state.activeRoom);
      }
      ensureActiveRoomFromBootstrap();
      renderSidebarMeta();
      renderConversationList();
      renderFriendRequests();
      renderAuthState();
      return state.bootstrap;
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to load chat right now.'), 'danger');
      return null;
    }
  }

  async function loadActiveRoom() {
    if (!pb || !isAuthenticated() || !state.activeRoomId) {
      state.activeRoom = null;
      renderRoomChrome();
      renderMessages();
      return null;
    }

    try {
      const roomResponse = await api('/api/chat/room', 'POST', { roomId: state.activeRoomId });
      const summary = findRoomSummaryById(state.activeRoomId) || roomResponse.room;
      const room = Object.assign({}, summary || {}, roomResponse.room || {});

      if (room.type === 'dm') {
        const peer = (roomResponse.members || []).filter(function (member) {
          return !state.session || !state.session.user || member.id !== state.session.user.id;
        })[0] || (summary ? summary.peer : null);
        room.peer = peer || null;
        state.transientDmRoom = room.lastMessageAt ? null : room;
      }

      state.activeRoom = {
        room: room,
        messages: Array.isArray(roomResponse.messages) ? roomResponse.messages : [],
        members: Array.isArray(roomResponse.members) ? roomResponse.members : [],
        pinnedMessage: roomResponse.pinnedMessage || ''
      };

      syncRoomSummaryFromState(state.activeRoom);

      renderRoomChrome();
      renderMessages();
      renderConversationList();
      return state.activeRoom;
    } catch (error) {
      state.activeRoom = null;
      if (state.activeView === 'groups') {
        const data = getBootstrapData();
        state.activeRoomId = data.globalRoom ? data.globalRoom.id : '';
      } else {
        state.activeRoomId = '';
      }
      renderRoomChrome();
      renderMessages();
      renderConversationList();
      return null;
    }
  }

  function scheduleBootstrapPoll() {
    if (state.bootstrapPollHandle) {
      clearInterval(state.bootstrapPollHandle);
    }

    state.bootstrapPollHandle = window.setInterval(function () {
      if (isAuthenticated()) {
        loadBootstrap();
      }
    }, 5000);
  }

  function scheduleRoomPoll() {
    if (state.roomPollHandle) {
      clearInterval(state.roomPollHandle);
    }

    state.roomPollHandle = window.setInterval(function () {
      if (isAuthenticated() && state.activeRoomId) {
        loadActiveRoom();
      }
    }, 2000);
  }

  function scheduleSessionPoll() {
    if (state.sessionPollHandle) {
      clearInterval(state.sessionPollHandle);
    }

    state.sessionPollHandle = window.setInterval(function () {
      if (isAuthenticated()) {
        refreshSession();
      }
    }, 60000);
  }

  function scheduleSiteStatePoll() {
    if (state.siteStateHandle) {
      clearInterval(state.siteStateHandle);
    }

    state.siteStateHandle = window.setInterval(fetchSiteState, 1000);
  }

  function scheduleAdminReportsPoll() {
    if (state.adminReportsHandle) {
      clearInterval(state.adminReportsHandle);
    }

    state.adminReportsHandle = window.setInterval(function () {
      if (isOwner()) {
        loadAdminReports();
      }
    }, 8000);
  }

  async function loadAdminReports() {
    if (!pb || !isOwner()) {
      state.adminReports = [];
      renderAdminReports();
      return;
    }

    try {
      const response = await api('/api/admin/reports', 'GET');
      state.adminReports = Array.isArray(response.reports) ? response.reports : [];
      renderAdminReports();
    } catch (error) {
      state.adminReports = [];
      renderAdminReports();
    }
  }

  async function openDmWithUsername(username) {
    try {
      clearMentionSuggestions();
      clearPendingReply(false);
      clearPendingChatImage();
      const response = await api('/api/chat/open-dm', 'POST', {
        username: username
      });
      state.openMessageMenuId = '';
      state.activeView = 'dms';
      if (response && response.room) {
        state.transientDmRoom = response.room;
        state.activeRoomId = response.room.id;
      }
      syncChatModeTabs('dms');
      renderSidebarMeta();
      renderConversationList();
      renderFriendRequests();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to open that DM.'), 'warning');
    }
  }

  function setActiveView(view) {
    if (state.activeView === view) {
      return;
    }

    clearMentionSuggestions();
    clearPendingReply(false);
    clearPendingChatImage();
    state.openMessageMenuId = '';
    state.activeView = view;

    if (view === 'groups') {
      const data = getBootstrapData();
      state.activeRoomId = data.globalRoom ? data.globalRoom.id : '';
      loadActiveRoom();
    } else if (view === 'friends') {
      state.activeRoomId = '';
      state.activeRoom = null;
      renderRoomChrome();
      renderMessages();
    } else if (view === 'dms') {
      const data = getBootstrapData();
      if (!state.activeRoomId && data.dmRooms && data.dmRooms.length) {
        state.activeRoomId = data.dmRooms[0].id;
        loadActiveRoom();
      } else if (state.activeRoomId) {
        loadActiveRoom();
      }
    }

    renderSidebarMeta();
    renderConversationList();
    renderFriendRequests();

    syncChatModeTabs(view);
  }

  async function runAdminAction(action, payload, successMessage, confirmMessage) {
    const elements = getElements();

    if (!isOwner()) {
      setFeedback(elements.adminFeedback, 'error', 'Owner access required.');
      return null;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return null;
    }

    try {
      const response = await api('/api/admin/action', 'POST', Object.assign({}, payload || {}, { action: action }));
      setFeedback(elements.adminFeedback, 'success', successMessage || response.message || 'Done.');
      return response;
    } catch (error) {
      setFeedback(elements.adminFeedback, 'error', extractErrorMessage(error, 'Admin action failed.'));
      return null;
    }
  }

  function parseCommaSeparatedUsernames(value) {
    const seen = {};
    return String(value || '')
      .split(',')
      .map(function (entry) {
        return normalizeUsernameValue(entry);
      })
      .filter(function (entry) {
        if (!entry || seen[entry]) {
          return false;
        }
        seen[entry] = true;
        return true;
      });
  }

  function openModal(element) {
    if (!element) {
      return;
    }
    element.hidden = false;
    element.classList.add('visible');
  }

  function closeModal(element) {
    if (!element) {
      return;
    }
    element.classList.remove('visible');
    element.hidden = true;
  }

  function openGroupCreateModal() {
    const elements = getElements();
    if (elements.chatGroupForm) {
      elements.chatGroupForm.reset();
    }
    state.pendingGroupAvatarFile = null;
    if (elements.chatGroupAvatarName) {
      elements.chatGroupAvatarName.textContent = 'No image selected';
    }
    openModal(elements.chatGroupModal);
  }

  function openGroupManageModal(room) {
    const elements = getElements();
    state.manageGroupRoomId = room.id;
    state.pendingManageGroupAvatarFile = null;

    if (elements.chatManageGroupNameInput) {
      elements.chatManageGroupNameInput.value = room.name || '';
    }
    if (elements.chatManageGroupUsersInput) {
      elements.chatManageGroupUsersInput.value = '';
    }
    if (elements.chatManageGroupAvatarName) {
      elements.chatManageGroupAvatarName.textContent = 'No image selected';
    }
    openModal(elements.chatGroupManageModal);
  }

  function openReportModal(message) {
    const elements = getElements();
    state.pendingReportMessage = message;
    if (elements.chatReportReasonInput) {
      elements.chatReportReasonInput.value = '';
    }
    if (elements.chatReportPreview) {
      elements.chatReportPreview.textContent = message.authorUsername + ': ' + (getMessagePreviewText(message) || '[Message unavailable]');
    }
    openModal(elements.chatReportModal);
  }

  async function handleSignup(event) {
    event.preventDefault();
    const elements = getElements();
    const username = normalizeUsernameValue(elements.signupUsername ? elements.signupUsername.value : '');
    const password = elements.signupPassword ? elements.signupPassword.value : '';
    const passwordConfirm = elements.signupPasswordConfirm ? elements.signupPasswordConfirm.value : '';

    if (elements.signupUsername) {
      elements.signupUsername.value = username;
    }

    try {
      const response = await api('/api/chat/signup', 'POST', {
        username: username,
        password: password,
        passwordConfirm: passwordConfirm
      });
      pb.authStore.save(response.token, response.record);
      await refreshSession();
      await loadBootstrap();
      await loadActiveRoom();
      setFeedback(elements.accountAuthFeedback, 'success', 'Account created.');
      if (window.switchTab) {
        window.switchTab('chat');
      }
    } catch (error) {
      setFeedback(elements.accountAuthFeedback, 'error', extractErrorMessage(error, 'Unable to create the account.'));
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const elements = getElements();
    const username = normalizeUsernameValue(elements.loginUsername ? elements.loginUsername.value : '');
    const password = elements.loginPassword ? elements.loginPassword.value : '';

    if (elements.loginUsername) {
      elements.loginUsername.value = username;
    }

    try {
      const response = await api('/api/chat/login', 'POST', {
        username: username,
        password: password
      });
      pb.authStore.save(response.token, response.record);
      await refreshSession();
      await loadBootstrap();
      await loadActiveRoom();
      setFeedback(elements.accountAuthFeedback, 'success', 'Logged in.');
      if (window.switchTab) {
        window.switchTab('chat');
      }
    } catch (error) {
      setFeedback(elements.accountAuthFeedback, 'error', extractErrorMessage(error, 'Unable to log in.'));
    }
  }

  async function handleChangeUsername(event) {
    event.preventDefault();
    const elements = getElements();
    const username = normalizeUsernameValue(elements.accountUsernameInput ? elements.accountUsernameInput.value : '');
    if (elements.accountUsernameInput) {
      elements.accountUsernameInput.value = username;
    }

    try {
      await api('/api/chat/change-username', 'POST', { username: username });
      await refreshSession();
      await loadBootstrap();
      if (state.activeRoomId) {
        await loadActiveRoom();
      }
      setFeedback(elements.accountUsernameFeedback, 'success', 'Username updated.');
    } catch (error) {
      setFeedback(elements.accountUsernameFeedback, 'error', extractErrorMessage(error, 'Unable to update the username.'));
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    const elements = getElements();

    try {
      const response = await api('/api/chat/change-password', 'POST', {
        currentPassword: elements.accountCurrentPassword ? elements.accountCurrentPassword.value : '',
        newPassword: elements.accountNewPassword ? elements.accountNewPassword.value : '',
        newPasswordConfirm: elements.accountNewPasswordConfirm ? elements.accountNewPasswordConfirm.value : ''
      });
      pb.authStore.save(response.token, response.record);
      if (elements.accountPasswordForm) {
        elements.accountPasswordForm.reset();
      }
      setFeedback(elements.accountPasswordFeedback, 'success', 'Password updated.');
    } catch (error) {
      setFeedback(elements.accountPasswordFeedback, 'error', extractErrorMessage(error, 'Unable to change the password.'));
    }
  }

  async function handleDeleteAccount() {
    const elements = getElements();
    if (!window.confirm('Delete this account? DMs with friends will be removed and your messages will become DELETED USER.')) {
      return;
    }

    try {
      await api('/api/chat/delete-account', 'POST', {});
      pb.authStore.clear();
      state.session = null;
      state.bootstrap = null;
      state.activeRoom = null;
      state.activeRoomId = '';
      state.transientDmRoom = null;
      renderAuthState();
      renderConversationList();
      renderFriendRequests();
      renderRoomChrome();
      renderMessages();
      setFeedback(elements.accountDangerFeedback, 'success', 'Account deleted.');
    } catch (error) {
      setFeedback(elements.accountDangerFeedback, 'error', extractErrorMessage(error, 'Unable to delete the account.'));
    }
  }

  function handleLogout() {
    pb.authStore.clear();
    state.session = null;
    state.bootstrap = null;
    state.activeRoom = null;
    state.activeRoomId = '';
    state.transientDmRoom = null;
    state.adminReports = [];
    clearMentionSuggestions();
    clearPendingReply(false);
    clearPendingChatImage();
    clearFeedbacks();
    renderAuthState();
    renderConversationList();
    renderFriendRequests();
    renderRoomChrome();
    renderMessages();
    renderAdminReports();
    if (window.switchTab) {
      window.switchTab('account');
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    const elements = getElements();
    const message = collapseWhitespace(elements.chatMessageInput ? elements.chatMessageInput.value : '');
    const imageFile = state.pendingChatImageFile;

    if ((!message && !imageFile) || !state.activeRoomId) {
      return;
    }

    if (elements.chatSendButton) {
      elements.chatSendButton.disabled = true;
    }
    if (elements.chatImageButton) {
      elements.chatImageButton.disabled = true;
    }

    try {
      let response = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append('roomId', state.activeRoomId);
        formData.append('message', message);
        if (state.pendingReply && state.pendingReply.messageId) {
          formData.append('replyToMessageId', state.pendingReply.messageId);
        }
        formData.append('image', imageFile, imageFile.name);
        response = await api('/api/chat/room/send', 'POST', formData);
      } else {
        response = await api('/api/chat/room/send', 'POST', {
          roomId: state.activeRoomId,
          message: message,
          replyToMessageId: state.pendingReply && state.pendingReply.messageId ? state.pendingReply.messageId : ''
        });
      }

      if (elements.chatMessageInput) {
        elements.chatMessageInput.value = '';
      }
      clearMentionSuggestions();
      clearPendingReply(false);
      clearPendingChatImage();

      if (
        response &&
        response.record &&
        state.activeRoom &&
        state.activeRoom.room &&
        state.activeRoom.room.id === response.record.roomId
      ) {
        const alreadyPresent = Array.isArray(state.activeRoom.messages) && state.activeRoom.messages.some(function (entry) {
          return entry.id === response.record.id;
        });

        if (!alreadyPresent) {
          state.activeRoom.messages = (state.activeRoom.messages || []).concat([response.record]);
        }

        syncRoomSummaryFromState(state.activeRoom);
        renderRoomChrome();
        renderMessages();
        renderConversationList();
      }

      await refreshSession();
      await loadBootstrap();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to send the message.'), 'warning');
    } finally {
      if (elements.chatSendButton) {
        elements.chatSendButton.disabled = false;
      }
      if (elements.chatImageButton) {
        elements.chatImageButton.disabled = false;
      }
    }
  }

  async function handleAddFriendRequest(event) {
    event.preventDefault();
    const elements = getElements();
    const username = normalizeUsernameValue(elements.chatAddFriendInput ? elements.chatAddFriendInput.value : '');

    if (elements.chatAddFriendInput) {
      elements.chatAddFriendInput.value = username;
    }

    try {
      await api('/api/chat/friend-request', 'POST', { username: username });
      if (elements.chatAddFriendInput) {
        elements.chatAddFriendInput.value = '';
      }
      await loadBootstrap();
      setChatStatus('Friend request sent.', 'warning');
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to send that request.'), 'warning');
    }
  }

  async function submitGroupCreate(event) {
    event.preventDefault();
    const elements = getElements();

    try {
      const response = await api('/api/chat/group/create', 'POST', {
        name: elements.chatGroupNameInput ? elements.chatGroupNameInput.value : '',
        usernames: parseCommaSeparatedUsernames(elements.chatGroupUsersInput ? elements.chatGroupUsersInput.value : '')
      });

      if (response && response.room && state.pendingGroupAvatarFile) {
        const formData = new FormData();
        formData.append('roomId', response.room.id);
        formData.append('avatar', state.pendingGroupAvatarFile, state.pendingGroupAvatarFile.name || 'group-avatar.png');
        await api('/api/chat/group/avatar', 'POST', formData);
      }

      closeModal(elements.chatGroupModal);
      await loadBootstrap();
      state.activeView = 'groups';
      state.activeRoomId = response && response.room ? response.room.id : '';
      renderSidebarMeta();
      renderConversationList();
      renderFriendRequests();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to create that group.'), 'warning');
    }
  }

  async function submitGroupManage(event) {
    event.preventDefault();
    const elements = getElements();

    try {
      const roomId = state.manageGroupRoomId;

      if (elements.chatManageGroupNameInput && collapseWhitespace(elements.chatManageGroupNameInput.value)) {
        await api('/api/chat/group/update', 'POST', {
          roomId: roomId,
          name: elements.chatManageGroupNameInput.value
        });
      }

      const usernames = parseCommaSeparatedUsernames(elements.chatManageGroupUsersInput ? elements.chatManageGroupUsersInput.value : '');
      if (usernames.length) {
        await api('/api/chat/group/add-members', 'POST', {
          roomId: roomId,
          usernames: usernames
        });
      }

      if (state.pendingManageGroupAvatarFile) {
        const formData = new FormData();
        formData.append('roomId', roomId);
        formData.append('avatar', state.pendingManageGroupAvatarFile, state.pendingManageGroupAvatarFile.name || 'group-avatar.png');
        await api('/api/chat/group/avatar', 'POST', formData);
      }

      closeModal(elements.chatGroupManageModal);
      await loadBootstrap();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to update that group.'), 'warning');
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    const elements = getElements();
    if (!state.pendingReportMessage) {
      return;
    }

    try {
      await api('/api/chat/report', 'POST', {
        messageId: state.pendingReportMessage.id,
        reason: elements.chatReportReasonInput ? elements.chatReportReasonInput.value : ''
      });
      closeModal(elements.chatReportModal);
      state.pendingReportMessage = null;
      setChatStatus('Report submitted.', 'warning');
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to submit that report.'), 'warning');
    }
  }

  async function handleRequestAction(requestId, decision) {
    try {
      await api('/api/chat/friend-request/respond', 'POST', {
        requestId: requestId,
        decision: decision
      });
      await loadBootstrap();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to update that request.'), 'warning');
    }
  }

  async function handleChatAction(action, dataset) {
    if (!action) {
      return;
    }

    if (action === 'friend-request') {
      try {
        await api('/api/chat/friend-request', 'POST', { username: dataset.username });
        await loadBootstrap();
        setChatStatus('Friend request sent.', 'warning');
      } catch (error) {
        setChatStatus(extractErrorMessage(error, 'Unable to send that request.'), 'warning');
      }
      return;
    }

    if (action === 'open-dm') {
      openDmWithUsername(dataset.username);
      return;
    }

    if (action === 'reply-message') {
      const messages = state.activeRoom && Array.isArray(state.activeRoom.messages) ? state.activeRoom.messages : [];
      const message = messages.find(function (entry) {
        return entry.id === dataset.messageId;
      });
      if (message) {
        setPendingReply(message);
      }
      return;
    }

    if (action === 'report-message') {
      const messages = state.activeRoom && Array.isArray(state.activeRoom.messages) ? state.activeRoom.messages : [];
      const message = messages.find(function (entry) {
        return entry.id === dataset.messageId;
      });
      if (message) {
        openReportModal(message);
      }
      return;
    }

    if (action === 'block-user') {
      try {
        await api('/api/chat/block', 'POST', { username: dataset.username });
        await loadBootstrap();
        if (state.activeView === 'dms') {
          state.activeRoomId = '';
          state.activeRoom = null;
        }
        renderConversationList();
        renderFriendRequests();
        renderRoomChrome();
        renderMessages();
      } catch (error) {
        setChatStatus(extractErrorMessage(error, 'Unable to block that user.'), 'warning');
      }
      return;
    }

    if (action.indexOf('admin-') === 0) {
      const adminMap = {
        'admin-delete-message': 'delete_message',
        'admin-delete-user-messages': 'delete_user_messages',
        'admin-timeout-user': 'timeout_user',
        'admin-ban-user': 'ban_user',
        'admin-delete-user': 'delete_user'
      };
      const adminAction = adminMap[action];
      const payload = {
        messageId: dataset.messageId || '',
        userId: dataset.userId || '',
        username: dataset.username || ''
      };

      if (adminAction === 'timeout_user') {
        payload.minutes = '30';
      }

      if (adminAction === 'ban_user') {
        payload.days = '3';
      }

      const confirmMessage = adminAction === 'delete_user'
        ? 'Delete this account? Their messages will become DELETED USER.'
        : adminAction === 'delete_user_messages'
          ? 'Delete every message from this user?'
          : '';

      const response = await runAdminAction(adminAction, payload, 'Action applied.', confirmMessage);
      if (response) {
        await loadBootstrap();
        await loadActiveRoom();
      }
    }
  }

  async function handleRoomAction(action, roomId) {
    if (!action || !roomId) {
      return;
    }

    try {
      if (action === 'manage-group') {
        const room = findRoomSummaryById(roomId);
        if (room) {
          openGroupManageModal(room);
        }
        return;
      }

      if (action === 'delete-group') {
        if (!window.confirm('Delete this group chat for everyone?')) {
          return;
        }
        await api('/api/chat/group/delete', 'POST', { roomId: roomId });
        state.activeRoomId = getBootstrapData().globalRoom ? getBootstrapData().globalRoom.id : '';
      }

      if (action === 'leave-group') {
        if (!window.confirm('Leave this group chat?')) {
          return;
        }
        await api('/api/chat/group/leave', 'POST', { roomId: roomId });
        state.activeRoomId = getBootstrapData().globalRoom ? getBootstrapData().globalRoom.id : '';
      }

      await loadBootstrap();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to update that group.'), 'warning');
    }
  }

  async function handleUnblock(username) {
    try {
      await api('/api/chat/unblock', 'POST', { username: username });
      await loadBootstrap();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to unblock that user.'), 'warning');
    }
  }

  async function handleFriendClick(username) {
    await openDmWithUsername(username);
  }

  async function handleConversationClick(roomId) {
    clearMentionSuggestions();
    clearPendingReply(false);
    clearPendingChatImage();
    state.openMessageMenuId = '';
    state.activeRoomId = roomId;
    await loadActiveRoom();
    renderConversationList();
  }

  async function handleAdminReportAction(reportId, action) {
    const elements = getElements();
    const select = elements.adminReportsList ? elements.adminReportsList.querySelector('[data-report-select="' + reportId + '"]') : null;
    const duration = elements.adminReportsList ? elements.adminReportsList.querySelector('[data-report-duration="' + reportId + '"]') : null;
    const unit = elements.adminReportsList ? elements.adminReportsList.querySelector('[data-report-unit="' + reportId + '"]') : null;

    try {
      await api('/api/admin/report-action', 'POST', {
        reportId: reportId,
        action: action === 'dismiss' ? 'dismiss' : (select ? select.value : 'timeout'),
        durationValue: duration ? duration.value : '',
        durationUnit: unit ? unit.value : ''
      });
      await loadAdminReports();
      await refreshSession();
      await loadBootstrap();
      if (state.activeRoomId) {
        await loadActiveRoom();
      }
      setFeedback(elements.adminFeedback, 'success', 'Report action applied.');
    } catch (error) {
      setFeedback(elements.adminFeedback, 'error', extractErrorMessage(error, 'Unable to update that report.'));
    }
  }

  function closeAllMenusOnOutsideClick() {
  }

  function bindChatListEvents() {
    const elements = getElements();

    if (elements.chatModeTabs) {
      elements.chatModeTabs.addEventListener('click', function (event) {
        const button = event.target.closest('[data-chat-view]');
        if (!button) {
          return;
        }
        setActiveView(button.dataset.chatView || 'groups');
      });
    }

    if (elements.siteMentionToast) {
      elements.siteMentionToast.style.cursor = 'pointer';
      elements.siteMentionToast.addEventListener('click', function () {
        hideMentionToast(true);
        var roomId = state.mentionToastRoomId;
        var roomType = state.mentionToastRoomType;
        if (typeof switchTab === 'function') {
          switchTab('chat');
        }
        if (roomId) {
          if (roomType === 'dm') {
            state.activeView = 'dms';
          } else {
            state.activeView = 'groups';
          }
          state.activeRoomId = roomId;
          syncChatModeTabs(state.activeView);
          renderSidebarMeta();
          renderConversationList();
          renderFriendRequests();
          loadActiveRoom();
        }
      });
    }

    if (elements.chatSidebarPrimaryButton) {
      elements.chatSidebarPrimaryButton.addEventListener('click', openGroupCreateModal);
    }

    if (elements.chatConversationList) {
      elements.chatConversationList.addEventListener('click', function (event) {
        const friend = event.target.closest('[data-kind="friend"]');
        if (friend && friend.dataset.username) {
          handleFriendClick(friend.dataset.username);
          return;
        }

        const room = event.target.closest('[data-kind="room"]');
        if (room && room.dataset.id) {
          handleConversationClick(room.dataset.id);
        }
      });
    }

    if (elements.chatIncomingRequestsList) {
      elements.chatIncomingRequestsList.addEventListener('click', function (event) {
        const button = event.target.closest('[data-request-action]');
        if (!button) {
          return;
        }
        handleRequestAction(button.dataset.requestId || '', button.dataset.requestAction || '');
      });
    }

    if (elements.chatBlockedList) {
      elements.chatBlockedList.addEventListener('click', function (event) {
        const button = event.target.closest('[data-block-action="unblock"]');
        if (!button) {
          return;
        }
        handleUnblock(button.dataset.username || '');
      });
    }

    if (elements.chatMessageList) {
      elements.chatMessageList.addEventListener('click', function (event) {
        const toggle = event.target.closest('[data-chat-menu-toggle]');
        if (toggle) {
          const messageId = toggle.dataset.chatMenuToggle || '';
          state.openMessageMenuId = state.openMessageMenuId === messageId ? '' : messageId;
          renderMessages();
          return;
        }

        const button = event.target.closest('[data-chat-action]');
        if (!button) {
          return;
        }
        state.openMessageMenuId = '';
        handleChatAction(button.dataset.chatAction || '', button.dataset);
      });
      elements.chatMessageList.addEventListener('scroll', function () {
        const el = elements.chatMessageList;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        el._userScrolledUp = distanceFromBottom > 48;
      });
    }

    if (elements.chatRoomActions) {
      elements.chatRoomActions.addEventListener('click', function (event) {
        const button = event.target.closest('[data-room-action]');
        if (!button) {
          return;
        }
        handleRoomAction(button.dataset.roomAction || '', button.dataset.roomId || '');
      });
    }
  }

  function bindAccountEvents() {
    const elements = getElements();

    if (elements.accountSignupForm) {
      elements.accountSignupForm.addEventListener('submit', handleSignup);
    }

    if (elements.accountLoginForm) {
      elements.accountLoginForm.addEventListener('submit', handleLogin);
    }

    if (elements.accountUsernameForm) {
      elements.accountUsernameForm.addEventListener('submit', handleChangeUsername);
    }

    if (elements.accountPasswordForm) {
      elements.accountPasswordForm.addEventListener('submit', handleChangePassword);
    }

    if (elements.accountDeleteButton) {
      elements.accountDeleteButton.addEventListener('click', handleDeleteAccount);
    }

    if (elements.accountLogoutButton) {
      elements.accountLogoutButton.addEventListener('click', handleLogout);
    }

    if (elements.avatarUploadButton && elements.avatarUploadInput) {
      elements.avatarUploadButton.addEventListener('click', function () {
        elements.avatarUploadInput.click();
      });
    }

    if (elements.avatarUploadInput) {
      elements.avatarUploadInput.addEventListener('change', async function () {
        const file = elements.avatarUploadInput.files && elements.avatarUploadInput.files[0];
        if (!file) {
          return;
        }

        if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type || '')) {
          elements.avatarUploadInput.value = '';
          setFeedback(elements.accountAvatarFeedback, 'error', 'Use a PNG, JPG, WEBP, or GIF under 2 MB.');
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          elements.avatarUploadInput.value = '';
          setFeedback(elements.accountAvatarFeedback, 'error', 'Profile photos must be under 2 MB.');
          return;
        }

        if (/^image\/gif$/i.test(file.type || '')) {
          if (elements.avatarUploadButton) {
            elements.avatarUploadButton.disabled = true;
          }
          try {
            await uploadProfileAvatar(file, file.name || 'avatar.gif');
          } catch (error) {
            setFeedback(elements.accountAvatarFeedback, 'error', extractErrorMessage(error, 'Unable to upload that GIF.'));
          } finally {
            elements.avatarUploadInput.value = '';
            if (elements.avatarUploadButton) {
              elements.avatarUploadButton.disabled = !isAuthenticated() || !canUseAccountActions();
            }
          }
          return;
        }

        openCropperForFile(file, 'profile');
      });
    }
  }

  function bindAdminEvents() {
    const elements = getElements();

    if (elements.adminTargetUsernameInput) {
      elements.adminTargetUsernameInput.addEventListener('input', function () {
        elements.adminTargetUsernameInput.value = normalizeUsernameValue(elements.adminTargetUsernameInput.value);
      });
    }

    if (elements.adminRenameCurrentInput) {
      elements.adminRenameCurrentInput.addEventListener('input', function () {
        elements.adminRenameCurrentInput.value = normalizeUsernameValue(elements.adminRenameCurrentInput.value);
      });
    }

    if (elements.adminRenameNewInput) {
      elements.adminRenameNewInput.addEventListener('input', function () {
        elements.adminRenameNewInput.value = normalizeUsernameValue(elements.adminRenameNewInput.value);
      });
    }

    if (elements.adminBroadcastSetButton) {
      elements.adminBroadcastSetButton.addEventListener('click', function () {
        runAdminAction('set_broadcast', { message: elements.adminBroadcastInput ? elements.adminBroadcastInput.value : '' }, 'Broadcast updated.');
      });
    }

    if (elements.adminBroadcastClearButton) {
      elements.adminBroadcastClearButton.addEventListener('click', function () {
        runAdminAction('clear_broadcast', {}, 'Broadcast cleared.');
      });
    }

    if (elements.adminPinnedSetButton) {
      elements.adminPinnedSetButton.addEventListener('click', function () {
        runAdminAction('set_pinned_message', { message: elements.adminPinnedInput ? elements.adminPinnedInput.value : '' }, 'Pinned message updated.');
      });
    }

    if (elements.adminPinnedClearButton) {
      elements.adminPinnedClearButton.addEventListener('click', function () {
        runAdminAction('clear_pinned_message', {}, 'Pinned message cleared.');
      });
    }

    if (elements.adminWipeChatButton) {
      elements.adminWipeChatButton.addEventListener('click', function () {
        runAdminAction('wipe_chat', {}, 'Global chat wiped.', 'Wipe every active message from Global Chat?');
      });
    }

    if (elements.adminTimeoutUserButton) {
      elements.adminTimeoutUserButton.addEventListener('click', function () {
        const username = normalizeUsernameValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot moderate an owner account.'); return; }
        runAdminAction('timeout_user', { username: username, minutes: '30' }, 'User timed out.');
      });
    }

    if (elements.adminBanUserButton) {
      elements.adminBanUserButton.addEventListener('click', function () {
        const username = normalizeUsernameValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot moderate an owner account.'); return; }
        runAdminAction('ban_user', { username: username, days: '3' }, 'User banned.');
      });
    }

    if (elements.adminDeleteUserButton) {
      elements.adminDeleteUserButton.addEventListener('click', function () {
        const username = normalizeUsernameValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot delete an owner account.'); return; }
        runAdminAction('delete_user', { username: username }, 'User account deleted.', 'Delete this user account?');
      });
    }

    if (elements.adminRenameUserButton) {
      elements.adminRenameUserButton.addEventListener('click', function () {
        runAdminAction('rename_user', {
          currentUsername: elements.adminRenameCurrentInput ? elements.adminRenameCurrentInput.value : '',
          newUsername: elements.adminRenameNewInput ? elements.adminRenameNewInput.value : ''
        }, 'Username updated.');
      });
    }

    if (elements.adminChooseSoundButton && elements.adminSoundInput) {
      elements.adminChooseSoundButton.addEventListener('click', function () {
        elements.adminSoundInput.click();
      });
    }

    if (elements.adminChooseMediaButton && elements.adminMediaInput) {
      elements.adminChooseMediaButton.addEventListener('click', function () {
        elements.adminMediaInput.click();
      });
    }

    if (elements.adminSoundInput) {
      elements.adminSoundInput.addEventListener('change', async function () {
        const file = elements.adminSoundInput.files && elements.adminSoundInput.files[0];
        if (!file) {
          return;
        }
        const formData = new FormData();
        formData.append('sound', file, file.name);
        try {
          await api('/api/admin/upload-sound', 'POST', formData);
          if (elements.adminSoundName) {
            elements.adminSoundName.textContent = file.name;
          }
          setFeedback(elements.adminFeedback, 'success', 'Sound uploaded.');
        } catch (error) {
          setFeedback(elements.adminFeedback, 'error', extractErrorMessage(error, 'Unable to upload the sound.'));
        } finally {
          elements.adminSoundInput.value = '';
        }
      });
    }

    if (elements.adminMediaInput) {
      elements.adminMediaInput.addEventListener('change', async function () {
        const file = elements.adminMediaInput.files && elements.adminMediaInput.files[0];
        if (!file) {
          return;
        }
        const formData = new FormData();
        formData.append('media', file, file.name);
        try {
          await api('/api/admin/upload-media', 'POST', formData);
          if (elements.adminMediaName) {
            elements.adminMediaName.textContent = file.name;
          }
          setFeedback(elements.adminFeedback, 'success', 'Image broadcast uploaded.');
        } catch (error) {
          setFeedback(elements.adminFeedback, 'error', extractErrorMessage(error, 'Unable to upload the image.'));
        } finally {
          elements.adminMediaInput.value = '';
        }
      });
    }

    if (elements.adminPlaySoundButton) {
      elements.adminPlaySoundButton.addEventListener('click', function () {
        runAdminAction('play_sound', {}, 'Sound triggered.');
      });
    }

    if (elements.adminShowMediaButton) {
      elements.adminShowMediaButton.addEventListener('click', function () {
        runAdminAction('show_media', {}, 'Image broadcast triggered.');
      });
    }

    if (elements.adminFlashbangButton) {
      elements.adminFlashbangButton.addEventListener('click', function () {
        runAdminAction('trigger_flashbang', {}, 'Flashbang triggered.');
      });
    }

    if (elements.adminBustButton) {
      elements.adminBustButton.addEventListener('click', function () {
        runAdminAction('trigger_bust', {}, 'Bust effect triggered.');
      });
    }

    if (elements.adminRollButton) {
      elements.adminRollButton.addEventListener('click', function () {
        runAdminAction('trigger_roll', {}, 'Barrel roll triggered.');
      });
    }

    if (elements.adminNukeButton) {
      elements.adminNukeButton.addEventListener('click', function () {
        runAdminAction('trigger_nuke', {}, 'Nuke event triggered.');
      });
    }

    if (elements.adminReportsList) {
      elements.adminReportsList.addEventListener('click', function (event) {
        const button = event.target.closest('[data-report-action]');
        if (!button) {
          return;
        }
        handleAdminReportAction(button.dataset.reportId || '', button.dataset.reportAction || '');
      });
    }

    if (elements.adminReportsFilter) {
      elements.adminReportsFilter.addEventListener('change', function () {
        renderAdminReports();
      });
    }
  }

  function bindModalEvents() {
    const elements = getElements();

    if (elements.chatAddFriendForm) {
      elements.chatAddFriendForm.addEventListener('submit', handleAddFriendRequest);
    }

    if (elements.chatComposer) {
      elements.chatComposer.addEventListener('submit', handleSendMessage);
    }

    if (elements.chatMessageInput) {
      elements.chatMessageInput.addEventListener('input', function () {
        updateMentionSuggestions();
      });

      elements.chatMessageInput.addEventListener('keydown', function (event) {
        if (!state.mentionSuggestions.length) {
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          state.mentionSelectedIndex = (state.mentionSelectedIndex + 1) % state.mentionSuggestions.length;
          renderMentionSuggestions();
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          state.mentionSelectedIndex = (state.mentionSelectedIndex - 1 + state.mentionSuggestions.length) % state.mentionSuggestions.length;
          renderMentionSuggestions();
          return;
        }

        if (event.key === 'Enter' || event.key === 'Tab') {
          const selected = state.mentionSuggestions[state.mentionSelectedIndex];
          if (!selected) {
            return;
          }
          event.preventDefault();
          applyMentionSuggestion(selected.username || '');
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          clearMentionSuggestions();
        }
      });

      elements.chatMessageInput.addEventListener('blur', function () {
        window.setTimeout(function () {
          const active = document.activeElement;
          if (!active || !active.closest || !active.closest('#chatMentionMenu')) {
            clearMentionSuggestions();
          }
        }, 120);
      });
    }

    if (elements.chatImageButton && elements.chatImageInput) {
      elements.chatImageButton.addEventListener('click', function () {
        elements.chatImageInput.click();
      });
    }

    if (elements.chatImageInput) {
      elements.chatImageInput.addEventListener('change', function () {
        const file = elements.chatImageInput.files && elements.chatImageInput.files[0];
        if (!file) {
          clearPendingChatImage();
          return;
        }

        if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type || '')) {
          clearPendingChatImage();
          setChatStatus('Use a PNG, JPG, WEBP, or GIF under 3 MB.', 'warning');
          return;
        }

        if (file.size > 3 * 1024 * 1024) {
          clearPendingChatImage();
          setChatStatus('Images must be under 3 MB.', 'warning');
          return;
        }

        state.pendingChatImageFile = file;
        renderChatComposerAttachmentState();
      });
    }

    if (elements.chatAttachmentClear) {
      elements.chatAttachmentClear.addEventListener('click', function () {
        clearPendingChatImage();
      });
    }

    if (elements.chatReplyClear) {
      elements.chatReplyClear.addEventListener('click', function () {
        clearPendingReply(true);
      });
    }

    if (elements.chatMentionMenu) {
      elements.chatMentionMenu.addEventListener('click', function (event) {
        const button = event.target.closest('[data-mention-username]');
        if (!button) {
          return;
        }
        applyMentionSuggestion(button.dataset.mentionUsername || '');
      });
    }

    if (elements.chatGroupForm) {
      elements.chatGroupForm.addEventListener('submit', submitGroupCreate);
    }

    if (elements.chatGroupCancelButton) {
      elements.chatGroupCancelButton.addEventListener('click', function () {
        closeModal(elements.chatGroupModal);
      });
    }

    if (elements.chatGroupAvatarButton && elements.chatGroupAvatarInput) {
      elements.chatGroupAvatarButton.addEventListener('click', function () {
        elements.chatGroupAvatarInput.click();
      });
    }

    if (elements.chatGroupAvatarInput) {
      elements.chatGroupAvatarInput.addEventListener('change', function () {
        const file = elements.chatGroupAvatarInput.files && elements.chatGroupAvatarInput.files[0];
        if (file) {
          openCropperForFile(file, 'group-create');
        }
      });
    }

    if (elements.chatGroupManageForm) {
      elements.chatGroupManageForm.addEventListener('submit', submitGroupManage);
    }

    if (elements.chatManageGroupCancelButton) {
      elements.chatManageGroupCancelButton.addEventListener('click', function () {
        closeModal(elements.chatGroupManageModal);
      });
    }

    if (elements.chatManageGroupAvatarButton && elements.chatManageGroupAvatarInput) {
      elements.chatManageGroupAvatarButton.addEventListener('click', function () {
        elements.chatManageGroupAvatarInput.click();
      });
    }

    if (elements.chatManageGroupAvatarInput) {
      elements.chatManageGroupAvatarInput.addEventListener('change', function () {
        const file = elements.chatManageGroupAvatarInput.files && elements.chatManageGroupAvatarInput.files[0];
        if (file) {
          openCropperForFile(file, 'group-manage');
        }
      });
    }

    if (elements.chatReportForm) {
      elements.chatReportForm.addEventListener('submit', submitReport);
    }

    if (elements.chatReportCancelButton) {
      elements.chatReportCancelButton.addEventListener('click', function () {
        closeModal(elements.chatReportModal);
      });
    }

    if (elements.avatarCropCancel) {
      elements.avatarCropCancel.addEventListener('click', resetCropState);
    }

    if (elements.avatarCropApprove) {
      elements.avatarCropApprove.addEventListener('click', approveCropUpload);
    }

    if (elements.avatarCropZoom) {
      elements.avatarCropZoom.addEventListener('input', function () {
        state.crop.zoom = Number(elements.avatarCropZoom.value || 1);
        drawCropPreview();
      });
    }

    if (elements.avatarCropCanvas) {
      elements.avatarCropCanvas.addEventListener('pointerdown', function (event) {
        if (!state.crop.image) {
          return;
        }
        state.crop.dragging = true;
        state.crop.dragStartX = event.clientX;
        state.crop.dragStartY = event.clientY;
        state.crop.startOffsetX = state.crop.offsetX;
        state.crop.startOffsetY = state.crop.offsetY;
        elements.avatarCropCanvas.setPointerCapture(event.pointerId);
      });

      elements.avatarCropCanvas.addEventListener('pointermove', function (event) {
        if (!state.crop.dragging) {
          return;
        }
        state.crop.offsetX = state.crop.startOffsetX + (event.clientX - state.crop.dragStartX);
        state.crop.offsetY = state.crop.startOffsetY + (event.clientY - state.crop.dragStartY);
        drawCropPreview();
      });

      elements.avatarCropCanvas.addEventListener('pointerup', function () {
        state.crop.dragging = false;
      });

      elements.avatarCropCanvas.addEventListener('pointercancel', function () {
        state.crop.dragging = false;
      });
    }

    [elements.chatGroupModal, elements.chatGroupManageModal, elements.chatReportModal].forEach(function (modal) {
      if (!modal) {
        return;
      }
      modal.addEventListener('click', function (event) {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });
  }

  function bindGlobalEvents() {
    document.addEventListener('click', closeAllMenusOnOutsideClick);
  }

  async function initialize() {
    if (!pb) {
      return;
    }

    clearFeedbacks();
    renderSidebarMeta();
    renderConversationList();
    renderFriendRequests();
    renderRoomChrome();
    renderMessages();

    await refreshSession();
    await loadBootstrap();
    ensureActiveRoomFromBootstrap();
    if (state.activeRoomId) {
      await loadActiveRoom();
    } else {
      renderRoomChrome();
      renderMessages();
    }
    await loadAdminReports();
    await fetchSiteState();

    scheduleBootstrapPoll();
    scheduleRoomPoll();
    scheduleSessionPoll();
    scheduleSiteStatePoll();
    scheduleAdminReportsPoll();
  }

  bindChatListEvents();
  bindAccountEvents();
  bindAdminEvents();
  bindModalEvents();
  bindGlobalEvents();
  initialize();
})();
