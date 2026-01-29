---
name: design-fhir-loinc-questionnaires
description: Creates FHIR R4 Questionnaires with official LOINC codes. NEVER suggest codes from memory - ALWAYS use provided scripts to search LOINC database.
metadata:
  dependencies: python>=3.8, jsonschema>=4.0.0
---

# FHIR Questionnaire Skill

## ⚠️ CRITICAL RULES - READ FIRST

**NEVER suggest LOINC codes from memory or training data.**

When any LOINC code is needed:
1. **ALWAYS run `python scripts/search_loinc.py "search term"` FIRST**
2. **ONLY use codes returned by the script**
3. **If search fails or returns no results, DO NOT make up codes**

LOINC codes from AI memory are highly unreliable and will cause incorrect clinical coding.

## Network Access Requirements

Requires whitelisted network access:
- `clinicaltables.nlm.nih.gov` (LOINC search)
- `tx.fhir.org` (FHIR terminology server)

If network access fails, STOP. Do not suggest codes.

## Essential Scripts (Use These Every Time)

### 1. Search LOINC Codes
**ALWAYS run this before suggesting any LOINC code:**
```bash
python scripts/search_loinc.py "depression screening"
python scripts/search_loinc.py "blood pressure" --format fhir
```

### 2. Find Answer Options
**For questions with standardized answers:**
```bash
python scripts/query_valueset.py --loinc-code "72166-2"
python scripts/query_valueset.py --loinc-code "72166-2" --format fhir
```

### 3. Validate Questionnaire
**Before finalizing:**
```bash
python scripts/validate_questionnaire.py questionnaire.json
```

## Templates

Start with `assets/templates/`:
- `minimal.json` - Bare bones structure
- `basic.json` - Simple questionnaire
- `advanced.json` - Complex with conditional logic

## Documentation

See [REFERENCE.md](REFERENCE.md) for detailed specs, examples, and best practices.

## Workflows

### Standardized Clinical Instruments (PHQ-9, GAD-7, etc.)
```bash
# Step 1: Find panel code (NEVER skip this)
python scripts/search_loinc.py "PHQ-9 panel"

# Step 2: Find answer options
python scripts/query_valueset.py --loinc-code "FOUND-CODE" --format fhir

# Step 3: See examples/templates
# Check references/examples.md for complete implementations
```

### Custom Organizational Questionnaires
```bash
# Step 1: Start with template
cp assets/templates/advanced.json my-questionnaire.json

# Step 2: For any clinical questions, search LOINC
python scripts/search_loinc.py "body weight"

# Step 3: Add answer options if available
python scripts/query_valueset.py --loinc-code "FOUND-CODE"

# Step 4: Validate
python scripts/validate_questionnaire.py my-questionnaire.json
```

### Create Custom Codes (Only When LOINC Unavailable)
Use Welshare namespace: `http://codes.welshare.app`
```bash
python scripts/create_custom_codesystem.py --interactive
```

## Common Patterns

- **Conditional display**: Use `enableWhen` to show/hide questions
- **Repeating groups**: Set `"repeats": true` for medications, allergies, etc.
- **Answer options**: Always use `query_valueset.py --loinc-code "CODE"`

See `references/examples.md` for complete working examples.

## Script Reference

### search_loinc.py - Find LOINC Codes
```bash
python scripts/search_loinc.py "blood pressure"
python scripts/search_loinc.py "depression" --limit 10 --format fhir
```

### query_valueset.py - Find Answer Options
```bash
python scripts/query_valueset.py --loinc-code "72166-2"
python scripts/query_valueset.py --loinc-code "72166-2" --format fhir
python scripts/query_valueset.py --search "smoking"
```
**Alternative servers** (if tx.fhir.org fails):
- `--server https://hapi.fhir.org/baseR4`
- `--server https://r4.ontoserver.csiro.au/fhir`

### validate_questionnaire.py - Validate Structure
```bash
python scripts/validate_questionnaire.py questionnaire.json
python scripts/validate_questionnaire.py questionnaire.json --verbose
```

### extract_loinc_codes.py - Analyze Codes
```bash
python scripts/extract_loinc_codes.py questionnaire.json
python scripts/extract_loinc_codes.py questionnaire.json --validate
```

### create_custom_codesystem.py - Custom Codes
```bash
python scripts/create_custom_codesystem.py --interactive
```
Use Welshare namespace: `http://codes.welshare.app`

## Troubleshooting

- **No LOINC results**: Use broader search terms (e.g., "depression" not "PHQ-9 question 1")
- **Network errors**: Try alternative servers with `--server` flag
- **Validation errors**: Check `references/fhir_questionnaire_spec.md` for requirements
- **No answer list found**: Not all LOINC codes have standardized answer options

## Reference Links

- [FHIR R4 Questionnaire Spec](http://hl7.org/fhir/R4/questionnaire.html)
- [LOINC Database](https://loinc.org)
- [Complete Documentation](REFERENCE.md)
