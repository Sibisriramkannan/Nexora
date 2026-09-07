const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AgentEnrollment = sequelize.define('AgentEnrollment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  token_hash: { type: DataTypes.STRING(128), allowNull: false, unique: true },
  server_id: { type: DataTypes.UUID, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  used_at: { type: DataTypes.DATE, allowNull: true },
  revoked_at: { type: DataTypes.DATE, allowNull: true },
  created_by: { type: DataTypes.UUID, allowNull: true },
  os: { type: DataTypes.ENUM('Linux', 'Windows'), allowNull: false },
  architecture: { type: DataTypes.ENUM('x64', 'arm64'), allowNull: false, defaultValue: 'x64' }
}, { timestamps: true, underscored: true, tableName: 'agent_enrollments' });

module.exports = AgentEnrollment;
