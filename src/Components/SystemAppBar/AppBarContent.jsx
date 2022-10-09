import {
    alpha, Avatar, Button, Icon, IconButton, InputAdornment,
    Menu as MuiMenu, MenuItem, TextField, useMediaQuery
} from '@material-ui/core';
import { Close, Menu as MenuIcon, Search, SearchOutlined, TuneOutlined } from '@material-ui/icons';
import { useRouter } from 'flitlib';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

function AppBarContent(props) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const { changePage } = useRouter();
    const isXs = useMediaQuery(theme => theme.breakpoints.down('md'));
    const user = useSelector(state => state.user);


    return (
        <>
            {isXs ?
                <XsContainer>
                    <IconButton
                        onClick={_ => props.setShowSearch(state => !state)}
                    >
                        {props.showSearch ?
                            <Close color='action' /> :
                            <Search color='action' />
                        }
                    </IconButton>
                    <IconButton color='inherit' onClick={e => setAnchorEl(e.target)} >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        open={!!anchorEl} onClose={() => setAnchorEl(null)}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom', horizontal: 'right'
                        }}
                        getContentAnchorEl={null}
                        onClick={e => {
                            if (!e.target.disabled) {
                                setAnchorEl(null);
                            }
                        }}
                    >
                        <MenuItem onClick={e => changePage('/login')} >
                            Login
                        </MenuItem>
                    </Menu>
                </XsContainer> :
                <Container >
                    <TextField
                        size='small' fullWidth
                        onChange={e => props.setSearchValue(e.target.value)}
                        onKeyUp={props.handleSearch}
                        value={props.searchValue}
                        onFocus={e => setIsSearchFocused(true)}
                        onBlur={e => setIsSearchFocused(false)}
                        inputProps={{
                            type: 'search',
                            autoComplete: 'search',
                        }}
                        InputProps={{
                            startAdornment: (<InputAdornment position='start' >
                                <Button
                                    size='large' variant='outlined'
                                    onClick={props.requestOpenFilter}
                                    endIcon={<Icon>
                                        <TuneOutlined color={
                                            props.selectedFilters?.length ?
                                                'primary' : 'action'
                                        } />
                                    </Icon>}
                                />
                            </InputAdornment>),
                            endAdornment: (<InputAdornment position='end' >
                                <IconButton
                                    variant='outlined'
                                    onClick={props.handleSearch}
                                >
                                    <SearchOutlined />
                                </IconButton>
                            </InputAdornment>)
                        }}
                    />

                    <div className="action">
                        {Boolean(user) ?
                            <>
                                <Avatar onClick={e => setUserMenuAnchorEl(e.target)} >
                                    {user.username[0]}
                                </Avatar>
                                <Menu
                                    open={!!userMenuAnchorEl} onClose={() => setUserMenuAnchorEl(null)}
                                    anchorEl={userMenuAnchorEl} anchorOrigin={{
                                        vertical: 'bottom', horizontal: 'right'
                                    }}
                                    getContentAnchorEl={null}
                                    onKeyDown={e => e.code === 'Enter' || e.code === 'Space' &&
                                        !e.target.disabled && setUserMenuAnchorEl(null)
                                    }
                                    onClick={e => !e.target.disabled &&
                                        setUserMenuAnchorEl(null)
                                    }
                                >
                                    <MenuItem component={Link} to='/library/follows' >
                                        Library
                                    </MenuItem>
                                    <MenuItem component={Link} to='/profile' >
                                        Profile
                                    </MenuItem>
                                    <MenuItem>
                                        About
                                    </MenuItem>
                                    <MenuItem>
                                        Log out
                                    </MenuItem>
                                </Menu>
                            </> :
                            <>
                                <Button
                                    size='large' color='primary' variant='text'
                                    onClick={e => changePage('/login')}
                                >
                                    Login
                                </Button>
                            </>
                        }
                    </div>
                </Container>
            }
        </>
    )
}




const XsContainer = styled.div`
    flex: 1;
    display: grid;
    justify-items: flex-end;
    grid-template-columns: 1fr auto auto;
    >.MuiToggleButton-root {
        border: none;
    }
`;

const Container = styled.div`
    margin-left: ${({ theme }) => theme.spacing(2)}px;
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr repeat(2, auto);
    flex: 1;
    >.MuiTextField-root {
        justify-self: center;
        max-width: 600px;
        .MuiInputBase-root{
            background-color: ${({ theme }) => alpha(theme.palette.background.paper, .3)};
            padding-left: 0;
            padding-right: 0;
            .MuiInputAdornment-root {
                height: 100%;
                max-height: unset;
                .MuiButton-root {
                    height: 100%;
                    line-height: unset;
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                    .MuiButton-endIcon {
                        margin: 0;
                    }
                }
            }
        }
    }
    >div.action {
        margin-left: ${({ theme }) => theme.spacing(2)}px;
        .MuiAvatar-root {
            cursor: pointer;
        }
    }
`;



const Menu = styled(MuiMenu)`
    a {
        color: inherit;
        text-decoration: none;
    }  
    .MuiMenuItem-root {
        min-width: 150px;
    }
`;

AppBarContent.propTypes = {
    requestOpenFilter: PropTypes.func.isRequired,
    handleSearch: PropTypes.func.isRequired,
    showSearch: PropTypes.bool,
    setShowSearch: PropTypes.func.isRequired,
    searchValue: PropTypes.string,
    setSearchValue: PropTypes.func.isRequired,
    selectedFilters: PropTypes.array,
}

export default AppBarContent

