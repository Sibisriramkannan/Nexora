const fs = require('fs');
const { Op } = require('sequelize');
const Metric = require('../models/Metric');
const logger = require('../utils/logger');

const getRoot = () => process.env.NEXORA_DATA_DIR || '/var/lib/nexora';
function diskUsagePercent(path = getRoot()) {
  try {
    const stat = fs.statfsSync(path);
    return 100 - (Number(stat.bavail) / Number(stat.blocks || 1)) * 100;
  } catch { return null; }
}
async function enforceMetricRetention() {
  const days = Math.max(Number(process.env.METRIC_RETENTION_DAYS || 30), 1);
  const cutoff = new Date(Date.now() - days * 86400000);
  const result = await Metric.destroy({ where: { timestamp: { [Op.lt]: cutoff } } });
  if (result) logger.info(`Storage retention removed ${result} metric rows older than ${days} days`);
  return result;
}
async function guardStorage() {
  const usage = diskUsagePercent();
  const warning = Number(process.env.STORAGE_WARNING_PERCENT || 80);
  const critical = Number(process.env.STORAGE_CRITICAL_PERCENT || 90);
  if (usage != null && usage >= critical) {
    logger.error(`Nexora storage critical: ${usage.toFixed(1)}% used`);
    await enforceMetricRetention();
  } else if (usage != null && usage >= warning) {
    logger.warn(`Nexora storage warning: ${usage.toFixed(1)}% used`);
  }
  return usage;
}
function startStorageGuard() {
  const interval = Math.max(Number(process.env.STORAGE_GUARD_INTERVAL_SECONDS || 300), 60) * 1000;
  const run = async () => { try { await guardStorage(); await enforceMetricRetention(); } catch (e) { logger.error('Storage guard failed:', e); } };
  run();
  const timer = setInterval(run, interval); timer.unref?.(); return timer;
}
module.exports = { diskUsagePercent, enforceMetricRetention, guardStorage, startStorageGuard };
