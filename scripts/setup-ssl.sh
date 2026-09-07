#!/bin/bash

# SSL Certificate Setup Script
# Usage: ./setup-ssl.sh --domain=<domain> --email=<email>

set -e

echo "🔒 Nexora SSL Setup"
echo "==================="

# Parse arguments
for arg in "$@"; do
    case $arg in
        --domain=*)
            DOMAIN="${arg#*=}"
            ;;
        --email=*)
            EMAIL="${arg#*=}"
            ;;
        *)
            echo "Unknown argument: $arg"
            exit 1
            ;;
    esac
done

# Check required arguments
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "❌ Missing required arguments"
    echo "Usage: ./setup-ssl.sh --domain=<domain> --email=<email>"
    exit 1
fi

echo "📋 SSL Parameters:"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"

# Install certbot
echo "📥 Installing certbot..."
if command -v apt-get &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
elif command -v yum &> /dev/null; then
    yum install -y certbot python3-certbot-nginx
else
    echo "❌ Unsupported package manager"
    exit 1
fi

# Obtain certificate
echo "🔑 Obtaining SSL certificate..."
certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# Auto-renewal
echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet") | crontab -

echo "✅ SSL setup complete!"
echo "🔒 Certificate installed for: $DOMAIN"
echo "🔄 Auto-renewal configured"