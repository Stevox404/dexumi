import {
    AppBar, Button, ButtonGroup, ListItemIcon, Menu, MenuItem, Toolbar
} from '@material-ui/core';
import {
    BookmarkOutlined, ChromeReaderModeOutlined, DeleteOutlined,
    HourglassFullOutlined, KeyboardArrowDownOutlined, LibraryAddCheckOutlined
} from '@material-ui/icons';
import { SystemAppBar } from 'Components';
import { Lists, Follows } from './components';
import { useRouter } from 'flitlib';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation, useParams, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';

function Library() {
    const language = useSelector(state => state.language);
    const [listAnchorEl, setListAnchorEl] = useState(null);
    const [selectedTab, setSelectedTab] = useState('feed');
    const [selectedList, setSelectedList] = useState(null);


    const user = useSelector(state => state.user);
    const loading = useSelector(state => state.pending.length > 0);
    const { changePage } = useRouter();


    const lists = {
        'reading': {
            label: 'Reading',
            icon: <ChromeReaderModeOutlined />
        },
        'plan_to_read': {
            label: 'Plan to Read',
            icon: <BookmarkOutlined />
        },
        'on_hold': {
            label: 'On Hold',
            icon: <HourglassFullOutlined />
        },
        'completed': {
            label: 'Completed',
            icon: <LibraryAddCheckOutlined />
        },
        'dropped': {
            label: 'Dropped',
            icon: <DeleteOutlined />
        }
    };

    const selectList = list => {
        setSelectedList(list);
        setSelectedTab('lists');
        changePage(`/library/lists/${list}`);
        setListAnchorEl(null);
    }

    const getButtonProps = btn => {
        if (btn === selectedTab) {
            return ({
                color: 'primary',
                variant: 'contained',
                className: 'selected',
            });
        }
        return {};
    }

    const getPageContent = () => (
        <Switch>
            <Route path='/library/lists/:listType' component={Lists} />
            <Route path='/library/follows' component={Follows} />
            <Route component={Follows} />
        </Switch>
    );

    const match = useRouteMatch("/library/lists/:listType");
    useEffect(() => {
        const listType = match?.params?.listType;
        if(listType && selectedList !== listType){
            selectList(listType);
        } else {
            setSelectedTab('feed');
            setSelectedList(null);
        }
    }, []);
    

    if (!user && !loading) {
        // TODO if loading return loader
        return <Redirect to='/login' />
    }

    return (
        <>
            <SystemAppBar />
            <Wrapper className='page clear-appBar' >
                <AppBar position="sticky" color="default" >
                    <Toolbar>
                        <ButtonGroup >
                            <Button
                                onClick={_ => {
                                    setSelectedTab('feed');
                                    changePage(`/library/follows`);
                                    setSelectedList(null);
                                }}
                                {...getButtonProps('feed')}
                            >
                                Latest Updates
                            </Button>
                            <Button
                                {...getButtonProps('lists')}
                                endIcon={<KeyboardArrowDownOutlined />}
                                onClick={e => setListAnchorEl(e.currentTarget)}
                            >
                                {(selectedTab === 'lists') ? lists[selectedList].label : 'Lists'}
                            </Button>
                            <Button
                                {...getButtonProps('customLists')}
                                onClick={_ => {
                                    setSelectedTab('customLists');
                                    setSelectedList(null);
                                }}
                                disabled endIcon={<KeyboardArrowDownOutlined />}
                            >
                                Custom Lists
                            </Button>
                        </ButtonGroup>
                    </Toolbar>
                </AppBar>
                <div id="container" className='clear-appBar' >
                    {getPageContent()}
                </div>
                <Menu
                    anchorEl={listAnchorEl} open={!!listAnchorEl}
                    onClose={e => setListAnchorEl(null)}
                    getContentAnchorEl={null} anchorOrigin={{
                        vertical: 'bottom', horizontal: 'left'
                    }}
                >
                    {Object.entries(lists).map(([key, el]) => (
                        <MenuItem
                            value={key} selected={selectedList === key}
                            onClick={_ => selectList(key)} key={key}
                        >
                            <ListItemIcon>
                                {el.icon}
                            </ListItemIcon>
                            {el.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Wrapper>
        </>
    );
}


const Wrapper = styled.div`
    #container {
        display: grid;
        grid-template-columns: 1fr;

        .MuiButton-root {
            display: none;
            margin: 2rem auto;
            width: 50%;
            min-width: 12rem;
            justify-self: center;
        }
    }
`;



export default Library;
