const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Config = sequelize.define('Config', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    category: {
        type: DataTypes.ENUM('system', 'server', 'monitor', 'alert', 'security', 'integration'),
        allowNull: false
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_encrypted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true,
    uniqueKeys: {
        unique_config: {
            fields: ['category', 'key']
        }
    }
});

module.exports = Config;