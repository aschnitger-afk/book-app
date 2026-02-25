#!/bin/bash
# Auto-backup script for AuthorAI book app
# Runs daily to commit and push changes to GitHub

cd /Users/knut/my-app

# Check if there are changes to commit
if git diff --quiet && git diff --staged --quiet; then
    echo "$(date): No changes to backup"
    exit 0
fi

# Configure git for this operation
git config user.name "aschnitger-afk"
git config user.email "auto@backup.local"

# Add all changes
git add -A

# Commit with timestamp
git commit -m "Auto backup: $(date '+%Y-%m-%d %H:%M')"

# Push to GitHub
if git push origin main; then
    echo "$(date): ✅ Backup successful"
else
    echo "$(date): ❌ Backup failed"
fi
