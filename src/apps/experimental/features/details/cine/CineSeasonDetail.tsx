import React, { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import type { ApiClient } from 'jellyfin-apiclient';

import { useApi } from 'hooks/useApi';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import {
    CineArt,
    CineBackLink,
    CineContentGrid,
    CineEpisodeRow,
    CineHero,
    CineMetaDot,
    CineMetaItem,
    CineMetaRow,
    CinePoster,
    CineReveal
} from 'components/cinematic';
import { CineDetailShell, useCineItemMenu, usePlayItem, type CineDetailNav } from './CineDetailShell';
import { useCineItem } from './hooks/useCineItem';
import { useCineSeasonEpisodes } from './hooks/useCineSeasonEpisodes';
import { getBackdropUrl, getCardImageUrl, getThumbUrl } from './utils/imageUrls';
import { formatEndTime, formatRuntime } from './utils/format';
import type { SeasonDetail } from './types';

import './cineDetail.scss';

type Props = Readonly<{
    itemId: string;
    activeNav: CineDetailNav;
}>;

type BodyProps = Readonly<{
    season: SeasonDetail;
    episodes: ReadonlyArray<BaseItemDto>;
    seriesName: string;
    seriesId: string | null;
    apiClient: ApiClient | null;
    backdrop: ReactNode;
}>;

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
    const url = apiClient ? (getCardImageUrl(apiClient, item) || getBackdropUrl(apiClient, item)) : undefined;
    return (
        <CineArt
            {...(url ? { imageUrl: url } : {})}
            gradient={gradientFor(item.Id || item.Name)}
            style={{ width: '100%', height: '100%' }}
        />
    );
}

// eslint-disable-next-line sonarjs/function-return-type
function episodeArtFor(apiClient: ApiClient | null | undefined, episode: BaseItemDto): ReactNode {
    const url = apiClient ? (getThumbUrl(apiClient, episode) || getBackdropUrl(apiClient, episode)) : undefined;
    return (
        <CineArt
            {...(url ? { imageUrl: url } : {})}
            gradient={gradientFor(episode.Id || episode.Name)}
            style={{ width: '100%', height: '100%' }}
        />
    );
}

// eslint-disable-next-line sonarjs/function-return-type
function buildBackdrop(apiClient: ApiClient | null | undefined, season: SeasonDetail): ReactNode {
    const url = apiClient ? getBackdropUrl(apiClient, season as unknown as BaseItemDto) : undefined;
    if (url) {
        return <CineArt imageUrl={url} style={{ width: '100%', height: '100%' }} />;
    }
    return <CineArt gradient={gradientFor(season.Id)} style={{ width: '100%', height: '100%' }} />;
}

function buildBlurredStyle(apiClient: ApiClient | null | undefined, season: SeasonDetail): CSSProperties | undefined {
    const url = apiClient ? getBackdropUrl(apiClient, season as unknown as BaseItemDto) : undefined;
    if (url) {
        return { backgroundImage: `url('${url.replace(/'/g, '%27')}')` };
    }
    return { backgroundImage: gradientFor(season.Id) };
}

export function CineSeasonDetail({ itemId, activeNav }: Props) {
    const { data: item, isLoading: itemLoading } = useCineItem(itemId);
    const { user } = useApi();
    const apiClient = user?.ServerId ?
        ServerConnections.getApiClient(user.ServerId) :
        ServerConnections.currentApiClient() ?? null;

    const isLoading = itemLoading;
    const season = item?.Type === 'Season' ? item as SeasonDetail : null;
    const seriesId = season?.SeriesId ?? undefined;
    const { data: episodes } = useCineSeasonEpisodes(seriesId, itemId);

    const backdrop = useMemo(
        () => season ? buildBackdrop(apiClient, season) : null,
        [apiClient, season]
    );
    const blurredStyle = useMemo(
        () => season ? buildBlurredStyle(apiClient, season) : undefined,
        [apiClient, season]
    );

    return (
        <CineDetailShell item={item} isLoading={isLoading} activeNav={activeNav}>
            {season && blurredStyle && (
                <div className='cineDetailBackdrop' style={blurredStyle} />
            )}
            {season && (
                <CineSeasonBody
                    season={season}
                    episodes={episodes || []}
                    seriesName={season.SeriesName || ''}
                    seriesId={seriesId || null}
                    apiClient={apiClient}
                    backdrop={backdrop}
                />
            )}
        </CineDetailShell>
    );
}

function CineSeasonBody({ season, episodes, seriesName, seriesId, apiClient, backdrop }: BodyProps) {
    const navigate = useNavigate();
    const [isWatched, setIsWatched] = useState(Boolean(season.UserData?.Played));
    const play = usePlayItem(season as unknown as BaseItemDto);
    const showMenu = useCineItemMenu(season as unknown as BaseItemDto);

    const onBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const onMarkWatched = useCallback(() => {
        setIsWatched((prev) => !prev);
    }, []);

    const seasonTitle = season.Name || (season.IndexNumber === 0 ? 'Especiais' : `Temporada ${season.IndexNumber}`);
    const yearStr = season.ProductionYear ? String(season.ProductionYear) : '';
    const rating = typeof season.CommunityRating === 'number' ? season.CommunityRating : null;
    const episodeCount = episodes.length || season.ChildCount || 0;

    const seasonPoster = useMemo(
        () => posterArtFor(apiClient, season as unknown as BaseItemDto),
        [apiClient, season]
    );

    const firstEpisode = episodes[0];
    const onPlayFromStart = useCallback(() => {
        if (firstEpisode?.Id) {
            navigate(`/cinedetails?id=${encodeURIComponent(firstEpisode.Id)}`);
            return;
        }
        play();
    }, [firstEpisode, navigate, play]);

    return (
        <>
            <button type='button' className='cineDetailBack' onClick={onBack}>← Voltar</button>
            <CineHero
                backdrop={backdrop}
                parallaxFactor={0.2}
                className='cineDetailHero cineDetailHero--short'
            >
                <CineReveal delay={0.1}>
                    <div className='cineDetailHeroLayout'>
                        <CinePoster
                            small
                            art={seasonPoster}
                        />
                        <div className='cineDetailHeroBody'>
                            <CineReveal delay={0.15}>
                                {seriesId ?
                                    <CineBackLink to={`/cinedetails?id=${encodeURIComponent(seriesId)}`}>{seriesName}</CineBackLink> :
                                    <span className='cineBackLink'>{seriesName}</span>}
                            </CineReveal>
                            <CineReveal delay={0.25}>
                                <h1 className='cineDetailHeroTitle'>{seasonTitle}</h1>
                            </CineReveal>
                            <CineReveal delay={0.35}>
                                <CineMetaRow>
                                    {episodeCount > 0 && <span>{episodeCount} {episodeCount === 1 ? 'episódio' : 'episódios'}</span>}
                                    {episodeCount > 0 && yearStr && <CineMetaDot />}
                                    {yearStr && <span>{yearStr}</span>}
                                    {yearStr && rating !== null && <CineMetaDot />}
                                    {rating !== null && (
                                        <CineMetaItem amber>{`★ ${rating.toFixed(1)}`}</CineMetaItem>
                                    )}
                                </CineMetaRow>
                            </CineReveal>
                            <CineReveal delay={0.45}>
                                <div className='cineDetailActionsRow'>
                                    <button
                                        type='button'
                                        className='cineDetailPrimaryCta'
                                        onClick={onPlayFromStart}
                                    >
                                        ▶ Assistir do início
                                    </button>
                                    <button
                                        type='button'
                                        className={'cineDetailFavButton' + (isWatched ? ' cineDetailFavButtonActive' : '')}
                                        onClick={onMarkWatched}
                                        aria-pressed={isWatched}
                                    >
                                        {isWatched ? '✓ Visto' : '✓ Marcar visto'}
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
                    aside={null}
                >
                    <section>
                        <h2 className='cineDetailSectionTitle'>Episódios</h2>
                        <div className='cineDetailEpisodeList'>
                            {episodes.map((ep, i) => (
                                <CineReveal key={ep.Id} delay={0.1 + i * 0.06}>
                                    <CineEpisodeRow
                                        art={episodeArtFor(apiClient, ep)}
                                        number={ep.IndexNumber ?? '?'}
                                        title={ep.Name || `Episódio ${ep.IndexNumber ?? '?'}`}
                                        duration={ep.RunTimeTicks ? formatRuntime(ep.RunTimeTicks) : undefined}
                                        rating={typeof ep.CommunityRating === 'number' ? ep.CommunityRating.toFixed(1) : undefined}
                                        endsAt={ep.RunTimeTicks ? formatEndTime(ep.RunTimeTicks) : undefined}
                                        description={ep.Overview}
                                        href={ep.Id ? `/cinedetails?id=${encodeURIComponent(ep.Id)}` : '#'}
                                    />
                                </CineReveal>
                            ))}
                        </div>
                    </section>
                </CineContentGrid>
            </div>
        </>
    );
}
