const Config = require('../../models/Config');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const yaml = require('js-yaml');

// Get all config
exports.getAllConfig = async (req, res) => {
    try {
        const config = await Config.findAll({
            order: [['category', 'ASC'], ['key', 'ASC']]
        });
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch config',
            error: error.message
        });
    }
};

// Get config by category
exports.getConfigByCategory = async (req, res) => {
    try {
        const config = await Config.findAll({
            where: { category: req.params.category },
            order: [['key', 'ASC']]
        });
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error fetching config by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch config',
            error: error.message
        });
    }
};

// Get specific config
exports.getConfig = async (req, res) => {
    try {
        const { category, key } = req.params;
        const config = await Config.findOne({
            where: { category, key }
        });
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Configuration not found'
            });
        }
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch config',
            error: error.message
        });
    }
};

// Update config
exports.updateConfig = async (req, res) => {
    try {
        const { config } = req.body;
        const updates = [];

        for (const item of config) {
            const existing = await Config.findOne({
                where: { category: item.category, key: item.key }
            });

            if (existing) {
                await existing.update({
                    value: item.value,
                    description: item.description || existing.description,
                    updated_by: req.user.id
                });
                updates.push(existing);
            } else {
                const newConfig = await Config.create({
                    id: uuidv4(),
                    category: item.category,
                    key: item.key,
                    value: item.value,
                    description: item.description || '',
                    updated_by: req.user.id
                });
                updates.push(newConfig);
            }
        }

        res.json({
            success: true,
            data: updates,
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update config',
            error: error.message
        });
    }
};

// Update specific config
exports.updateSpecificConfig = async (req, res) => {
    try {
        const { category, key } = req.params;
        const { value, description } = req.body;

        let config = await Config.findOne({
            where: { category, key }
        });

        if (config) {
            await config.update({
                value,
                description: description || config.description,
                updated_by: req.user.id
            });
        } else {
            config = await Config.create({
                id: uuidv4(),
                category,
                key,
                value,
                description: description || '',
                updated_by: req.user.id
            });
        }

        res.json({
            success: true,
            data: config,
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update config',
            error: error.message
        });
    }
};

// Import config from file
exports.importConfig = async (req, res) => {
    try {
        const { content, format = 'json' } = req.body;
        let configData;

        if (format === 'yaml' || format === 'yml') {
            configData = yaml.load(content);
        } else {
            configData = JSON.parse(content);
        }

        const imports = [];
        for (const [category, values] of Object.entries(configData)) {
            for (const [key, value] of Object.entries(values)) {
                let config = await Config.findOne({
                    where: { category, key }
                });

                const description = typeof value === 'object' ? JSON.stringify(value) : String(value);

                if (config) {
                    await config.update({
                        value: typeof value === 'object' ? value : { value },
                        description: description,
                        updated_by: req.user.id
                    });
                } else {
                    config = await Config.create({
                        id: uuidv4(),
                        category,
                        key,
                        value: typeof value === 'object' ? value : { value },
                        description: description,
                        updated_by: req.user.id
                    });
                }
                imports.push(config);
            }
        }

        res.json({
            success: true,
            data: imports,
            message: `Imported ${imports.length} configurations`
        });
    } catch (error) {
        console.error('Error importing config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import config',
            error: error.message
        });
    }
};

// Export config
exports.exportConfig = async (req, res) => {
    try {
        const config = await Config.findAll({
            order: [['category', 'ASC'], ['key', 'ASC']]
        });

        const exportData = {};
        for (const item of config) {
            if (!exportData[item.category]) {
                exportData[item.category] = {};
            }
            exportData[item.category][item.key] = item.value;
        }

        res.json({
            success: true,
            data: exportData
        });
    } catch (error) {
        console.error('Error exporting config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export config',
            error: error.message
        });
    }
};