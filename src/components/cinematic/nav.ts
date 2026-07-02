import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import { createElement } from 'react';

import type { CineSidebarItem } from './primitives';

const ANIME_NAME_PATTERN = /anime|animes/i;

function isAnimeView(view: BaseItemDto) {
    return Boolean(view.Name && ANIME_NAME_PATTERN.test(view.Name));
}

function getLibraryHref(path: string, view: BaseItemDto | undefined, collectionType: CollectionType) {
    if (!view?.Id) return path;
    return `${path}?topParentId=${encodeURIComponent(view.Id)}&collectionType=${encodeURIComponent(collectionType)}`;
}

function icon(name: string) {
    return createElement('span', { className: 'material-icons', 'aria-hidden': 'true' }, name);
}

export function getCineLibraryViews(userViews: BaseItemDto[] | undefined) {
    const views = userViews || [];
    const movieView = views.find(view => view.CollectionType === CollectionType.Movies);
    const animeView = views.find(view => view.CollectionType === CollectionType.Tvshows && isAnimeView(view));
    const seriesView = views.find(view => view.CollectionType === CollectionType.Tvshows && !isAnimeView(view));

    return {
        movieView,
        seriesView: seriesView || animeView,
        animeView
    };
}

export function getCineSidebarItems(userViews: BaseItemDto[] | undefined): CineSidebarItem[] {
    const { movieView, seriesView, animeView } = getCineLibraryViews(userViews);
    const items: CineSidebarItem[] = [
        { icon: icon('home'), label: 'Início', href: '/home', key: 'home' },
        { icon: icon('movie'), label: 'Filmes', href: getLibraryHref('/movies', movieView, CollectionType.Movies), key: 'movies' },
        { icon: icon('tv'), label: 'Séries', href: getLibraryHref('/tv', seriesView, CollectionType.Tvshows), key: 'series' }
    ];

    if (animeView) {
        items.push({ icon: icon('animation'), label: 'Anime', href: getLibraryHref('/tv', animeView, CollectionType.Tvshows), key: 'anime' });
    }

    return items;
}

export function getCineSidebarActiveIndex(items: ReadonlyArray<CineSidebarItem>, key: string) {
    const index = items.findIndex(item => item.key === key);
    return index >= 0 ? index : undefined;
}
