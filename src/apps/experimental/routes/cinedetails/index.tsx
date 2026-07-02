import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import {
    CineEpisodeDetail,
    CineMovieDetail,
    CinePersonDetail,
    CineSeasonDetail,
    CineSeriesDetail
} from 'apps/experimental/features/details/cine';
import { useCineItem } from 'apps/experimental/features/details/cine/hooks/useCineItem';

export default function CineDetailsPage() {
    const location = useLocation();
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const itemId = params.get('id') || undefined;
    const { data: item, isLoading } = useCineItem(itemId);

    const view = useMemo(() => {
        if (!item || !itemId) return null;
        switch (item.Type) {
            case 'Movie':
                return <CineMovieDetail itemId={itemId} activeNav='movies' />;
            case 'Series':
                return <CineSeriesDetail itemId={itemId} activeNav='series' />;
            case 'Season':
                return <CineSeasonDetail itemId={itemId} activeNav='series' />;
            case 'Episode':
                return <CineEpisodeDetail itemId={itemId} activeNav='series' />;
            case 'Person':
                return <CinePersonDetail itemId={itemId} />;
            default:
                return null;
        }
    }, [item, itemId]);

    if (!itemId) {
        return (
            <div className='cineDetailEmpty'>
                <h2>Sem ID de item</h2>
                <p>Forneça o parâmetro <code>id</code> na URL: <code>#/cinedetails?id=…</code></p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className='cineDetailLoading'>
                <div className='cineDetailLoadingSpinner' />
                <span>Carregando…</span>
            </div>
        );
    }

    return view;
}
