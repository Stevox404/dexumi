import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components';
import { ButtonBase, Chip, Icon, IconButton, Typography } from '@material-ui/core';
import {
    LibraryBooksOutlined, StarOutlined, BarChartOutlined, VisibilityOutlined, BookmarkOutlined, OpenInNewOutlined, AddCircleOutline, EditOutlined,
} from '@material-ui/icons';
import amz from 'Assets/images/sites/amz.ico';
import al from 'Assets/images/sites/al.png';
import ap from 'Assets/images/sites/ap.png';
import bw from 'Assets/images/sites/bw.png';
import cdj from 'Assets/images/sites/cdj.ico';
import ebj from 'Assets/images/sites/ebj.ico';
import kt from 'Assets/images/sites/kt.png';
import mal from 'Assets/images/sites/mal.png';
import mu from 'Assets/images/sites/mu.svg';
import nu from 'Assets/images/sites/nu.png';

function InfoTab(props) {
    if(!props.manga) return null;
    
    return (
        <Container>
            <InfoItem title='Alt Names' >
                {props.manga.altTitles?.map(t =>
                    <AltName key={t} >{t}</AltName>
                )}
            </InfoItem>
            <InfoItem title='Author' >
                {props.manga.authors?.map(a =>
                    <Typography key={a.id} className='listing' >
                        <a href='#' >{a.name}</a>
                    </Typography>
                )}
            </InfoItem>
            <InfoItem title='Artist' >
                {props.manga.artists?.map(a =>
                    <Typography key={a.id} className='listing' >
                        <a href='#' >{a.name}</a>
                    </Typography>
                )}
            </InfoItem>
            {props.manga.publicationDemographic &&
                <InfoItem title='Demographic' >
                    <Chip clickable variant='outlined' label={props.manga.publicationDemographic} />
                </InfoItem>
            }
            <InfoItem title='Genre' >
                {props.manga.genre?.map(t =>
                    <Chip key={t} clickable variant='outlined' label={t} />
                )}
            </InfoItem>
            <InfoItem title='Rating' >
                <IconTextItem clickable icon={StarOutlined} iconProps={{ color: 'primary' }} >
                    {props.manga.userRating || '--'}
                </IconTextItem>
                <IconTextItem icon={StarOutlined} >
                    {Math.round(props.manga?.rating) || '--'}/10
                </IconTextItem>
                <IconButton disabled >
                    <BarChartOutlined />
                </IconButton>
            </InfoItem>
            <InfoItem title='Pub Status' >
                <Typography>{props.manga.status}</Typography>
            </InfoItem>
            <InfoItem title='Stats' >
                <IconTextItem icon={BookmarkOutlined} >
                    {props.manga.follows}
                </IconTextItem>
            </InfoItem>
            {props.manga.links.raw &&
                <InfoItem title='Official' >
                    <IconTextItem icon={OpenInNewOutlined} >
                        <a href={props.manga.links.raw} target='_blank' >Raw</a>
                    </IconTextItem>
                </InfoItem>
            }
            {(
                props.manga.links.engtl ||
                props.manga.links.amz ||
                props.manga.links.bw ||
                props.manga.links.ebj ||
                props.manga.links.cdj
            ) &&
                <InfoItem title='Retail' >
                    <ExtLink
                        name='Official English Translation'
                        href={props.manga.links.engtl}
                    />
                    <ExtLink
                        img={amz} name='Amazon'
                        href={props.manga.links.amz}
                    />
                    <ExtLink
                        img={bw} name='Bookwalker'
                        href={props.manga.links.bw}
                    />
                    <ExtLink
                        img={ebj} name='eBookJapan'
                        href={props.manga.links.ebj}
                    />
                    <ExtLink
                        img={cdj} name='CD Japan'
                        href={props.manga.links.cdj}
                    />
                </InfoItem>
            }
            {(
                props.manga.links.al ||
                props.manga.links.ap ||
                props.manga.links.kt ||
                props.manga.links.mal ||
                props.manga.links.mu ||
                props.manga.links.nu
            ) &&
                <InfoItem title='Info' >
                    <ExtLink
                        img={al} name='Anilist'
                        href={props.manga.links.al}
                    />
                    <ExtLink
                        img={ap} name='Anime-Planet'
                        href={props.manga.links.ap}
                    />
                    <ExtLink
                        img={kt} name='Kitsu'
                        href={props.manga.links.kt}
                    />
                    <ExtLink
                        img={mal} name='MyAnimeList'
                        href={props.manga.links.mal}
                    />
                    <ExtLink
                        img={mu} name='NovelUpdates'
                        href={props.manga.links.mu}
                    />
                    <ExtLink
                        img={nu} name='NovelUpdates'
                        href={props.manga.links.nu}
                    />
                </InfoItem>
            }
            <InfoItem title='Reading Progress' >
                {props.manga.volumeCount > 1 &&
                    <ProgressItem>
                        Volume 0/{props.manga.volumeCount}
                    </ProgressItem>
                }
                <ProgressItem>
                    Chapter 0/{props.manga.chapterCount}
                </ProgressItem>
                <IconButton disabled size='small' ><EditOutlined /> </IconButton>
            </InfoItem>
            <InfoItem title='Reading Status' >
                <Typography>
                    {props.manga.readingStatus}
                </Typography>
                <IconButton disabled size='small' ><EditOutlined /> </IconButton>
            </InfoItem>
        </Container>
    )
}



const InfoItem = props => (
    <>
        <Typography variant='body2' >{props.title}</Typography>
        <div>
            {props.children}
        </div>
    </>
);

const IconTextItem = ({ icon: IconProp, ...props }) => {
    const Container = (props.clickable || props.onClick) ? ButtonBase : 'div';

    return (
        <Container className='icon-text' >
            <IconProp fontSize='small' {...props.iconProps} />
            <Typography variant='body2' >{props.children}</Typography>
        </Container>
    );
}

const AltName = props => (
    <IconTextItem icon={LibraryBooksOutlined} {...props} />
);

const ExtLink = props => {
    return props.href ? (
        <div className='ext-link icon-text' >
            {props.img && <img src={props.img} />}
            <Typography>
                <a href={props.href} target='_blank' >{props.name}</a>
            </Typography>
        </div>
    ) : null;
}

const ProgressItem = props => (
    <div className='icon-text' >
        <Typography>{props.children}</Typography>
        <IconButton disabled size='small' color='secondary' onClick={props.onClick} >
            <AddCircleOutline />
        </IconButton>
    </div>
);



const Container = styled.div`
    padding: 1rem 2rem;
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 2rem;
    row-gap: 1.4rem;
    align-items: baseline;
    >:nth-child(odd){
        font-weight: bold;
    }
    >:nth-child(even){
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        >* {
            margin-right: 1.2rem;
        }

        >.listing:not(:last-child)::after {
            content: ',';
        }
        
        .icon-text {
            margin-right: 2.4rem;
            display: flex;
            white-space: nowrap;
            align-items: center;
            gap: .4rem;
        }

        >.MuiButtonBase-root {
            padding-left: .8rem;
            padding-right: .8rem;
        }

        .ext-link {
            img {
                width: 16px;
                height: 16px;
                border-radius: 3px;
                border: 1px solid ${({ theme }) => theme.palette.text.primary};
            }
        }
    }
`;

InfoTab.propTypes = {
    manga: PropTypes.object,
}

export default InfoTab

