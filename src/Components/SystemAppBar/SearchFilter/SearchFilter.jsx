import React, { useEffect, useState } from 'react';
import MuiXDialog from 'Components/shared/mui-x/GenericDialog';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import FiltersButton from './FiltersButton';
import { Chip, Typography } from '@material-ui/core';
import { Tag } from 'mangadex-full-api';
import { DexCache } from 'Utils';

/**
 * @param {SearchFilter.propTypes} props 
 */
function SearchFilter(props) {
    const [filters, setFilters] = useState(FILTERS);

    useEffect(() => {
        setTagFilters();
    }, [props.filters]);


    async function setTagFilters() {
        if (props.filters) {
            setFilters(props.filters);
            return;
        }

        if (filters.length > FILTERS.length) return;
        const cache = new DexCache();
        cache.name = 'tag-filters';

        let cachedFilters = await cache.fetch();
        if (cachedFilters) {
            appendNewFilters(cachedFilters);
            return;
        }
        const tags = await Tag.getAllTags();
        const filterObj = tags.reduce((acc, tag) => {
            const option = {
                label: tag.name,
                value: tag.id,
            }

            const filter = acc[tag.group] || {
                name: tag.group,
                label: String(tag.group).replace(/^([a-z])/, m1 => m1.toUpperCase()),
                type: 'tag',
                options: []
            };
            filter.options.push(option);

            acc[tag.group] = filter;
            return acc;
        }, {});

        const tagFilters = Object.values(filterObj).map(f => f);
        cache.data = tagFilters;
        cache.save();
        appendNewFilters(tagFilters);
        return;


        function appendNewFilters(filters) {
            setFilters(fs => fs.concat(filters));
        }
    }


    function updateFilters(opts, idx) {
        setFilters(filters => {
            return filters.map((filter, i) => {
                if (i !== idx) return filter;
                const f = { ...filter };
                f.options = opts;
                return f;
            });
        });
    }

    useEffect(() => {
        returnSelectedFilters();
    }, [filters])


    function returnSelectedFilters() {
        const selectedFilters = filters.reduce((acc, filter) => {
            const selFilter = filter.options.reduce((acc, opt) => {
                if (!opt.status) return acc;

                if (!Array.isArray(acc[opt.status])) {
                    acc[opt.status] = [opt.value];
                } else acc[opt.status].push(opt.value);

                return acc;
            }, {});

            if (!selFilter.include && !selFilter.exclude) return acc;

            selFilter.name = filter.name;
            if (filter.type) {
                selFilter.type = filter.type;
            }
            acc.push(selFilter);
            return acc;
        }, []);
        props.onChange(selectedFilters);
    }

    function deselectFilter(idx) {
        setFilters(filters => {
            return filters.map((filter, i) => {
                if (i !== idx) return filter;
                const f = { ...filter };
                f.options = f.options.map(opt => {
                    opt.status = null;
                    return opt;
                });
                return f;
            });
        });
    }

    function getSelectedFiltersTags() {
        const tags = filters.reduce((acc, filter, idx) => {
            const f = filter.options.reduce((acc, opt) => {
                if (opt.status === 'include') {
                    acc.include = (acc.include || 0) + 1;
                } else if (opt.status === 'exclude') {
                    acc.exclude = (acc.exclude || 0) + 1;
                }
                return acc;
            }, {});
            let text = '';
            if (f.include) text += `+${f.include}`;
            if (f.exclude) {
                if (text) text += `, `
                text += `-${f.exclude}`
            };
            if (!text) return acc;
            text = `(${text}) ${filter.label}`;


            acc.push(
                <Chip key={filter.name} label={text} variant='outlined' onDelete={_ => deselectFilter(idx)} />
            );
            return acc;
        }, []);
        if (tags.length) return tags;
        return null;
    }

    return (
        <Dialog
            open={props.open} breakpoint='sm' maxWidth='sm' fullWidth
            hideDialogActions showCloseButton onClose={props.onClose}
            disableBackdropClick={false} title='Search Filters'
        >
            <div id='sel-filters' >
                {
                    getSelectedFiltersTags() ||
                    <Typography color='textSecondary' >Select filters below...</Typography>

                }
            </div>

            {filters.map((filter, idx) => (
                <FiltersButton
                    key={filter.name}
                    options={filter.options}
                    allowExclude={filter.allowExclude ?? true}
                    onChange={(e, opts) => {
                        updateFilters(opts, idx);
                    }}
                >
                    {filter.label}
                </FiltersButton>
            ))}
        </Dialog>
    )
}

const FILTERS = [{
    name: 'publicationDemographic',
    label: 'Demography',
    allowExclude: false,
    options: [
        {
            label: 'Shounen', value: 'shounen', status: null
        }, {
            label: 'Shoujo', value: 'shoujo', status: null
        }, {
            label: 'Josei', value: 'josei', status: null
        }, {
            label: 'Seinen', value: 'seinen', status: null
        }, {
            label: 'None', value: 'none', status: null
        }
    ],
}, {
    name: 'status',
    label: 'Status',
    allowExclude: false,
    options: [
        {
            label: 'Ongoing', value: 'ongoing', status: null
        }, {
            label: 'Completed', value: 'completed', status: null
        }, {
            label: 'Hiatus', value: 'hiatus', status: null
        }, {
            label: 'Cancelled', value: 'cancelled', status: null
        }
    ],
}, {
    name: 'contentRating',
    label: 'Content Rating',
    allowExclude: false,
    options: [
        {
            label: 'Safe', value: 'safe', status: 'include'
        }, {
            label: 'Suggestive', value: 'suggestive', status: 'include'
        }, {
            label: 'Erotica', value: 'erotica', status: 'include'
        }, {
            label: 'Pornographic', value: 'pornographic', status: null
        }
    ]
}];

/**@type {MuiXDialog} */
const Dialog = styled(MuiXDialog)`
    .MuiDialogTitle-root {
        display: flex;
        align-items: center;
    }
    .MuiDialogContent-root {
        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-content: space-between;
        align-content: flex-start;
        row-gap: 1rem;
        column-gap: 1rem;
        padding-bottom: 4rem;
        #sel-filters {
            grid-column: 1 / -1;
            display: flex;
            gap: .4rem;
            overflow-x: auto;
            padding: 0 .8rem .8rem;
            min-height: 4rem;
            .MuiChip-root {
                margin: .2rem;
            }
        }
        .full-width {
            grid-column: 1/3;
        }
        .MuiFormControlLabel-root {
            margin: 0;
            justify-self: flex-start;
        }
    }

    ${({ theme }) => theme.breakpoints.down('sm')}{
        .MuiDialogContent-root {
            grid-template-columns: 1fr;
        }
    }
`;

/**
* @callback OnChangeFn
* @param {Array<{ name: String, include: String[], exclude:[] }>} props - whether the toggle is open or not
*/


SearchFilter.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    /**@type {OnChangeFn} */
    onChange: PropTypes.func,
    filters: PropTypes.object,
    readerSettings: PropTypes.shape({
        displayMode: PropTypes.string,
        imageSize: PropTypes.string,
        readingDir: PropTypes.string,
        arrowScrollSize: PropTypes.number,
        preloadPages: PropTypes.number,
    }),
}


export default SearchFilter;