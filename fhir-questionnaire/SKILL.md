---
name: fhir-questionnaire
description: Create, convert, and validate FHIR R4 Questionnaire resources with LOINC/SNOMED coding. Use when working with healthcare questionnaires, patient intake forms, clinical assessments, or surveys that need to conform to FHIR standards. Includes tools for searching LOINC codes, querying FHIR ValueSets, and generating Python code for questionnaire processing. CRITICAL - REQUIRES network access for Python scripts to reach external APIs. NOT compatible with Claude Desktop or sandboxed environments. Use ONLY in Claude Code or agents with network permissions. If scripts cannot access the web, STOP using this skill immediately.
---

# FHIR Questionnaire Skill

Create, convert, and validate FHIR R4 Questionnaire resources with proper clinical coding and terminology.

## Requirements

Requires `jsonschema` for validation. Run setup once:

```bash
./setup.sh
```

Then use the virtual environment Python for scripts:

```bash
.venv/bin/python scripts/validate_questionnaire.py questionnaire.json
```

## Network Access Required - READ THIS FIRST

**CRITICAL REQUIREMENT**: This skill requires network access for Python scripts to reach external APIs.

**Required endpoints**:
- `clinicaltables.nlm.nih.gov` (LOINC search)
- `hapi.fhir.org` (FHIR terminology server)

**Compatible environments**:
- ✅ Claude Code (with network permissions enabled)
- ✅ Custom agents with network access

**NOT compatible**:
- ❌ Claude Desktop (skills cannot access network)
- ❌ Sandboxed/restricted environments

**If you encounter network errors**: STOP using this skill immediately. There is no fallback or workaround. The skill cannot function without network access to these APIs.

## Schema Reference

**Source of Truth**: `references/schema/questionnaire.schema.json` - All structural definitions are defined in this JSON Schema file.

See `references/fhir_questionnaire_spec.md` for human-readable schema documentation, or refer to `references/schema/questionnaire.schema.json` for the definitive FHIR R4 Questionnaire schema.

## Quick Start

### Creating a New Questionnaire

1. **Start with a template** from `assets/templates/`:
   - `minimal.json` - Bare minimum structure
   - `basic.json` - Standard questionnaire with sections
   - `advanced.json` - Full-featured with conditional logic, repeating groups, and LOINC codes
   - `CodeSystem-example.json` - Custom code system template
   - `ValueSet-example.json` - Custom value set template

2. **Use the FHIR spec** - See `references/fhir_questionnaire_spec.md` for:
   - Required fields and element definitions
   - Item types (string, boolean, choice, group, etc.)
   - Conditional logic (enableWhen)
   - Answer options and ValueSets

3. **Add clinical codes** - Search for LOINC codes:
   ```bash
   .venv/bin/python scripts/search_loinc.py "depression screening"
   ```

4. **Validate** - Always validate before publishing:
   ```bash
   python scripts/validate_questionnaire.py questionnaire.json --verbose
   ```

### Converting Existing Forms

When converting surveys, paper forms, or other documents to FHIR:

1. Identify the structure (sections, question types, conditional logic)
2. Start with `assets/templates/basic.json` or `advanced.json`
3. Map questions to appropriate FHIR item types (see spec reference)
4. Add LOINC codes for standardized questions
5. Use ValueSets for coded answers where appropriate
6. Implement conditional logic with enableWhen
7. Validate the result

## Core Workflows

### Workflow 1: Create Standardized Clinical Questionnaire

For well-known clinical instruments (PHQ-9, GAD-7, etc.):

1. **Find the LOINC panel code**:
   ```bash
   .venv/bin/python scripts/search_loinc.py "PHQ-9 panel" --limit 5
   ```

2. **Review examples** - See `references/examples.md` for complete PHQ-2 implementation

3. **Use official question codes** - Each question should have its LOINC code:
   ```json
   {
     "linkId": "phq9-1",
     "code": [{
       "system": "http://loinc.org",
       "code": "44250-9",
       "display": "Little interest or pleasure in doing things"
     }],
     "type": "choice",
     "text": "Little interest or pleasure in doing things"
   }
   ```

4. **Add answer options** with LOINC answer codes (see examples reference)

5. **Validate** to ensure conformance

### Workflow 2: Create Custom Organizational Questionnaire

For organization-specific questionnaires:

1. **Start with a template** - Copy `assets/templates/advanced.json`

2. **Structure your sections** using groups:
   ```json
   {
     "linkId": "demographics",
     "type": "group",
     "text": "Demographics",
     "item": [...]
   }
   ```

3. **Choose appropriate item types**:
   - `string` - Short text (< 255 chars)
   - `text` - Long text
   - `boolean` - Yes/No questions
   - `choice` - Single selection
   - `open-choice` - Selection with "other" option
   - `date`, `dateTime`, `time` - Temporal data
   - `integer`, `decimal` - Numeric values

4. **Add LOINC codes where applicable**:
   ```bash
   .venv/bin/python scripts/search_loinc.py "blood pressure"
   ```

5. **Use ValueSets for standard answers**:
   ```bash
   .venv/bin/python scripts/query_valueset.py --server https://hapi.fhir.org/baseR4 --search "gender"
   ```

6. **Implement conditional logic** (see examples in `references/examples.md`)

7. **Test and validate**

### Workflow 3: Add Clinical Terminology

To make questionnaires conform to clinical standards:

1. **Identify which questions need coding**:
   - Demographics (gender, date of birth)
   - Vital signs (blood pressure, heart rate, temperature)
   - Clinical observations
   - Standardized assessments

2. **Search for LOINC codes**:
   ```bash
   # For individual questions
   .venv/bin/python scripts/search_loinc.py "body weight" --format fhir

   # For complete instruments
   .venv/bin/python scripts/search_loinc.py "depression screening" --limit 10
   ```

3. **Query FHIR servers for ValueSets**:
   ```bash
   # Search for ValueSets
   .venv/bin/python scripts/query_valueset.py --server https://hapi.fhir.org/baseR4 --search "gender"

   # Get specific ValueSet with codes
   .venv/bin/python scripts/query_valueset.py --server https://hapi.fhir.org/baseR4 --id http://hl7.org/fhir/ValueSet/administrative-gender --expand
   ```

4. **Add codes to questionnaire items**:
   ```json
   {
     "linkId": "weight",
     "type": "decimal",
     "code": [{
       "system": "http://loinc.org",
       "code": "29463-7",
       "display": "Body weight"
     }],
     "text": "What is your weight?"
   }
   ```

5. **Use ValueSets for answer options**:
   ```json
   {
     "linkId": "gender",
     "type": "choice",
     "text": "Gender",
     "answerValueSet": "http://hl7.org/fhir/ValueSet/administrative-gender"
   }
   ```

6. **Reference LOINC guide** - See `references/loinc_guide.md` for:
   - Common LOINC codes for questionnaires
   - Best practices for using LOINC
   - LOINC code structure

### Workflow 4: Create Custom Codes When LOINC Isn't Suitable

When no suitable LOINC codes exist for organization-specific or novel questions:

**MANDATORY**: All custom CodeSystems and ValueSets MUST use the Welshare URL base: `http://codes.welshare.app`. This is hardcoded in the script and cannot be changed.

1. **Search LOINC first**:
   ```bash
   .venv/bin/python scripts/search_loinc.py "your concept" --limit 20
   ```

2. **If no suitable codes found**, create custom codes in Welshare namespace:
   ```bash
   # Interactive mode (recommended)
   python scripts/create_custom_codesystem.py --interactive

   # Or command-line mode
   python scripts/create_custom_codesystem.py \
     --id routine-preference \
     --category brainhealth \
     --title "Routine Preference Scale" \
     --codes "prefer-routines:Prefer routines,sometimes-new:Sometimes seek new challenges"
   ```

3. **Script generates two files**:
   - `CodeSystem-{id}.json` - Defines codes and meanings
   - `ValueSet-vs-{id}.json` - References CodeSystem for questionnaires

4. **Use in questionnaire**:
   ```json
   {
     "linkId": "routine-preference",
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

5. **Deploy CodeSystem and ValueSet**: Upload generated JSON files to your FHIR server or make available at the URLs specified

**Benefits**:
- Maintains interoperability through standard FHIR structures
- Specific to your organization's needs
- Reusable across multiple questionnaires
- Properly namespaced under `codes.welshare.app`

**Best Practices**:
- **MANDATORY**: URL base MUST be `http://codes.welshare.app` (enforced by script)
- Always search LOINC first before creating custom codes
- Use descriptive IDs (e.g., "sleep-quality" not "sq1")
- Categorize logically (e.g., "brainhealth", "social", "physical")
- Document thoroughly with clear descriptions
- Consider hybrid approach: use LOINC for question identification + custom codes for specific answer options

See `references/loinc_guide.md` section "Creating Custom Codes" for complete details.

## Python Code Generation

Generate Python code for processing questionnaires:

### Validation Code

```python
# Use the fhir.resources library
from fhir.resources.questionnaire import Questionnaire

# Load and validate
with open('questionnaire.json') as f:
    q = Questionnaire.parse_file(f)

# Access properties
print(q.title)
for item in q.item:
    print(f"Question: {item.text}, Type: {item.type}")
```

### Response Processing Code

```python
from fhir.resources.questionnaireresponse import QuestionnaireResponse

# Load response
with open('response.json') as f:
    response = QuestionnaireResponse.parse_file(f)

# Extract answers
for item in response.item:
    link_id = item.linkId
    if item.answer:
        for answer in item.answer:
            # Check answer type
            if answer.valueString:
                print(f"{link_id}: {answer.valueString}")
            elif answer.valueCoding:
                print(f"{link_id}: {answer.valueCoding.display}")
            elif answer.valueBoolean is not None:
                print(f"{link_id}: {answer.valueBoolean}")
```

### Creating Questionnaires Programmatically

```python
from fhir.resources.questionnaire import Questionnaire, QuestionnaireItem

# Create questionnaire
q = Questionnaire(
    status="draft",
    title="Example Questionnaire"
)

# Add items
q.item = [
    QuestionnaireItem(
        linkId="q1",
        type="string",
        text="What is your name?",
        required=True
    ),
    QuestionnaireItem(
        linkId="q2",
        type="boolean",
        text="Do you have any allergies?"
    )
]

# Save
with open('output.json', 'w') as f:
    f.write(q.json(indent=2))
```

## Key References

### FHIR Specification
Read `references/fhir_questionnaire_spec.md` for:
- Complete element definitions
- Item types and their uses
- Conditional logic (enableWhen)
- Answer options (answerOption, answerValueSet)
- Validation rules

### LOINC Coding
Read `references/loinc_guide.md` for:
- Common LOINC questionnaire codes (PHQ-9, GAD-7, etc.)
- Vital signs and measurements codes
- Demographics and social history codes
- Search tips and best practices

### Best Practices
Read `references/best_practices.md` for:
- Design principles
- Coding and terminology guidelines
- Conditional logic patterns
- Validation checklist
- Common antipatterns to avoid

### Examples
Read `references/examples.md` for complete examples:
- Simple patient intake
- PHQ-2 depression screening (standardized)
- Conditional logic patterns
- Repeating groups (medications, allergies)
- Complex medical history

## Common Patterns

### Conditional Display

Show questions only when relevant:

```json
{
  "linkId": "has-condition",
  "type": "boolean",
  "text": "Do you have diabetes?"
},
{
  "linkId": "condition-details",
  "type": "text",
  "text": "Please describe your diabetes management",
  "enableWhen": [{
    "question": "has-condition",
    "operator": "=",
    "answerBoolean": true
  }]
}
```

### Repeating Groups

Allow multiple entries:

```json
{
  "linkId": "medication",
  "type": "group",
  "text": "Medication",
  "repeats": true,
  "item": [
    {
      "linkId": "medication.name",
      "type": "string",
      "text": "Medication Name"
    },
    {
      "linkId": "medication.dosage",
      "type": "string",
      "text": "Dosage"
    }
  ]
}
```

### Choice Questions with LOINC

```json
{
  "linkId": "smoking-status",
  "type": "choice",
  "code": [{
    "system": "http://loinc.org",
    "code": "72166-2",
    "display": "Tobacco smoking status"
  }],
  "text": "Smoking status",
  "answerValueSet": "http://hl7.org/fhir/ValueSet/smoking-status"
}
```

## Tools and Scripts

### search_loinc.py
Search LOINC codes via the SearchLOINC API:

```bash
# Basic search
.venv/bin/python scripts/search_loinc.py "blood pressure"

# Limit results
.venv/bin/python scripts/search_loinc.py "depression screening" --limit 10

# Output as FHIR Coding objects
.venv/bin/python scripts/search_loinc.py "body weight" --format fhir

# Table format
.venv/bin/python scripts/search_loinc.py "anxiety" --format table
```

### validate_questionnaire.py
Validate FHIR Questionnaire JSON against the schema:

```bash
# Full validation (schema + semantic checks)
python scripts/validate_questionnaire.py questionnaire.json

# Verbose output
python scripts/validate_questionnaire.py questionnaire.json --verbose

# Schema validation only (skip semantic checks)
python scripts/validate_questionnaire.py questionnaire.json --schema-only

# Use custom schema file
python scripts/validate_questionnaire.py questionnaire.json --schema custom-schema.json
```

**Requires**: `jsonschema` library (`pip install jsonschema` or `uv pip install jsonschema`)

Validates:
- **JSON Schema compliance**: All fields, types, patterns defined in `references/schema/questionnaire.schema.json`
- **Semantic checks**: linkId uniqueness, enableWhen references, best practices
- **Warnings**: Missing recommended fields (title, text, answer options)

### query_valueset.py
Query FHIR servers for ValueSets and CodeSystems:

```bash
# Search for ValueSets
.venv/bin/python scripts/query_valueset.py --server https://hapi.fhir.org/baseR4 --search "gender"

# Get specific ValueSet
.venv/bin/python scripts/query_valueset.py --server https://hapi.fhir.org/baseR4 --id http://hl7.org/fhir/ValueSet/administrative-gender

# Expand to see all codes
.venv/bin/python scripts/query_valueset.py --expand --server https://hapi.fhir.org/baseR4 --id http://hl7.org/fhir/ValueSet/administrative-gender

# JSON output
.venv/bin/python scripts/query_valueset.py --server https://hapi.fhir.org/baseR4 --search "gender" --format json
```

### create_custom_codesystem.py
Create custom CodeSystem and ValueSet resources for Welshare namespace:

```bash
# Interactive mode (recommended)
python scripts/create_custom_codesystem.py --interactive

# Command-line mode
python scripts/create_custom_codesystem.py \
  --id routine-preference \
  --category brainhealth \
  --title "Routine Preference Scale" \
  --description "Scale for assessing preference for routines" \
  --codes "prefer-routines:Prefer routines,sometimes-new:Sometimes seek new challenges,frequently-new:Frequently seek new challenges"

# Output to specific directory
python scripts/create_custom_codesystem.py --interactive --output ./custom-codes/

# Mark as experimental
python scripts/create_custom_codesystem.py --interactive --experimental
```

Generates:
- `CodeSystem-{id}.json` - Complete CodeSystem resource
- `ValueSet-vs-{id}.json` - ValueSet referencing the CodeSystem
- Both use Welshare namespace: `http://codes.welshare.app/`

Use when:
- No suitable LOINC codes exist
- Organization-specific questions
- Novel assessment instruments
- Fine-grained answer options needed

## Working with the User

### Understanding Requirements

Ask clarifying questions:
- "What is the purpose of this questionnaire?"
- "Who will be completing it?"
- "Are there any conditional questions (show/hide based on answers)?"
- "Do you need to follow any specific clinical standards?"
- "Should this questionnaire use standard terminology (LOINC, SNOMED)?"

### Iterative Development

1. Start simple - Build minimal viable questionnaire
2. Add sections and questions
3. Implement conditional logic
4. Add clinical codes
5. Validate frequently
6. Test with the user
7. Refine based on feedback

### Common User Requests

**"Convert this survey to FHIR"**
- Review the source survey structure
- Map question types to FHIR item types
- Start with a template (basic or advanced)
- Add questions systematically
- Validate and iterate

**"Add LOINC codes to my questionnaire"**
- Identify which questions need coding
- Search for appropriate codes using search_loinc.py
- Add codes to item.code array
- Document the LOINC version used

**"Make this question show only if..."**
- Implement enableWhen condition
- Reference the controlling question by linkId
- Choose appropriate operator (=, !=, exists, etc.)
- Test the conditional logic

**"Generate Python code to process this questionnaire"**
- Use fhir.resources library
- Create code for loading and validating
- Add response processing logic
- Include error handling

## Troubleshooting

### Validation Errors

**"Missing required field: status"**
- Add `"status": "draft"` (or "active", "retired")

**"Invalid type"**
- Check `references/fhir_questionnaire_spec.md` for valid types
- Common types: string, boolean, choice, group, date

**"enableWhen references invalid linkId"**
- Ensure the referenced question exists
- Check linkId spelling
- Verify question order (enableWhen must reference earlier questions)

### LOINC Search Issues

**"No results found"**
- Try broader search terms
- Use common clinical terms instead of technical jargon
- Search for panel names (e.g., "PHQ-9 panel")

### ValueSet Query Issues

**"ValueSet not found"**
- Verify the server URL is correct
- Check if the ValueSet URL is exact
- Try searching instead: `--search "gender"` instead of `--id`

## Additional Resources

- **FHIR R4 Questionnaire**: http://hl7.org/fhir/R4/questionnaire.html
- **LOINC Database**: https://loinc.org
- **FHIR ValueSets**: http://hl7.org/fhir/R4/valueset.html
- **SNOMED CT**: https://www.snomed.org
- **Python fhir.resources**: https://pypi.org/project/fhir.resources/
