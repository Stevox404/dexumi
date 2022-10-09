import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Manga } from 'mangadex-full-api';
import { resolveManga } from 'Utils/mfa';
import { standardize } from 'Utils/Standardize';
import GenericListPage from 'Components/shared/GenericListPage';
import { SystemAppBar } from 'Components';

function Search() {
    const [isFetching, setIsFetching] = useState(false);
    const [manga, setManga] = useState([]);
    const { location } = useHistory();

    useEffect(() => {
        fetchManga();
    }, [location]);

    const fetchManga = async () => {
        setIsFetching(true);
        const sp = new URLSearchParams(location.search);
        try {
            const params = JSON.parse(sp.get('query'));
            params.limit = 20;
            let manga = await Manga.search(params);
            manga = await Promise.all(manga.map(async m => {
                const md = await resolveManga(m, { mainCover: true });
                return standardize(md);
            }));
            setManga(manga);
            setIsFetching(false);
        } catch (err) {
            console.error('Malformed query');
        }
    }

    return (
        <>
            <SystemAppBar />
            <GenericListPage
                manga={manga}
                isFetching={isFetching}
            />
        </>
    );
}

export default Search;
