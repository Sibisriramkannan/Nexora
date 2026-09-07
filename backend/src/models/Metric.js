const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Metric = sequelize.define('Metric', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    server_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'servers', key: 'id' } },
    cpu: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    memory: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    disk: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    process_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    uptime: { type: DataTypes.BIGINT, allowNull: true },
    timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'metrics',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['server_id', 'timestamp'] },
        { fields: ['timestamp'] }
    ]
});

module.exports = Metric;
