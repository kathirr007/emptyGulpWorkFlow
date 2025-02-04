#!/bin/bash

commit_count=$(git rev-list --count HEAD)

echo "## Commit Count: $commit_count" > README_TEMP.md
echo "Last Updated: $(date '+%Y-%m-%d')" >> README_TEMP.md