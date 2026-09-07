const { sequelize } = require('../config/database');
const User = require('./User');
const Server = require('./Server');
const Monitor = require('./Monitor');
const Scan = require('./Scan');
const Alert = require('./Alert');
const Integration = require('./Integration');
const Config = require('./Config');
const Metric = require('./Metric');
const ScanSchedule = require('./ScanSchedule');
const AgentEnrollment = require('./AgentEnrollment');

// Define associations
Server.hasMany(Monitor, { foreignKey: 'server_id' });
Monitor.belongsTo(Server, { foreignKey: 'server_id' });

Server.hasMany(Alert, { foreignKey: 'server_id' });
Alert.belongsTo(Server, { foreignKey: 'server_id' });

User.hasMany(Server, { foreignKey: 'created_by' });
Server.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(Monitor, { foreignKey: 'created_by' });
Monitor.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(Scan, { foreignKey: 'created_by' });
Scan.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(Alert, { foreignKey: 'acknowledged_by' });
Alert.belongsTo(User, { foreignKey: 'acknowledged_by' });

User.hasMany(Alert, { foreignKey: 'resolved_by' });
Alert.belongsTo(User, { foreignKey: 'resolved_by' });

User.hasMany(Integration, { foreignKey: 'created_by' });
Integration.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(Config, { foreignKey: 'updated_by' });
Config.belongsTo(User, { foreignKey: 'updated_by' });

module.exports = {
    sequelize,
    User,
    Server,
    Monitor,
    Scan,
    Alert,
    Integration,
    Config,
    Metric,
    ScanSchedule,
    AgentEnrollment
};