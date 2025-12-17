# FHIR Questionnaire Skill

Create, convert, and validate FHIR R4 Questionnaire resources with proper clinical coding and terminology.

## Quick Setup

1. **Install dependencies**:
   ```bash
   ./setup.sh
   ```

   This installs the `jsonschema` library needed for validation.

2. **Verify installation**:
   ```bash
   python3 scripts/validate_questionnaire.py assets/templates/minimal.json
   ```

## What This Skill Does

- ✅ **Create** FHIR Questionnaires from scratch or convert existing forms
- ✅ **Validate** questionnaires against JSON Schema
- ✅ **Search** LOINC codes for clinical questions
- ✅ **Query** FHIR servers for ValueSets
- ✅ **Generate** custom CodeSystems/ValueSets in Welshare namespace
- ✅ **Generate** Python code for questionnaire processing

## Core Tools

| Tool | Purpose | Network Required |
|------|---------|------------------|
| `validate_questionnaire.py` | Validate against schema | No |
| `search_loinc.py` | Search LOINC codes | Yes (NLM API) |
| `query_valueset.py` | Query FHIR servers | Yes (FHIR server) |
| `create_custom_codesystem.py` | Generate custom codes | No |

## Requirements

- **Python 3.7+**
- **jsonschema library** (installed via setup.sh)
- **Network access** for LOINC search and FHIR queries

## Documentation

- `SKILL.md` - Complete skill documentation and workflows
- `references/` - FHIR spec, LOINC guide, examples, best practices
- `assets/schema/questionnaire.schema.json` - Source of truth for validation
- `assets/templates/` - Template questionnaires to get started

## Getting Started

See `SKILL.md` for complete workflows and examples, or start with:

```bash
# Create a questionnaire from template
cp assets/templates/basic.json my-questionnaire.json

# Search for LOINC codes
python3 scripts/search_loinc.py "depression screening"

# Validate your questionnaire
python3 scripts/validate_questionnaire.py my-questionnaire.json --verbose
```

## Troubleshooting

**Import Error: No module named 'jsonschema'**
- Run `./setup.sh` to install dependencies

**Network errors when searching LOINC**
- Scripts require internet access to reach NLM APIs
- Check your network connection
- The scripts will fail gracefully with error messages

**Claude Code sandbox restrictions**
- Network access to approved APIs (clinicaltables.nlm.nih.gov) is pre-configured
- Scripts handle errors gracefully when network is unavailable
