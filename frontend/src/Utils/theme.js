import { createTheme } from "@material-ui/core";
import { deepOrange } from "@material-ui/core/colors";

const breakpointValues = {
    xs: 480,
    sm: 640,
    md: 960,
    lg: 1280,
    xl: 1920,
};

const theme = createTheme({
    breakpoints: {
        values: breakpointValues,
    },
    palette: {
        primary: {
            main: '#fb8c00',
            contrastText: '#000000',
        },
        secondary: {
            main: '#738cec',
            // main: '#00897b',
        },
        background: {
            default: '#0b0b0b',
            paper: '#222222'
        },
        type: "dark",
    },
    typography: {
        h1: {
            fontSize: '3.3rem',
            fontWeight: 700,
            [`@media (max-width: ${breakpointValues.sm}px)`]: {
                fontSize: '2.2rem',
            }
        },
        h4: {
            fontSize: '2.125rem',
            [`@media (max-width: ${breakpointValues.sm}px)`]: {
                fontSize: '1.6rem',
            }
        },
        body1: {
            fontSize: '1.2rem',
        },
        body2: {
            fontSize: '1.1rem',
        }
    },
    
    props: {
        MuiTextField: {
            variant: 'outlined',
        },
        MuiTooltip: {
            PopperProps: {
                disablePortal: true,
            },
        },
        MuiTypography: {
            color: "textPrimary",
        }
    }
});


console.log(theme);

export default theme;