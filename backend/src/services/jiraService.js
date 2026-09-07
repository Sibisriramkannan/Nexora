const axios = require('axios');
const logger = require('../utils/logger');

class JiraService {
    constructor() {
        this.url = process.env.JIRA_URL;
        this.projectKey = process.env.JIRA_PROJECT_KEY;
        this.username = process.env.JIRA_USERNAME;
        this.apiToken = process.env.JIRA_API_TOKEN;
        this.enabled = !!this.url && !!this.projectKey && !!this.username && !!this.apiToken;
        this.auth = Buffer.from(`${this.username}:${this.apiToken}`).toString('base64');
        this.headers = {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
        };
    }

    // Create issue in Jira
    async createIssue(alert) {
        if (!this.enabled) {
            logger.warn('⚠️ Jira not configured');
            return { success: false, error: 'Jira not configured' };
        }

        try {
            const severityLabels = {
                critical: ['critical', 'security'],
                high: ['high', 'security'],
                warning: ['warning'],
                info: ['info']
            };

            const labels = severityLabels[alert.severity] || ['alert'];

            const issue = {
                fields: {
                    project: {
                        key: this.projectKey
                    },
                    summary: `[${alert.severity.toUpperCase()}] ${alert.message}`,
                    description: {
                        version: 1,
                        type: 'doc',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: `Alert Details:`
                                    }
                                ]
                            },
                            {
                                type: 'bulletList',
                                content: [
                                    {
                                        type: 'listItem',
                                        content: [
                                            {
                                                type: 'paragraph',
                                                content: [
                                                    {
                                                        type: 'text',
                                                        text: `Severity: ${alert.severity.toUpperCase()}`
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        type: 'listItem',
                                        content: [
                                            {
                                                type: 'paragraph',
                                                content: [
                                                    {
                                                        type: 'text',
                                                        text: `Message: ${alert.message}`
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        type: 'listItem',
                                        content: [
                                            {
                                                type: 'paragraph',
                                                content: [
                                                    {
                                                        type: 'text',
                                                        text: `Time: ${new Date(alert.triggered_at).toLocaleString()}`
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    labels: labels,
                    issuetype: {
                        name: this.getIssueType(alert.severity)
                    },
                    priority: {
                        name: this.getPriority(alert.severity)
                    },
                    customfield_10001: alert.id // Store alert ID for reference
                }
            };

            // Add server details if available
            if (alert.details?.server_name) {
                issue.fields.description.content.push(
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `\nServer: ${alert.details.server_name}`
                            }
                        ]
                    }
                );
            }

            if (alert.details?.server_ip) {
                issue.fields.description.content.push(
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `IP: ${alert.details.server_ip}`
                            }
                        ]
                    }
                );
            }

            if (alert.details?.description) {
                issue.fields.description.content.push(
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `\nDescription: ${alert.details.description}`
                            }
                        ]
                    }
                );
            }

            if (alert.details?.remediation) {
                issue.fields.description.content.push(
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `\nRemediation: ${alert.details.remediation}`
                            }
                        ]
                    }
                );
            }

            // Add link to Nexora
            issue.fields.description.content.push(
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: `\n🔗 View in Nexora: ${process.env.FRONTEND_URL}/alerts/${alert.id}`
                        }
                    ]
                }
            );

            const response = await axios.post(
                `${this.url}/rest/api/2/issue`,
                issue,
                { headers: this.headers }
            );

            if (response.data && response.data.key) {
                logger.info(`✅ Jira issue created: ${response.data.key}`);
                return {
                    success: true,
                    issue_key: response.data.key,
                    issue_url: `${this.url}/browse/${response.data.key}`
                };
            } else {
                throw new Error('Jira API error: No issue key returned');
            }
        } catch (error) {
            logger.error('❌ Jira create issue error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Update issue
    async updateIssue(issueKey, alert) {
        if (!this.enabled) {
            return { success: false, error: 'Jira not configured' };
        }

        try {
            const update = {
                fields: {
                    summary: `[${alert.severity.toUpperCase()}] ${alert.message}`,
                    labels: ['updated', alert.severity]
                }
            };

            // Add comment
            const comment = {
                body: {
                    version: 1,
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: `Alert updated. Status: ${alert.status}\n`
                                }
                            ]
                        },
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: `Last updated: ${new Date().toLocaleString()}`
                                }
                            ]
                        }
                    ]
                }
            };

            await axios.post(
                `${this.url}/rest/api/2/issue/${issueKey}/comment`,
                comment,
                { headers: this.headers }
            );

            logger.info(`✅ Jira issue updated: ${issueKey}`);
            return { success: true };
        } catch (error) {
            logger.error('❌ Jira update issue error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Resolve issue
    async resolveIssue(issueKey) {
        if (!this.enabled) {
            return { success: false, error: 'Jira not configured' };
        }

        try {
            // Transition to resolved
            const transition = {
                transition: {
                    id: 'resolved' // This may vary per Jira configuration
                },
                fields: {
                    resolution: {
                        name: 'Done'
                    }
                }
            };

            await axios.post(
                `${this.url}/rest/api/2/issue/${issueKey}/transitions`,
                transition,
                { headers: this.headers }
            );

            // Add resolution comment
            const comment = {
                body: {
                    version: 1,
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: '✅ Alert resolved successfully.'
                                }
                            ]
                        }
                    ]
                }
            };

            await axios.post(
                `${this.url}/rest/api/2/issue/${issueKey}/comment`,
                comment,
                { headers: this.headers }
            );

            logger.info(`✅ Jira issue resolved: ${issueKey}`);
            return { success: true };
        } catch (error) {
            logger.error('❌ Jira resolve issue error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Get issue type based on severity
    getIssueType(severity) {
        const types = {
            critical: 'Incident',
            high: 'Bug',
            warning: 'Task',
            info: 'Task'
        };
        return types[severity] || 'Task';
    }

    // Get priority based on severity
    getPriority(severity) {
        const priorities = {
            critical: 'Highest',
            high: 'High',
            warning: 'Medium',
            info: 'Low'
        };
        return priorities[severity] || 'Medium';
    }

    // Get issue by key
    async getIssue(issueKey) {
        if (!this.enabled) {
            return { success: false, error: 'Jira not configured' };
        }

        try {
            const response = await axios.get(
                `${this.url}/rest/api/2/issue/${issueKey}`,
                { headers: this.headers }
            );
            return { success: true, data: response.data };
        } catch (error) {
            logger.error('❌ Jira get issue error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Search issues
    async searchIssues(jql, fields = []) {
        if (!this.enabled) {
            return { success: false, error: 'Jira not configured' };
        }

        try {
            const params = {
                jql: jql,
                fields: fields.join(',')
            };

            const response = await axios.get(
                `${this.url}/rest/api/2/search`,
                {
                    headers: this.headers,
                    params: params
                }
            );
            return { success: true, data: response.data };
        } catch (error) {
            logger.error('❌ Jira search error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Get project info
    async getProjectInfo() {
        if (!this.enabled) {
            return { success: false, error: 'Jira not configured' };
        }

        try {
            const response = await axios.get(
                `${this.url}/rest/api/2/project/${this.projectKey}`,
                { headers: this.headers }
            );
            return { success: true, data: response.data };
        } catch (error) {
            logger.error('❌ Jira project info error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton
const jiraService = new JiraService();
module.exports = jiraService;