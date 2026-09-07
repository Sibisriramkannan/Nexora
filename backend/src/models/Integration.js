const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Integration = sequelize.define('Integration', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('slack', 'email', 'telegram', 'pagerduty', 'jira', 'webhook', 'discord'),
        allowNull: false
    },
    config: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    events: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: ['critical', 'high', 'warning']
    },
    last_test: {
        type: DataTypes.DATE,
        allowNull: true
    },
    test_status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        defaultValue: 'pending'
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = Integration;