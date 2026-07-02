import React, { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getUserLibraryApi } from '@jellyfin/sdk/lib/utils/api/user-library-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import type { ApiClient } from 'jellyfin-apiclient';

import { useApi } from 'hooks/useApi';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import {
    CineArt,
    CineCard,
    CineCastCard,
    CineContentGrid,
    CineEdgeRow,
    CineEyebrow,
    CineHero,
    CineMetaDot,
    CineMetaItem,
    CineMetaRow,
    CineNextUp,
    CinePill,
    CinePillRow,
    CinePoster,
    CineReveal,
    CineTagline,
    CineTechList,
    CineTechLinks,
    TiltCard
} from 'components/cinematic';
import { CineDetailShell, useCineItemMenu, type CineDetailNav } from './CineDetailShell';
import { useCineItem } from './hooks/useCineItem';
import { useCineNextUp } from './hooks/useCineNextUp';
import { useCineSeasons } from './hooks/useCineSeasons';
import { getBackdropUrl, getCardImageUrl, getLogoUrl, getPersonImageUrl, getPosterUrl } from './utils/imageUrls';
import { formatRuntime } from './utils/format';
import { filterCast, getPersonHref } from './utils/people';
import type { CastMember, SeriesDetail } from './types';

import './cineDetail.scss';

type Props = Readonly<{
    itemId: string;
    activeNav: CineDetailNav;
}>;

type BodyProps = Readonly<{
    series: SeriesDetail;
    nextUp: ReadonlyArray<BaseItemDto>;
    seasons: ReadonlyArray<BaseItemDto>;
    apiClient: ApiClient | null;
    backdrop: ReactNode;
}>;

type SeasonCardItemProps = Readonly<{
    season: BaseItemDto;
    apiClient: ApiClient | null;
    onNavigate: (id: string | null | undefined) => void;
}>;

function SeasonCardItem({ season, apiClient, onNavigate }: SeasonCardItemProps) {
    const seasonTitle = season.Name || (season.IndexNumber === 0 ? 'Especiais' : `Temporada ${season.IndexNumber}`);
    const episodeCount = season.ChildCount || 0;
    const handleClick = useCallback(() => onNavigate(season.Id), [onNavigate, season.Id]);
    return (
        <TiltCard max={12} className='cineTiltSeason'>
            <CineCard
                art={seasonArtFor(apiClient, season)}
                title={seasonTitle}
                {...(episodeCount > 0 ? { badge: String(episodeCount) } : {})}
                onClick={handleClick}
            />
        </TiltCard>
    );
}

const GRADIENTS: ReadonlyArray<string> = [
    'linear-gradient(135deg, #0c4a6e, #3b0764)',
    'linear-gradient(135deg, #1e3a8a, #7c3aed)',
    'linear-gradient(135deg, #7f1d1d, #1e1b4b)',
    'linear-gradient(135deg, #0e7490, #0f766e)',
    'linear-gradient(135deg, #4338ca, #db2777)',
    'linear-gradient(135deg, #9a3412, #7c2d12)',
    'linear-gradient(135deg, #0f172a, #334155)',
    'linear-gradient(135deg, #15803d, #065f46)'
];

function gradientFor(seed: string | null | undefined): string {
    if (!seed) return GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return GRADIENTS[hash % GRADIENTS.length];
}

// eslint-disable-next-line sonarjs/function-return-type
function posterArtFor(apiClient: ApiClient | null | undefined, item: BaseItemDto): ReactNode {
    const url = apiClient ? getPosterUrl(apiClient, item) : undefined;
    return (
        <CineArt
            {...(url ? { imageUrl: url } : {})}
            gradient={gradientFor(item.Id || item.Name)}
            style={{ width: '100%', height: '100%' }}
        />
    );
}

// eslint-disable-next-line sonarjs/function-return-type
function seasonArtFor(apiClient: ApiClient | null | undefined, item: BaseItemDto): ReactNode {
    const url = apiClient ? getCardImageUrl(apiClient, item) : undefined;
    return (
        <CineArt
            {...(url ? { imageUrl: url } : {})}
            gradient={gradientFor(item.Id || item.Name)}
            style={{ width: '100%', height: '100%' }}
        />
    );
}

// eslint-disable-next-line sonarjs/function-return-type
function buildBackdrop(apiClient: ApiClient | null | undefined, series: SeriesDetail): ReactNode {
    const url = apiClient ? (getBackdropUrl(apiClient, series) || getLogoUrl(apiClient, series)) : undefined;
    if (url) {
        return <CineArt imageUrl={url} style={{ width: '100%', height: '100%' }} />;
    }
    return <CineArt gradient={gradientFor(series.Id)} style={{ width: '100%', height: '100%' }} />;
}

function buildBlurredBackdropStyle(apiClient: ApiClient | null | undefined, series: SeriesDetail): CSSProperties | undefined {
    const url = apiClient ? getBackdropUrl(apiClient, series) : undefined;
    if (url) {
        return { backgroundImage: `url('${url.replace(/'/g, '%27')}')` };
    }
    return { backgroundImage: gradientFor(series.Id) };
}

export function CineSeriesDetail({ itemId, activeNav }: Props) {
    const { data: item, isLoading: itemLoading } = useCineItem(itemId);
    const { data: nextUp } = useCineNextUp(itemId, 1);
    const { data: seasons } = useCineSeasons(itemId);
    const { user } = useApi();
    const apiClient = user?.ServerId ?
        ServerConnections.getApiClient(user.ServerId) :
        ServerConnections.currentApiClient() ?? null;

    const isLoading = itemLoading;
    const series = item?.Type === 'Series' ? item as SeriesDetail : null;
    const backdrop = useMemo(
        () => series ? buildBackdrop(apiClient, series) : null,
        [apiClient, series]
    );
    const blurredBackdropStyle = useMemo(
        () => series ? buildBlurredBackdropStyle(apiClient, series) : undefined,
        [apiClient, series]
    );

    return (
        <CineDetailShell item={item} isLoading={isLoading} activeNav={activeNav}>
            {series && blurredBackdropStyle && (
                <div className='cineDetailBackdrop' style={blurredBackdropStyle} />
            )}
            {series && (
                <CineSeriesBody
                    series={series}
                    nextUp={nextUp || []}
                    seasons={seasons || []}
                    apiClient={apiClient}
                    backdrop={backdrop}
                />
            )}
        </CineDetailShell>
    );
}

function CineSeriesBody({ series, nextUp, seasons, apiClient, backdrop }: BodyProps) {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(Boolean(series.UserData?.IsFavorite));
    const showMenu = useCineItemMenu(series);
    const { api, user } = useApi();
    const queryClient = useQueryClient();

    const onToggleFavorite = useCallback(async () => {
        if (!api || !user?.Id || !series.Id) return;
        const userLibrary = getUserLibraryApi(api);
        try {
            if (isFavorite) {
                await userLibrary.unmarkFavoriteItem({ userId: user.Id, itemId: series.Id });
            } else {
                await userLibrary.markFavoriteItem({ userId: user.Id, itemId: series.Id });
            }
            setIsFavorite(!isFavorite);
            await queryClient.invalidateQueries({ queryKey: [ 'CineItem', user.Id, series.Id ] });
        } catch (err) {
            console.error('[CineDetail] favorite toggle failed', err);
        }
    }, [api, user?.Id, series.Id, isFavorite, queryClient]);

    const onBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const onNavigateToItem = useCallback((id: string | null | undefined) => {
        if (id) navigate(`/cinedetails?id=${encodeURIComponent(id)}`);
    }, [navigate]);

    const onPlayNextUp = useCallback(() => {
        const target = nextUp[0];
        if (target?.Id) onNavigateToItem(target.Id);
    }, [nextUp, onNavigateToItem]);

    const onPlayRandom = useCallback(() => {
        if (!seasons.length) return;
        // eslint-disable-next-line sonarjs/pseudo-random
        const randomIndex = Math.floor(Math.random() * seasons.length);
        const target = seasons[randomIndex];
        if (target?.Id) onNavigateToItem(target.Id);
    }, [seasons, onNavigateToItem]);

    const yearRange = useMemo(() => {
        if (series.ProductionYear && series.EndDate) {
            return `${series.ProductionYear} – ${new Date(series.EndDate).getFullYear()}`;
        }
        if (series.ProductionYear) return `${series.ProductionYear} – Presente`;
        return '';
    }, [series.ProductionYear, series.EndDate]);

    const typeLabel = useMemo(() => {
        const labels: string[] = ['Série'];
        if (series.Genres?.length) labels.push(series.Genres[0]);
        return labels.join(' · ');
    }, [series.Genres]);

    const tags = useMemo(() => {
        const set = new Set<string>();
        series.Genres?.forEach((g) => {
            if (g) set.add(g);
        });
        series.Tags?.slice(0, 6).forEach((t) => {
            if (t) set.add(t);
        });
        return Array.from(set).slice(0, 8);
    }, [series.Genres, series.Tags]);

    const cast = useMemo(() => filterCast(series.People as CastMember[] | null, 8), [series.People]);

    const tech = useMemo(() => {
        const list: Array<[string, string]> = [];
        if (series.Studios?.length) {
            const studioNames = series.Studios
                .map((s) => s.Name)
                .filter((name): name is string => Boolean(name))
                .join(', ');
            if (studioNames) list.push(['Estúdios', studioNames]);
        }
        if (series.Genres?.length) list.push(['Gêneros', series.Genres.join(', ')]);
        if (series.ProductionYear) list.push(['Estreia', String(series.ProductionYear)]);
        if (series.Status) list.push(['Status', series.Status]);
        return list;
    }, [series.Studios, series.Genres, series.ProductionYear, series.Status]);

    const providerLinks = useMemo(() => {
        const ids = series.ProviderIds;
        if (!ids) return [];
        const out: Array<{ label: string; href?: string }> = [];
        if (ids.Imdb) out.push({ label: 'IMDb ↗', href: `https://www.imdb.com/title/${ids.Imdb}` });
        if (ids.Tvdb) out.push({ label: 'TheTVDB ↗', href: `https://thetvdb.com/?id=${ids.Tvdb}&tab=series` });
        if (ids.Tmdb) out.push({ label: 'TMDB ↗', href: `https://www.themoviedb.org/tv/${ids.Tmdb}` });
        return out;
    }, [series.ProviderIds]);

    const seasonCount = seasons.length;
    const rating = typeof series.CommunityRating === 'number' ? series.CommunityRating : null;
    const firstNextUp = nextUp[0];

    const nextUpArt = useMemo(() => {
        if (!firstNextUp || !apiClient) return null;
        const url = getCardImageUrl(apiClient, firstNextUp);
        return (
            <CineArt
                {...(url ? { imageUrl: url } : {})}
                gradient={gradientFor(firstNextUp.Id || firstNextUp.Name)}
                style={{ width: '100%', height: '100%' }}
            />
        );
    }, [firstNextUp, apiClient]);

    return (
        <>
            <button type='button' className='cineDetailBack' onClick={onBack}>← Voltar</button>
            <CineHero
                backdrop={backdrop}
                parallaxFactor={0.25}
                className='cineDetailHero'
            >
                <CineReveal delay={0.1}>
                    <div className='cineDetailHeroLayout'>
                        <CinePoster
                            small
                            art={posterArtFor(apiClient, series)}
                        />
                        <div className='cineDetailHeroBody'>
                            <CineReveal delay={0.15}>
                                <CineEyebrow>{typeLabel}</CineEyebrow>
                            </CineReveal>
                            <CineReveal delay={0.25}>
                                <h1 className='cineDetailHeroTitle'>{series.Name}</h1>
                            </CineReveal>
                            {series.OriginalTitle && series.OriginalTitle !== series.Name && (
                                <CineReveal delay={0.32}>
                                    <CineTagline>{series.OriginalTitle}</CineTagline>
                                </CineReveal>
                            )}
                            <CineReveal delay={0.4}>
                                <CineMetaRow>
                                    {yearRange && <CineMetaItem strong>{yearRange}</CineMetaItem>}
                                    {yearRange && seasonCount > 0 && <CineMetaDot />}
                                    {seasonCount > 0 && <span>{seasonCount} {seasonCount === 1 ? 'temporada' : 'temporadas'}</span>}
                                    {seasonCount > 0 && rating !== null && <CineMetaDot />}
                                    {rating !== null && (
                                        <CineMetaItem amber>{`★ ${rating.toFixed(1)}`}</CineMetaItem>
                                    )}
                                </CineMetaRow>
                            </CineReveal>
                            <CineReveal delay={0.5}>
                                <div className='cineDetailActionsRow'>
                                    <button
                                        type='button'
                                        className='cineDetailPrimaryCta'
                                        onClick={onPlayNextUp}
                                        disabled={!firstNextUp}
                                    >
                                        ▶ Continuar
                                    </button>
                                    <button
                                        type='button'
                                        className='cineDetailFavButton'
                                        onClick={onPlayRandom}
                                        disabled={seasons.length === 0}
                                    >
                                        🔀 Aleatório
                                    </button>
                                    <button
                                        type='button'
                                        className={'cineDetailFavButton' + (isFavorite ? ' cineDetailFavButtonActive' : '')}
                                        onClick={onToggleFavorite}
                                        aria-pressed={isFavorite}
                                    >
                                        {isFavorite ? '♥ Favorito' : '♡ Favoritar'}
                                    </button>
                                    <button type='button' className='cineDetailIconButton' aria-label='Mais opções' onClick={showMenu}>⋯</button>
                                </div>
                            </CineReveal>
                        </div>
                    </div>
                </CineReveal>
            </CineHero>

            <div className='cineDetailContentInner'>
                <CineContentGrid
                    aside={tech.length > 0 ? (
                        <div className='cineDetailPanel'>
                            <h3 className='cineDetailPanelTitle'>Ficha técnica</h3>
                            <CineTechList items={tech} />
                            {providerLinks.length > 0 && (
                                <CineTechLinks links={providerLinks} />
                            )}
                        </div>
                    ) : null}
                >
                    {series.Overview && (
                        <section>
                            <h2 className='cineDetailSectionTitle'>Sinopse</h2>
                            <p className='cineDetailSynopsis'>{series.Overview}</p>
                            {tags.length > 0 && (
                                <CinePillRow>
                                    {tags.map((t) => <CinePill key={t}>{t}</CinePill>)}
                                </CinePillRow>
                            )}
                        </section>
                    )}

                    {firstNextUp && firstNextUp.Id && (
                        <section>
                            <h2 className='cineDetailSectionTitle'>A seguir</h2>
                            <CineNextUp
                                art={nextUpArt}
                                eyebrow={`T${firstNextUp.ParentIndexNumber ?? '?'} · E${firstNextUp.IndexNumber ?? '?'}`}
                                title={firstNextUp.Name}
                                meta={firstNextUp.RunTimeTicks ? formatRuntime(firstNextUp.RunTimeTicks) : undefined}
                                href={`#/cinedetails?id=${encodeURIComponent(firstNextUp.Id)}`}
                            />
                        </section>
                    )}

                    {seasons.length > 0 && (
                        <CineEdgeRow title='Temporadas' mask='right'>
                            {seasons.map((s) => (
                                <SeasonCardItem
                                    key={s.Id}
                                    season={s}
                                    apiClient={apiClient}
                                    onNavigate={onNavigateToItem}
                                />
                            ))}
                        </CineEdgeRow>
                    )}

                    {cast.length > 0 && (
                        <CineEdgeRow title='Elenco e Equipe' mask='right'>
                            {cast.map((c) => (
                                <TiltCard key={c.Id || c.Name} max={14} className='cineTiltCast'>
                                    <CineCastCard
                                        imageUrl={apiClient ? getPersonImageUrl(apiClient, c) : undefined}
                                        gradient={gradientFor(c.Id || c.Name)}
                                        name={c.Name}
                                        role={c.Role}
                                        href={getPersonHref(c)}
                                    />
                                </TiltCard>
                            ))}
                        </CineEdgeRow>
                    )}
                </CineContentGrid>
            </div>
        </>
    );
}
