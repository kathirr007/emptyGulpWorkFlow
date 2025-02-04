#!/bin/bash

# Get commit count and current date/time
commit_count=$(git rev-list --count HEAD)
last_updated=$(date '+%Y-%m-%d %H:%M:%S')

# Format the new content
new_content="\n## Commit Count: $commit_count\nLast Updated: $last_updated\n"

# Use sed to replace or append, handling newlines correctly.  This version
# correctly handles multiple occurrences of the target lines.
sed -i -r 's/## Commit Count:.*//g' README.md  # Remove existing content
sed -i -r 's/Last Updated:.*//g' README.md  # Remove existing content

# Remove any empty lines
# tr -s '\n' '\n' < README.md > README.md.tmp && mv README.md.tmp README.md
# sed -i -E 's/\n{2,}/\n/g' README.md
awk '
/^$/ { if (c++ == 0) print; next } # Consecutive empty lines
{ if (c) print ""; c=0; print }    # Non-empty lines
END { if (c) print "" }            # Ensure file ends with a newline (if needed)
' README.md > README.md.tmp && mv README.md.tmp README.md

# Append the new content
printf "$new_content" >> README.md

