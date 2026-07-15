# Shrimp-World

## Upload changes to the existing Git repository

From the project root, stage the current site changes, review them, commit, and push:

```bash
git status
git add -A
git diff --cached --stat
git commit -m "Update Shrimp World storefront"
git push
```

Before `git add -A`, confirm `git status` does not list `.env` or other credential files. Keep those files out of Git.
