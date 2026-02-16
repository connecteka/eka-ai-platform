#!/bin/bash
# Force Railway cache clear by modifying timestamp

echo "Forcing Railway cache clear..."

# Add timestamp to force new build
echo "# Build timestamp: $(date)" >> .railwayignore

# Commit and push
git add .railwayignore
git commit -m "Force cache clear: $(date)"
git push

echo "Pushed! Railway should rebuild with fresh cache."
