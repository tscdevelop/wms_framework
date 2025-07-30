import React from 'react';
import PropTypes from 'prop-types';
import { Button, Box } from '@mui/material';
import './print.css';

function Output({ onPrint }) {
    const handlePrintComponent = () => {
        onPrint();
    };

    return (
        <div>
            <Box mt={4} display="flex" justifyContent="flex-end">
            <Button onClick={handlePrintComponent} className="no-print">
                Print
            </Button>
            </Box>
        </div>
    );
}

Output.propTypes = {
    onPrint: PropTypes.func.isRequired,
};

export default Output;




