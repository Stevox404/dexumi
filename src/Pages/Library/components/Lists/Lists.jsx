import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Manga as MfaManga } from 'mangadex-full-api';
import { addNotification } from 'Redux/actions';
import { DexCache } from 'Utils/StorageManager';
import { standardize } from 'Utils/Standardize';
import { useLocation, useParams } from 'react-router-dom';
import GenericListPage from 'Components/shared/GenericListPage';
import { resolveManga } from 'Utils/mfa';

const cache = new DexCache();

function Lists(props) {
    const [isFetching, setIsFetching] = useState(true);
    const [manga, setManga] = useState([]);

    const dispatch = useDispatch();
    const params = useParams();
    const location = useLocation();

    useEffect(() => {
        const listType = params.listType;
        fetchList(listType);
        const label = listType.replace(/(?:^|_)(\w)/g, m1 => m1.toUpperCase()).replace(/_/g, ' ');
        document.title = `List - ${label}`;
    }, [location]);


    const fetchList = async (listType) => {
        setIsFetching(true);
        cache.name = `list.${listType}`;

        try {
            let list = await cache.fetch();
            if (!list) {
                list = await MfaManga.getAllReadingStatuses(listType);
                list = await Promise.all(Object.keys(list).map(async m => {
                    const md = await resolveManga(m, { mainCover: true });
                    return standardize(md);
                }));
                cache.data = list;
                await cache.save();
            }
            
            setManga(list);
        } catch (err) {
            if (/TypeError/.test(err.message)) {
                dispatch(addNotification({
                    message: "Check your network connection",
                    group: 'network',
                    persist: true,
                }));
            } else {
                throw err;
            }
        } finally {
            setIsFetching(false);
        }
    }

    return (
        <GenericListPage
            manga={manga}
            isFetching={isFetching}
            showPopularity={false}
        />
    );
}

Lists.propTypes = {};

export default Lists;
