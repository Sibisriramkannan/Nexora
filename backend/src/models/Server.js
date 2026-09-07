const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Server = sequelize.define('Server', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    hostname: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ip_address: { type: DataTypes.STRING, allowNull: true },
    private_ip: { type: DataTypes.STRING, allowNull: true },
    public_ip: { type: DataTypes.STRING, allowNull: true },
    ipv6_addresses: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    network_interfaces: { type: DataTypes.JSONB, defaultValue: [] },
    port: {
        type: DataTypes.INTEGER,
        defaultValue: 22
    },
    os: {
        type: DataTypes.ENUM('Linux', 'Windows', 'macOS', 'Unknown'),
        defaultValue: 'Unknown'
    },
    environment: {
        type: DataTypes.ENUM('production', 'staging', 'development'),
        defaultValue: 'development'
    },
    group: {
        type: DataTypes.STRING,
        defaultValue: 'Default'
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('online', 'offline', 'warning', 'unknown'),
        defaultValue: 'unknown'
    },
    agent_installed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    agent_version: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // ✅ FIX 9: Add api_key field
    api_key: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    last_seen: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cpu_usage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    memory_usage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    disk_usage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    uptime: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ssh_username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ssh_password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ssh_key: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    monitor_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    scan_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = Server;