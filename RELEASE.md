# Release Guide

## Creating a New Release

This project uses GitHub Releases to distribute the skill package. The build process is automated via GitHub Actions.

### Release Process

1. **Ensure all changes are committed and pushed**
   ```bash
   git add .
   git commit -m "Prepare for release vX.Y.Z"
   git push origin main
   ```

2. **Create and push a version tag**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Create a GitHub Release**
   - Go to: https://github.com/welshare/questionnaire-skill/releases/new
   - Select the tag you just created (e.g., `v1.0.0`)
   - Fill in the release title: "v1.0.0" or "Release 1.0.0"
   - Add release notes describing changes, new features, bug fixes
   - Click "Publish release"

4. **Automated Build**
   - GitHub Actions will automatically:
     - Build the `fhir-questionnaire.skill` package
     - Attach it to the release as a downloadable asset
   - This typically takes 1-2 minutes

5. **Verify the Release**
   - Check that the `.skill` file appears under release assets
   - Test download and installation

### Manual Release (if needed)

If automated build fails or you need to release manually:

```bash
# Build the package locally
make package

# Verify it
make test-package

# Upload manually via GitHub Releases UI
```

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version (X.0.0): Breaking changes
- **MINOR** version (0.X.0): New features, backward compatible
- **PATCH** version (0.0.X): Bug fixes, backward compatible

Examples:
- `v1.0.0` - Initial stable release
- `v1.1.0` - Added new LOINC search capabilities
- `v1.1.1` - Fixed validation bug

### Release Notes Template

```markdown
## What's New in vX.Y.Z

### Features
- Added support for custom CodeSystems
- Improved LOINC search with fuzzy matching

### Improvements
- Enhanced validation error messages
- Updated FHIR specification references

### Bug Fixes
- Fixed issue with nested questionnaire items
- Corrected ValueSet expansion logic

### Installation
Download `fhir-questionnaire.skill` and install it in Claude Desktop or Claude Code.
```

## Testing Releases

Before creating a release:

1. **Test packaging locally**
   ```bash
   make clean
   make package
   make test-package
   ```

2. **Test installation**
   - Install the local `.skill` file
   - Verify all scripts work correctly
   - Test with sample questionnaires

3. **Update documentation**
   - Ensure README is current
   - Update version references if needed
   - Check all links work

## Troubleshooting

**GitHub Action fails:**
- Check the Actions tab for error logs
- Verify `Makefile` works locally first
- Ensure repository has proper permissions

**Release asset not attached:**
- Check that `GITHUB_TOKEN` has write permissions
- Verify the workflow file syntax
- Try manual upload as fallback

**Download link not working:**
- Ensure release is published (not draft)
- Check asset is actually attached to release
- Verify URL format is correct
