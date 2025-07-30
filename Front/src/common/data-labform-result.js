export const data_current ={
    "labinspirs_date": "2024-02-24",
    "labform_result": [
      {
        "labfrm_code": "LFM_RCC-C_PCV_PP",
        "labfrm_name": "Reticulocyte count + PCV + PP",
        "labform_testprm": [
          {
            "labfrmtp_id": "1",
            "labfrmtp_index": "01-001",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "PERCENT-RETICULOCYTE",
            "labtspr_name": "%Reticulocyte",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"1 - 1.5\", \"operator\": \"BETWEEN\", \"value1\": \"1\", \"value2\": \"1.5\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "1.6",
            "note_label": "H",
            "comment": "Test comment"
          },
          {
            "labfrmtp_id": "2",
            "labfrmtp_index": "01-002",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "CRP",
            "labtspr_name": "Corrected Reticulocyte Percentage (CRP)",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"> 1.0\", \"operator\": \">\", \"value1\": \"1\", \"value2\": \"\", \"note\": \"Y\", \"note_above\": \"N\", \"note_below\": \"\" }",
            "value": "1.2",
            "note_label": "Y",
            "comment": ""
          },
          {
            "labfrmtp_id": "3",
            "labfrmtp_index": "01-003",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "CRP-INTERPRETATION",
            "labtspr_name": "CRP Interpretation",
            "labtspr_datatype": "STRING",
            "unit": "-",
            "setting_for": "TEXTBOX",
            "setting_json": "{ \"maxLength\":\"255\" }",
            "value": "Test key",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "4",
            "labfrmtp_index": "02-001",
            "labfrmtp_group_name": "PCV+PP",
            "labtspr_code": "PCV",
            "labtspr_name": "Packed Cell Volume (PCV)",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"37 - 55\", \"operator\": \"BETWEEN\", \"value1\": \"37\", \"value2\": \"55\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "40",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "5",
            "labfrmtp_index": "02-002",
            "labfrmtp_group_name": "PCV+PP",
            "labtspr_code": "PP",
            "labtspr_name": "Plasma Protein (PP)",
            "labtspr_datatype": "NUMBER",
            "unit": "g/dL",
            "setting_for": "RANGE",
            "setting_json": "{\"ref_range\": \"5.7 - 7\", \"operator\": \"BETWEEN\", \"value1\": \"5.7\", \"value2\": \"7\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "4",
            "note_label": "L",
            "comment": ""
          },
          {
            "labfrmtp_id": "6",
            "labfrmtp_index": "03-001",
            "labfrmtp_group_name": "",
            "labtspr_code": "COMMENT",
            "labtspr_name": "Comment",
            "labtspr_datatype": "STRING",
            "unit": "",
            "setting_for": "TEXTAREA",
            "setting_json": "{ \"defaultValue\":\"C-Reactive Protein (CRP) CRP concentrations >3.0 mg/dL indicate clinically significant systemic inflammation.\" }",
            "value": "",
            "note_label": "",
            "comment": ""
          }
        ]
      },
      {
        "labfrm_code": "LFM_BACTERIAL-CULTURE",
        "labfrm_name": "Bacterial Culture",
        "labform_testprm": [
          {
            "labfrmtp_id": "15",
            "labfrmtp_index": "00-001",
            "labfrmtp_group_name": "",
            "labtspr_code": "FILE_PDF",
            "labtspr_name": "File PDF",
            "labtspr_datatype": "JSON",
            "unit": "",
            "setting_for": "UPLOAD_FILE",
            "setting_json": "{\"allow_file_type\" : \"PDF\", \"max_file_size_mb\" : \"10\" }",
            "value": "{\"file_id\":1,\"file_name\":\"LAB-01.pdf\",\"file_type\":\"PDF\",\"file_size\":\"5 mb\",\"file_url\":\"/uploads/lab_insp_result_file/[labinsp_number]/LAB-01.pdf\"}",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "16",
            "labfrmtp_index": "00-002",
            "labfrmtp_group_name": "",
            "labtspr_code": "COMMENT",
            "labtspr_name": "Comment",
            "labtspr_datatype": "STRING",
            "unit": "",
            "setting_for": "TEXTAREA",
            "setting_json": "{ \"defaultValue\": \"\" }",
            "value": "",
            "note_label": "",
            "comment": ""
          }
        ]
      }
    ]
  }
  
  export const data_prv1 = {
    "labinspirs_date": "2024-02-05",
    "labform_result": [
      {
        "labfrm_code": "LFM_RCC-C_PCV_PP",
        "labfrm_name": "Reticulocyte count + PCV + PP",
        "labform_testprm": [
          {
            "labfrmtp_id": "1",
            "labfrmtp_index": "01-001",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "PERCENT-RETICULOCYTE",
            "labtspr_name": "%Reticulocyte",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"1 - 1.5\", \"operator\": \"BETWEEN\", \"value1\": \"1\", \"value2\": \"1.5\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "1.3",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "2",
            "labfrmtp_index": "01-002",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "CRP",
            "labtspr_name": "Corrected Reticulocyte Percentage (CRP)",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"> 1.0\", \"operator\": \">\", \"value1\": \"1\", \"value2\": \"\", \"note\": \"Y\", \"note_above\": \"N\", \"note_below\": \"\" }",
            "value": "0.5",
            "note_label": "N",
            "comment": ""
          },
          {
            "labfrmtp_id": "3",
            "labfrmtp_index": "01-003",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "CRP-INTERPRETATION",
            "labtspr_name": "CRP Interpretation",
            "labtspr_datatype": "STRING",
            "unit": "-",
            "setting_for": "TEXTBOX",
            "setting_json": "{ \"maxLength\":\"255\" }",
            "value": "Non Regenarative anemia",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "4",
            "labfrmtp_index": "02-001",
            "labfrmtp_group_name": "PCV+PP",
            "labtspr_code": "PCV",
            "labtspr_name": "Packed Cell Volume (PCV)",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"37 - 55\", \"operator\": \"BETWEEN\", \"value1\": \"37\", \"value2\": \"55\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "30",
            "note_label": "L",
            "comment": ""
          },
          {
            "labfrmtp_id": "5",
            "labfrmtp_index": "02-002",
            "labfrmtp_group_name": "PCV+PP",
            "labtspr_code": "PP",
            "labtspr_name": "Plasma Protein (PP)",
            "labtspr_datatype": "NUMBER",
            "unit": "g/dL",
            "setting_for": "RANGE",
            "setting_json": "{\"ref_range\": \"5.7 - 7\", \"operator\": \"BETWEEN\", \"value1\": \"5.7\", \"value2\": \"7\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "4",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "6",
            "labfrmtp_index": "03-001",
            "labfrmtp_group_name": "",
            "labtspr_code": "COMMENT",
            "labtspr_name": "Comment",
            "labtspr_datatype": "STRING",
            "unit": "",
            "setting_for": "TEXTAREA",
            "setting_json": "{ \"defaultValue\": \"\" }",
            "value": "",
            "note_label": "",
            "comment": ""
          }
        ]
      },
      {
        "labfrm_code": "LFM_BACTERIAL-CULTURE",
        "labfrm_name": "Bacterial Culture",
        "labform_testprm": [
          {
            "labfrmtp_id": "15",
            "labfrmtp_index": "00-001",
            "labfrmtp_group_name": "",
            "labtspr_code": "FILE_PDF",
            "labtspr_name": "File PDF",
            "labtspr_datatype": "JSON",
            "unit": "",
            "setting_for": "UPLOAD_FILE",
            "setting_json": "{\"allow_file_type\" : \"PDF\", \"max_file_size_mb\" : \"10\" }",
            "value": "{\"file_id\":1,\"file_name\":\"LAB-02.pdf\",\"file_type\":\"PDF\",\"file_size\":\"5 mb\",\"file_url\":\"/uploads/lab_insp_result_file/[labinsp_number]/LAB-02.pdf\"}",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "16",
            "labfrmtp_index": "00-002",
            "labfrmtp_group_name": "",
            "labtspr_code": "COMMENT",
            "labtspr_name": "Comment",
            "labtspr_datatype": "STRING",
            "unit": "",
            "setting_for": "TEXTAREA",
            "setting_json": "{ \"defaultValue\": \"\" }",
            "value": "",
            "note_label": "",
            "comment": ""
          }
        ]
      }
    ]
  }
  
  export const data_prv2 = {
    "labinspirs_date": "2024-01-30",
    "labform_result": [
      {
        "labfrm_code": "LFM_RCC-C_PCV_PP",
        "labfrm_name": "Reticulocyte count + PCV + PP",
        "labform_testprm": [
          {
            "labfrmtp_id": "1",
            "labfrmtp_index": "01-001",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "PERCENT-RETICULOCYTE",
            "labtspr_name": "%Reticulocyte",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"1 - 1.5\", \"operator\": \"BETWEEN\", \"value1\": \"1\", \"value2\": \"1.5\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "1.2",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "2",
            "labfrmtp_index": "01-002",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "CRP",
            "labtspr_name": "Corrected Reticulocyte Percentage (CRP)",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"> 1.0\", \"operator\": \">\", \"value1\": \"1\", \"value2\": \"\", \"note\": \"Y\", \"note_above\": \"N\", \"note_below\": \"\" }",
            "value": "15",
            "note_label": "N",
            "comment": ""
          },
          {
            "labfrmtp_id": "3",
            "labfrmtp_index": "01-003",
            "labfrmtp_group_name": "Reticulocyte count",
            "labtspr_code": "CRP-INTERPRETATION",
            "labtspr_name": "CRP Interpretation",
            "labtspr_datatype": "STRING",
            "unit": "-",
            "setting_for": "TEXTBOX",
            "setting_json": "{ \"maxLength\":\"255\" }",
            "value": "Regenarative anemia",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "4",
            "labfrmtp_index": "02-001",
            "labfrmtp_group_name": "PCV+PP",
            "labtspr_code": "PCV",
            "labtspr_name": "Packed Cell Volume (PCV)",
            "labtspr_datatype": "NUMBER",
            "unit": "%",
            "setting_for": "RANGE",
            "setting_json": "{ \"ref_range\": \"37 - 55\", \"operator\": \"BETWEEN\", \"value1\": \"37\", \"value2\": \"55\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "60",
            "note_label": "H",
            "comment": ""
          },
          {
            "labfrmtp_id": "5",
            "labfrmtp_index": "02-002",
            "labfrmtp_group_name": "PCV+PP",
            "labtspr_code": "PP",
            "labtspr_name": "Plasma Protein (PP)",
            "labtspr_datatype": "NUMBER",
            "unit": "g/dL",
            "setting_for": "RANGE",
            "setting_json": "{\"ref_range\": \"5.7 - 7\", \"operator\": \"BETWEEN\", \"value1\": \"5.7\", \"value2\": \"7\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
            "value": "7.5",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "6",
            "labfrmtp_index": "03-001",
            "labfrmtp_group_name": "",
            "labtspr_code": "COMMENT",
            "labtspr_name": "Comment",
            "labtspr_datatype": "STRING",
            "unit": "",
            "setting_for": "TEXTAREA",
            "setting_json": "{ \"defaultValue\": \"\" }",
            "value": "",
            "note_label": "",
            "comment": ""
          }
        ]
      },
      {
        "labfrm_code": "LFM_BACTERIAL-CULTURE",
        "labfrm_name": "Bacterial Culture",
        "labform_testprm": [
          {
            "labfrmtp_id": "15",
            "labfrmtp_index": "00-001",
            "labfrmtp_group_name": "",
            "labtspr_code": "FILE_PDF",
            "labtspr_name": "File PDF",
            "labtspr_datatype": "JSON",
            "unit": "",
            "setting_for": "UPLOAD_FILE",
            "setting_json": "{\"allow_file_type\" : \"PDF\", \"max_file_size_mb\" : \"10\" }",
            "value": "{\"file_id\":1,\"file_name\":\"LAB-03.pdf\",\"file_type\":\"PDF\",\"file_size\":\"3 mb\",\"file_url\":\"/uploads/lab_insp_result_file/[labinsp_number]/LAB-03.pdf\"}",
            "note_label": "",
            "comment": ""
          },
          {
            "labfrmtp_id": "16",
            "labfrmtp_index": "00-002",
            "labfrmtp_group_name": "",
            "labtspr_code": "COMMENT",
            "labtspr_name": "Comment",
            "labtspr_datatype": "STRING",
            "unit": "",
            "setting_for": "TEXTAREA",
            "setting_json": "{ \"defaultValue\": \"\" }",
            "value": "",
            "note_label": "",
            "comment": ""
          }
        ]
      }
    ]
  }
  