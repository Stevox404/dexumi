import MomentUtils from '@date-io/moment';
import { MuiThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import NotificationManager from 'Components/shared/mui-x/NotificationManager';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from 'Redux/store';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import theme from 'Utils/theme';
import App from './App';
import './index.css';

const DecoratedApp = () => {
    return (
        <Provider store={store} >
            <MuiThemeProvider theme={theme} >
                <ThemeProvider theme={theme} >
                    <GlobalStyle/>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <BrowserRouter>
                            <SnackbarProvider
                                autoHideDuration={4500}
                                domRoot={document.getElementById('notification-root')}
                            >
                                <App />
                                <NotificationManager />
                            </SnackbarProvider>
                        </BrowserRouter>
                    </MuiPickersUtilsProvider>
                </ThemeProvider>
            </MuiThemeProvider>
        </Provider>
    );
}


const GlobalStyle = createGlobalStyle`
    .notification-snackbar {
        pointer-events: all;
        &[class*="SnackbarItem-contentRoot"] {
            background-color: ${p => p.theme.palette.background.default};
            [class*="SnackbarItem-message"] {
                color: ${p => p.theme.palette.text.primary};
            }
        }
    }
`;


export default DecoratedApp;