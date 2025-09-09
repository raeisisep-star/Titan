#!/bin/bash

# TITAN Trading System - Database Setup Script
# Sets up D1 database for production and local development

set -e

echo "🗄️ TITAN Trading System - Database Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI is not installed. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    print_error "You are not logged in to Cloudflare. Please login first:"
    echo "wrangler login"
    exit 1
fi

print_success "Wrangler CLI is ready"

# Get project name from wrangler.jsonc
PROJECT_NAME=$(grep -o '"name": *"[^"]*"' wrangler.jsonc | cut -d'"' -f4)
if [ -z "$PROJECT_NAME" ]; then
    PROJECT_NAME="titan-trading"
    print_warning "Could not detect project name from wrangler.jsonc, using default: $PROJECT_NAME"
else
    print_status "Project name: $PROJECT_NAME"
fi

DATABASE_NAME="${PROJECT_NAME}-production"

echo ""
print_status "This script will set up:"
echo "  📊 Production D1 Database: $DATABASE_NAME"
echo "  🔄 Database migrations"
echo "  🧪 Local development database"
echo "  ✅ Database validation and testing"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

echo ""

# Function to check if database exists
check_database_exists() {
    local db_name=$1
    wrangler d1 list | grep -q "$db_name" 2>/dev/null
}

# Step 1: Create production database if it doesn't exist
print_status "=== Step 1: Production Database Setup ==="

if check_database_exists "$DATABASE_NAME"; then
    print_warning "Database '$DATABASE_NAME' already exists"
    
    read -p "Do you want to use the existing database? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_error "Please choose a different database name or delete the existing one"
        exit 1
    fi
    
    print_success "Using existing database: $DATABASE_NAME"
else
    print_status "Creating production database: $DATABASE_NAME"
    
    # Create the database and capture the output
    DB_OUTPUT=$(wrangler d1 create "$DATABASE_NAME" 2>&1)
    
    if [ $? -eq 0 ]; then
        print_success "✅ Database created successfully"
        echo ""
        echo "Database details:"
        echo "$DB_OUTPUT"
        echo ""
        
        # Extract database ID from output
        DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
        
        if [ -n "$DB_ID" ]; then
            print_status "Database ID: $DB_ID"
            
            # Update wrangler.jsonc with the database ID
            if [ -f "wrangler.jsonc" ]; then
                print_status "Updating wrangler.jsonc with database ID..."
                
                # Create a backup
                cp wrangler.jsonc wrangler.jsonc.backup
                
                # Replace the placeholder database ID
                if grep -q "placeholder-will-be-updated-after-creation" wrangler.jsonc; then
                    sed -i.bak "s/placeholder-will-be-updated-after-creation/$DB_ID/g" wrangler.jsonc
                    print_success "✅ wrangler.jsonc updated with database ID"
                else
                    print_warning "Could not find placeholder in wrangler.jsonc. Please update manually:"
                    echo "  \"database_id\": \"$DB_ID\""
                fi
            fi
        else
            print_warning "Could not extract database ID from output. Please update wrangler.jsonc manually"
        fi
    else
        print_error "Failed to create database"
        echo "$DB_OUTPUT"
        exit 1
    fi
fi

# Step 2: Run migrations
print_status "=== Step 2: Database Migrations ==="

if [ -d "migrations" ]; then
    migration_files=(migrations/*.sql)
    if [ ${#migration_files[@]} -gt 0 ] && [ -f "${migration_files[0]}" ]; then
        print_status "Found ${#migration_files[@]} migration files"
        
        for migration in "${migration_files[@]}"; do
            migration_name=$(basename "$migration")
            print_status "Applying migration: $migration_name"
            
            if wrangler d1 migrations apply "$DATABASE_NAME" --local; then
                print_success "✅ Local migration applied: $migration_name"
            else
                print_error "❌ Local migration failed: $migration_name"
                exit 1
            fi
        done
        
        # Apply to production
        read -p "Apply migrations to production database? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Applying migrations to production..."
            
            if wrangler d1 migrations apply "$DATABASE_NAME"; then
                print_success "✅ Production migrations applied successfully"
            else
                print_error "❌ Production migration failed"
                print_warning "Local migrations were applied, but production failed"
                print_warning "You can retry later with: wrangler d1 migrations apply $DATABASE_NAME"
            fi
        else
            print_warning "Production migrations skipped. You can apply them later with:"
            echo "wrangler d1 migrations apply $DATABASE_NAME"
        fi
    else
        print_warning "No migration files found in migrations/ directory"
    fi
else
    print_error "Migrations directory not found"
    exit 1
fi

# Step 3: Test database
print_status "=== Step 3: Database Testing ==="

print_status "Testing local database connection..."

# Test basic query
if wrangler d1 execute "$DATABASE_NAME" --local --command="SELECT 1 as test" >/dev/null 2>&1; then
    print_success "✅ Local database connection successful"
else
    print_error "❌ Local database connection failed"
    exit 1
fi

# List tables
print_status "Checking database tables..."
TABLE_OUTPUT=$(wrangler d1 execute "$DATABASE_NAME" --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'" 2>/dev/null)

if [ -n "$TABLE_OUTPUT" ]; then
    print_success "✅ Database tables found:"
    echo "$TABLE_OUTPUT" | grep -v "name" | while read -r table; do
        if [ -n "$table" ]; then
            echo "  📋 $table"
        fi
    done
else
    print_warning "No user tables found in database"
fi

# Step 4: Seed data (optional)
print_status "=== Step 4: Seed Data ==="

if [ -f "seed.sql" ]; then
    read -p "Load seed data for development? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Loading seed data..."
        
        if wrangler d1 execute "$DATABASE_NAME" --local --file="./seed.sql"; then
            print_success "✅ Seed data loaded successfully"
        else
            print_warning "⚠️  Seed data loading failed (this is often normal if data already exists)"
        fi
    fi
else
    print_warning "No seed.sql file found"
fi

# Step 5: Setup summary and next steps
echo ""
print_status "=== Setup Complete ==="

print_success "🎉 Database setup completed successfully!"
echo ""
print_status "Database configuration:"
echo "  📊 Database name: $DATABASE_NAME"
echo "  🔧 Local development: Ready"
echo "  🌐 Production: Ready (migrations may need manual application)"
echo ""

print_status "Next steps:"
echo "  1. Test local development:"
echo "     npm run build && npm run dev:d1"
echo ""
echo "  2. Test database API:"
echo "     curl http://localhost:3000/api/database/health"
echo ""
echo "  3. Deploy to production:"
echo "     npm run deploy"
echo ""
echo "  4. Test production database:"
echo "     curl https://your-domain.pages.dev/api/database/health"
echo ""

print_status "Database management commands:"
echo "  📊 Local console: wrangler d1 execute $DATABASE_NAME --local"
echo "  🌐 Production console: wrangler d1 execute $DATABASE_NAME"
echo "  📋 List tables: wrangler d1 execute $DATABASE_NAME --local --command=\"SELECT name FROM sqlite_master WHERE type='table'\""
echo ""

print_warning "Important notes:"
echo "  • Local database files are stored in .wrangler/state/v3/d1/"
echo "  • Production database is managed by Cloudflare"
echo "  • Always test migrations locally first"
echo "  • Keep your wrangler.jsonc database_id updated"
echo ""

print_success "TITAN Trading System database is ready! 🚀"