# FHIR Questionnaire Skill

A Claude skill that enables AI agents to create and validate FHIR R4 Questionnaires with proper LOINC/SNOMED coding, discover standardized answer lists, and validate results against questionnaire schemas.

## What are Skills?

Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks. Rather than relying on Claude's general knowledge, skills provide domain-specific instructions and tools that make Claude consistently better at particular use cases.

Learn more: [Official Skills Repository](https://github.com/anthropics/skills/blob/main/README.md)

## Network Access

This skill requires whitelisted network access to:
- `clinicaltables.nlm.nih.gov` (LOINC search)
- `tx.fhir.org` (FHIR terminology server)

## Installation

Install the packaged skill file (`fhir-questionnaire.skill`) in Claude Desktop or Claude Code.

## Contents

- **SKILL.md** - Core instructions and workflows
- **scripts/** - LOINC search, ValueSet discovery, and validation tools
- **assets/templates/** - FHIR questionnaire templates and examples
- **references/** - Comprehensive FHIR and LOINC documentation
