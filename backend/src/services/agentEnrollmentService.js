const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const AgentEnrollment = require('../models/AgentEnrollment');
const Server = require('../models/Server');
const logger = require('../utils/logger');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const makeToken = () => crypto.randomBytes(32).toString('base64url');

async function createEnrollment({ serverId, os, architecture = 'x64', createdBy, ttlMinutes = 60 }) {
  const server = await Server.findByPk(serverId);
  if (!server) throw new Error('Server not found');
  if (!['Linux', 'Windows'].includes(os)) throw new Error('Unsupported agent OS');
  const token = makeToken();
  const enrollment = await AgentEnrollment.create({
    id: uuidv4(), token_hash: hashToken(token), server_id: serverId,
    expires_at: new Date(Date.now() + Math.min(Math.max(ttlMinutes, 5), 1440) * 60000),
    created_by: createdBy || null, os, architecture
  });
  return { enrollment, token };
}

async function consumeEnrollment(token, os) {
  if (!token) throw new Error('Enrollment token is required');
  const enrollment = await AgentEnrollment.findOne({ where: { token_hash: hashToken(token) } });
  if (!enrollment) throw new Error('Invalid enrollment token');
  if (enrollment.revoked_at) throw new Error('Enrollment token revoked');
  if (enrollment.used_at) throw new Error('Enrollment token already used');
  if (new Date(enrollment.expires_at) <= new Date()) throw new Error('Enrollment token expired');
  if (os && enrollment.os !== os) throw new Error('Enrollment token OS mismatch');
  await enrollment.update({ used_at: new Date() });
  return enrollment;
}

function getObservedPublicIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.ip?.replace(/^::ffff:/, '') || null;
}

async function enrollAgent({ token, os, payload, req }) {
  const enrollment = await consumeEnrollment(token, os);
  const server = await Server.findByPk(enrollment.server_id);
  if (!server) throw new Error('Target server no longer exists');
  const privateIp = payload.private_ip || payload.ip || null;
  const publicIp = getObservedPublicIp(req);
  const networkInterfaces = Array.isArray(payload.network_interfaces) ? payload.network_interfaces : [];
  const ipv6 = Array.isArray(payload.ipv6_addresses) ? payload.ipv6_addresses : [];
  const apiKey = `nexora_${crypto.randomBytes(32).toString('hex')}`;
  await server.update({
    hostname: payload.hostname || server.hostname,
    ip_address: privateIp || publicIp || server.ip_address,
    private_ip: privateIp,
    public_ip: publicIp || payload.public_ip || null,
    ipv6_addresses: ipv6,
    network_interfaces: networkInterfaces,
    os,
    agent_installed: true,
    agent_version: payload.version || '1.0.0',
    status: 'online',
    last_seen: new Date(),
    api_key: apiKey
  });
  logger.info(`Agent enrolled: ${server.name}`);
  return { server, apiKey };
}

module.exports = { createEnrollment, enrollAgent };
