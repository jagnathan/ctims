export const NCT02503722_Osimertinib = {
  "age": "Adult",
  "drug_list": {
    "drug": [
      {
        "drug_name": "Osimertinib"
      },
    ]
  },
  "last_updated": "September 2, 2021",
  "long_title": "A Phase 1 Trial of MLN0128 (TAK-228) in Combination With Osimertinib (AZD9291) in Advanced EGFR Mutation Positive Non-Small Cell Lung Cancer (NSCLC) After Progression on a Previous EGFR Tyrosine Kinase Inhibitor",
  "management_group_list": {
    "management_group": [
      {
        "is_primary": "Y",
        "management_group_name": "Princess Margaret Cancer Centre"
      },
    ]
  },
  "nct_id": "NCT02503722",
  "nct_purpose": "This phase I trial studies the side effects and best dose of sapanisertib when given together with osimertinib in treating patients with stage IV EGFR mutation positive non-small cell lung cancer that has progressed after treatment with an EGFR tyrosine kinase inhibitor. Sapanisertib and osimertinib may stop the growth of tumor cells by blocking some of the enzymes needed for cell growth.",
  "phase": "I",
  "protocol_no": "123-020",
  "short_title": "Testing the Combination of MLN0128 (TAK-228) and AZD9291 in Advanced EGFR (Epidermal Growth Factor Receptor) Mutation Positive Non-small Cell Lung Cancer",
  "site_list": {
    "site": [
      {
        "coordinating_center": "Y",
        "site_name": "Princess Margaret Cancer Centre",
        "site_status": "Closed to Accrual",
        "uses_cancer_center_irb": "Y"
      },
    ]
  },
  "sponsor_list": {
    "sponsor": [
      {
        "is_principal_sponsor": "Y",
        "sponsor_name": "National Cancer Institute"
      }
    ]
  },
  "staff_list": {
    "protocol_staff": [
      {
        "email_address": "Penelope.Bradbury@uhn.ca",
        "first_name": "Penelope",
        "institution_name": "Princess Margaret Cancer Centre",
        "last_name": "Bradbury",
        "staff_role": "Overall Principal Investigator"
      }
    ]
  },
  "status": "Open to Accrual",
  "treatment_list": {
    "step": [
      {
        "arm": [
          {
            "arm_code": "Treatment (sapanisertib, osimertinib)",
            "arm_description": "Patients receive sapanisertib PO QD on days 1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, and 26 (day 1 is omitted in cycle 1). Patients also receive osimertinib PO QD on days 1-28. Cycles repeat every 28 days in the absence of disease progression or unacceptable toxicity.",
            "arm_internal_id": 1,
            "arm_suspended": "N",
            "dose_level": [
              {
                "level_code": "Osimertinib",
                "level_description": "Osimertinib (AZD9291) will be delivered once per day in a continuous oral dose in a 28 day cycle. The initial dose of osimertinib (AZD9291) will start at the RP2D of osimertinib (AZD9291).",
                "level_internal_id": 1,
                "level_suspended": "N"
              },
            ],
            "match": [
              {
                "and": [
                  {
                    "clinical": {
                      "age_numerical": ">=18",
                      "oncotree_primary_diagnosis": "Non-Small Cell Lung Cancer"
                    }
                  },
                  {
                    "or": [
                      {
                        "genomic": {
                          "hugo_symbol": "EGFR",
                          "protein_change": "p.L858R",
                          "variant_category": "Mutation",
                          "variant_classification": "Missense_Mutation"
                        }
                      },
                      {
                        "genomic": {
                          "hugo_symbol": "EGFR",
                          "protein_change": "p.729_761del",
                          "variant_category": "Mutation"
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
