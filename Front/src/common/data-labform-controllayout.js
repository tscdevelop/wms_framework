export const data_labform_controllayout =  {
   "layout": {
    "rows": 9,
    "columns": 7,
    "columnsWidth": [
      "20%", "15%", "15%", "15%", "15%", "10%", "10%"  // ความกว้างของแต่ละคอลัมน์ในแถว
    ]
  },
    "controls": [
      {
        "name": "title_urinalysis",
        "controltype": "LABEL",
        "value": "Urinalysis",
        "position": {
          "row": 1,
          "col": 1,
          "colSpan": 7
        },
        "style": {
          "fontWeight": "bold",
          "fontSize": "1.5rem"
        }
      },
      {
        "name": "label_collection_technique",
        "controltype": "LABEL",
        "value": "Collection Technique :",
        "position": {
          "row": 2,
          "col": 1
        },
        "style": {
        }
      },
      {
        "name": "input_collection_technique",
        "controltype": "DROPDOWN",
        "value": "DDL_ITEM_1",
        "position": {
          "row": 2,
          "col": 2,
          "colSpan": 2
        },
        "setting_json": "{ \"label\":\"\",\"defaultValue\" : \"DDL_ITEM_2\", \"options\" : [{ \"value\": \"DDL_ITEM_1\", \"text\": \"ตัวเลือก 1\" },  { \"value\": \"DDL_ITEM_2\", \"text\": \"ตัวเลือก 2\" }] }",
        "style": {}
      },
      {
        "name": "label_sampling_volume",
        "controltype": "LABEL",
        "value": "Sampling Volume :",
        "position": {
          "row": 2,
          "col": 4
        },
        "style": {
        }
      },
      {
        "name": "input_sampling_volume",
        "controltype": "TEXTBOX",
        "value": "2.3",
        "position": {
          "row": 2,
          "col": 5
        },
        "setting_json": {
          "maxLength": "10"
        },
        "style": {}
      },
      {
        "name": "label_sampling_unit",
        "controltype": "LABEL",
        "value": "mL",
        "position": {
          "row": 2,
          "col": 6
        },
        "style": {}
      },
      {
        "name": "title_physical_examination",
        "controltype": "LABEL",
        "value": "Physical Examination",
        "position": {
          "row": 3,
          "col": 1,
          "colSpan": 7
        },
        "style": {
          "fontWeight": "bold"
        }
      },
      {
        "name": "label_color",
        "controltype": "LABEL",
        "value": "Color :",
        "position": {
          "row": 4,
          "col": 1
        },
        "style": {
        }
      },
      {
        "name": "input_color",
        "controltype": "TEXTBOX",
        "value": "Straw",
        "position": {
          "row": 4,
          "col": 2,
          "colSpan": 2
        },
        "setting_json": {
          "maxLength": "50"
        },
        "style": {}
      },
      {
        "name": "label_turbidity",
        "controltype": "LABEL",
        "value": "Turbidity :",
        "position": {
          "row": 4,
          "col": 4
        },
        "style": {
        }
      },
      {
        "name": "input_turbidity",
        "controltype": "TEXTBOX",
        "value": "Slightly Cloudy",
        "position": {
          "row": 4,
          "col": 5,
          "colSpan": 2
        },
        "setting_json": {
          "maxLength": "50"
        },
        "style": {}
      },
      {
        "name": "label_specific_gravity",
        "controltype": "LABEL",
        "value": "Specific Gravity :",
        "position": {
          "row": 5,
          "col": 1
        },
        "style": {
        }
      },
      {
        "name": "input_specific_gravity",
        "controltype": "TEXTBOX",
        "value": "1.027",
        "position": {
          "row": 5,
          "col": 2,
          "colSpan": 2
        },
        "setting_json": {
          "maxLength": "10"
        },
        "style": {}
      },
      {
        "name": "title_chemical_examination",
        "controltype": "LABEL",
        "value": "Chemical Examination",
        "position": {
          "row": 6,
          "col": 1,
          "colSpan": 7
        },
        "style": {
          "fontWeight": "bold"
        }
      },
      {
        "name": "label_ph",
        "controltype": "LABEL",
        "value": "pH :",
        "position": {
          "row": 7,
          "col": 1
        },
        "style": {
        }
      },
      {
        "name": "input_ph",
        "controltype": "TEXTBOX",
        "value": "6.5",
        "position": {
          "row": 7,
          "col": 2
        },
        "setting_json": {
          "maxLength": "10"
        },
        "style": {}
      },
      {
        "name": "label_urobilinogen",
        "controltype": "LABEL",
        "value": "Urobilinogen :",
        "position": {
          "row": 7,
          "col": 4
        },
        "style": {
        }
      },
      {
        "name": "input_urobilinogen",
        "controltype": "TEXTBOX",
        "value": "Normal",
        "position": {
          "row": 7,
          "col": 5
        },
        "setting_json": {
          "maxLength": "10"
        },
        "style": {}
      }
    ]
  };
  
  