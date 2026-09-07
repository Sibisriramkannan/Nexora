const { sequelize } = require('../config/database');
const logger = require('./logger');

class DatabaseManager {
    constructor() {
        this.connected = false;
        this.retryCount = 0;
        this.maxRetries = 5;
    }

    // ✅ FIX 12: Complete database initialization
    async initialize() {
        try {
            await this.connect();
            await this.syncModels();
            this.connected = true;
            logger.info('✅ Database initialized successfully');
            return true;
        } catch (error) {
            logger.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    async connect() {
        try {
            await sequelize.authenticate();
            logger.info('✅ Database connection established');
            return true;
        } catch (error) {
            logger.error('❌ Database connection failed:', error);
            
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
                logger.info(`🔄 Retrying connection in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.connect();
            }
            
            throw error;
        }
    }

    // ✅ FIX 12: Sync models with database
    async syncModels() {
        try {
            // Import all models
            const User = require('../models/User');
            const Server = require('../models/Server');
            const Monitor = require('../models/Monitor');
            const Scan = require('../models/Scan');
            const Alert = require('../models/Alert');
            const Integration = require('../models/Integration');
            const Config = require('../models/Config');
            const Metric = require('../models/Metric');
            const ScanSchedule = require('../models/ScanSchedule');
            
            // Sync all models
            await sequelize.sync({ alter: true });
            logger.info('✅ Database schema synced');
            
            // Create default admin user if none exists
            await this.createDefaultAdmin();
            
            return true;
        } catch (error) {
            logger.error('❌ Database sync failed:', error);
            throw error;
        }
    }

    async createDefaultAdmin() {
        try {
            const User = require('../models/User');
            const bcrypt = require('bcrypt');
            
            const adminExists = await User.findOne({ where: { email: 'admin@nexora.com' } });
            if (!adminExists) {
                const salt = await bcrypt.genSalt(10);
                const password = process.env.NEXORA_ADMIN_PASSWORD || require('crypto').randomBytes(18).toString('base64url');
                const hashedPassword = await bcrypt.hash(password, salt);
                
                await User.create({
                    id: require('uuid').v4(),
                    name: 'Administrator',
                    email: 'admin@nexora.com',
                    password: hashedPassword,
                    role: 'admin',
                    status: 'active'
                });
                logger.info('✅ Default admin user created');
                logger.info('📧 Email: admin@nexora.com');
                logger.info('🔑 Initial password was generated securely and is available in the installer output/secret store.');
            }
        } catch (error) {
            logger.error('❌ Create default admin error:', error);
        }
    }

    async close() {
        try {
            await sequelize.close();
            this.connected = false;
            logger.info('✅ Database connection closed');
            return true;
        } catch (error) {
            logger.error('❌ Database close failed:', error);
            throw error;
        }
    }

    async healthCheck() {
        try {
            await sequelize.authenticate();
            return { status: 'healthy' };
        } catch (error) {
            logger.error('❌ Database health check failed:', error);
            return { status: 'unhealthy', error: error.message };
        }
    }
}

// Export singleton
const dbManager = new DatabaseManager();
module.exports = dbManager;