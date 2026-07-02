import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import React, { type CSSProperties, type FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getBackdropUrl, getPosterUrl } from 'apps/experimental/features/details/cine/utils/imageUrls';
import { CineSidebar, getCineLibraryViews, getCineSidebarActiveIndex, getCineSidebarItems, CineShell } from 'components/cinematic';
import useCurrentTab from 'hooks/useCurrentTab';
import { useGetItems } from 'hooks/useFetchItems';
import { useApi } from 'hooks/useApi';
import { useUserViews } from 'hooks/api/useUserViews';
import type { ItemDto } from 'types/base/models/item-dto';

import './cineLibrary.scss';

type CineLibraryKind = typeof CollectionType.Movies | typeof CollectionType.Tvshows;

type CineLibraryPageProps = Readonly<{
    type: CineLibraryKind;
}>;

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getLibraryTitle(type: CineLibraryKind, isAnime: boolean) {
    if (isAnime) return 'Anime';
    return type === CollectionType.Movies ? 'Filmes' : 'Séries';
}

function getItemTypes(type: CineLibraryKind) {
    return type === CollectionType.Movies ? [BaseItemKind.Movie] : [BaseItemKind.Series];
}

function getActiveNavKey(type: CineLibraryKind, isAnime: boolean) {
    if (isAnime) return 'anime';
    return type === CollectionType.Movies ? 'movies' : 'series';
}

function getYear(item: ItemDto) {
    return item.ProductionYear ? String(item.ProductionYear) : '';
}

function getRuntime(item: ItemDto) {
    if (!item.RunTimeTicks) return '';
    const totalMinutes = Math.round(item.RunTimeTicks / 600000000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (!hours) return `${minutes}min`;
    return `${hours}h ${minutes}min`;
}

function getProgress(item: ItemDto) {
    const position = item.UserData?.PlaybackPositionTicks || 0;
    const runtime = item.RunTimeTicks || 0;
    if (!position || !runtime) return 0;
    return Math.min(100, Math.max(0, (position / runtime) * 100));
}

function getQuality(item: ItemDto) {
    const videoStream = item.MediaSources
        ?.flatMap(source => source.MediaStreams || [])
        .find(stream => stream.Type === 'Video');
    const width = videoStream?.Width || 0;
    const height = videoStream?.Height || 0;

    if (width >= 3800 || height >= 2100) return '4K';
    if (width >= 1280 || height >= 700) return 'HD';
    return '';
}

function getCinePosterUrl(apiClient: NonNullable<ReturnType<typeof useApi>['__legacyApiClient__']>, item: ItemDto, maxWidth?: number) {
    return getPosterUrl(apiClient, item as BaseItemDto, maxWidth);
}

function getCineBackdropUrl(apiClient: NonNullable<ReturnType<typeof useApi>['__legacyApiClient__']>, item: ItemDto) {
    return getBackdropUrl(apiClient, item as BaseItemDto);
}

function getItemHref(item: ItemDto) {
    return item.Id ? `/cinedetails?id=${encodeURIComponent(item.Id)}` : '#';
}

function itemMatchesSearch(item: ItemDto, search: string) {
    if (!search.trim()) return true;
    return (item.Name || '').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
}

function itemMatchesLetter(item: ItemDto, letter: string) {
    if (letter === 'Todos') return true;
    const first = (item.SortName || item.Name || '').trim().charAt(0).toUpperCase();
    if (letter === '#') return !first || first < 'A' || first > 'Z';
    return first === letter;
}

function sortItems(items: ItemDto[], filter: string) {
    const sorted = [...items];
    if (filter === 'Recentes') {
        return sorted.sort((a, b) => (Date.parse(b.DateCreated || '') || 0) - (Date.parse(a.DateCreated || '') || 0));
    }
    if (filter === 'Nota') {
        return sorted.sort((a, b) => (b.CommunityRating || 0) - (a.CommunityRating || 0));
    }
    if (filter === 'Ano') {
        return sorted.sort((a, b) => (b.ProductionYear || 0) - (a.ProductionYear || 0));
    }
    return sorted.sort((a, b) => (a.SortName || a.Name || '').localeCompare(b.SortName || b.Name || ''));
}

function CineLibraryCard({ item, index }: Readonly<{ item: ItemDto; index: number }>) {
    const { __legacyApiClient__: apiClient } = useApi();
    const imageUrl = apiClient ? getCinePosterUrl(apiClient, item, 500) || getCineBackdropUrl(apiClient, item) : undefined;
    const style = imageUrl ? { '--cine-library-card-image': `url('${imageUrl.replace(/'/g, '%27')}')` } as CSSProperties : undefined;
    const progress = getProgress(item);
    const quality = getQuality(item);
    const year = getYear(item);
    const runtime = getRuntime(item);
    const rating = item.CommunityRating ? item.CommunityRating.toFixed(1) : '';
    const genres = (item.Genres || []).slice(0, 3);

    return (
        <article className='cineLibraryCard cineReveal' style={{ '--cine-delay': `${(index % 8) * 0.04}s` } as CSSProperties}>
            <Link to={getItemHref(item)} className='cineLibraryCardLink'>
                <div className='cineLibraryPoster' style={style}>
                    {quality && <span className='cineLibraryQuality'>{quality}</span>}
                    <div className='cineLibraryHover'>
                        <div className='cineLibraryHoverMeta'>
                            {rating && <span className='cineLibraryRating'>★ {rating}</span>}
                            {runtime && <span>{runtime}</span>}
                            {year && <span>{year}</span>}
                        </div>
                        {item.Overview && <p>{item.Overview}</p>}
                        {!!genres.length && (
                            <div className='cineLibraryGenreRow'>
                                {genres.map(genre => <span key={genre}>{genre}</span>)}
                            </div>
                        )}
                        <div className='cineLibraryHoverActions'>
                            <span>▶ Reproduzir</span>
                            <b>+</b>
                        </div>
                    </div>
                </div>
                {progress > 0 && (
                    <div className='cineLibraryProgress'>
                        <span style={{ width: `${progress}%` }} />
                    </div>
                )}
                <h3>{item.Name}</h3>
                <p>{[year, item.Type === 'Series' ? 'Série' : item.Type, runtime].filter(Boolean).join(' • ')}</p>
            </Link>
        </article>
    );
}

function CineLibraryTrack({ title, items }: Readonly<{ title: string; items: ItemDto[] }>) {
    if (!items.length) return null;
    return (
        <section className='cineLibraryTrack'>
            <div className='cineLibraryTrackHead'>
                <h2>{title}</h2>
            </div>
            <div className='cineLibraryTrackScroller'>
                {items.map((item, index) => (
                    <CineLibraryCard key={item.Id || `${item.Name}-${index}`} item={item} index={index} />
                ))}
            </div>
        </section>
    );
}

function CineLibraryHero({ item }: Readonly<{ item?: ItemDto }>) {
    const { __legacyApiClient__: apiClient } = useApi();
    const imageUrl = item && apiClient ? getCineBackdropUrl(apiClient, item) || getCinePosterUrl(apiClient, item, 900) : undefined;
    const style = imageUrl ? { '--cine-library-hero-image': `url('${imageUrl.replace(/'/g, '%27')}')` } as CSSProperties : undefined;
    if (!item) return null;

    return (
        <section className='cineLibraryHero' style={style}>
            <div className='cineLibraryHeroContent'>
                <span>Em destaque</span>
                <h2>{item.Name}</h2>
                <div className='cineLibraryHeroMeta'>
                    {item.CommunityRating && <b>★ {item.CommunityRating.toFixed(1)}</b>}
                    {item.ProductionYear && <span>{item.ProductionYear}</span>}
                    {getRuntime(item) && <span>{getRuntime(item)}</span>}
                    {getQuality(item) && <small>{getQuality(item)}</small>}
                </div>
                {item.Overview && <p>{item.Overview}</p>}
                <div className='cineLibraryHeroActions'>
                    <Link to={getItemHref(item)}>▶ Reproduzir</Link>
                    <Link to={getItemHref(item)}>Mais informações</Link>
                </div>
            </div>
        </section>
    );
}

const FILTERS = ['AZ', 'Recentes', 'Nota', 'Ano'];

const CineLibraryPage: FC<CineLibraryPageProps> = ({ type }) => {
    const { libraryId } = useCurrentTab();
    const [filter, setFilter] = useState(FILTERS[0]);
    const [search, setSearch] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [letter, setLetter] = useState('Todos');
    const { data: userViewsData } = useUserViews();
    const userViews = userViewsData?.Items || [];
    const sidebarItems = useMemo(() => getCineSidebarItems(userViews), [userViews]);
    const { animeView } = useMemo(() => getCineLibraryViews(userViews), [userViews]);
    const isAnime = type === CollectionType.Tvshows && Boolean(animeView?.Id && animeView.Id === libraryId);
    const itemTypes = useMemo(() => getItemTypes(type), [type]);
    const title = getLibraryTitle(type, isAnime);

    const { data, isLoading } = useGetItems({
        parentId: libraryId ?? undefined,
        recursive: true,
        includeItemTypes: itemTypes,
        fields: [
            ItemFields.DateCreated,
            ItemFields.Overview,
            ItemFields.Genres,
            ItemFields.MediaSourceCount,
            ItemFields.PrimaryImageAspectRatio
        ],
        enableImageTypes: [ImageType.Primary, ImageType.Backdrop, ImageType.Thumb],
        imageTypeLimit: 1,
        sortBy: [ItemSortBy.SortName],
        sortOrder: [SortOrder.Ascending],
        limit: 240
    });

    const items = useMemo(() => (data?.Items || []) as ItemDto[], [data?.Items]);
    const visibleItems = useMemo(() => sortItems(items, filter)
        .filter(item => itemMatchesSearch(item, search))
        .filter(item => itemMatchesLetter(item, letter)), [filter, items, letter, search]);
    const continueItems = useMemo(() => items.filter(item => getProgress(item) > 0).slice(0, 12), [items]);
    const recentItems = useMemo(() => sortItems(items, 'Recentes').slice(0, 12), [items]);
    const ratingItems = useMemo(() => sortItems(items, 'Nota').slice(0, 12), [items]);
    const marathonItems = useMemo(() => sortItems(items, 'Ano').slice(0, 12), [items]);
    const heroItem = ratingItems[0] || recentItems[0] || items[0];

    return (
        <CineShell>
            <div className='cineLibraryBody'>
                <CineSidebar
                    items={sidebarItems}
                    activeIndex={getCineSidebarActiveIndex(sidebarItems, getActiveNavKey(type, isAnime))}
                />
                <main className='cineLibraryContent'>
                    <header className='cineLibraryHeader'>
                        <div className='cineLibraryTitleBlock'>
                            <h1>{title}</h1>
                            <span>{data?.TotalRecordCount ?? items.length} títulos</span>
                        </div>
                        <div className='cineLibraryControls'>
                            <label className='cineLibrarySearch'>
                                <span>⌕</span>
                                <input value={search} onChange={event => setSearch(event.target.value)} placeholder='Buscar título...' />
                            </label>
                            <button type='button' onClick={() => setShowAll(value => !value)}>
                                {showAll ? 'Ver trilhas' : 'Ver tudo (A-Z)'}
                            </button>
                        </div>
                        <div className='cineLibraryFilters'>
                            {FILTERS.map(item => (
                                <button key={item} type='button' className={item === filter ? 'is-active' : ''} onClick={() => setFilter(item)}>
                                    {item}
                                </button>
                            ))}
                        </div>
                    </header>

                    {isLoading && <div className='cineLibraryState'>Carregando biblioteca...</div>}

                    {!isLoading && showAll && (
                        <div className='cineLibraryGridShell'>
                            <div className='cineLibraryGrid'>
                                {visibleItems.map((item, index) => (
                                    <CineLibraryCard key={item.Id || `${item.Name}-${index}`} item={item} index={index} />
                                ))}
                            </div>
                            <nav className='cineLibraryAlphabet' aria-label='Índice alfabético'>
                                {['Todos', ...ALPHABET].map(item => (
                                    <button key={item} type='button' className={item === letter ? 'is-active' : ''} onClick={() => setLetter(item)}>
                                        {item === 'Todos' ? '•' : item}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}

                    {!isLoading && !showAll && (
                        <>
                            <CineLibraryHero item={heroItem} />
                            <div className='cineLibraryTracks'>
                                <CineLibraryTrack title='Continue assistindo' items={continueItems} />
                                <CineLibraryTrack title='Adicionados recentemente' items={recentItems} />
                                <CineLibraryTrack title='Mais bem avaliados' items={ratingItems} />
                                <CineLibraryTrack title={type === CollectionType.Tvshows ? 'Para maratonar' : 'Destaques da biblioteca'} items={marathonItems} />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </CineShell>
    );
};

export default CineLibraryPage;
