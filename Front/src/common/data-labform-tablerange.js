export const data_labform_tablerange = {
  "headers": [
    [
      { "name": "hd_row1_col1", "value": "Test", "controltype": "LABEL", "colSpan": 1, "rowSpan": 2, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col2", "value": "Current Result", "controltype": "LABEL", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col3", "value": "Previous Result", "controltype": "LABEL", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col4", "value": "Previous Result", "controltype": "LABEL", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col5", "value": "Unit", "controltype": "LABEL", "colSpan": 1, "rowSpan": 2, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col6", "value": "Reference Range", "controltype": "LABEL", "colSpan": 2, "rowSpan": 2, "style": { "fontWeight": "bold" } }
    ],
    [
      { "name": "data_current-labinspirs_date", "value": "", "controltype": "DATEPICKER", "readonly": false, "colSpan": 1, "rowSpan": 1, "setting_json":{}, "style": {} },
      { "name": "data_prv1-labinspirs_date", "value": "", "controltype": "DATEPICKER", "readonly": true, "colSpan": 1, "rowSpan": 1, "setting_json":{}, "style": {} },
      { "name": "data_prv2-labinspirs_date", "value": "", "controltype": "DATEPICKER", "readonly": true, "colSpan": 1, "rowSpan": 1, "setting_json":{}, "style": {} }
    ]
  ],
  "rows": [
    {
      "cells": [
        { "name": "group_1", "controltype": "LABEL", "value": "Reticulocyte count", "colSpan": 7, "rowSpan": 1, "style": { "fontWeight": "bold" } }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labform_result-labform_testprm-labtspr_name-1", "value": "", "controltype": "LABEL", "setting_json":{}, "style": {} },
          { "name": "data_current-labform_result-labform_testprm-comment-1", "value": "", "controltype": "COMMENT_ICON", "setting_json":"{ \"maxLength\":\"255\",\"defaultValue\":\"ค่าตั้งต้น\" }", "style": {placeholder : "กรุณาระบุ"} }
        ],
        { "name": "data_current-labform_result-labform_testprm-1", "value": "", "controltype": "RANGE", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_prv1-labform_result-labform_testprm-1", "value": "", "controltype": "RANGE_LABEL", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_prv2-labform_result-labform_testprm-1", "value": "", "controltype": "RANGE_LABEL", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-unit-1", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-setting_json-ref_range-1", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labform_result-labform_testprm-labtspr_name-2", "value": "", "controltype": "LABEL", "setting_json":{}, "style": {} },
          { "name": "data_current-labform_result-labform_testprm-comment-2", "value": "", "controltype": "COMMENT_ICON", "setting_json":"{ \"maxLength\":\"255\",\"defaultValue\":\"ค่าตั้งต้น\" }", "style": {placeholder : "กรุณาระบุ"}  }
        ],
        { "name": "data_current-labform_result-labform_testprm-2", "value": "", "controltype": "RANGE", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_prv1-labform_result-labform_testprm-2", "value": "", "controltype": "RANGE_LABEL", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_prv2-labform_result-labform_testprm-2", "value": "", "controltype": "RANGE_LABEL", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-unit-2", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-setting_json-ref_range-2", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labform_result-labform_testprm-labtspr_name-3", "value": "", "controltype": "LABEL", "setting_json":{}, "style": {} },
          { "name": "data_current-labform_result-labform_testprm-comment-3", "value": "", "controltype": "COMMENT_ICON", "show_icon": false, "setting_json":{}, "style": {} }
        ],
        { "name": "data_current-labform_result-labform_testprm-3", "value": "", "controltype": "TEXTBOX", "setting_json":{}, "style": {} },
        { "name": "data_prv1-labform_result-labform_testprm-3", "value": "", "controltype": "LABEL", "setting_json":{}, "style": {} },
        { "name": "data_prv2-labform_result-labform_testprm-3", "value": "", "controltype": "LABEL", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-unit-3", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-setting_json-ref_range-3", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} }
      ]
    },
    {
      "cells": [
        { "name": "group_2", "controltype": "LABEL", "value": "PCV + PP", "colSpan": 7, "rowSpan": 1, "style": { "fontWeight": "bold" } }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labform_result-labform_testprm-labtspr_name-4", "value": "", "controltype": "LABEL", "setting_json":{}, "style": {} },
          { "name": "data_current-labform_result-labform_testprm-comment-4", "value": "", "controltype": "COMMENT_ICON", "setting_json":{}, "style": {} }
        ],
        { "name": "data_current-labform_result-labform_testprm-4", "value": "", "controltype": "RANGE", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_prv1-labform_result-labform_testprm-4", "value": "", "controltype": "RANGE_LABEL", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_prv2-labform_result-labform_testprm-4", "value": "", "controltype": "RANGE_LABEL", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-unit-4", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-setting_json-ref_range-4", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labform_result-labform_testprm-labtspr_name-5", "value": "", "controltype": "LABEL", "setting_json":{}, "style": {} },
          { "name": "data_current-labform_result-labform_testprm-comment-5", "value": "", "controltype": "COMMENT_ICON", "setting_json":{}, "style": {} }
        ],
        { "name": "data_current-labform_result-labform_testprm-5", "value": "", "controltype": "RANGE", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_prv1-labform_result-labform_testprm-5", "value": "", "controltype": "RANGE_LABEL", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_prv2-labform_result-labform_testprm-5", "value": "", "controltype": "RANGE_LABEL", "note_label": "", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-unit-5", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} },
        { "name": "data_current-labform_result-labform_testprm-setting_json-ref_range-5", "value": "", "controltype": "LABEL_DIV_CENTER", "setting_json":{}, "style": {} }
      ]
    }
  ]
};


/* export const data_labform_tablerange = {
    "headers": [
      [
        { "name": "hd_row1_col1", "value": "Test", "controltype": "LABEL", "colSpan": 1, "rowSpan": 2, "style": { "fontWeight": "bold" } },
        { "name": "hd_row1_col2", "value": "Current Result", "controltype": "LABEL", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
        { "name": "hd_row1_col3", "value": "Previous Result", "controltype": "LABEL", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
        { "name": "hd_row1_col4", "value": "Previous Result", "controltype": "LABEL", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
        { "name": "hd_row1_col5", "value": "Unit", "controltype": "LABEL", "colSpan": 1, "rowSpan": 2, "style": { "fontWeight": "bold" } },
        { "name": "hd_row1_col6", "value": "Reference Range", "controltype": "LABEL", "colSpan": 2, "rowSpan": 2, "style": { "fontWeight": "bold" } }
      ],
      [
        { "name": "data_current-labinspirs_date", "value": "", "controltype": "DATEPICKER", "colSpan": 1, "rowSpan": 1 },
        { "name": "data_prv1-labinspirs_date", "value": "", "controltype": "LABEL", "colSpan": 1, "rowSpan": 1 },
        { "name": "data_prv2-labinspirs_date", "value": "", "controltype": "LABEL", "colSpan": 1, "rowSpan": 1 }
      ]
    ],
    "rows": [
    {
      "cells": [
        [
          { "name": "data_current-labform_testprm-name-1", "value": "", "controltype": "LABEL", "style": {} },
          { "name": "data_current-labform_testprm-comment-1", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "data_current-labform_testprm-value-1", "value": "", "controltype": "RANGE", "style": {} },
        { "name": "data_prv1-labform_testprm-value-1", "value": "", "controltype": "RANGE_LABEL", "style": {} },
        { "name": "data_prv2-labform_testprm-value-1", "value": "", "controltype": "RANGE_LABEL", "style": {} },
        { "name": "data_current-labform_testprm-unit-1", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} },
        { "name": "data_current-labform_testprm-ref_range-1", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labtspr_name_2", "value": "", "controltype": "LABEL", "style": {} },
          { "name": "data_current-comment_2", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "data_current-result_2", "value": "", "controltype": "RANGE", "style": {} },
        { "name": "data_prv1-result_2", "value": "", "controltype": "RANGE_LABEL", "style": {} },
        { "name": "data_prv2-result_2", "value": "", "controltype": "RANGE_LABEL", "style": {} },
        { "name": "data_current-unit_2", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} },
        { "name": "data_current-ref_range_2", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labtspr_name_3", "value": "", "controltype": "LABEL", "style": {} },
          { "name": "data_current-comment_3", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "data_current-result_3", "value": "", "controltype": "TEXTBOX", "style": {} },
        { "name": "data_prv1-result_3", "value": "", "controltype": "LABEL", "style": {} },
        { "name": "data_prv2-result_3", "value": "", "controltype": "LABEL", "style": {} },
        { "name": "data_current-unit_3", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} },
        { "name": "data_current-ref_range_3", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labtspr_name_4", "value": "", "controltype": "LABEL", "style": {} },
          { "name": "data_current-comment_4", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "data_current-result_4", "value": "", "controltype": "RANGE", "style": {} },
        { "name": "data_prv1-result_4", "value": "", "controltype": "RANGE_LABEL", "style": {} },
        { "name": "data_prv2-result_4", "value": "", "controltype": "RANGE_LABEL", "style": {} },
        { "name": "data_current-unit_4", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} },
        { "name": "data_current-ref_range_4", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "data_current-labtspr_name_5", "value": "", "controltype": "LABEL", "style": {} },
          { "name": "data_current-comment_5", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "data_current-result_5", "value": "", "controltype": "RANGE", "style": {} },
        { "name": "data_prv1-result_5", "value": "", "controltype": "RANGE_LABEL", "style": {} },
        { "name": "data_prv2-result_5", "value": "", "controltype": "RANGE_LABEL", "style": {} },
        { "name": "data_current-unit_5", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} },
        { "name": "data_current-ref_range_5", "value": "", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    }
  ]
};
   */