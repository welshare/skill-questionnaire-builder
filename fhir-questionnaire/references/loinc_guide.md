# LOINC Guide for FHIR Questionnaires

LOINC (Logical Observation Identifiers Names and Codes) provides standardized codes for clinical observations, including standardized questionnaires and assessment instruments.

## Table of Contents
- Using LOINC in Questionnaires
- Common LOINC Questionnaire Codes
- LOINC Code Structure
- Searching for LOINC Codes
- Best Practices

## Using LOINC in Questionnaires

### Questionnaire-Level Coding

Assign a LOINC code to the entire questionnaire using the `code` element:

```json
{
  "resourceType": "Questionnaire",
  "code": [{
    "system": "http://loinc.org",
    "code": "44249-1",
    "display": "PHQ-9 quick depression assessment panel"
  }]
}
```

### Item-Level Coding

Assign LOINC codes to individual questions:

```json
{
  "linkId": "q1",
  "type": "choice",
  "text": "Little interest or pleasure in doing things",
  "code": [{
    "system": "http://loinc.org",
    "code": "44250-9",
    "display": "Little interest or pleasure in doing things"
  }]
}
```

## Common LOINC Questionnaire Codes


### Vital Signs & Measurements

| LOINC Code | Display Name | Type |
|------------|--------------|------|
| 8867-4 | Heart rate | Observation |
| 85354-9 | Blood pressure panel | Panel |
| 8480-6 | Systolic blood pressure | Observation |
| 8462-4 | Diastolic blood pressure | Observation |
| 8310-5 | Body temperature | Observation |
| 29463-7 | Body weight | Observation |
| 8302-2 | Body height | Observation |
| 39156-5 | Body mass index (BMI) | Observation |
| 59408-5 | Oxygen saturation | Observation |

### Social History

| LOINC Code | Display Name |
|------------|--------------|
| 72166-2 | Tobacco smoking status |
| 11366-2 | History of tobacco use |
| 74013-4 | Alcoholic drinks per day |
| 68518-0 | Preferred language |
| 76689-9 | Sex assigned at birth |
| 54120-3 | Sexual orientation |
| 46098-0 | Biological sex |
| 71802-3 | Housing status |
| 82589-3 | Employment status |

## LOINC Code Structure

LOINC codes follow a structured format with multiple components:

**Format**: `Component : Property : Time : System : Scale : Method`

### Example: 8867-4 (Heart rate)
- **Component**: Heart rate
- **Property**: Rate (Numeric)
- **Time**: Point in time
- **System**: Heart
- **Scale**: Quantitative (Qn)
- **Method**: (not specified)

### Common Properties
- **Qn** (Quantitative): Numeric result
- **Ord** (Ordinal): Ordered categories (mild, moderate, severe)
- **Nom** (Nominal): Named categories (yes/no, blood types)
- **Nar** (Narrative): Free text

### Common Systems
- **Patient**: Questions about the patient as a whole
- **^Patient**: Self-reported by patient
- **Bld** (Blood): Blood-related observations
- **Ser/Plas**: Serum or plasma
- **{Setting}**: Clinical setting context

## Searching for LOINC Codes

### Using the search_loinc.py Script

```bash
# Search for depression screening tools
python scripts/search_loinc.py "depression screening" --limit 10

# Search for blood pressure codes
python scripts/search_loinc.py "blood pressure" --format fhir

# Search for anxiety assessments
python scripts/search_loinc.py "anxiety" --format table
```

### Online LOINC Resources

1. **LOINC Search**: https://loinc.org/search/
2. **FHIR LOINC ValueSets**: http://hl7.org/fhir/R4/loinc.html
3. **Clinical Tables API**: https://clinicaltables.nlm.nih.gov/
4. **RELMA (Regenstrief LOINC Mapping Assistant)**: Desktop tool for LOINC mapping

### Search Tips

- Search by clinical concept (e.g., "diabetes", "pain scale")
- Include measurement type (e.g., "blood glucose fasting")
- For panels, search with "panel" keyword (e.g., "lipid panel")
- For questionnaires, include scale name (e.g., "PHQ-9", "GAD-7")

## Best Practices

### 1. Use Standard Questionnaires When Available

When implementing well-known clinical scales (PHQ-9, GAD-7, etc.), use the official LOINC panel codes:

```json
{
  "resourceType": "Questionnaire",
  "url": "http://example.org/fhir/Questionnaire/phq9",
  "code": [{
    "system": "http://loinc.org",
    "code": "44249-1",
    "display": "PHQ-9 quick depression assessment panel"
  }],
  "item": [
    {
      "linkId": "phq9-1",
      "code": [{
        "system": "http://loinc.org",
        "code": "44250-9"
      }],
      "type": "choice",
      "text": "Little interest or pleasure in doing things"
    }
  ]
}
```

### 2. Combine with Custom Codes

For organization-specific questions, use both LOINC (if available) and local codes:

```json
{
  "linkId": "preferred-contact",
  "type": "choice",
  "text": "Preferred contact method",
  "code": [
    {
      "system": "http://loinc.org",
      "code": "68517-2",
      "display": "Preferred communication mode"
    },
    {
      "system": "http://example.org/codes",
      "code": "CONTACT-METHOD"
    }
  ]
}
```

### 3. Use Appropriate Scale Types

Match the LOINC scale type to your item type:

- **Qn (Quantitative)** → integer, decimal, quantity
- **Ord (Ordinal)** → choice with ordered options
- **Nom (Nominal)** → choice, open-choice
- **Nar (Narrative)** → text, string

### 4. Document LOINC Version

Include LOINC version in metadata for reproducibility:

```json
{
  "resourceType": "Questionnaire",
  "meta": {
    "tag": [{
      "system": "http://loinc.org",
      "code": "2.78",
      "display": "LOINC version 2.78"
    }]
  }
}
```

### 5. Use LOINC Answer Lists

For standardized questions, use LOINC answer lists (ValueSets):

```json
{
  "linkId": "tobacco-status",
  "type": "choice",
  "code": [{
    "system": "http://loinc.org",
    "code": "72166-2",
    "display": "Tobacco smoking status"
  }],
  "answerValueSet": "http://loinc.org/vs/LL2201-3"
}
```

#### Discovering Answer Lists for LOINC Codes

Many LOINC codes come with standardized answer lists. Use the `query_valueset.py` script to automatically discover them:

```bash
# Find answer options for a LOINC code
.venv/bin/python scripts/query_valueset.py --loinc-code "72166-2"

# Output:
# ValueSet: LOINCAnswerListLL2201_3
# URL: http://loinc.org/vs/LL2201-3
# Version: 2.77
#
# Answer Options (8 total):
#   LA18976-3       Current every day smoker
#   LA18977-1       Current some day smoker
#   LA15920-4       Former smoker
#   LA18978-9       Never smoker
#   ...

# Get as FHIR Coding objects for direct use
.venv/bin/python scripts/query_valueset.py --loinc-code "72166-2" --format fhir

# Get as complete Questionnaire item template
.venv/bin/python scripts/query_valueset.py --loinc-code "44250-9" --format questionnaire
```

The script uses the official FHIR terminology server (tx.fhir.org) which has comprehensive LOINC support including all answer lists. This ensures you use the correct, standardized answer options for each LOINC code.

**Benefits**:
- Automatically discovers associated answer lists
- Provides standardized, validated answer options
- Returns FHIR-compliant Coding objects
- Can generate complete Questionnaire item templates
- Ensures clinical interoperability

**Common LOINC codes with answer lists**:
- `72166-2` - Tobacco smoking status (8 options)
- `44250-9` - PHQ-9 depression items (4 frequency options)
- `54120-3` - Sexual orientation (7 options)
- Many standardized assessment instruments

### 6. Panel vs Individual Questions

- Use **panel codes** for the questionnaire as a whole
- Use **individual question codes** for each item
- Maintain the hierarchical structure

### 7. Validate Against Official Instruments

When implementing standardized instruments:
- Verify question wording matches the official instrument
- Use exact LOINC codes for each item
- Maintain original question order
- Use specified answer options

## Creating Custom Codes When LOINC Isn't Suitable

**MANDATORY URL BASE**: All custom CodeSystems and ValueSets MUST use `http://codes.welshare.app` as the URL base. This is hardcoded in the `create_custom_codesystem.py` script and cannot be changed to ensure consistency across all Welshare questionnaires.

### When to Create Custom Codes

Create custom codes in the Welshare namespace when:
- No suitable LOINC codes exist for your specific domain
- Questions are organization-specific or novel
- You need fine-grained answer options not in standard terminologies
- Conducting research with new assessment instruments

### Using the create_custom_codesystem.py Script

#### Interactive Mode (Recommended)

```bash
python scripts/create_custom_codesystem.py --interactive
```

The script will prompt you for:
1. **Title**: Human-readable name (e.g., "Routine Preference Scale")
2. **ID**: Identifier (auto-suggested from title)
3. **Category**: Domain/category (e.g., "brainhealth", "social")
4. **Description**: Purpose of the code system
5. **Concepts**: Code/display pairs for each answer option

#### Command-Line Mode

```bash
python scripts/create_custom_codesystem.py \
  --id routine-preference \
  --category brainhealth \
  --title "Routine Preference Scale" \
  --description "Scale for assessing preference for routines" \
  --codes "prefer-routines:Prefer routines,sometimes-new:Sometimes seek new challenges,frequently-new:Frequently seek new challenges"
```

#### Output

The script generates two files:
- `CodeSystem-{id}.json` - Defines the codes and their meanings
- `ValueSet-vs-{id}.json` - References the CodeSystem for use in questionnaires

**MANDATORY**: Both files use the Welshare namespace `http://codes.welshare.app/` as the URL base. This cannot be changed.

### Using Custom Codes in Questionnaires

#### With ValueSet Reference (Recommended for Choice Questions)

```json
{
  "linkId": "routine-preference",
  "type": "choice",
  "text": "How do you feel about routines?",
  "answerValueSet": "http://codes.welshare.app/ValueSet/brainhealth/routine-preference.json"
}
```

#### With Direct Coding (For Question Identification)

```json
{
  "linkId": "routine-question",
  "type": "choice",
  "code": [{
    "system": "http://codes.welshare.app/CodeSystem/brainhealth/routine-preference.json",
    "code": "routine-preference",
    "display": "Routine Preference"
  }],
  "text": "How do you feel about routines?",
  "answerValueSet": "http://codes.welshare.app/ValueSet/brainhealth/routine-preference.json"
}
```

### CodeSystem Structure

```json
{
  "resourceType": "CodeSystem",
  "id": "routine-preference",
  "url": "http://codes.welshare.app/CodeSystem/brainhealth/routine-preference.json",
  "version": "1.0.0",
  "name": "RoutinePreference",
  "title": "Routine Preference Scale",
  "status": "active",
  "experimental": false,
  "date": "2025-11-11",
  "publisher": "Welshare",
  "description": "Scale for assessing individual preference for routines",
  "content": "complete",
  "concept": [
    {
      "code": "prefer-routines",
      "display": "Prefer routines"
    },
    {
      "code": "sometimes-new",
      "display": "Sometimes seek new challenges"
    },
    {
      "code": "frequently-new",
      "display": "Frequently seek new challenges"
    }
  ]
}
```

### ValueSet Structure

```json
{
  "resourceType": "ValueSet",
  "id": "vs-routine-preference",
  "url": "http://codes.welshare.app/ValueSet/brainhealth/routine-preference.json",
  "status": "active",
  "compose": {
    "include": [
      {
        "system": "http://codes.welshare.app/CodeSystem/brainhealth/routine-preference.json"
      }
    ]
  }
}
```

### Best Practices for Custom Codes

1. **Search LOINC first**: Always try to find suitable LOINC codes before creating custom ones
2. **Use descriptive IDs**: Make IDs self-explanatory (e.g., "sleep-quality" not "sq1")
3. **Consistent naming**: Use lowercase with hyphens (kebab-case)
4. **Clear displays**: Display text should be user-friendly and unambiguous
5. **Categorize logically**: Use consistent category names (e.g., "brainhealth", "social", "physical")
6. **Document thoroughly**: Add good descriptions to CodeSystems
7. **Version control**: Keep custom codes in version control with questionnaires
8. **Consider reusability**: Design codes to be reused across multiple questionnaires

### Hybrid Approach: LOINC + Custom

For organization-specific questionnaires, combine both:

```json
{
  "linkId": "exercise-frequency",
  "type": "choice",
  "code": [
    {
      "system": "http://loinc.org",
      "code": "68516-4",
      "display": "Exercise activity"
    },
    {
      "system": "http://codes.welshare.app/CodeSystem/physical/exercise-frequency.json",
      "code": "exercise-frequency",
      "display": "Exercise Frequency - Custom Scale"
    }
  ],
  "text": "How often do you exercise per week?",
  "answerValueSet": "http://codes.welshare.app/ValueSet/physical/exercise-frequency.json"
}
```

This allows:
- Standard interoperability via LOINC
- Specific answer granularity via custom codes

## LOINC Copyright Notice

LOINC is copyright © 1995-2024, Regenstrief Institute, Inc. and the LOINC Committee.

Terms of use: https://loinc.org/license/

While LOINC codes are freely available, attribution is required when distributing questionnaires that use LOINC codes.

## Additional Resources

- **LOINC Official Site**: https://loinc.org
- **FHIR LOINC Implementation Guide**: http://hl7.org/fhir/loinc.html
- **LOINC Groups**: Pre-built panels and hierarchies
- **SNOMED-LOINC Mapping**: For converting between terminologies
