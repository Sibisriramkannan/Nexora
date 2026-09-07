const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createEnrollment, enrollAgent } = require('../../services/agentEnrollmentService');
const Server = require('../../models/Server');

router.post('/', auth, async (req, res) => {
  try {
    const { server_id, os, architecture, ttl_minutes } = req.body;
    const result = await createEnrollment({ serverId: server_id, os, architecture, createdBy: req.user.id, ttlMinutes: ttl_minutes });
    const base = `${req.protocol}://${req.get('host')}`;
    const path = os === 'Linux' ? 'linux' : 'windows';
    const url = `${base}/agent/${path}/installer/${result.token}`;
    const command = os === 'Linux'
      ? `curl -fL '${url}' -o nexora-agent.run && chmod +x nexora-agent.run && sudo ./nexora-agent.run`
      : `powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '${url}' -OutFile 'Nexora-Agent-Installer.ps1'; & .\\Nexora-Agent-Installer.ps1"`;
    res.status(201).json({ success: true, data: { enrollment_id: result.enrollment.id, expires_at: result.enrollment.expires_at, installer_url: url, install_command: command } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.get('/', auth, async (req, res) => {
  const AgentEnrollment = require('../../models/AgentEnrollment');
  const rows = await AgentEnrollment.findAll({ order: [['created_at','DESC']], limit: 100 });
  res.json({ success: true, data: rows.map(x => ({ id:x.id, server_id:x.server_id, os:x.os, architecture:x.architecture, expires_at:x.expires_at, used_at:x.used_at, revoked_at:x.revoked_at })) });
});

router.post('/register/:token', async (req, res) => {
  try {
    const os = String(req.body.os || '').toLowerCase() === 'windows' ? 'Windows' : 'Linux';
    const result = await enrollAgent({ token: req.params.token, os, payload: req.body, req });
    const io = req.app.get('io');
    io?.emit('agent:connected', { server_id: result.server.id, name: result.server.name, hostname: result.server.hostname, private_ip: result.server.private_ip, public_ip: result.server.public_ip, status: 'online' });
    res.status(201).json({ success: true, message: 'Agent enrolled successfully', data: { server_id: result.server.id, server_name: result.server.name, api_key: result.apiKey, main_server: `${req.protocol}://${req.get('host')}` } });
  } catch (e) { res.status(403).json({ success: false, message: e.message }); }
});

router.post('/:id/revoke', auth, async (req, res) => {
  const AgentEnrollment = require('../../models/AgentEnrollment');
  const row = await AgentEnrollment.findByPk(req.params.id);
  if (!row) return res.status(404).json({ success:false, message:'Enrollment not found' });
  await row.update({ revoked_at: new Date() });
  res.json({ success:true, message:'Enrollment revoked' });
});

module.exports = router;
