// ปรับ ให้ รองรับ Setting จาก test parameter
export const datatable_reticulocyte_count_PCV_PP = {
  "headers": [
    [
      { "name": "hd_row1_col1", "controltype": "LABEL", "value": "Test", "colSpan": 1, "rowSpan": 2, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col2", "controltype": "LABEL", "value": "Current Result", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col3", "controltype": "LABEL", "value": "Previous Result", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col4", "controltype": "LABEL", "value": "Previous Result", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col5", "controltype": "LABEL", "value": "Unit", "colSpan": 1, "rowSpan": 2, "style": { "fontWeight": "bold" } },
      { "name": "hd_row1_col6", "controltype": "LABEL", "value": "Reference Range", "colSpan": 2, "rowSpan": 2, "style": { "fontWeight": "bold" } }
    ],
    [
      { "name": "hd_row2_col2", "controltype": "DATEPICKER", "value": "", "colSpan": 1, "rowSpan": 1 },
      { "name": "hd_row2_col3", "controltype": "LABEL", "value": "05/02/2024", "colSpan": 1, "rowSpan": 1 },
      { "name": "hd_row2_col4", "controltype": "LABEL", "value": "30/01/2024", "colSpan": 1, "rowSpan": 1 }
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
          { "name": "name_tsprmcode1", "controltype": "LABEL", "value": "%Reticulocyte", "style": {} },
          { "name": "comment_current_tsprmcode1", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode1", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode1", "controltype": "RANGE_LABEL", "value": "0.5", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode1", "controltype": "RANGE_LABEL", "value": "3.2", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "unit_tsprmcode1", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode1", "controltype": "LABEL_DIV_CENTER", "value": "1 - 1.5", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode2", "controltype": "LABEL", "value": "Corrected Reticulocyte Percentage (CRP)", "style": {} },
          { "name": "comment_current_tsprmcode2", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode2", "controltype": "RANGE", "value": "", "operator": ">", "value1": "1.0", "value2": "", "note": "Y", "note_above": "N", "note_below": "", "style": {} },
        { "name": "result_prv1_tsprmcode2", "controltype": "RANGE_LABEL", "value": "0", "operator": ">", "value1": "1.0", "value2": "", "note": "Y", "note_above": "N", "note_below": "", "style": {} },
        { "name": "result_prv2_tsprmcode2", "controltype": "RANGE_LABEL", "value": "1.2", "operator": ">", "value1": "1.0", "value2": "", "note": "Y", "note_above": "N", "note_below": "", "style": {} },
        { "name": "unit_tsprmcode2", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode2", "controltype": "LABEL_DIV_CENTER", "value": "> 1.0", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode5", "controltype": "LABEL", "value": "CRP Interpretation", "style": {} },
          { "name": "comment_current_tsprmcode5", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode5", "controltype": "TEXTBOX", "value": "", "style": {} },
        { "name": "result_prv1_tsprmcode5", "controltype": "LABEL", "value": "Non Regenarative anemia", "style": {} },
        { "name": "result_prv2_tsprmcode5", "controltype": "LABEL", "value": "Regenarative anemia", "style": {} },
        { "name": "unit_tsprmcode5", "controltype": "LABEL_DIV_CENTER", "value": "-", "style": {} },
        { "name": "reference_range_tsprmcode5", "controltype": "LABEL_DIV_CENTER", "value": "-", "style": {} }
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
          { "name": "name_tsprmcode3", "controltype": "LABEL", "value": "Packed Cell Volume (PCV)", "style": {} },
          { "name": "comment_current_tsprmcode3", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_labcode3", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode3", "controltype": "RANGE_LABEL", "value": "35", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode3", "controltype": "RANGE_LABEL", "value": "60", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "unit_tsprmcode3", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode3", "controltype": "LABEL_DIV_CENTER", "value": "37 - 55", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode4", "controltype": "LABEL", "value": "Plasma Protein (PP)", "style": {} },
          { "name": "comment_current_tsprmcode4", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_labcode4", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode4", "controltype": "RANGE_LABEL", "value": "6", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode4", "controltype": "RANGE_LABEL", "value": "5", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "unit_tsprmcode4", "controltype": "LABEL_DIV_CENTER", "value": "g/dL", "style": {} },
        { "name": "reference_range_tsprmcode4", "controltype": "LABEL_DIV_CENTER", "value": "5.7 - 7", "style": {} }
      ]
    }
  ]
};

// ปรับ CompositeLabel เป็นรูปแบบใหม่
/* export const datatable_reticulocyte_count_PCV_PP = {
  "headers": [
    [
      { "name": "hd_row1_col1", "controltype": "LABEL", "value": "Test", "colSpan": 1, "rowSpan": 2, "style": { "fontWeight": "bold"} },
      { "name": "hd_row1_col2", "controltype": "LABEL", "value": "Current Result", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold"} },
      { "name": "hd_row1_col3", "controltype": "LABEL", "value": "Previous Result", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold"} },
      { "name": "hd_row1_col4", "controltype": "LABEL", "value": "Previous Result", "colSpan": 1, "rowSpan": 1, "style": { "fontWeight": "bold"} },
      { "name": "hd_row1_col5", "controltype": "LABEL", "value": "Unit", "colSpan": 1, "rowSpan": 2, "style": { "fontWeight": "bold"} },
      { "name": "hd_row1_col6", "controltype": "LABEL", "value": "Reference Range", "colSpan": 2, "rowSpan": 2, "style": { "fontWeight": "bold"} }
    ],
    [
      { "name": "hd_row2_col2", "controltype": "DATEPICKER", "value": "", "colSpan": 1, "rowSpan": 1 },
      { "name": "hd_row2_col3", "controltype": "LABEL", "value": "05/02/2024", "colSpan": 1, "rowSpan": 1 },
      { "name": "hd_row2_col4", "controltype": "LABEL", "value": "30/01/2024", "colSpan": 1, "rowSpan": 1 }
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
          { "name": "name_tsprmcode1", "controltype": "LABEL", "value": "%Reticulocyte", "style": {} },
          { "name": "comment_current_tsprmcode1", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode1", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode1", "controltype": "RANGE_LABEL", "value": "0.5", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode1", "controltype": "RANGE_LABEL", "value": "3.2", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "unit_tsprmcode1", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode1", "controltype": "LABEL_DIV_CENTER", "value": "1 - 1.5", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode2", "controltype": "LABEL", "value": "Corrected Reticulocyte Percentage (CRP)", "style": {} },
          { "name": "comment_current_tsprmcode2", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode2", "controltype": "RANGE", "value": "", "operator": ">", "value1": "1.0", "value2": "", "note": "Y", "note_above": "N", "note_below": "", "style": {} },
        { "name": "result_prv1_tsprmcode2", "controltype": "RANGE_LABEL", "value": "0", "operator": ">", "value1": "1.0", "value2": "", "note": "Y", "note_above": "N", "note_below": "", "style": {} },
        { "name": "result_prv2_tsprmcode2", "controltype": "RANGE_LABEL", "value": "1.2", "operator": ">", "value1": "1.0", "value2": "", "note": "Y", "note_above": "N", "note_below": "", "style": {} },
        { "name": "unit_tsprmcode2", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode2", "controltype": "LABEL_DIV_CENTER", "value": "> 1.0", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode5", "controltype": "LABEL", "value": "CRP Interpretation", "style": {} },
          { "name": "comment_current_tsprmcode5", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode5", "controltype": "TEXTBOX", "value": "", "style": {} },
        { "name": "result_prv1_tsprmcode5", "controltype": "LABEL", "value": "Non Regenarative anemia", "style": {} },
        { "name": "result_prv2_tsprmcode5", "controltype": "LABEL", "value": "Regenarative anemia", "style": {} },
        { "name": "unit_tsprmcode5", "controltype": "LABEL_DIV_CENTER", "value": "-", "style": {} },
        { "name": "reference_range_tsprmcode5", "controltype": "LABEL_DIV_CENTER", "value": "-", "style": {} }
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
          { "name": "name_tsprmcode3", "controltype": "LABEL", "value": "Packed Cell Volume (PCV)", "style": {} },
          { "name": "comment_current_tsprmcode3", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_labcode3", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode3", "controltype": "RANGE_LABEL", "value": "35", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode3", "controltype": "RANGE_LABEL", "value": "60", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "unit_tsprmcode3", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode3", "controltype": "LABEL_DIV_CENTER", "value": "37 - 55", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode4", "controltype": "LABEL", "value": "Plasma Protein (PP)", "style": {} },
          { "name": "comment_current_tsprmcode4", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_labcode4", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode4", "controltype": "RANGE_LABEL", "value": "6", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode4", "controltype": "RANGE_LABEL", "value": "5", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "unit_tsprmcode4", "controltype": "LABEL_DIV_CENTER", "value": "g/dL", "style": {} },
        { "name": "reference_range_tsprmcode4", "controltype": "LABEL_DIV_CENTER", "value": "5.7 - 7", "style": {} }
      ]
    }
  ]
}; */


/* export const datatable_reticulocyte_count_PCV_PP = {
  "headers": [
    [
      { "name": "hd_row1_col1", "controltype": "LABEL", "value": "Test", "colSpan": 1, "rowSpan": 2, "style": {} },
      { "name": "hd_row1_col2", "controltype": "LABEL", "value": "Current Result", "colSpan": 1, "rowSpan": 1, "style": {} },
      { "name": "hd_row1_col3", "controltype": "LABEL", "value": "Previous Result", "colSpan": 1, "rowSpan": 1, "style": {} },
      { "name": "hd_row1_col4", "controltype": "LABEL", "value": "Previous Result", "colSpan": 1, "rowSpan": 1, "style": {} },
      { "name": "hd_row1_col5", "controltype": "LABEL", "value": "Unit", "colSpan": 1, "rowSpan": 2, "style": {} },
      { "name": "hd_row1_col6", "controltype": "LABEL", "value": "Reference Range", "colSpan": 2, "rowSpan": 2, "style": {} }
    ],
    [
      { "name": "hd_row2_col2", "controltype": "DATEPICKER", "value": "", "colSpan": 1, "rowSpan": 1 },
      { "name": "hd_row2_col3", "controltype": "LABEL", "value": "05/02/67", "colSpan": 1, "rowSpan": 1 },
      { "name": "hd_row2_col4", "controltype": "LABEL", "value": "30/01/67", "colSpan": 1, "rowSpan": 1 }
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
          { "name": "name_tsprmcode1", "controltype": "LABEL", "value": "%Reticulocyte", "style": {} },
          { "name": "comment_current_tsprmcode1", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode1", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode1", "controltype": "COMPOSITE_LABEL", "value": "1.3", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode1", "controltype": "COMPOSITE_LABEL", "value": "1.2", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L", "style": {} },

        { "name": "unit_tsprmcode1", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode1", "controltype": "LABEL_DIV_CENTER", "value": "1 - 1.5", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode2", "controltype": "LABEL", "value": "Corrected Reticulocyte Percentage (CRP)", "style": {} },
          { "name": "comment_current_tsprmcode2", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode2", "controltype": "RANGE", "value": "", "operator": ">", "value1": "1.0", "value2": "", "note": "correct", "note_above": "", "note_below": "incorrect", "style": {} },
        { "name": "result_prv1_tsprmcode2", "controltype": "COMPOSITE_LABEL", "value": "0", "operator": ">", "value1": "1.0", "value2": "", "note": "correct", "note_above": "", "note_below": "incorrect", "style": {} },
        { "name": "result_prv2_tsprmcode2", "controltype": "COMPOSITE_LABEL", "value": "0", "operator": ">", "value1": "1.0", "value2": "", "note": "correct", "note_above": "", "note_below": "incorrect", "style": {} },
        { "name": "unit_tsprmcode2", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode2", "controltype": "LABEL_DIV_CENTER", "value": "> 1.0", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode5", "controltype": "LABEL", "value": "CRP Interpretation", "style": {} },
          { "name": "comment_current_tsprmcode5", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_tsprmcode5", "controltype": "TEXTBOX", "value": "", "style": {} },
        { "name": "result_prv1_tsprmcode5", "controltype": "LABEL", "value": "Non Regenarative anemia", "style": {} },
        { "name": "result_prv2_tsprmcode5", "controltype": "LABEL", "value": "Regenarative anemia", "style": {} },
        { "name": "unit_tsprmcode5", "controltype": "LABEL_DIV_CENTER", "value": "-", "style": {} },
        { "name": "reference_range_tsprmcode5", "controltype": "LABEL_DIV_CENTER", "value": "-", "style": {} }
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
          { "name": "name_tsprmcode3", "controltype": "LABEL", "value": "Packed Cell Volume (PCV)", "style": {} },
          { "name": "comment_current_tsprmcode3", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_labcode3", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode3", "controltype": "COMPOSITE_LABEL", "value": "35", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode3", "controltype": "COMPOSITE_LABEL", "value": "60", "operator": "BETWEEN", "value1": "37", "value2": "55", "note": "Y", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "unit_tsprmcode3", "controltype": "LABEL_DIV_CENTER", "value": "%", "style": {} },
        { "name": "reference_range_tsprmcode3", "controltype": "LABEL_DIV_CENTER", "value": "37 - 55", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "name_tsprmcode4", "controltype": "LABEL", "value": "Plasma Protein (PP)", "style": {} },
          { "name": "comment_current_tsprmcode4", "controltype": "COMMENT_ICON", "value": "", "style": {} }
        ],
        { "name": "result_current_labcode4", "controltype": "RANGE", "value": "", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv1_tsprmcode4", "controltype": "COMPOSITE_LABEL", "value": "6", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "result_prv2_tsprmcode4", "controltype": "COMPOSITE_LABEL", "value": "5", "operator": "BETWEEN", "value1": "5.7", "value2": "7", "note": "", "note_above": "H", "note_below": "L", "style": {} },
        { "name": "unit_tsprmcode4", "controltype": "LABEL_DIV_CENTER", "value": "g/dL", "style": {} },
        { "name": "reference_range_tsprmcode4", "controltype": "LABEL_DIV_CENTER", "value": "5.7 - 7", "style": {} }
      ]
    }
  ]
}; */

/* export const datatable_reticulocyte_count_PCV_PP = {
  "headers": [
    [
      { "name": "hd_row1_col1", "value": "Test", "colSpan": 2, "rowSpan": 2, "controltype": "LABEL", "style": {} },
      { "name": "hd_row1_col2", "value": "Current Result", "colSpan": 1, "rowSpan": 1, "controltype": "LABEL", "style": {} },
      { "name": "hd_row1_col3", "value": "Previous Result", "colSpan": 1, "rowSpan": 1, "controltype": "LABEL", "style": {} },
      { "name": "hd_row1_col4", "value": "Previous Result", "colSpan": 1, "rowSpan": 1, "controltype": "LABEL", "style": {} },
      { "name": "hd_row1_col5", "value": "Unit", "colSpan": 1, "rowSpan": 2, "controltype": "LABEL", "style": {} },
      { "name": "hd_row1_col6", "value": "Reference Range", "colSpan": 2, "rowSpan": 2, "controltype": "LABEL", "style": {} }
    ],
    [
      { "name": "hd_row2_col2", "value": "{result_current.date}", "colSpan": 1, "rowSpan": 1, "controltype": "DATEPICKER" },
      { "name": "hd_row2_col3", "value": "{result_prev1.date}", "colSpan": 1, "rowSpan": 1, "controltype": "LABEL" },
      { "name": "hd_row2_col4", "value": "{result_prev2.date}", "colSpan": 1, "rowSpan": 1, "controltype": "LABEL" }
    ]
  ],
  "rows": [
    {
      "cells": [
        { "name": "dt_row1_col1", "value": "Reticulocyte count", "colSpan": 7, "rowSpan": 1, "controltype": "LABEL", "style": {"fontWeight": "bold"} }
      ]
    },
    {
      "cells": [
        [
          { "name": "{result_current.code}", "value": "{result_current.name}", "controltype": "LABEL", "style": {} },
          { "name": "{result_current.comment}", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "cell_textbox1", "value": "{result_current.value}", "min": "1", "max": "1.5", "controltype": "TEXTBOX", "style": {} },
        { "name": "cell_textbox2", "value": "{result_prev1.value}", "controltype": "TEXTBOX", "style": {} },
        { "name": "cell_textbox3", "value": "{result_prev1.value}", "controltype": "TEXTBOX", "style": {} },
        { "name": "cell_unit_percent_reticulocyte","value": "%", "controltype": "LABEL_DIV_CENTER",  "style": {} },
        { "name": "cell_range_percent_reticulocyte", "value": "1 - 1.5", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "cell_crp", "value": "Corrected Reticulocyte Percentage (CRP)", "controltype": "LABEL", "style": {} },
          { "name": "cell_comment_crp", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "cell_textbox_crp", "value": "0", "min": "1", "max": "100", "controltype": "TEXTBOX", "style": {} },
        { "name": "cell_textbox_crp_prev1", "value": "0", "controltype": "TEXTBOX", "style": {} },
        { "name": "cell_textbox_crp_prev2", "value": "0", "controltype": "TEXTBOX", "style": {} },
        { "name": "cell_unit_crp", "value": "%", "controltype": "LABEL_DIV_CENTER", "style": {} },
        { "name": "cell_range_crp", "value": ">1.0", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    },
    {
      "cells": [
        { "name": "row_pcv_pp", "value": "PCV + PP", "colSpan": 7, "rowSpan": 1, "controltype": "LABEL", "style": {"fontWeight": "bold"} }
      ]
    },
    {
      "cells": [
        [
          { "name": "cell_pcv", "value": "Packed Cell Volume (PCV)", "controltype": "LABEL", "style": {} },
          { "name": "cell_comment_pcv", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "cell_textbox_pcv", "value": "40", "min": "30", "max": "55", "controltype": "TEXTBOX", "style": {"color":"red"}, "flag": "Normal" },
        { "name": "cell_textbox_pcv_prev1", "parts": [
                {
                  "value": "35",
                  "style": { "color": "blue" }
                },
                {
                  "value": "L",
                  "style": { "color": "blue" }
                }
              ], "controltype": "COMPOSITE_LABEL", "style": {} },
        { "name": "cell_textbox_pcv_prev2", "parts": [
                {
                  "value": "60",
                  "style": { "color": "red" }
                },
                {
                  "value": "H",
                  "style": { "color": "red" }
                }
              ], "controltype": "COMPOSITE_LABEL", "style": {} },
        { "name": "cell_unit_pcv", "value": "%", "controltype": "LABEL_DIV_CENTER", "style": {} },
        { "name": "cell_range_pcv", "value": "37 - 55", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    },
    {
      "cells": [
        [
          { "name": "cell_pp", "value": "Plasma Protein (PP)", "controltype": "LABEL", "style": {} },
          { "name": "cell_comment_pp", "value": "", "controltype": "COMMENT_ICON", "style": {} }
        ],
        { "name": "cell_textbox_pp", "value": "25", "min": "5.7", "max": "7", "controltype": "TEXTBOX", "style": {}, "flag": "H" },
        { "name": "cell_textbox_pp_prev1", "parts": [
                {
                  "value": "6",
                  "style": {  }
                },
                {
                  "value": "",
                  "style": {  }
                }
              ], "controltype": "COMPOSITE_LABEL", "style": {} },
        { "name": "cell_textbox_pp_prev2", "parts": [
                {
                  "value": "5",
                  "style": { "color": "blue" }
                },
                {
                  "value": "L",
                  "style": { "color": "blue" }
                }
              ], "controltype": "COMPOSITE_LABEL", "style": {} },
        { "name": "cell_unit_pp", "value": "g/dL", "controltype": "LABEL_DIV_CENTER", "style": {} },
        { "name": "cell_range_pp", "value": "5.7 - 7", "controltype": "LABEL_DIV_CENTER", "style": {} }
      ]
    }
  ]
}; */