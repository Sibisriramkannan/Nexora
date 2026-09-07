const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scan = sequelize.define('Scan', {
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
        type: DataTypes.ENUM('network', 'web', 'compliance', 'full'),
        allowNull: false
    },
    targets: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    options: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    schedule: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending'
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    results: {
        type: DataTypes.JSONB,
        defaultValue: {
            findings: [],
            summary: {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            }
        }
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = Scan;