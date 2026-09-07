const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScanSchedule = sequelize.define('ScanSchedule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  scan_type: { type: DataTypes.ENUM('network','web','compliance','full'), allowNull: false },
  targets: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
  cron: { type: DataTypes.STRING, allowNull: false },
  timezone: { type: DataTypes.STRING, allowNull: false, defaultValue: 'UTC' },
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  profile: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  next_run_at: { type: DataTypes.DATE, allowNull: true },
  last_run_at: { type: DataTypes.DATE, allowNull: true },
  last_status: { type: DataTypes.STRING, allowNull: true },
  created_by: { type: DataTypes.UUID, allowNull: false }
}, { timestamps: true, underscored: true });

module.exports = ScanSchedule;
