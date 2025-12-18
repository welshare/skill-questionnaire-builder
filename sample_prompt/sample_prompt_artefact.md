{
  "resourceType": "Questionnaire",
  "id": "metabolic-lifestyle-screening",
  "meta": {
    "profile": ["http://hl7.org/fhir/StructureDefinition/Questionnaire"]
  },
  "url": "http://example.org/fhir/Questionnaire/metabolic-lifestyle-screening",
  "version": "1.0.0",
  "name": "MetabolicLifestyleScreening",
  "title": "Metabolic and Lifestyle Health Screening Questionnaire",
  "status": "draft",
  "experimental": false,
  "date": "2024-12-18",
  "publisher": "Welshare Health",
  "contact": [
    {
      "name": "Health Informatics Team",
      "telecom": [
        {
          "system": "email",
          "value": "health@welshare.app"
        }
      ]
    }
  ],
  "description": "Comprehensive screening questionnaire for metabolic health, diabetes management, and lifestyle factors",
  "purpose": "To assess metabolic health status, diabetes management, and lifestyle factors that may impact overall health",
  "item": [
    {
      "linkId": "demographics",
      "type": "group",
      "text": "Basic Demographics",
      "item": [
        {
          "linkId": "sex-assigned-at-birth",
          "prefix": "5.",
          "type": "choice",
          "code": [
            {
              "system": "http://loinc.org",
              "code": "76689-9",
              "display": "Sex assigned at birth"
            }
          ],
          "text": "What was your sex assigned at birth?",
          "required": true,
          "answerOption": [
            {
              "valueCoding": {
                "system": "http://hl7.org/fhir/administrative-gender",
                "code": "male",
                "display": "Male"
              }
            },
            {
              "valueCoding": {
                "system": "http://hl7.org/fhir/administrative-gender",
                "code": "female",
                "display": "Female"
              }
            },
            {
              "valueCoding": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
                "code": "UNK",
                "display": "Prefer not to answer"
              }
            }
          ]
        },
        {
          "linkId": "menstrual-status",
          "prefix": "6.",
          "type": "choice",
          "code": [
            {
              "system": "http://loinc.org",
              "code": "8678-5",
              "display": "Menstrual status"
            }
          ],
          "text": "Are you currently menstruating?",
          "enableWhen": [
            {
              "question": "sex-assigned-at-birth",
              "operator": "=",
              "answerCoding": {
                "system": "http://hl7.org/fhir/administrative-gender",
                "code": "female"
              }
            }
          ],
          "answerOption": [
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "248957007",
                "display": "Premenopausal"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "289903006",
                "display": "Menopausal"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "289904000",
                "display": "Postmenopausal"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "161712005",
                "display": "Pregnant"
              }
            },
            {
              "valueCoding": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
                "code": "UNK",
                "display": "Not sure"
              }
            }
          ]
        },
        {
          "linkId": "bmi",
          "prefix": "9.",
          "type": "decimal",
          "code": [
            {
              "system": "http://loinc.org",
              "code": "39156-5",
              "display": "Body mass index (BMI)"
            }
          ],
          "text": "What is your Body Mass Index (BMI)? If you don't know, you can leave this blank.",
          "required": false
        }
      ]
    },
    {
      "linkId": "diabetes-screening",
      "type": "group",
      "text": "Diabetes and Blood Sugar Management",
      "item": [
        {
          "linkId": "has-diabetes",
          "prefix": "2.",
          "type": "choice",
          "code": [
            {
              "system": "http://loinc.org",
              "code": "54795-0",
              "display": "Diabetes mellitus"
            }
          ],
          "text": "Do you have diabetes?",
          "required": true,
          "answerOption": [
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "44054006",
                "display": "Type 2 diabetes mellitus"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "46635009",
                "display": "Type 1 diabetes mellitus"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "11687002",
                "display": "Gestational diabetes"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "8801005",
                "display": "Prediabetes"
              }
            },
            {
              "valueCoding": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
                "code": "NA",
                "display": "No, I do not have diabetes"
              }
            }
          ]
        },
        {
          "linkId": "hypoglycemia-frequency",
          "prefix": "1.",
          "type": "choice",
          "code": [
            {
              "system": "http://loinc.org",
              "code": "101629-4",
              "display": "Hypoglycemia evaluation"
            }
          ],
          "text": "Do you experience frequent episodes of low blood sugar (hypoglycemia)?",
          "required": true,
          "answerOption": [
            {
              "valueCoding": {
                "code": "never",
                "display": "Never or almost never"
              }
            },
            {
              "valueCoding": {
                "code": "rarely",
                "display": "Rarely (a few times a year)"
              }
            },
            {
              "valueCoding": {
                "code": "sometimes",
                "display": "Sometimes (monthly)"
              }
            },
            {
              "valueCoding": {
                "code": "often",
                "display": "Often (weekly)"
              }
            },
            {
              "valueCoding": {
                "code": "very-often",
                "display": "Very often (multiple times per week)"
              }
            }
          ]
        },
        {
          "linkId": "nocturnal-hypoglycemia",
          "prefix": "7.",
          "type": "boolean",
          "text": "If you have diabetes: Have you noticed episodes of low blood sugar during the night (such as waking up sweaty, confused, or with a rapid heartbeat)?",
          "enableWhen": [
            {
              "question": "has-diabetes",
              "operator": "!=",
              "answerCoding": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
                "code": "NA"
              }
            }
          ],
          "required": false
        }
      ]
    },
    {
      "linkId": "urinary-health",
      "type": "group",
      "text": "Urinary Health",
      "item": [
        {
          "linkId": "urination-frequency",
          "prefix": "3.",
          "type": "choice",
          "text": "How many times do you typically urinate during a 24-hour period?",
          "required": true,
          "answerOption": [
            {
              "valueCoding": {
                "code": "4-6",
                "display": "4-6 times per day (typical)"
              }
            },
            {
              "valueCoding": {
                "code": "7-9",
                "display": "7-9 times per day"
              }
            },
            {
              "valueCoding": {
                "code": "10-12",
                "display": "10-12 times per day"
              }
            },
            {
              "valueCoding": {
                "code": "more-than-12",
                "display": "More than 12 times per day"
              }
            },
            {
              "valueCoding": {
                "code": "less-than-4",
                "display": "Less than 4 times per day"
              }
            }
          ]
        }
      ]
    },
    {
      "linkId": "lifestyle-factors",
      "type": "group",
      "text": "Lifestyle and Behavioral Health",
      "item": [
        {
          "linkId": "tobacco-status",
          "prefix": "4.",
          "type": "choice",
          "code": [
            {
              "system": "http://loinc.org",
              "code": "72166-2",
              "display": "Tobacco smoking status"
            }
          ],
          "text": "Do you currently use tobacco products (cigarettes, cigars, chewing tobacco, vaping)?",
          "required": true,
          "answerOption": [
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "449868002",
                "display": "Current every day smoker"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "428041000124106",
                "display": "Current some day smoker"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "8517006",
                "display": "Former smoker"
              }
            },
            {
              "valueCoding": {
                "system": "http://snomed.info/sct",
                "code": "266919005",
                "display": "Never smoker"
              }
            },
            {
              "valueCoding": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
                "code": "UNK",
                "display": "Unknown"
              }
            }
          ]
        },
        {
          "linkId": "sleep-duration",
          "prefix": "8.",
          "type": "choice",
          "code": [
            {
              "system": "http://loinc.org",
              "code": "93832-4",
              "display": "Sleep duration"
            }
          ],
          "text": "On average, how many hours of sleep do you get per night?",
          "required": true,
          "answerOption": [
            {
              "valueCoding": {
                "code": "less-than-5",
                "display": "Less than 5 hours"
              }
            },
            {
              "valueCoding": {
                "code": "5-6",
                "display": "5-6 hours"
              }
            },
            {
              "valueCoding": {
                "code": "7-8",
                "display": "7-8 hours (recommended)"
              }
            },
            {
              "valueCoding": {
                "code": "9-10",
                "display": "9-10 hours"
              }
            },
            {
              "valueCoding": {
                "code": "more-than-10",
                "display": "More than 10 hours"
              }
            },
            {
              "valueCoding": {
                "code": "varies",
                "display": "It varies significantly"
              }
            }
          ]
        },
        {
          "linkId": "alcohol-frequency",
          "prefix": "10.",
          "type": "choice",
          "code": [
            {
              "system": "http://loinc.org",
              "code": "74013-4",
              "display": "Alcoholic drinks per day"
            }
          ],
          "text": "How often do you consume alcoholic beverages?",
          "required": true,
          "answerOption": [
            {
              "valueCoding": {
                "code": "never",
                "display": "Never"
              }
            },
            {
              "valueCoding": {
                "code": "monthly-or-less",
                "display": "Monthly or less"
              }
            },
            {
              "valueCoding": {
                "code": "2-4-times-month",
                "display": "2-4 times a month"
              }
            },
            {
              "valueCoding": {
                "code": "2-3-times-week",
                "display": "2-3 times a week"
              }
            },
            {
              "valueCoding": {
                "code": "4-or-more-week",
                "display": "4 or more times a week"
              }
            }
          ]
        }
      ]
    }
  ]
}