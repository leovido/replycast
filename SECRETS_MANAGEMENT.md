# 🔐 Secrets Management Strategy

## Overview

This project uses **GPG encryption** for secrets management, allowing contributors to use their own API keys and environments without exposing production secrets.

## 🎯 Strategy Goals

- ✅ **Contributors can develop** without production API keys
- ✅ **Secrets are encrypted** in the repository
- ✅ **Environment-specific** configurations
- ✅ **No production keys** in contributor hands
- ✅ **Easy onboarding** for new contributors

## 🔧 Implementation

### **1. GPG Key Setup**

Each contributor needs their own GPG key:

```bash
# Generate GPG key (if you don't have one)
gpg --full-generate-key

# Export your public key
gpg --armor --export your-email@example.com > public-keys/contributor-name.asc

# Add to repository
git add public-keys/contributor-name.asc
git commit -m "Add GPG key for contributor-name"
```

### **2. Environment Structure**

```
├── .env.example                 # Template for all environments
├── .env.local                  # Local development (gitignored)
├── .env.staging                # Staging environment (encrypted)
├── .env.production             # Production environment (encrypted)
├── public-keys/                # GPG public keys
│   ├── maintainer.asc
│   └── contributor.asc
└── scripts/
    ├── encrypt-secrets.sh      # Encrypt environment files
    └── decrypt-secrets.sh      # Decrypt environment files
```

### **3. Encryption Script**

Create `scripts/encrypt-secrets.sh`:

```bash
#!/bin/bash
# Encrypt environment files for all contributors

ENCRYPTED_DIR="encrypted-envs"
PUBLIC_KEYS_DIR="public-keys"

# Create encrypted directory
mkdir -p $ENCRYPTED_DIR

# Get list of contributors
CONTRIBUTORS=($(ls $PUBLIC_KEYS_DIR/*.asc | sed 's/.*\///' | sed 's/\.asc$//'))

for contributor in "${CONTRIBUTORS[@]}"; do
    echo "🔐 Encrypting secrets for $contributor..."

    # Encrypt staging environment
    if [ -f ".env.staging" ]; then
        gpg --encrypt --armor --recipient "$contributor" --output "$ENCRYPTED_DIR/.env.staging.$contributor.asc" .env.staging
    fi

    # Encrypt production environment
    if [ -f ".env.production" ]; then
        gpg --encrypt --armor --recipient "$contributor" --output "$ENCRYPTED_DIR/.env.production.$contributor.asc" .env.production
    fi
done

echo "✅ All secrets encrypted for contributors"
```

### **4. Decryption Script**

Create `scripts/decrypt-secrets.sh`:

```bash
#!/bin/bash
# Decrypt environment files for current user

ENCRYPTED_DIR="encrypted-envs"
CONTRIBUTOR_NAME=${1:-$(whoami)}

echo "🔓 Decrypting secrets for $CONTRIBUTOR_NAME..."

# Decrypt staging environment
if [ -f "$ENCRYPTED_DIR/.env.staging.$CONTRIBUTOR_NAME.asc" ]; then
    gpg --decrypt --output .env.staging "$ENCRYPTED_DIR/.env.staging.$CONTRIBUTOR_NAME.asc"
    echo "✅ Staging environment decrypted"
else
    echo "⚠️  No staging environment found for $CONTRIBUTOR_NAME"
fi

# Decrypt production environment
if [ -f "$ENCRYPTED_DIR/.env.production.$CONTRIBUTOR_NAME.asc" ]; then
    gpg --decrypt --output .env.production "$ENCRYPTED_DIR/.env.production.$CONTRIBUTOR_NAME.asc"
    echo "✅ Production environment decrypted"
else
    echo "⚠️  No production environment found for $CONTRIBUTOR_NAME"
fi
```

### **5. Contributor Onboarding**

Create `CONTRIBUTOR_SETUP.md`:

````markdown
# 👋 Contributor Setup Guide

## 1. Environment Setup

### Option A: Use Your Own API Keys (Recommended)

```bash
# Copy the example environment
cp .env.example .env.local

# Add your own API keys
# - Get Neynar API key from https://neynar.com
# - Get Quotient API key from their platform
# - Set NEXT_PUBLIC_USE_MOCKS=false
```
````

### Option B: Use Encrypted Staging Environment

```bash
# Decrypt staging environment (if you have access)
./scripts/decrypt-secrets.sh your-name

# This will create .env.staging with staging API keys
```

## 2. Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint
```

## 3. API Key Sources

- **Neynar**: https://neynar.com (Free tier available)
- **Quotient**: Contact maintainers for access
- **Mock Mode**: Set `NEXT_PUBLIC_USE_MOCKS=true` for development

````

## 🔄 Workflow

### **For Maintainers**
1. **Add contributor's GPG key** to `public-keys/`
2. **Encrypt environments** using `./scripts/encrypt-secrets.sh`
3. **Commit encrypted files** to repository
4. **Share decryption instructions** with contributor

### **For Contributors**
1. **Set up GPG key** and share public key
2. **Use own API keys** in `.env.local` (recommended)
3. **Or decrypt staging environment** if provided
4. **Never commit** `.env.local` or decrypted files

## 🛡️ Security Benefits

- ✅ **No production keys** in contributor hands
- ✅ **Encrypted secrets** in repository
- ✅ **Individual access control** via GPG
- ✅ **Easy revocation** by removing GPG key
- ✅ **Audit trail** of who has access

## 🚀 Alternative: Environment-Specific Configs

For simpler setup, use environment-specific configurations:

```typescript
// utils/config.ts
const config = {
  development: {
    neynarApiKey: process.env.NEYNAR_API_KEY || 'mock-key',
    quotientApiKey: process.env.QUOTIENT_API_KEY || 'mock-key',
    useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
  },
  staging: {
    neynarApiKey: process.env.NEYNAR_API_KEY!,
    quotientApiKey: process.env.QUOTIENT_API_KEY!,
    useMocks: false
  },
  production: {
    neynarApiKey: process.env.NEYNAR_API_KEY!,
    quotientApiKey: process.env.QUOTIENT_API_KEY!,
    useMocks: false
  }
};

export default config[process.env.NODE_ENV || 'development'];
````

## 📋 Checklist for New Contributors

- [ ] **GPG key** generated and shared
- [ ] **API keys** obtained (Neynar, Quotient)
- [ ] **Environment file** created (`.env.local`)
- [ ] **Development server** running (`pnpm dev`)
- [ ] **Tests passing** (`pnpm test`)
- [ ] **Linting clean** (`pnpm lint`)

---

_This approach ensures contributors can develop effectively while maintaining security and access control._
