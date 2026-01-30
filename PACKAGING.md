# Packaging and Distribution Guide

## Overview

Claude skills are distributed as `.skill` files, which are ZIP archives containing the skill definition, executable scripts, templates, and reference documentation.

## Skill File Structure

A `.skill` file should contain:
- `SKILL.md` - Core instructions and workflows for Claude
- `scripts/` - Executable Python scripts (LOINC search, validation, etc.)
- `assets/templates/` - FHIR questionnaire templates and examples
- `references/` - Documentation, specifications, and schemas
- `requirements.txt` - Python dependencies
- `setup.sh` - Environment setup script (optional)

## Packaging Procedure

### Manual Packaging

1. Navigate to the project root directory
2. Ensure all source files in `fhir-questionnaire/` are up to date
3. Create the skill archive:
   ```bash
   cd fhir-questionnaire
   zip -r ../fhir-questionnaire.skill . \
     -x "*.pyc" \
     -x "__pycache__/*" \
     -x ".venv/*" \
     -x ".venv" \
     -x "*.egg-info/*" \
     -x ".DS_Store"
   ```

### Automated Packaging (Recommended)

Use the provided Makefile:

```bash
# Create a new skill package
make package

# Clean build artifacts
make clean

# Test the package structure
make test-package
```

## Distribution

### GitHub Releases (Recommended)

This project uses **GitHub Releases** for distribution with automated builds:

1. Create a new release on GitHub (see [RELEASE.md](RELEASE.md))
2. GitHub Actions automatically builds and attaches the `.skill` file
3. Users download from: https://github.com/welshare/questionnaire-skill/releases

**Benefits:**
- Automated, reproducible builds
- Version tracking and changelog
- Direct download links
- No manual upload needed

### Local Installation

Users can install the skill by:
1. Downloading the `.skill` file from releases
2. Opening Claude Desktop or Claude Code
3. Installing the skill through the UI or CLI

### Version Management

When releasing new versions:
1. Update version information in relevant files
2. Update SKILL.md with any new capabilities
3. Commit changes and create a version tag
4. Create a GitHub Release
5. GitHub Actions automatically builds and publishes the `.skill` file

See [RELEASE.md](RELEASE.md) for detailed release procedures.

## Best Practices

1. **Exclude Development Files**: Never include:
   - Virtual environments (`.venv/`)
   - Python cache files (`__pycache__/`, `*.pyc`)
   - IDE configuration files
   - Build artifacts

2. **Keep Dependencies Minimal**: Only include necessary dependencies in `requirements.txt`

3. **Test Before Distribution**:
   - Verify the package contents with `unzip -l fhir-questionnaire.skill`
   - Test installation in a clean environment
   - Validate that scripts execute correctly

4. **Documentation**: Ensure all reference materials and examples are current

## File Size Considerations

Skills should be reasonably sized for distribution:
- Current package: ~70KB (without .venv)
- Target: Keep under 1MB when possible
- Large reference files should be evaluated for necessity

## Troubleshooting

**Package includes unwanted files:**
- Check the exclusion patterns in the Makefile
- Use `make test-package` to inspect contents

**Scripts don't execute:**
- Verify Python dependencies are in `requirements.txt`
- Check that scripts have proper shebang lines if needed
- Ensure `setup.sh` installs dependencies correctly

**Package won't install:**
- Verify it's a valid ZIP archive: `file fhir-questionnaire.skill`
- Check that SKILL.md exists at the root of the skill directory
