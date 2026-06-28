/* ============================================================
   HARMONY DECEPTION — Replay Player JavaScript
   Handles: file loading, playback, timeline scrubbing,
   event rendering, role reveal, spectator filtering
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
    currentEventIndex: 0,   // Index into filteredEvents
    isPlaying: false,
    speed: 1,               // 1x, 2x, 4x
    playInterval: null,     // setInterval handle
    rolesRevealed: false,   // Whether game_over has been reached
    activeFilter: 'all',    // Current event log filter
    totalDurationMs: 0,     // Total game duration in ms
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
        // If fetch fails (e.g., file:// protocol), try relative path
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
    if (state.playInterval) {
      clearInterval(state.playInterval);
      state.playInterval = null;
    }
    state.replay = null;
    state.events = [];
    state.filteredEvents = [];
    state.currentEventIndex = 0;
    state.isPlaying = false;
    state.rolesRevealed = false;
    dom.eventLog.innerHTML = '';
    dom.playerList.innerHTML = '';
    dom.phaseJumps.innerHTML = '';
    dom.phaseMarkers.innerHTML = '';
    dom.deathMarkers.innerHTML = '';
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

      html += renderEventEntry(ev, idx === state.currentEventIndex);
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

  function renderEventEntry(ev, isCurrent) {
    const icon = EVENT_ICONS[ev.kind] || '•';
    const timeStr = formatTimestamp(ev.timestampMs);
    const content = formatEventContent(ev);
    const currentClass = isCurrent ? ' style="border-right: 3px solid var(--c-gold);"' : '';

    return '<div class="event-entry event-' + escapeHtml(ev.kind) + '"' + currentClass + '>'
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

  // ===== PLAYBACK CONTROLS =====

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
        if (state.isPlaying) {
          // Restart interval with new speed
          stopPlayback();
          startPlayback();
        }
      });
    });

    // Scrubber click/drag
    let isDragging = false;

    dom.scrubberTrack.addEventListener('mousedown', (e) => {
      isDragging = true;
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
          stepPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
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

  function startPlayback() {
    if (state.currentEventIndex >= state.filteredEvents.length - 1) {
      // At end, restart from beginning
      seekToEvent(0);
    }
    state.isPlaying = true;
    dom.btnPlay.textContent = '⏸';

    const baseInterval = 800; // ms between events at 1x
    const interval = baseInterval / state.speed;

    state.playInterval = setInterval(() => {
      if (state.currentEventIndex < state.filteredEvents.length - 1) {
        seekToEvent(state.currentEventIndex + 1);
      } else {
        stopPlayback();
      }
    }, interval);
  }

  function stopPlayback() {
    state.isPlaying = false;
    dom.btnPlay.textContent = '▶';
    if (state.playInterval) {
      clearInterval(state.playInterval);
      state.playInterval = null;
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

    // Check if we've hit game_over
    const currentEv = state.filteredEvents[idx];
    if (currentEv && currentEv.kind === 'game_over' && !state.rolesRevealed) {
      state.rolesRevealed = true;
      rebuildFilteredEvents();
      // After rebuild, find the equivalent position
      // We need to find the game_over event in the new filtered list
      const gameOverIdx = state.filteredEvents.findIndex(e => e.kind === 'game_over');
      if (gameOverIdx >= 0) {
        idx = gameOverIdx;
        state.currentEventIndex = idx;
      }
      renderPlayerList();
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
        // Find nearest event
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
      dom.stateDay.textContent = phase.dayNumber;
      dom.statePhase.textContent = phase.phaseType;
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
      // Check events up to current for player_died events
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

    dom.stateAlive.textContent = aliveCount;
    dom.stateDead.textContent = deadCount;

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

    dom.phaseIcon.textContent = icon;
    dom.phaseLabel.textContent = label;
    dom.phaseSubLabel.textContent = subLabel;
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