/* ============================================================
   HARMONY DECEPTION — Replay Player JavaScript (I5: Animated/Progressive)
   Handles: file loading, progressive animated playback, timeline scrubbing,
   event rendering, role reveal, spectator filtering

   I5 enhancements:
   - requestAnimationFrame-based playback loop for smooth animation
   - Continuous timestamp-based seeking (not just event-to-event jumps)
   - Animated phase transition banners
   - Smooth scrubber movement between events
   - State panel values interpolate during playback
   - Event log entries fade/slide in as they appear
   - Variable speed: 1x, 2x, 4x
   ============================================================ */

(function() {
  'use strict';

  // ===== STATE =====
  const state = {
    replay: null,           // Full ReplayFile object
    events: [],             // All events from replay
    filteredEvents: [],     // Events visible to spectator (public only during playback)
    phases: [],             // Phase records
    players: [],            // Player records
    snapshots: [],          // State snapshots
    currentEventIndex: 0,   // Index into filteredEvents (last shown event)
    isPlaying: false,
    speed: 1,               // 1x, 2x, 4x
    rolesRevealed: false,   // Whether game_over has been reached
    activeFilter: 'all',    // Current event log filter
    totalDurationMs: 0,     // Total game duration in ms

    // ── I5: Progressive playback state ──────────────────────────────
    playbackPosMs: 0,       // Current playback position in ms (continuous)
    lastFrameTime: 0,       // Last rAF timestamp for delta calculation
    rafId: null,             // requestAnimationFrame handle
    basePlaybackRate: 1.0,  // Base speed multiplier (1x = real-time-ish)
    phaseTransitionActive: false, // True during phase transition animation
    phaseTransitionEnd: 0,  // When phase transition animation should end (timestamp)
    lastPhaseIndex: -1,     // Track phase changes for transition detection
  };

  // ===== DOM =====
  const dom = {
    loaderOverlay:    document.getElementById('loaderOverlay'),
    dropzone:         document.getElementById('dropzone'),
    fileInput:        document.getElementById('fileInput'),
    loadSampleBtn:    document.getElementById('loadSampleBtn'),
    replayApp:        document.getElementById('replayApp'),
    matchTitle:       document.getElementById('matchTitle'),
    matchMeta:        document.getElementById('matchMeta'),
    loadAnotherBtn:   document.getElementById('loadAnotherBtn'),
    stateDay:         document.getElementById('stateDay'),
    statePhase:       document.getElementById('statePhase'),
    stateAlive:       document.getElementById('stateAlive'),
    stateDead:        document.getElementById('stateDead'),
    stateTimer:       document.getElementById('stateTimer'),
    stateEventCount:  document.getElementById('stateEventCount'),
    phaseIcon:        document.getElementById('phaseIcon'),
    phaseLabel:       document.getElementById('phaseLabel'),
    phaseSubLabel:    document.getElementById('phaseSubLabel'),
    timerDisplay:     document.getElementById('timerDisplay'),
    scrubberTrack:    document.getElementById('scrubberTrack'),
    scrubberFill:     document.getElementById('scrubberFill'),
    scrubberThumb:    document.getElementById('scrubberThumb'),
    phaseMarkers:     document.getElementById('phaseMarkers'),
    deathMarkers:     document.getElementById('deathMarkers'),
    btnPrev:          document.getElementById('btnPrev'),
    btnPlay:          document.getElementById('btnPlay'),
    btnNext:          document.getElementById('btnNext'),
    speedSelector:    document.getElementById('speedSelector'),
    currentTime:      document.getElementById('currentTime'),
    totalTime:        document.getElementById('totalTime'),
    phaseJumps:       document.getElementById('phaseJumps'),
    playerList:       document.getElementById('playerList'),
    eventLog:         document.getElementById('eventLog'),
    eventFilters:     document.getElementById('eventFilters'),
  };

  // ===== CONSTANTS =====
  const PHASE_ICONS = {
    'Day': '☀️',
    'NightAction': '🌙',
    'NightResolution': '✨',
    'Voting': '⚖️',
    'Trial': '⚖️',
  };

  const PHASE_LABELS = {
    'Day': 'Discussion',
    'NightAction': 'Night Actions',
    'NightResolution': 'Night Resolution',
    'Voting': 'Voting',
    'Trial': 'Trial',
  };

  const EVENT_ICONS = {
    'phase_start': '▶',
    'phase_end': '⏹',
    'player_joined': '👋',
    'player_left': '🚪',
    'player_died': '💀',
    'role_assigned': '🎭',
    'night_action_submitted': '🔮',
    'night_action_result': '📜',
    'nomination_started': '📌',
    'vote_cast': '🗳',
    'vote_updated': '📊',
    'nomination_failed': '❌',
    'trial_started': '⚖️',
    'verdict_cast': '🔨',
    'verdict_result': '📋',
    'player_executed': '⛓',
    'player_spared': '🛡',
    'chat_message': '💬',
    'ghost_whisper_sent': '👻',
    'ghost_vote_cast': '🗳',
    'faction_kill_claimed': '🗡',
    'game_over': '🏆',
    'timer_expired': '⏰',
    'special_ability_used': '✨',
  };

  // Events hidden from spectator view (per spec §3.2 and §9.1)
  const HIDDEN_DURING_PLAYBACK = ['role_assigned', 'night_action_submitted', 'night_action_result', 'ghost_whisper_sent'];

  // I5: Playback speed constants
  // At 1x, we play through the replay at a comfortable viewing pace.
  // The base interval between events is scaled by the actual time gap
  // between events, capped to avoid too-slow or too-fast playback.
  const MIN_EVENT_DELAY_MS = 200;   // Minimum delay between events (ms real time)
  const MAX_EVENT_DELAY_MS = 3000;  // Maximum delay between events (ms real time)
  const DEFAULT_EVENT_DELAY_MS = 800; // Fallback if no timestamp gap
  const PHASE_TRANSITION_MS = 600;  // Phase transition animation duration (ms real time)

  // ===== FILE LOADING =====

  function initLoader() {
    // Dropzone click → file picker
    dom.dropzone.addEventListener('click', () => dom.fileInput.click());

    // File input change
    dom.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        loadFile(e.target.files[0]);
      }
    });

    // Drag and drop
    dom.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dom.dropzone.classList.add('drag-over');
    });

    dom.dropzone.addEventListener('dragleave', () => {
      dom.dropzone.classList.remove('drag-over');
    });

    dom.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dom.dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        loadFile(e.dataTransfer.files[0]);
      }
    });

    // Load sample button
    dom.loadSampleBtn.addEventListener('click', () => {
      loadSampleReplay();
    });

    // Load another file button
    dom.loadAnotherBtn.addEventListener('click', () => {
      resetPlayer();
      dom.loaderOverlay.classList.remove('hidden');
    });
  }

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        loadReplay(data);
      } catch (err) {
        alert('Failed to parse replay file: ' + err.message);
      }
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsText(file);
  }

  function loadSampleReplay() {
    fetch('sample-replay.json')
      .then(res => res.json())
      .then(data => loadReplay(data))
      .catch(err => {
        console.error('Failed to load sample:', err);
        alert('Could not load sample replay. Make sure sample-replay.json is in the same directory. If opening via file://, use a local server or drop the file manually.');
      });
  }

  function loadReplay(data) {
    // Validate minimum structure
    if (!data.version || !data.events || !data.players) {
      alert('Invalid replay file: missing required fields (version, events, players).');
      return;
    }

    state.replay = data;
    state.events = data.events || [];
    state.phases = data.phases || [];
    state.players = data.players || [];
    state.snapshots = data.snapshots || [];
    state.currentEventIndex = 0;
    state.isPlaying = false;
    state.rolesRevealed = false;
    state.activeFilter = 'all';
    state.playbackPosMs = 0;
    state.lastFrameTime = 0;
    state.phaseTransitionActive = false;
    state.lastPhaseIndex = -1;

    // Compute total duration
    if (state.events.length > 0) {
      const lastEvent = state.events[state.events.length - 1];
      state.totalDurationMs = lastEvent.timestampMs || 0;
    }

    // Build filtered events for spectator (public only, hide private/admin during playback)
    rebuildFilteredEvents();

    // Hide loader, show app
    dom.loaderOverlay.classList.add('hidden');
    dom.replayApp.classList.add('active');

    // Create phase transition overlay element
    createPhaseTransitionOverlay();

    // Render everything
    renderMatchHeader();
    renderPlayerList();
    renderPhaseJumps();
    renderPhaseMarkers();
    renderDeathMarkers();
    renderEventFilters();
    renderEventLog();
    updateScrubber();
    updatePlaybackControls();
    updateStatePanel();
    updatePhaseDisplay();

    // Reset to beginning
    seekToEvent(0);
  }

  function resetPlayer() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    state.replay = null;
    state.events = [];
    state.filteredEvents = [];
    state.currentEventIndex = 0;
    state.isPlaying = false;
    state.rolesRevealed = false;
    state.playbackPosMs = 0;
    state.phaseTransitionActive = false;
    state.lastPhaseIndex = -1;
    dom.eventLog.innerHTML = '';
    dom.playerList.innerHTML = '';
    dom.phaseJumps.innerHTML = '';
    dom.phaseMarkers.innerHTML = '';
    dom.deathMarkers.innerHTML = '';
    removePhaseTransitionOverlay();
    dom.replayApp.classList.remove('active');
  }

  // ===== SPECTATOR FILTERING =====

  function rebuildFilteredEvents() {
    // Spectator mode: show public events. Hide admin_only and private events
    // EXCEPT after game over, role_assigned events become visible for the reveal
    state.filteredEvents = state.events.filter(ev => {
      // Always show public events
      if (ev.visibility === 'public') return true;
      // Show spectator events
      if (ev.visibility === 'spectator') return true;
      // After game over, show faction and private events (full reveal)
      if (state.rolesRevealed) {
        if (ev.visibility === 'faction') return true;
        if (ev.visibility === 'private' && ev.kind === 'role_assigned') return true;
        if (ev.visibility === 'private' && ev.kind === 'night_action_result') return true;
      }
      // Never show admin_only events in spectator view
      return false;
    });
  }

  // ===== I5: PHASE TRANSITION OVERLAY =====

  function createPhaseTransitionOverlay() {
    // Create overlay element for phase transition animations
    let overlay = document.getElementById('phaseTransitionOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'phaseTransitionOverlay';
      overlay.className = 'phase-transition-overlay';
      overlay.innerHTML = `
        <div class="phase-transition-content">
          <div class="phase-transition-icon" id="ptIcon"></div>
          <div class="phase-transition-label" id="ptLabel"></div>
          <div class="phase-transition-sublabel" id="ptSubLabel"></div>
          <div class="phase-transition-bar"><div class="phase-transition-bar-fill" id="ptBarFill"></div></div>
        </div>
      `;
      dom.replayApp.appendChild(overlay);
    }
  }

  function removePhaseTransitionOverlay() {
    const overlay = document.getElementById('phaseTransitionOverlay');
    if (overlay) overlay.remove();
  }

  function showPhaseTransition(phaseRecord) {
    if (!phaseRecord) return;

    const overlay = document.getElementById('phaseTransitionOverlay');
    if (!overlay) return;

    const icon = PHASE_ICONS[phaseRecord.phaseType] || '▶';
    const label = phaseRecord.phaseType === 'Day'
      ? 'Day ' + phaseRecord.dayNumber
      : phaseRecord.phaseType === 'NightAction'
        ? 'Night ' + phaseRecord.dayNumber
        : phaseRecord.phaseType === 'NightResolution'
          ? 'Resolution — Night ' + phaseRecord.dayNumber
          : phaseRecord.phaseType === 'Voting'
            ? 'Voting — Day ' + phaseRecord.dayNumber
            : phaseRecord.phaseType === 'Trial'
              ? 'Trial — Day ' + phaseRecord.dayNumber
              : phaseRecord.phaseType + ' — Day ' + phaseRecord.dayNumber;

    const subLabel = PHASE_LABELS[phaseRecord.phaseType] || '';

    document.getElementById('ptIcon').textContent = icon;
    document.getElementById('ptLabel').textContent = label;
    document.getElementById('ptSubLabel').textContent = subLabel;

    // Reset bar fill
    const barFill = document.getElementById('ptBarFill');
    barFill.style.width = '0%';

    // Trigger animation
    overlay.classList.remove('active');
    // Force reflow to restart animation
    void overlay.offsetWidth;
    overlay.classList.add('active');

    // Animate progress bar
    requestAnimationFrame(() => {
      barFill.style.transition = `width ${PHASE_TRANSITION_MS}ms linear`;
      barFill.style.width = '100%';
    });

    state.phaseTransitionActive = true;
    state.phaseTransitionEnd = performance.now() + PHASE_TRANSITION_MS;

    // Auto-hide after animation
    setTimeout(() => {
      overlay.classList.remove('active');
      state.phaseTransitionActive = false;
    }, PHASE_TRANSITION_MS);
  }

  // ===== RENDER: MATCH HEADER =====

  function renderMatchHeader() {
    const r = state.replay;
    dom.matchTitle.textContent = 'Match ' + (r.matchId || 'Unknown');

    const winnerClass = {
      'Harmony': 'winner-harmony',
      'Deceiver': 'winner-deceiver',
      'NeutralKilling': 'winner-neutral',
      'Neutral': 'winner-neutral',
      'Draw': 'winner-draw',
    };

    const winnerLabel = r.winner || 'Unknown';
    const wc = winnerClass[winnerLabel] || 'winner-draw';

    let metaHTML = '';

    metaHTML += '<span class="winner-badge ' + wc + '">' + escapeHtml(winnerLabel) + '</span>';
    metaHTML += '<span>📅 ' + escapeHtml(r.startedAt ? new Date(r.startedAt).toLocaleString() : 'Unknown') + '</span>';
    metaHTML += '<span>🎮 v' + escapeHtml(r.gameVersion || '?') + '</span>';
    metaHTML += '<span>👥 ' + state.players.length + ' players</span>';
    metaHTML += '<span>🌙 ' + (r.totalDays || '?') + ' days</span>';

    if (r.winCondition) {
      metaHTML += '<span>🏆 ' + escapeHtml(r.winCondition) + '</span>';
    }

    dom.matchMeta.innerHTML = metaHTML;
  }

  // ===== RENDER: PLAYER LIST =====

  function renderPlayerList() {
    let html = '';
    state.players.forEach(p => {
      const isDead = !p.wasAlive || (p.diedAt !== null && p.diedAt !== undefined);
      const factionClass = state.rolesRevealed ? 'faction-' + escapeHtml(p.faction || '') : '';
      const deadClass = isDead ? 'dead' : '';

      let roleDisplay = '';
      let factionTag = '';

      if (state.rolesRevealed) {
        roleDisplay = '<span class="player-role">' + escapeHtml(p.roleName || 'Unknown') + '</span>';
        if (p.faction) {
          factionTag = '<span class="player-faction-tag">' + escapeHtml(p.faction) + '</span>';
        }
      }

      html += '<li class="player-item ' + deadClass + ' ' + factionClass + '" data-player-index="' + p.playerIndex + '">'
        + '<span class="player-status ' + (isDead ? 'dead' : 'alive') + '"></span>'
        + '<span class="player-name">' + escapeHtml(p.displayName) + '</span>'
        + roleDisplay
        + factionTag
        + '</li>';
    });
    dom.playerList.innerHTML = html;
  }

  // ===== RENDER: PHASE JUMPS =====

  function renderPhaseJumps() {
    let html = '';
    state.phases.forEach((phase, idx) => {
      const icon = PHASE_ICONS[phase.phaseType] || '•';
      const label = phase.phaseType === 'Day'
        ? 'Day ' + phase.dayNumber
        : phase.phaseType === 'NightAction'
          ? 'Night ' + phase.dayNumber
          : phase.phaseType === 'NightResolution'
            ? 'Resolve ' + phase.dayNumber
            : phase.phaseType === 'Voting'
              ? 'Vote ' + phase.dayNumber
              : phase.phaseType + ' ' + phase.dayNumber;
      html += '<button class="phase-jump-btn" data-phase-index="' + idx + '">' + icon + ' ' + escapeHtml(label) + '</button>';
    });
    dom.phaseJumps.innerHTML = html;

    // Wire clicks
    dom.phaseJumps.querySelectorAll('.phase-jump-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const phaseIdx = parseInt(btn.dataset.phaseIndex);
        jumpToPhase(phaseIdx);
      });
    });
  }

  // ===== RENDER: PHASE MARKERS ON TIMELINE =====

  function renderPhaseMarkers() {
    if (state.totalDurationMs === 0) return;
    let html = '';
    state.phases.forEach((phase, idx) => {
      // Find the first event in this phase
      const phaseEvents = state.events.filter(e => e.phaseIndex === phase.phaseIndex);
      if (phaseEvents.length === 0) return;
      const firstTs = phaseEvents[0].timestampMs;
      const pct = (firstTs / state.totalDurationMs) * 100;

      const markerClass = phase.phaseType === 'Day' ? 'day'
        : phase.phaseType === 'NightAction' || phase.phaseType === 'NightResolution' ? 'night'
        : 'voting';

      const label = phase.phaseType === 'Day'
        ? 'D' + phase.dayNumber
        : phase.phaseType === 'NightAction'
          ? 'N' + phase.dayNumber
          : phase.phaseType === 'Voting'
            ? 'V' + phase.dayNumber
            : phase.phaseType.substring(0, 4) + phase.dayNumber;

      html += '<div class="phase-marker ' + markerClass + '" style="left: ' + pct + '%" data-label="' + escapeHtml(label) + '"></div>';
    });
    dom.phaseMarkers.innerHTML = html;
  }

  // ===== RENDER: DEATH MARKERS ON TIMELINE =====

  function renderDeathMarkers() {
    if (state.totalDurationMs === 0) return;
    let html = '';
    state.players.forEach(p => {
      if (p.diedAt !== null && p.diedAt !== undefined) {
        // Find the player_died event for this player to get the timestamp
        const deathEvent = state.events.find(e =>
          e.kind === 'player_died' && e.targetIndex === p.playerIndex
        );
        if (deathEvent) {
          const pct = (deathEvent.timestampMs / state.totalDurationMs) * 100;
          html += '<div class="death-marker" style="left: ' + pct + '%" data-label="' + escapeHtml(p.displayName) + '"></div>';
        }
      }
    });
    dom.deathMarkers.innerHTML = html;
  }

  // ===== RENDER: EVENT LOG =====

  function renderEventFilters() {
    dom.eventFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dom.eventFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeFilter = btn.dataset.filter;
        renderEventLog();
      });
    });
  }

  function renderEventLog() {
    // Show all events up to current position
    const visibleEvents = state.filteredEvents.slice(0, state.currentEventIndex + 1);
    let html = '';
    let lastPhaseIndex = -1;

    visibleEvents.forEach((ev, idx) => {
      if (!matchesFilter(ev, state.activeFilter)) return;

      // Phase start events act as section headers
      if (ev.kind === 'phase_start' && ev.phaseIndex !== lastPhaseIndex) {
        lastPhaseIndex = ev.phaseIndex;
      }

      // I5: Add "newly-appeared" class to the most recent event during playback
      const isNew = state.isPlaying && idx === state.currentEventIndex;
      html += renderEventEntry(ev, idx === state.currentEventIndex, isNew);
    });

    dom.eventLog.innerHTML = html;

    // Scroll to bottom (latest event)
    dom.eventLog.scrollTop = dom.eventLog.scrollHeight;
  }

  function matchesFilter(ev, filter) {
    switch (filter) {
      case 'all': return true;
      case 'chat': return ev.kind === 'chat_message' || ev.kind === 'ghost_whisper_sent';
      case 'vote': return ev.kind === 'vote_cast' || ev.kind === 'vote_updated' ||
        ev.kind === 'nomination_started' || ev.kind === 'nomination_failed' ||
        ev.kind === 'ghost_vote_cast' || ev.kind === 'trial_started' ||
        ev.kind === 'verdict_cast' || ev.kind === 'verdict_result' ||
        ev.kind === 'player_executed' || ev.kind === 'player_spared';
      case 'death': return ev.kind === 'player_died' || ev.kind === 'player_executed';
      case 'phase': return ev.kind === 'phase_start' || ev.kind === 'phase_end' ||
        ev.kind === 'timer_expired' || ev.kind === 'game_over';
      case 'system': return ev.kind === 'player_joined' || ev.kind === 'player_left' ||
        ev.kind === 'role_assigned' || ev.kind === 'night_action_submitted' ||
        ev.kind === 'night_action_result' || ev.kind === 'faction_kill_claimed' ||
        ev.kind === 'special_ability_used' || ev.kind === 'ghost_whisper_sent';
      default: return true;
    }
  }

  function renderEventEntry(ev, isCurrent, isNew) {
    const icon = EVENT_ICONS[ev.kind] || '•';
    const timeStr = formatTimestamp(ev.timestampMs);
    const content = formatEventContent(ev);
    const currentClass = isCurrent ? ' style="border-right: 3px solid var(--c-gold);"' : '';
    const newClass = isNew ? ' event-new' : '';

    return '<div class="event-entry event-' + escapeHtml(ev.kind) + newClass + '"' + currentClass + '>'
      + '<span class="event-time">' + timeStr + '</span>'
      + '<span class="event-icon">' + icon + '</span>'
      + '<span class="event-content">' + content + '</span>'
      + '</div>';
  }

  function formatEventContent(ev) {
    const actorName = ev.actorIndex !== null && ev.actorIndex !== undefined
      ? getPlayerName(ev.actorIndex)
      : null;
    const targetName = ev.targetIndex !== null && ev.targetIndex !== undefined
      ? getPlayerName(ev.targetIndex)
      : null;
    const data = ev.data || {};

    switch (ev.kind) {
      case 'phase_start': {
        const pt = data.phase_type || '?';
        const dn = data.day_number || '?';
        const icon = PHASE_ICONS[pt] || '▶';
        return icon + ' ' + escapeHtml(pt) + ' ' + dn + ' begins';
      }

      case 'phase_end': {
        const pt = data.phase_type || '?';
        const reason = data.reason || '';
        return escapeHtml(pt) + ' ended (' + escapeHtml(reason) + ')';
      }

      case 'player_joined':
        return escapeHtml(data.display_name || actorName || 'A player') + ' joined the game';

      case 'player_left':
        return escapeHtml(actorName || 'A player') + ' left (' + escapeHtml(data.reason || 'unknown') + ')';

      case 'player_died': {
        const cause = data.cause || 'unknown';
        const by = data.by_player_index !== null && data.by_player_index !== undefined
          ? ' (killed by ' + escapeHtml(getPlayerName(data.by_player_index)) + ')'
          : '';
        return '💀 ' + escapeHtml(targetName || 'A player') + ' has died — cause: ' + escapeHtml(cause) + by;
      }

      case 'role_assigned':
        return '🎭 ' + escapeHtml(targetName || 'Player') + ' was assigned: ' + escapeHtml(data.role_name || '?') + ' (' + escapeHtml(data.faction || '?') + ')';

      case 'night_action_submitted':
        return '🔮 ' + escapeHtml(actorName || 'Player') + ' used ' + escapeHtml(data.ability_name || 'ability') + ' on ' + escapeHtml(targetName || 'someone');

      case 'night_action_result': {
        const msg = data.message || data.result_type || 'result received';
        return '📜 ' + escapeHtml(targetName || 'Player') + ' received: ' + escapeHtml(msg);
      }

      case 'nomination_started':
        return '📌 ' + escapeHtml(actorName || 'Someone') + ' nominated ' + escapeHtml(targetName || 'someone');

      case 'vote_cast': {
        const ghost = data.is_ghost ? ' 👻' : '';
        return '🗳 ' + escapeHtml(actorName || 'Voter') + ' voted against ' + escapeHtml(targetName || 'someone') + ghost;
      }

      case 'vote_updated': {
        const yea = data.yea_count || 0;
        const nay = data.nay_count || 0;
        const nominee = data.nominee !== undefined ? getPlayerName(data.nominee) : 'someone';
        return '📊 Vote update — ' + escapeHtml(nominee) + ': ' + yea + ' yes, ' + nay + ' no';
      }

      case 'nomination_failed':
        return '❌ Nomination failed — ' + escapeHtml(data.reason || 'unknown reason');

      case 'trial_started':
        return '⚖️ Trial started for ' + escapeHtml(targetName || 'the accused');

      case 'verdict_cast': {
        const verdict = data.verdict || '?';
        const ghost = data.is_ghost ? ' 👻' : '';
        return '🔨 ' + escapeHtml(actorName || 'Juror') + ' voted ' + escapeHtml(verdict) + ghost;
      }

      case 'verdict_result': {
        const g = data.guilty_count || 0;
        const i = data.innocent_count || 0;
        const a = data.abstain_count || 0;
        const accused = data.accused_index !== undefined ? getPlayerName(data.accused_index) : 'the accused';
        return '📋 Verdict — ' + escapeHtml(accused) + ': ' + g + ' guilty, ' + i + ' innocent, ' + a + ' abstain';
      }

      case 'player_executed':
        return '⛓ ' + escapeHtml(targetName || 'Player') + ' was executed' + (data.was_last_deceiver ? ' (last Deceiver!)' : '');

      case 'player_spared':
        return '🛡 ' + escapeHtml(targetName || 'Player') + ' was spared by the jury';

      case 'chat_message': {
        const text = data.text || '';
        const channel = data.channel || 'public';
        const channelTag = channel !== 'public' ? ' <em style="color: var(--c-text-dim);">[' + escapeHtml(channel) + ']</em>' : '';
        return '<span class="chat-sender">' + escapeHtml(actorName || 'Someone') + ':</span>' + channelTag + ' ' + escapeHtml(text);
      }

      case 'ghost_whisper_sent':
        return '👻 ' + escapeHtml(actorName || 'Ghost') + ' whispered to ' + escapeHtml(targetName || 'someone');

      case 'ghost_vote_cast':
        return '🗳 👻 ' + escapeHtml(actorName || 'Ghost') + ' voted against ' + escapeHtml(targetName || 'someone');

      case 'faction_kill_claimed':
        return '🗡 ' + escapeHtml(actorName || 'Killer') + ' claimed kill on ' + escapeHtml(targetName || 'victim') + ' (' + escapeHtml(data.ability_name || 'ability') + ')';

      case 'game_over':
        return '🏆 GAME OVER — Winner: ' + escapeHtml(data.winner || '?') + '. ' + escapeHtml(data.win_condition || '');

      case 'timer_expired':
        return '⏰ Timer expired in ' + escapeHtml(data.phase_type || 'phase') + ' (' + escapeHtml(data.action_taken || 'skipped') + ')';

      case 'special_ability_used':
        return '✨ ' + escapeHtml(actorName || 'Player') + ' used ' + escapeHtml(data.ability_name || 'ability') + ' on ' + escapeHtml(targetName || 'someone');

      default:
        return escapeHtml(ev.kind) + (Object.keys(data).length > 0 ? ' — ' + escapeHtml(JSON.stringify(data)) : '');
    }
  }

  // ===== I5: PROGRESSIVE PLAYBACK ENGINE =====

  function setupPlaybackControls() {
    dom.btnPlay.addEventListener('click', togglePlay);
    dom.btnPrev.addEventListener('click', stepPrev);
    dom.btnNext.addEventListener('click', stepNext);

    // Speed selector
    dom.speedSelector.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dom.speedSelector.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.speed = parseInt(btn.dataset.speed);
        // Speed change takes effect on next frame
      });
    });

    // Scrubber click/drag
    let isDragging = false;

    dom.scrubberTrack.addEventListener('mousedown', (e) => {
      isDragging = true;
      stopPlayback();
      handleScrubberClick(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) handleScrubberClick(e);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    dom.scrubberTrack.addEventListener('touchstart', (e) => {
      stopPlayback();
      handleScrubberTouch(e);
    });

    dom.scrubberTrack.addEventListener('touchmove', (e) => {
      e.preventDefault();
      handleScrubberTouch(e);
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!state.replay) return;
      if (e.target.tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stopPlayback();
          stepPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stopPlayback();
          stepNext();
          break;
      }
    });
  }

  function handleScrubberClick(e) {
    if (!state.filteredEvents.length) return;
    const rect = dom.scrubberTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTs = pct * state.totalDurationMs;

    // Find the event closest to this timestamp
    let bestIdx = 0;
    let bestDiff = Infinity;
    state.filteredEvents.forEach((ev, idx) => {
      const diff = Math.abs(ev.timestampMs - targetTs);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = idx;
      }
    });
    seekToEvent(bestIdx);
  }

  function handleScrubberTouch(e) {
    if (!state.filteredEvents.length || !e.touches.length) return;
    const rect = dom.scrubberTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
    const targetTs = pct * state.totalDurationMs;

    let bestIdx = 0;
    let bestDiff = Infinity;
    state.filteredEvents.forEach((ev, idx) => {
      const diff = Math.abs(ev.timestampMs - targetTs);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = idx;
      }
    });
    seekToEvent(bestIdx);
  }

  function togglePlay() {
    if (state.isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  // I5: Progressive playback using requestAnimationFrame
  // Instead of stepping event-by-event with setInterval, we use a continuous
  // timestamp-based playback position that advances smoothly via rAF.
  // Events are revealed as the playback position passes their timestamp.
  function startPlayback() {
    if (state.currentEventIndex >= state.filteredEvents.length - 1) {
      // At end, restart from beginning
      seekToEvent(0);
    }
    state.isPlaying = true;
    dom.btnPlay.textContent = '⏸';

    // Set initial playback position to current event's timestamp
    const currentEv = state.filteredEvents[state.currentEventIndex];
    state.playbackPosMs = currentEv ? currentEv.timestampMs : 0;
    state.lastFrameTime = performance.now();

    // Start rAF loop
    state.rafId = requestAnimationFrame(playbackFrame);
  }

  // I5: Main playback loop — called every frame via requestAnimationFrame
  function playbackFrame(frameTime) {
    if (!state.isPlaying) return;

    // Calculate real-time delta
    const deltaMs = frameTime - state.lastFrameTime;
    state.lastFrameTime = frameTime;

    // Scale delta by playback speed
    // At 1x: we advance through the replay at a comfortable viewing pace
    // The base rate scales the replay timeline to real-time
    // (e.g., a 30-min game plays back in ~30s at 1x with event-delay scaling)
    const scaledDelta = deltaMs * state.speed;

    // Advance playback position
    state.playbackPosMs += scaledDelta;

    // Clamp to total duration
    if (state.playbackPosMs >= state.totalDurationMs) {
      state.playbackPosMs = state.totalDurationMs;
      // Show all remaining events
      if (state.currentEventIndex < state.filteredEvents.length - 1) {
        seekToEvent(state.filteredEvents.length - 1);
      }
      stopPlayback();
      return;
    }

    // Find all events that should be visible at current playback position
    let newEventIndex = state.currentEventIndex;
    let phaseChanged = false;
    let newPhaseRecord = null;

    for (let i = state.currentEventIndex + 1; i < state.filteredEvents.length; i++) {
      if (state.filteredEvents[i].timestampMs <= state.playbackPosMs) {
        newEventIndex = i;

        // Check for phase transition
        const ev = state.filteredEvents[i];
        if (ev.kind === 'phase_start' && ev.phaseIndex !== state.lastPhaseIndex) {
          phaseChanged = true;
          state.lastPhaseIndex = ev.phaseIndex;
          newPhaseRecord = state.phases.find(p => p.phaseIndex === ev.phaseIndex);
        }
      } else {
        break; // Events are sorted by timestamp
      }
    }

    // If we advanced past events, update display
    if (newEventIndex > state.currentEventIndex) {
      // Use seekToEvent to update everything
      seekToEvent(newEventIndex);

      // I5: Show phase transition animation if phase changed
      if (phaseChanged && newPhaseRecord) {
        showPhaseTransition(newPhaseRecord);
      }
    } else {
      // I5: Even if no new event, update the scrubber smoothly
      updateScrubberSmooth();
    }

    // Continue the animation loop
    state.rafId = requestAnimationFrame(playbackFrame);
  }

  // I5: Smooth scrubber update (between events)
  function updateScrubberSmooth() {
    if (state.totalDurationMs === 0) return;
    const pct = (state.playbackPosMs / state.totalDurationMs) * 100;
    dom.scrubberFill.style.width = pct + '%';
    dom.scrubberThumb.style.left = pct + '%';
    dom.currentTime.textContent = formatTimestamp(state.playbackPosMs);
  }

  function stopPlayback() {
    state.isPlaying = false;
    dom.btnPlay.textContent = '▶';
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }

  function stepNext() {
    if (state.currentEventIndex < state.filteredEvents.length - 1) {
      seekToEvent(state.currentEventIndex + 1);
    }
  }

  function stepPrev() {
    if (state.currentEventIndex > 0) {
      seekToEvent(state.currentEventIndex - 1);
    }
  }

  function seekToEvent(idx) {
    idx = Math.max(0, Math.min(idx, state.filteredEvents.length - 1));
    state.currentEventIndex = idx;

    // Update playback position to match the event
    const currentEv = state.filteredEvents[idx];
    if (currentEv) {
      state.playbackPosMs = currentEv.timestampMs;
    }

    // Check if we've hit game_over
    if (currentEv && currentEv.kind === 'game_over' && !state.rolesRevealed) {
      state.rolesRevealed = true;
      rebuildFilteredEvents();
      // After rebuild, find the equivalent position
      const gameOverIdx = state.filteredEvents.findIndex(e => e.kind === 'game_over');
      if (gameOverIdx >= 0) {
        idx = gameOverIdx;
        state.currentEventIndex = idx;
      }
      renderPlayerList();
    }

    // I5: Detect phase transitions during manual seeking
    if (currentEv && currentEv.kind === 'phase_start') {
      if (currentEv.phaseIndex !== state.lastPhaseIndex) {
        state.lastPhaseIndex = currentEv.phaseIndex;
        // Only show transition during playback, not manual scrub
        if (state.isPlaying) {
          const phaseRecord = state.phases.find(p => p.phaseIndex === currentEv.phaseIndex);
          if (phaseRecord) {
            showPhaseTransition(phaseRecord);
          }
        }
      }
    }

    updateScrubber();
    updatePlaybackControls();
    updateStatePanel();
    updatePhaseDisplay();
    renderEventLog();
    updatePhaseJumpActive();
  }

  function jumpToPhase(phaseIdx) {
    // Find the first filtered event in this phase
    const phase = state.phases[phaseIdx];
    if (!phase) return;

    const evIdx = state.filteredEvents.findIndex(e => e.phaseIndex === phase.phaseIndex);
    if (evIdx >= 0) {
      seekToEvent(evIdx);
    } else {
      // Find closest phase
      const phaseStartTs = state.events.find(e => e.phaseIndex === phase.phaseIndex);
      if (phaseStartTs) {
        let bestIdx = 0;
        let bestDiff = Infinity;
        state.filteredEvents.forEach((ev, idx) => {
          const diff = Math.abs(ev.timestampMs - phaseStartTs.timestampMs);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = idx;
          }
        });
        seekToEvent(bestIdx);
      }
    }
  }

  // ===== UPDATE UI =====

  function updateScrubber() {
    if (state.filteredEvents.length === 0 || state.totalDurationMs === 0) {
      dom.scrubberFill.style.width = '0%';
      dom.scrubberThumb.style.left = '0%';
      dom.currentTime.textContent = '0:00';
      dom.totalTime.textContent = '0:00';
      return;
    }

    const currentEv = state.filteredEvents[state.currentEventIndex];
    const pct = (currentEv.timestampMs / state.totalDurationMs) * 100;

    dom.scrubberFill.style.width = pct + '%';
    dom.scrubberThumb.style.left = pct + '%';

    dom.currentTime.textContent = formatTimestamp(currentEv.timestampMs);
    dom.totalTime.textContent = formatTimestamp(state.totalDurationMs);
  }

  function updatePlaybackControls() {
    const atStart = state.currentEventIndex === 0;
    const atEnd = state.currentEventIndex >= state.filteredEvents.length - 1;

    dom.btnPrev.disabled = atStart;
    dom.btnNext.disabled = atEnd;
    dom.btnPrev.style.opacity = atStart ? '0.4' : '1';
    dom.btnNext.style.opacity = atEnd ? '0.4' : '1';

    if (atEnd && state.isPlaying) {
      stopPlayback();
    }

    dom.stateEventCount.textContent = (state.currentEventIndex + 1) + ' / ' + state.filteredEvents.length;
  }

  function updateStatePanel() {
    const currentEv = state.filteredEvents[state.currentEventIndex];
    if (!currentEv) return;

    // Find the current phase from the event
    const phase = state.phases.find(p => p.phaseIndex === currentEv.phaseIndex);
    const snapshot = state.snapshots.find(s => s.phaseIndex === currentEv.phaseIndex);

    // Day
    if (phase) {
      // I5: Animate day/phase changes
      const prevDay = dom.stateDay.textContent;
      const prevPhase = dom.statePhase.textContent;
      if (prevDay !== String(phase.dayNumber)) {
        animateValueChange(dom.stateDay, phase.dayNumber);
      } else {
        dom.stateDay.textContent = phase.dayNumber;
      }
      if (prevPhase !== phase.phaseType) {
        animateValueChange(dom.statePhase, phase.phaseType);
      } else {
        dom.statePhase.textContent = phase.phaseType;
      }
    }

    // Alive/Dead count from snapshot or compute from events
    let aliveCount = 0;
    let deadCount = 0;

    if (snapshot) {
      snapshot.state.players.forEach(ps => {
        if (ps.isAlive) aliveCount++;
        else deadCount++;
      });
    } else {
      // Compute from player records + death events seen so far
      const deadPlayers = new Set();
      for (let i = 0; i <= state.currentEventIndex; i++) {
        const ev = state.filteredEvents[i];
        if (ev.kind === 'player_died' && ev.targetIndex !== null) {
          deadPlayers.add(ev.targetIndex);
        }
        if (ev.kind === 'player_executed' && ev.targetIndex !== null) {
          deadPlayers.add(ev.targetIndex);
        }
      }
      state.players.forEach(p => {
        if (deadPlayers.has(p.playerIndex) || (p.diedAt !== null && p.diedAt !== undefined && phase && p.diedAt <= phase.phaseIndex)) {
          deadCount++;
        } else {
          aliveCount++;
        }
      });
    }

    // I5: Animate alive/dead count changes
    const prevAlive = dom.stateAlive.textContent;
    const prevDead = dom.stateDead.textContent;
    const newAlive = String(aliveCount);
    const newDead = String(deadCount);

    if (prevAlive !== newAlive) {
      animateValueChange(dom.stateAlive, newAlive);
    } else {
      dom.stateAlive.textContent = newAlive;
    }
    if (prevDead !== newDead) {
      animateValueChange(dom.stateDead, newDead);
    } else {
      dom.stateDead.textContent = newDead;
    }

    // Timer
    if (snapshot && snapshot.state && snapshot.state.timerSecondsRemaining !== undefined) {
      const timer = snapshot.state.timerSecondsRemaining;
      dom.stateTimer.textContent = timer + 's';
      dom.timerDisplay.textContent = timer + 's';
      if (timer <= 10) {
        dom.timerDisplay.classList.add('warning');
      } else {
        dom.timerDisplay.classList.remove('warning');
      }
    } else {
      dom.stateTimer.textContent = '—';
      dom.timerDisplay.textContent = '—';
      dom.timerDisplay.classList.remove('warning');
    }
  }

  // I5: Animate value changes in the state panel
  function animateValueChange(element, newValue) {
    element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    element.style.transform = 'scale(1.3)';
    element.style.opacity = '0.5';
    setTimeout(() => {
      element.textContent = newValue;
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    }, 150);
  }

  function updatePhaseDisplay() {
    const currentEv = state.filteredEvents[state.currentEventIndex];
    if (!currentEv) return;

    const phase = state.phases.find(p => p.phaseIndex === currentEv.phaseIndex);
    if (!phase) return;

    const icon = PHASE_ICONS[phase.phaseType] || '•';
    const label = phase.phaseType === 'Day'
      ? 'Day ' + phase.dayNumber
      : phase.phaseType === 'NightAction'
        ? 'Night ' + phase.dayNumber
        : phase.phaseType === 'NightResolution'
          ? 'Resolution ' + phase.dayNumber
          : phase.phaseType === 'Voting'
            ? 'Voting — Day ' + phase.dayNumber
            : phase.phaseType === 'Trial'
              ? 'Trial — Day ' + phase.dayNumber
              : phase.phaseType + ' — Day ' + phase.dayNumber;

    const subLabel = PHASE_LABELS[phase.phaseType] || '';

    // I5: Animate phase display changes
    const prevLabel = dom.phaseLabel.textContent;
    if (prevLabel !== label) {
      dom.phaseIcon.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      dom.phaseIcon.style.transform = 'scale(0.5) rotate(180deg)';
      dom.phaseIcon.style.opacity = '0';
      setTimeout(() => {
        dom.phaseIcon.textContent = icon;
        dom.phaseIcon.style.transform = 'scale(1) rotate(0deg)';
        dom.phaseIcon.style.opacity = '1';
      }, 200);

      dom.phaseLabel.style.transition = 'opacity 0.3s ease';
      dom.phaseLabel.style.opacity = '0';
      setTimeout(() => {
        dom.phaseLabel.textContent = label;
        dom.phaseLabel.style.opacity = '1';
      }, 200);

      dom.phaseSubLabel.style.transition = 'opacity 0.3s ease';
      dom.phaseSubLabel.style.opacity = '0';
      setTimeout(() => {
        dom.phaseSubLabel.textContent = subLabel;
        dom.phaseSubLabel.style.opacity = '1';
      }, 200);
    } else {
      dom.phaseIcon.textContent = icon;
      dom.phaseLabel.textContent = label;
      dom.phaseSubLabel.textContent = subLabel;
    }
  }

  function updatePhaseJumpActive() {
    const currentEv = state.filteredEvents[state.currentEventIndex];
    if (!currentEv) return;

    dom.phaseJumps.querySelectorAll('.phase-jump-btn').forEach(btn => {
      const phaseIdx = parseInt(btn.dataset.phaseIndex);
      const phase = state.phases[phaseIdx];
      if (phase && phase.phaseIndex === currentEv.phaseIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ===== UTILITIES =====

  function getPlayerName(idx) {
    if (idx === null || idx === undefined) return 'System';
    const player = state.players.find(p => p.playerIndex === idx);
    return player ? player.displayName : 'Player ' + idx;
  }

  function formatTimestamp(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  // ===== INIT =====

  function init() {
    initLoader();
    setupPlaybackControls();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();