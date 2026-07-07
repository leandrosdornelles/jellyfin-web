import React, { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getUserLibraryApi } from '@jellyfin/sdk/lib/utils/api/user-library-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import type { ApiClient } from 'jellyfin-apiclient';
import type { MediaStream } from '@jellyfin/sdk/lib/generated-client/models/media-stream';

import { useApi } from 'hooks/useApi';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import {
    CineArt,
    CineBackLink,
    CineCard,
    CineCastCard,
    CineContentGrid,
    CineEdgeRow,
    CineHero,
    CineMetaDot,
    CineMetaItem,
    CineMetaRow,
    CineReveal,
    CineTechList,
    CineTechLinks,
    TiltCard
} from 'components/cinematic';
import { CineDetailShell, useCineItemMenu, usePlayItem, type CineDetailNav } from './CineDetailShell';
import { useCineItem } from './hooks/useCineItem';
import { useCinePlaybackInfo } from './hooks/useCinePlaybackInfo';
import { useCineSeasonEpisodes } from './hooks/useCineSeasonEpisodes';
import { getBackdropUrl, getPersonImageUrl, getThumbUrl } from './utils/imageUrls';
import { formatProgress, formatRuntime } from './utils/format';
import {
    getAudioStreamLabel,
    getMediaFormat,
    getPrimaryMediaSource,
    getSubtitleStreamLabel,
    pickPrimaryAudio,
    pickPrimarySubtitle
} from './utils/mediaFormat';
import { filterCast, filterCrew, getPersonHref } from './utils/people';
import type { CastMember, EpisodeDetail } from './types';

import './cineDetail.scss';

type Props = Readonly<{
    itemId: string;
    activeNav: CineDetailNav;
}>;

type BodyProps = Readonly<{
    episode: EpisodeDetail;
    moreEpisodes: ReadonlyArray<BaseItemDto>;
    playbackItem: BaseItemDto | null | undefined;
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
function buildBackdrop(apiClient: ApiClient | null | undefined, episode: EpisodeDetail): ReactNode {
    const url = apiClient ? getBackdropUrl(apiClient, episode as unknown as BaseItemDto) : undefined;
    if (url) {
        return <CineArt imageUrl={url} style={{ width: '100%', height: '100%' }} />;
    }
    return <CineArt gradient={gradientFor(episode.Id)} style={{ width: '100%', height: '100%' }} />;
}

function buildBlurredStyle(apiClient: ApiClient | null | undefined, episode: EpisodeDetail): CSSProperties | undefined {
    const url = apiClient ? getBackdropUrl(apiClient, episode as unknown as BaseItemDto) : undefined;
    if (url) {
        return { backgroundImage: `url('${url.replace(/'/g, '%27')}')` };
    }
    return { backgroundImage: gradientFor(episode.Id) };
}

type MoreEpisodeCardItemProps = Readonly<{
    episode: BaseItemDto;
    parentIndex: number | null | undefined;
    apiClient: ApiClient | null;
    onNavigate: (id: string | null | undefined) => void;
}>;

function MoreEpisodeCardItem({ episode, parentIndex, apiClient, onNavigate }: MoreEpisodeCardItemProps) {
    const handleClick = useCallback(() => onNavigate(episode.Id), [onNavigate, episode.Id]);
    return (
        <TiltCard max={12} className='cineTiltSimilar'>
            <CineCard
                art={episodeArtFor(apiClient, episode)}
                title={episode.Name || `Episódio ${episode.IndexNumber ?? '?'}`}
                sub={episode.IndexNumber ? `T${parentIndex ?? '?'} · E${episode.IndexNumber}` : undefined}
                onClick={handleClick}
            />
        </TiltCard>
    );
}

export function CineEpisodeDetail({ itemId, activeNav }: Props) {
    const { data: item, isLoading: itemLoading } = useCineItem(itemId);
    const { data: playbackItem } = useCinePlaybackInfo(itemId);
    const { user } = useApi();
    const apiClient = user?.ServerId ?
        ServerConnections.getApiClient(user.ServerId) ?? null :
        ServerConnections.currentApiClient() ?? null;

    const isLoading = itemLoading;
    const episode = item?.Type === 'Episode' ? item as EpisodeDetail : null;
    const seriesId = episode?.SeriesId ?? undefined;
    const seasonId = episode?.SeasonId ?? undefined;
    const { data: moreEpisodes } = useCineSeasonEpisodes(seriesId, seasonId);

    const backdrop = useMemo(
        () => episode ? buildBackdrop(apiClient, episode) : null,
        [apiClient, episode]
    );
    const blurredStyle = useMemo(
        () => episode ? buildBlurredStyle(apiClient, episode) : undefined,
        [apiClient, episode]
    );

    const filteredMore = useMemo(
        () => (moreEpisodes || []).filter((e) => e.Id !== itemId).slice(0, 12),
        [moreEpisodes, itemId]
    );

    return (
        <CineDetailShell item={item} isLoading={isLoading} activeNav={activeNav}>
            {episode && blurredStyle && (
                <div className='cineDetailBackdrop' style={blurredStyle} />
            )}
            {episode && (
                <CineEpisodeBody
                    episode={episode}
                    moreEpisodes={filteredMore}
                    playbackItem={playbackItem}
                    apiClient={apiClient}
                    backdrop={backdrop}
                />
            )}
        </CineDetailShell>
    );
}

function CineEpisodeBody({ episode, moreEpisodes, playbackItem, apiClient, backdrop }: BodyProps) {
    const navigate = useNavigate();
    const play = usePlayItem(episode as unknown as BaseItemDto);
    const showMenu = useCineItemMenu(episode as unknown as BaseItemDto);
    const [isFavorite, setIsFavorite] = useState(Boolean(episode.UserData?.IsFavorite));
    const [isWatched, setIsWatched] = useState(Boolean(episode.UserData?.Played));
    const { api, user } = useApi();
    const queryClient = useQueryClient();

    const onToggleFavorite = useCallback(async () => {
        if (!api || !user?.Id || !episode.Id) return;
        const userLibrary = getUserLibraryApi(api);
        try {
            if (isFavorite) {
                await userLibrary.unmarkFavoriteItem({ userId: user.Id, itemId: episode.Id });
            } else {
                await userLibrary.markFavoriteItem({ userId: user.Id, itemId: episode.Id });
            }
            setIsFavorite(!isFavorite);
            await queryClient.invalidateQueries({ queryKey: [ 'CineItem', user.Id, episode.Id ] });
        } catch (err) {
            console.error('[CineDetail] favorite toggle failed', err);
        }
    }, [api, user?.Id, episode.Id, isFavorite, queryClient]);

    const onBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const onNavigateToEpisode = useCallback((id: string | null | undefined) => {
        if (id) navigate(`/cinedetails?id=${encodeURIComponent(id)}`);
    }, [navigate]);

    const onMarkWatched = useCallback(() => {
        setIsWatched((prev) => !prev);
    }, []);

    const source = getPrimaryMediaSource(playbackItem?.MediaSources) || getPrimaryMediaSource(episode.MediaSources);
    const mediaFormat = getMediaFormat(source);
    const audioStreams = useMemo<MediaStream[]>(
        () => (source?.MediaStreams || []).filter((s) => s.Type === 'Audio'),
        [source]
    );
    const subtitleStreams = useMemo<MediaStream[]>(
        () => (source?.MediaStreams || []).filter((s) => s.Type === 'Subtitle'),
        [source]
    );
    const primaryAudio = useMemo(() => pickPrimaryAudio(source?.MediaStreams), [source]);
    const primarySubtitle = useMemo(() => pickPrimarySubtitle(source?.MediaStreams), [source]);
    const [selectedAudioIdx, setSelectedAudioIdx] = useState<number | undefined>(primaryAudio?.Index);
    const [selectedSubtitleIdx, setSelectedSubtitleIdx] = useState<number | null>(primarySubtitle?.Index ?? null);
    const onAudioChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAudioIdx(Number(e.target.value));
    }, []);
    const onSubtitleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        setSelectedSubtitleIdx(v === 'off' ? null : Number(v));
    }, []);

    const cast = useMemo(() => filterCast(episode.People as CastMember[] | null, 8), [episode.People]);
    const crew = useMemo(() => filterCrew(episode.People as CastMember[] | null), [episode.People]);

    const dateStr = useMemo(() => {
        if (!episode.PremiereDate) return '';
        return new Date(episode.PremiereDate).toLocaleDateString('pt-BR');
    }, [episode.PremiereDate]);

    const hasRightPanel = source && (audioStreams.length > 0 || subtitleStreams.length > 0);

    const tech = useMemo(() => {
        const list: Array<[string, string]> = [];
        const director = crew.find((c) => c.Type === 'Director');
        if (director?.Name) list.push(['Diretor', director.Name]);
        if (mediaFormat.quality) {
            const label = [mediaFormat.resolution, mediaFormat.codec, mediaFormat.hdr]
                .filter(Boolean)
                .join(' ');
            list.push(['Vídeo', label || mediaFormat.quality]);
        }
        if (episode.EndDate) {
            const endTime = new Date(episode.EndDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            list.push(['Exibição', `Termina às ${endTime}`]);
        }
        if (episode.SeriesName) list.push(['Série', episode.SeriesName]);
        if (episode.SeasonName) list.push(['Temporada', episode.SeasonName]);
        return list;
    }, [crew, mediaFormat, episode.EndDate, episode.SeriesName, episode.SeasonName]);

    const providerLinks = useMemo(() => {
        const ids = episode.ProviderIds;
        if (!ids) return [];
        const out: Array<{ label: string; href?: string }> = [];
        if (ids.Imdb) out.push({ label: 'IMDb ↗', href: `https://www.imdb.com/title/${ids.Imdb}` });
        if (ids.Tvdb) out.push({ label: 'TheTVDB ↗', href: `https://thetvdb.com/?id=${ids.Tvdb}&tab=episode` });
        if (ids.Tmdb) out.push({ label: 'TMDB ↗', href: `https://www.themoviedb.org/tv/${ids.Tmdb}/season/${episode.ParentIndexNumber}/episode/${episode.IndexNumber}` });
        return out;
    }, [episode.ProviderIds, episode.ParentIndexNumber, episode.IndexNumber]);

    const hasMeta = Boolean(
        dateStr
        || episode.RunTimeTicks
        || episode.CommunityRating !== undefined
        || mediaFormat.quality
    );

    const episodeThumb = useMemo(
        () => episodeArtFor(apiClient, episode as unknown as BaseItemDto),
        [apiClient, episode]
    );

    const progress = formatProgress(episode.UserData?.PlaybackPositionTicks, episode.RunTimeTicks);
    const isResumable = progress > 0 && progress < 95;

    return (
        <>
            <button type='button' className='cineDetailBack' onClick={onBack}>← Voltar</button>
            <CineHero
                backdrop={backdrop}
                parallaxFactor={0.22}
                className='cineDetailHero cineDetailHero--episode'
            >
                <CineReveal delay={0.1}>
                    <div className='cineDetailHeroLayout cineDetailHeroLayout--episode'>
                        <div className='cineDetailEpisodeThumb'>
                            {episodeThumb}
                            <div className='cineDetailEpisodePlay'>
                                <span className='cineDetailEpisodePlayBtn'>▶</span>
                            </div>
                        </div>
                        <div className='cineDetailHeroBody'>
                            <CineReveal delay={0.15}>
                                {episode.SeasonId ?
                                    <CineBackLink to={`/cinedetails?id=${encodeURIComponent(episode.SeasonId)}`}>{episode.SeriesName} · {episode.SeasonName}</CineBackLink> :
                                    <span className='cineBackLink'>{episode.SeriesName} · {episode.SeasonName}</span>}
                            </CineReveal>
                            <CineReveal delay={0.25}>
                                <h1 className='cineDetailHeroTitle cineDetailHeroTitle--episode'>
                                    {episode.IndexNumber}. {episode.Name}
                                </h1>
                            </CineReveal>
                            {hasMeta && (
                                <CineReveal delay={0.35}>
                                    <CineMetaRow>
                                        {dateStr && <span>{dateStr}</span>}
                                        {dateStr && episode.RunTimeTicks && <CineMetaDot />}
                                        {episode.RunTimeTicks && <span>{formatRuntime(episode.RunTimeTicks)}</span>}
                                        {episode.RunTimeTicks && (episode.CommunityRating !== undefined || mediaFormat.quality) && <CineMetaDot />}
                                        {typeof episode.CommunityRating === 'number' && (
                                            <CineMetaItem amber>{`★ ${episode.CommunityRating.toFixed(1)}`}</CineMetaItem>
                                        )}
                                        {typeof episode.CommunityRating === 'number' && mediaFormat.quality && <CineMetaDot />}
                                        {mediaFormat.quality && <CineMetaItem quality>{mediaFormat.quality}</CineMetaItem>}
                                    </CineMetaRow>
                                </CineReveal>
                            )}
                            <CineReveal delay={0.45}>
                                <div className='cineDetailActionsRow'>
                                    <button type='button' className='cineDetailPrimaryCta' onClick={play}>
                                        {isResumable ? '▶ Continuar' : '▶ Assistir'}
                                    </button>
                                    <button
                                        type='button'
                                        className={'cineDetailFavButton' + (isWatched ? ' cineDetailFavButtonActive' : '')}
                                        onClick={onMarkWatched}
                                        aria-pressed={isWatched}
                                    >
                                        {isWatched ? '✓ Visto' : '✓ Marcar visto'}
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
                    aside={hasRightPanel || tech.length > 0 ? (
                        <>
                            {hasRightPanel && (
                                <div className='cineDetailPanel'>
                                    <h3 className='cineDetailPanelTitle'>Reprodução</h3>
                                    {audioStreams.length > 0 && (
                                        <label className='cineDetailSelectLabel'>
                                            <span className='cineDetailSelectCaption'>Áudio</span>
                                            <select
                                                className='cineDetailSelect'
                                                value={selectedAudioIdx ?? ''}
                                                onChange={onAudioChange}
                                            >
                                                {audioStreams.map((stream) => (
                                                    <option key={stream.Index} value={stream.Index}>
                                                        {getAudioStreamLabel(stream)}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    )}
                                    {audioStreams.length > 0 && subtitleStreams.length > 0 && (
                                        <div style={{ height: '0.85rem' }} />
                                    )}
                                    {subtitleStreams.length > 0 && (
                                        <label className='cineDetailSelectLabel'>
                                            <span className='cineDetailSelectCaption'>Legendas</span>
                                            <select
                                                className='cineDetailSelect'
                                                value={selectedSubtitleIdx ?? 'off'}
                                                onChange={onSubtitleChange}
                                            >
                                                <option value='off'>{getSubtitleStreamLabel(undefined, true)}</option>
                                                {subtitleStreams.map((stream) => (
                                                    <option key={stream.Index} value={stream.Index}>
                                                        {getSubtitleStreamLabel(stream)}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    )}
                                </div>
                            )}
                            {tech.length > 0 && (
                                <div className='cineDetailPanel'>
                                    <h3 className='cineDetailPanelTitle'>Ficha técnica</h3>
                                    <CineTechList items={tech} />
                                    {providerLinks.length > 0 && (
                                        <CineTechLinks links={providerLinks} />
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                >
                    {episode.Overview && (
                        <section>
                            <h2 className='cineDetailSectionTitle'>Sinopse</h2>
                            <p className='cineDetailSynopsis'>{episode.Overview}</p>
                        </section>
                    )}

                    {moreEpisodes.length > 0 && (
                        <CineEdgeRow title='Mais de Temporada 1' mask='right'>
                            {moreEpisodes.map((e) => (
                                <MoreEpisodeCardItem
                                    key={e.Id}
                                    episode={e}
                                    parentIndex={episode.ParentIndexNumber}
                                    apiClient={apiClient}
                                    onNavigate={onNavigateToEpisode}
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
