export const data_labform_tablerange_with_result = {
    "headers": [
        [
            {
                "name": "hd_row1_col1",
                "value": "Test",
                "controltype": "LABEL",
                "colSpan": 1,
                "rowSpan": 2,
                "style": {
                    "fontWeight": "bold"
                }
            },
            {
                "name": "hd_row1_col2",
                "value": "Current Result",
                "controltype": "LABEL",
                "colSpan": 1,
                "rowSpan": 1,
                "style": {
                    "fontWeight": "bold"
                }
            },
            {
                "name": "hd_row1_col3",
                "value": "Previous Result",
                "controltype": "LABEL",
                "colSpan": 1,
                "rowSpan": 1,
                "style": {
                    "fontWeight": "bold"
                }
            },
            {
                "name": "hd_row1_col4",
                "value": "Previous Result",
                "controltype": "LABEL",
                "colSpan": 1,
                "rowSpan": 1,
                "style": {
                    "fontWeight": "bold"
                }
            },
            {
                "name": "hd_row1_col5",
                "value": "Unit",
                "controltype": "LABEL",
                "colSpan": 1,
                "rowSpan": 2,
                "style": {
                    "fontWeight": "bold"
                }
            },
            {
                "name": "hd_row1_col6",
                "value": "Reference Range",
                "controltype": "LABEL",
                "colSpan": 2,
                "rowSpan": 2,
                "style": {
                    "fontWeight": "bold"
                }
            }
        ],
        [
            {
                "name": "data_current-labinspirs_date",
                "value": "2024-02-15",
                "controltype": "DATEPICKER",
                "readonly": false,
                "colSpan": 1,
                "rowSpan": 1,
                "setting_json": {},
                "style": {}
            },
            {
                "name": "data_prv1-labinspirs_date",
                "value": "2024-02-05",
                "controltype": "DATEPICKER",
                "readonly": true,
                "colSpan": 1,
                "rowSpan": 1,
                "setting_json": {},
                "style": {}
            },
            {
                "name": "data_prv2-labinspirs_date",
                "value": "2024-01-30",
                "controltype": "DATEPICKER",
                "readonly": true,
                "colSpan": 1,
                "rowSpan": 1
            }
        ]
    ],
    "rows": [
        {
            "cells": [
                [
                    {
                        "name": "data_current-labform_result-labform_testprm-labtspr_name-1",
                        "value": "%Reticulocyte",
                        "controltype": "LABEL",
                        "setting_json": {},
                        "style": {}
                    },
                    {
                        "name": "data_current-labform_result-labform_testprm-comment-1",
                        "value": "",
                        "controltype": "COMMENT_ICON",
                        "setting_json": "{ \"maxLength\":\"20\",\"defaultValue\":\"Test comment default\" }",
                        "style": {placeholder : "กรุณาระบบ"}
                    }
                ],
                {
                    "name": "data_current-labform_result-labform_testprm-1",
                    "value": "1.6",
                    "note_label": "H",
                    "controltype": "RANGE",
                    "setting_json": "{ \"ref_range\": \"1 - 1.5\", \"operator\": \"BETWEEN\", \"value1\": \"1\", \"value2\": \"1.5\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
                    "style": {}
                },
                {
                    "name": "data_prv1-labform_result-labform_testprm-1",
                    "value": "0.5",
                    "note_label": "L",
                    "controltype": "RANGE_LABEL",
                    "setting_json": "{ \"ref_range\": \"1 - 1.5\", \"operator\": \"BETWEEN\", \"value1\": \"1\", \"value2\": \"1.5\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
                    "style": {}
                },
                {
                    "name": "data_prv2-labform_result-labform_testprm-1",
                    "value": "2.2",
                    "controltype": "RANGE_LABEL",
                    "setting_json": "{ \"ref_range\": \"1 - 1.5\", \"operator\": \"BETWEEN\", \"value1\": \"1\", \"value2\": \"1.5\", \"note\": \"\", \"note_above\": \"H\", \"note_below\": \"L\" }",
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-unit-1",
                    "value": "%",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-setting_json-ref_range-1",
                    "value": "1 - 1.5",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                }
            ]
        },
        {
            "cells": [
                [
                    {
                        "name": "data_current-labform_result-labform_testprm-labtspr_name-2",
                        "value": "Corrected Reticulocyte Percentage (CRP)",
                        "controltype": "LABEL",
                        "setting_json": {},
                        "style": {}
                    },
                    {
                        "name": "data_current-labform_result-labform_testprm-comment-2",
                        "value": "Test value",
                        "controltype": "COMMENT_ICON",
                        "setting_json": "{ \"maxLength\":\"20\",\"defaultValue\":\"Test comment default\" }",
                        "style": {placeholder : "กรุณาระบบ"}
                    }
                ],
                {
                    "name": "data_current-labform_result-labform_testprm-2",
                    "value": "1.2",
                    "controltype": "RANGE",
                    "setting_json": "{ \"ref_range\": \"> 1.0\", \"operator\": \">\", \"value1\": \"1\", \"value2\": \"\", \"note\": \"Y\", \"note_above\": \"N\", \"note_below\": \"\" }",
                    "style": {}
                },
                {
                    "name": "data_prv1-labform_result-labform_testprm-2",
                    "value": "0",
                    "controltype": "RANGE_LABEL",
                    "setting_json": "{ \"ref_range\": \"> 1.0\", \"operator\": \">\", \"value1\": \"1\", \"value2\": \"\", \"note\": \"Y\", \"note_above\": \"N\", \"note_below\": \"\" }",
                    "style": {}
                },
                {
                    "name": "data_prv2-labform_result-labform_testprm-2",
                    "value": "5",
                    "controltype": "RANGE_LABEL",
                    "setting_json": "{ \"ref_range\": \"> 1.0\", \"operator\": \">\", \"value1\": \"1\", \"value2\": \"\", \"note\": \"Y\", \"note_above\": \"N\", \"note_below\": \"\" }",
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-unit-2",
                    "value": "%",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-setting_json-ref_range-2",
                    "value": "> 1.0",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                }
            ]
        },
        {
            "cells": [
                [
                    {
                        "name": "data_current-labform_result-labform_testprm-labtspr_name-3",
                        "value": "CRP Interpretation",
                        "controltype": "LABEL",
                        "setting_json": {},
                        "style": {}
                    },
                    {
                        "name": "data_current-labform_result-labform_testprm-comment-3",
                        "value": "",
                        "controltype": "COMMENT_ICON",
                        "show_icon": false,
                        "setting_json": {},
                        "style": {}
                    }
                ],
                {
                    "name": "data_current-labform_result-labform_testprm-value-3",
                    "value": "",
                    "controltype": "TEXTBOX",
                    "readonly": true,
                    "required": true,
                    "setting_json": "{ \"maxLength\":\"20\",\"defaultValue\":\"C-Reactive Protein (CRP)\" }",
                    "style": {}
                },
                {
                    "name": "data_prv1-labform_result-labform_testprm-value-3",
                    "value": "Non Regenarative anemia",
                    "controltype": "LABEL",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_prv2-labform_result-labform_testprm-value-3",
                    "value": "Regenarative anemia",
                    "controltype": "LABEL",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-unit-3",
                    "value": "-",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-setting_json-ref_range-3",
                    "value": "",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                }
            ]
        },
        {
            "cells": [
                [
                    {
                        "name": "data_current-labform_result-labform_testprm-labtspr_name-4",
                        "value": "Packed Cell Volume (PCV)",
                        "controltype": "LABEL",
                        "setting_json": {},
                        "style": {}
                    },
                    {
                        "name": "data_current-labform_result-labform_testprm-comment-4",
                        "value": "",
                        "controltype": "COMMENT_ICON",
                        "setting_json": {},
                        "style": {}
                    }
                ],
                {
                    "name": "data_current-labform_result-labform_testprm-value-4",
                    "value": "40",
                    "controltype": "RANGE",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_prv1-labform_result-labform_testprm-value-4",
                    "value": "30",
                    "controltype": "RANGE_LABEL",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_prv2-labform_result-labform_testprm-value-4",
                    "value": "60",
                    "controltype": "RANGE_LABEL",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-unit-4",
                    "value": "%",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-setting-ref_range-4",
                    "value": "",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                }
            ]
        },
        {
            "cells": [
                [
                    {
                        "name": "data_current-labform_result-labform_testprm-labtspr_name-5",
                        "value": "Plasma Protein (PP)",
                        "controltype": "LABEL",
                        "setting_json": {},
                        "style": {}
                    },
                    {
                        "name": "data_current-labform_result-labform_testprm-comment-5",
                        "value": "",
                        "controltype": "COMMENT_ICON",
                        "setting_json": {},
                        "style": {}
                    }
                ],
                {
                    "name": "data_current-labform_result-labform_testprm-value-5",
                    "value": "4",
                    "controltype": "RANGE",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_prv1-labform_result-labform_testprm-value-5",
                    "value": "6",
                    "controltype": "RANGE_LABEL",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_prv2-labform_result-labform_testprm-value-5",
                    "value": "6.5",
                    "controltype": "RANGE_LABEL",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-unit-5",
                    "value": "g/dL",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                },
                {
                    "name": "data_current-labform_result-labform_testprm-setting-ref_range-5",
                    "value": "",
                    "controltype": "LABEL_DIV_CENTER",
                    "setting_json": {},
                    "style": {}
                }
            ]
        }
    ]
}