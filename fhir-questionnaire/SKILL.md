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

# Step 4: For custom questions without LOINC results, use inline answerOptions
# (no coding system needed - just code + display)

# Step 5: Validate
python scripts/validate_questionnaire.py my-questionnaire.json
```

### Custom Answer Lists (When LOINC Has No Match)

When LOINC search returns no suitable answer list, use **inline answerOption with system-less valueCoding** by default. This is the simplest, spec-compliant approach for custom answer lists:

```json
{
  "linkId": "sleep-quality",
  "type": "choice",
  "text": "How would you rate your sleep quality?",
  "answerOption": [
    {"valueCoding": {"code": "good", "display": "Good"}},
    {"valueCoding": {"code": "fair", "display": "Fair"}},
    {"valueCoding": {"code": "poor", "display": "Poor"}}
  ]
}
```

**Do NOT invent a coding system URI.** Omitting `system` is valid FHIR and signals that these are local, questionnaire-scoped codes.

#### Opt-in: Reusable Welshare Coding System

If the user explicitly requests reusable codes that can be shared across questionnaires, use the Welshare namespace (`http://codes.welshare.app`) via the helper script:

```bash
python scripts/create_custom_codesystem.py --interactive
```

This creates a CodeSystem + ValueSet pair. To convert an inline answer list to the reusable format, add `"system": "http://codes.welshare.app/CodeSystem/<category>/<id>.json"` to each `valueCoding` and optionally reference the ValueSet via `answerValueSet`. See `references/loinc_guide.md` for details.

## Common Patterns

- **Conditional display**: Use `enableWhen` to show/hide questions
- **Repeating groups**: Set `"repeats": true` for medications, allergies, etc.
- **Standardized answers**: Use `query_valueset.py --loinc-code "CODE"` for LOINC-backed answer lists
- **Custom answers**: Use inline `answerOption` with `valueCoding` (no `system`) for non-standardized choices

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

### create_custom_codesystem.py - Reusable Custom Codes (Opt-in)
```bash
python scripts/create_custom_codesystem.py --interactive
```
Only use when the user explicitly requests reusable codes across questionnaires. Uses the Welshare namespace: `http://codes.welshare.app`. Default for custom answers is inline `answerOption` without a coding system.

## Troubleshooting

- **No LOINC results**: Use broader search terms (e.g., "depression" not "PHQ-9 question 1")
- **Network errors**: Try alternative servers with `--server` flag
- **Validation errors**: Check `references/fhir_questionnaire_spec.md` for requirements
- **No answer list found**: Use inline `answerOption` with system-less `valueCoding` (code + display only). Do NOT fall back to a custom coding system unless the user explicitly requests it

## Reference Links

- [FHIR R4 Questionnaire Spec](http://hl7.org/fhir/R4/questionnaire.html)
- [LOINC Database](https://loinc.org)
- [Complete Documentation](REFERENCE.md)
