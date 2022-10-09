import { ListItemIcon, MenuItem, useMediaQuery } from '@material-ui/core';
import { Person, CloudDownload } from '@material-ui/icons';
import { SystemAppBar } from 'Components';
import SideDrawer from 'Components/shared/mui-x/SideDrawer';
import { DownloadPage } from './components';
import React, { useState } from 'react';
import { Link, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';


function Settings() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isUnderSm = useMediaQuery(theme => theme.breakpoints.down('sm'));
    const isUnderXs = useMediaQuery(theme => theme.breakpoints.down('xs'));

    const { path: pathname } = useRouteMatch();

    return (
        <>
            <SystemAppBar />
            <Wrapper className='page fill-screen clear-appBar' >
                <SideDrawer
                    className='clear-appBar'
                    open={isUnderSm ? sidebarOpen : true} anchor='left'
                    onClose={_ => setSidebarOpen(false)}
                    variant={isUnderSm ? 'temporary' : 'permanent'}
                    maxWidth={isUnderXs ? '75%' : 300}
                >
                    <MenuItem component={Link} to={`${pathname}/`} >
                        <ListItemIcon>
                            <Person />
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem component={Link} to={`${pathname}/downloads`} >
                        <ListItemIcon>
                            <CloudDownload />
                        </ListItemIcon>
                        Download Manager
                    </MenuItem>
                </SideDrawer>
                <Switch>
                    <Route path={`${pathname}/`} exact component={'div'} />
                    <Route path={`${pathname}/downloads`} component={DownloadPage} />
                </Switch>
            </Wrapper>
        </>
    )
}

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    .uiSideDrawer-paper {
        padding-top: 1rem;
        a {
            color: inherit;
        }
    }
`;

export default Settings;
