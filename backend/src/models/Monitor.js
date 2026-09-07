const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Monitor = sequelize.define('Monitor', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // ✅ FIX 10: Add 'system' to enum
    type: {
        type: DataTypes.ENUM(
            'http',
            'https',
            'ping',
            'tcp',
            'dns',
            'ssl',
            'system'  // ✅ Added 'system'
        ),
        allowNull: false
    },
    target: {
        type: DataTypes.STRING,
        allowNull: false
    },
    port: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    interval: {
        type: DataTypes.INTEGER,
        defaultValue: 60
    },
    timeout: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    retries: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    status: {
        type: DataTypes.ENUM('up', 'down', 'warning', 'unknown'),
        defaultValue: 'unknown'
    },
    response_time: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    last_check: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_status_change: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fail_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    success_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    uptime_percentage: {
        type: DataTypes.FLOAT,
        defaultValue: 100
    },
    thresholds: {
        type: DataTypes.JSONB,
        defaultValue: {
            warning: 2000,
            critical: 5000
        }
    },
    config: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    server_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'servers',
            key: 'id'
        }
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = Monitor;