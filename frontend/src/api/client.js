const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = 'changeme';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  async getOverview() {
    const res = await fetch(`${BASE_URL}/api/overview`);
    return handleResponse(res);
  },

  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.severity) query.append('severity', params.severity);
    if (params.honeypot) query.append('honeypot', params.honeypot);
    if (params.q) query.append('q', params.q);
    if (params.limit) query.append('limit', params.limit);
    if (params.cursor) query.append('cursor', params.cursor);

    const res = await fetch(`${BASE_URL}/api/events?${query.toString()}`);
    return handleResponse(res);
  },

  async getAttackers() {
    const res = await fetch(`${BASE_URL}/api/attackers`);
    return handleResponse(res);
  },

  async getAttacker(id) {
    const res = await fetch(`${BASE_URL}/api/attackers/${id}`);
    return handleResponse(res);
  },

  async getAttackerTimeline(id) {
    const res = await fetch(`${BASE_URL}/api/attackers/${id}/timeline`);
    return handleResponse(res);
  },

  async getAttackerReplay(id) {
    const res = await fetch(`${BASE_URL}/api/attackers/${id}/replay`);
    return handleResponse(res);
  },

  async blockAttacker(id) {
    const res = await fetch(`${BASE_URL}/api/attackers/${id}/block`, {
      method: 'POST',
      headers: defaultHeaders,
    });
    return handleResponse(res);
  },

  async unblockAttacker(id) {
    const res = await fetch(`${BASE_URL}/api/attackers/${id}/unblock`, {
      method: 'POST',
      headers: defaultHeaders,
    });
    return handleResponse(res);
  },

  async getRelationships() {
    const res = await fetch(`${BASE_URL}/api/relationships`);
    return handleResponse(res);
  },

  async getIncidents() {
    const res = await fetch(`${BASE_URL}/api/incidents`);
    return handleResponse(res);
  },

  async getIncident(id) {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}`);
    return handleResponse(res);
  },

  async patchIncident(id, data) {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}`, {
      method: 'PATCH',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async addIncidentNote(id, noteData) {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}/notes`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(noteData),
    });
    return handleResponse(res);
  },

  async getBlocks() {
    const res = await fetch(`${BASE_URL}/api/blocks`);
    return handleResponse(res);
  },

  async getMetrics() {
    const res = await fetch(`${BASE_URL}/api/metrics`);
    return handleResponse(res);
  },

  async getHoneypotHealth() {
    const res = await fetch(`${BASE_URL}/api/honeypots/health`);
    return handleResponse(res);
  },

  async startSimulation(scenario = 'full_chain', speed = 1.0) {
    const res = await fetch(`${BASE_URL}/api/simulate/start`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ scenario, speed }),
    });
    return handleResponse(res);
  },

  async getActions(status = null) {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/api/actions${query}`);
    return handleResponse(res);
  },

  async approveAction(id, approver = 'analyst', durationSeconds = 600) {
    const res = await fetch(`${BASE_URL}/api/actions/${id}/approve`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ approver, duration_seconds: durationSeconds }),
    });
    return handleResponse(res);
  },

  async rejectAction(id, approver = 'analyst', reason = 'Declined by analyst') {
    const res = await fetch(`${BASE_URL}/api/actions/${id}/reject`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ approver, reason }),
    });
    return handleResponse(res);
  },

  async getIncidentInvestigation(incidentId) {
    const res = await fetch(`${BASE_URL}/api/incidents/${incidentId}/investigation`);
    return handleResponse(res);
  },

  async triggerIncidentInvestigate(incidentId) {
    const res = await fetch(`${BASE_URL}/api/incidents/${incidentId}/investigate`, {
      method: 'POST',
      headers: defaultHeaders,
    });
    return handleResponse(res);
  },

  getIncidentReportUrl(incidentId) {
    return `${BASE_URL}/api/incidents/${incidentId}/report`;
  },

  async getReportsSummary() {
    const res = await fetch(`${BASE_URL}/api/reports/summary`);
    return handleResponse(res);
  },

  async getAdaptiveDeception() {
    const res = await fetch(`${BASE_URL}/api/adaptive-deception`);
    return handleResponse(res);
  },

  async getIocs(format = 'json') {
    const res = await fetch(`${BASE_URL}/api/ioc?format=${format}`);
    if (format === 'csv') return res.text();
    return handleResponse(res);
  },

  getIocDownloadUrl(format = 'csv') {
    return `${BASE_URL}/api/ioc?format=${format}`;
  },

  async getAuditLogs(entityType = null, limit = 50) {
    const query = new URLSearchParams();
    if (entityType) query.append('entity_type', entityType);
    if (limit) query.append('limit', limit);
    const res = await fetch(`${BASE_URL}/api/audit?${query.toString()}`);
    return handleResponse(res);
  },

  async getEventIntegrity(eventId) {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/integrity`);
    return handleResponse(res);
  },

  async runWhatIf(attackerId, action = 'block', atStage = 'recon') {
    const res = await fetch(`${BASE_URL}/api/whatif`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ attacker_id: attackerId, action, at_stage: atStage }),
    });
    return handleResponse(res);
  },

  async getAttackerPrediction(attackerId) {
    const res = await fetch(`${BASE_URL}/api/attackers/${attackerId}/prediction`);
    return handleResponse(res);
  },

  async getExposureBudget() {
    const res = await fetch(`${BASE_URL}/api/exposure`);
    return handleResponse(res);
  },

  async updateExposureBudget(assets) {
    const res = await fetch(`${BASE_URL}/api/exposure`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify({ assets }),
    });
    return handleResponse(res);
  },

  async getHealthCorrelation() {
    const res = await fetch(`${BASE_URL}/api/health-correlation`);
    return handleResponse(res);
  },
};

