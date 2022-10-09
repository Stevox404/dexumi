import {
    AppBar, IconButton, Tab, Tabs, Typography, List,
    useMediaQuery
} from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import React, { useState } from 'react';
import styled from 'styled-components';
import { DownloadListItem } from './DownloadListItem';


function DownloadPage(props) {
    const [tabIndex, setTabIndex] = useState(0);
    const handleTabChange = (e, idx) => {
        setTabIndex(idx);
    }

    const isUnderSm = useMediaQuery(theme => theme.breakpoints.down('sm'));

    return (
        <Wrapper>
            <AppBar position="sticky" color="default" >
                <Typography variant='h5' component='h1' >
                    {isUnderSm &&
                        <IconButton onClick={_ => props.setSidebarOpen(s => !s)} >
                            <Menu />
                        </IconButton>
                    }
                    Download Manager
                </Typography>
            </AppBar>

            <AppBar position="sticky" color="default" >
                <Tabs
                    value={tabIndex}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleTabChange}
                >
                    <Tab label="Queued" />
                    <Tab label="Saved" />
                </Tabs>
            </AppBar>
            <div id="content" >
                <List>
                    <DownloadListItem />
                    <DownloadListItem />
                </List>
            </div>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    overflow-y: hidden;
    .MuiAppBar-root {
        padding-left: 1rem;
        .MuiTabs-root {
            padding-left: 2rem;
        }
    }
    #content {
        height: 100%;
        overflow-y: auto;
        padding: 1rem;
    }
`;

DownloadPage.propTypes = {

}

export default DownloadPage;
