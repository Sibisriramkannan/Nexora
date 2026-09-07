const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    severity: {
        type: DataTypes.ENUM('critical', 'high', 'warning', 'info'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('triggered', 'acknowledged', 'resolved', 'muted'),
        defaultValue: 'triggered'
    },
    // ✅ FIX 11: Add 'agent' to enum
    source_type: {
        type: DataTypes.ENUM(
            'monitor',
            'scanner',
            'system',
            'agent'  // ✅ Added 'agent'
        ),
        allowNull: false
    },
    source_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    server_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'servers',
            key: 'id'
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    details: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    triggered_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    acknowledged_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    acknowledged_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resolved_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    muted_until: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notification_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    notification_channels: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    escalated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    escalation_level: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    duplicate_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['status', 'severity']
        },
        {
            fields: ['triggered_at']
        },
        {
            fields: ['server_id']
        }
    ]
});

module.exports = Alert;