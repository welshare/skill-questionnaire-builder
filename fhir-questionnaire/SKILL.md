---
name: design-fhir-loinc-questionnaires
description: Creates FHIR R4 Questionnaires and helps discovering concise LOINC codings. Helps discovering standardized answer lists and validates results against questionnaire schemas. Requires whitelisted network access (see Network Access Requirements).
metadata:
  dependencies: python>=3.8, jsonschema>=4.0.0
---

# FHIR Questionnaire Skill

Create, convert, and validate FHIR R4 Questionnaire resources with proper clinical coding and terminology.

## Documentation Structure

**[REFERENCE.md](REFERENCE.md)** - Start here for navigation to all detailed documentation:
- Complete FHIR specification
- LOINC coding guide
- Best practices and patterns
- Working examples

## Network Access Requirements

This skill requires whitelisted network access to the following URLs:
- `clinicaltables.nlm.nih.gov` (LOINC search)
- `tx.fhir.org` (FHIR terminology server)

The skill works in Claude Desktop, Claude Code, and custom agents when these URLs are whitelisted for network access.

**CRITICAL WARNING**: If network access fails or LOINC search is unavailable, STOP IMMEDIATELY. DO NOT attempt to suggest LOINC codes from your training data or general knowledge. LOINC codes from AI training are highly unreliable and will lead to incorrect clinical coding. Always use the provided scripts to access authoritative LOINC sources. There is no acceptable fallback when network access is unavailable.

## Quick Start

1. **Pick a template** from `assets/templates/`:
   - `minimal.json`, `basic.json`, or `advanced.json`
   - `CodeSystem-example.json`, `ValueSet-example.json` for custom codes

2. **Reference documentation** - See [REFERENCE.md](REFERENCE.md) for:
   - FHIR specification details
   - LOINC coding guide
   - Examples and patterns

3. **Search LOINC codes**:
   ```bash
   python scripts/search_loinc.py "depression screening"
   ```

4. **Discover answer options**:
   ```bash
   python scripts/query_valueset.py --loinc-code "72166-2"
   ```

5. **Validate**:
   ```bash
   python scripts/validate_questionnaire.py questionnaire.json
   ```

## Core Workflows

### 1. Standardized Clinical Instruments (PHQ-9, GAD-7, etc.)

- Find LOINC panel code: `search_loinc.py "PHQ-9 panel"`
- Review `references/examples.md` for complete implementations
- Add official LOINC question codes
- Use LOINC answer options via `query_valueset.py`
- See `references/loinc_guide.md` for details

### 2. Custom Organizational Questionnaires

- Start with `assets/templates/advanced.json`
- Structure with groups and appropriate item types
- Add LOINC codes where applicable
- Discover answer options: `query_valueset.py --loinc-code "CODE"`
- See `references/fhir_questionnaire_spec.md` for item types
- See `references/examples.md` for conditional logic patterns

### 3. Add Clinical Terminology

- Identify questions needing standardization
- Search LOINC: `search_loinc.py "body weight" --format fhir`
- Discover answer options: `query_valueset.py --loinc-code "CODE"`
- Add codes to questionnaire items
- See `references/loinc_guide.md` for common codes

### 4. Create Custom Codes (When LOINC Isn't Suitable)

**MANDATORY**: Use Welshare namespace `http://codes.welshare.app`

```bash
# Interactive mode (recommended)
python scripts/create_custom_codesystem.py --interactive
```

Generates CodeSystem and ValueSet resources for organization-specific questions.
See `references/loinc_guide.md` "Creating Custom Codes" section for complete guide.

## Python Code Generation

Use `fhir.resources` library for processing questionnaires:

```python
from fhir.resources.questionnaire import Questionnaire, QuestionnaireItem
from fhir.resources.questionnaireresponse import QuestionnaireResponse

# Load and validate
q = Questionnaire.parse_file('questionnaire.json')

# Process responses
response = QuestionnaireResponse.parse_file('response.json')
for item in response.item:
    if item.answer:
        print(f"{item.linkId}: {item.answer[0].valueString}")

# Create programmatically
q = Questionnaire(status="draft", title="New Questionnaire")
q.item = [QuestionnaireItem(linkId="q1", type="string", text="Name?")]
```

## Common Patterns

See `references/examples.md` for complete implementations.

**Conditional display** - Use `enableWhen` to show/hide questions
**Repeating groups** - Set `"repeats": true` for multiple entries (medications, allergies)
**LOINC answer options** - Use `query_valueset.py --loinc-code "CODE" --format questionnaire`

## Tools and Scripts

### extract_loinc_codes.py
Extract and analyze all LOINC codes from a questionnaire:

```bash
# Display all codes as a table
python scripts/extract_loinc_codes.py questionnaire.json

# Save to JSON file
python scripts/extract_loinc_codes.py questionnaire.json --output codes.json

# Show summary only
python scripts/extract_loinc_codes.py questionnaire.json --format summary

# Validate codes against LOINC database
python scripts/extract_loinc_codes.py questionnaire.json --validate
```

**Formats**: `table` (default, detailed view), `json` (structured output), `summary` (concise list)

Recursively extracts both question codes and answer codes, showing where each is used.

### search_loinc.py
Search LOINC codes:

```bash
python scripts/search_loinc.py "blood pressure" [--limit N] [--format fhir|table]
```

### validate_questionnaire.py
Validate against schema:

```bash
python scripts/validate_questionnaire.py questionnaire.json [--verbose] [--schema-only]
```

Validates structure, semantics, and best practices.

### query_valueset.py
Discover LOINC answer options (uses tx.fhir.org by default):

```bash
# Find answer options for LOINC code
python scripts/query_valueset.py --loinc-code "72166-2" [--format fhir|questionnaire|json]

# Search ValueSets by keyword
python scripts/query_valueset.py --search "frequency"

# Expand specific ValueSet
python scripts/query_valueset.py --expand "http://loinc.org/vs/LL358-3"

# Use alternative server if SSL issues occur
python scripts/query_valueset.py --loinc-code "72166-2" --server https://hapi.fhir.org/baseR4
```

**Formats**: `table` (default), `fhir` (Coding objects), `questionnaire` (complete item), `json`

**Alternative servers** (if tx.fhir.org fails):
- `https://hapi.fhir.org/baseR4`
- `https://r4.ontoserver.csiro.au/fhir`

### create_custom_codesystem.py
Create custom codes in Welshare namespace (`http://codes.welshare.app`):

```bash
python scripts/create_custom_codesystem.py --interactive
```

Generates CodeSystem and ValueSet resources for organization-specific questions.

## Troubleshooting

**Validation errors** - Check `references/fhir_questionnaire_spec.md` for:
- Required fields (status, item types)
- Valid enableWhen references
- linkId uniqueness

**LOINC search** - Use broader terms, search for panel names
**ValueSet errors** - Verify exact URLs, try `--search` instead of specific IDs

## Resources

- FHIR R4 Questionnaire: http://hl7.org/fhir/R4/questionnaire.html
- LOINC Database: https://loinc.org
- Python fhir.resources: https://pypi.org/project/fhir.resources/
