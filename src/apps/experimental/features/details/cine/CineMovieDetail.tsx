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
    CineCard,
    CineCastCard,
    CineContentGrid,
    CineEdgeRow,
    CineEyebrow,
    CineHero,
    CineMetaDot,
    CineMetaItem,
    CineMetaRow,
    CinePill,
    CinePillRow,
    CinePoster,
    CineReveal,
    CineTagline,
    CineTechList,
    CineTechLinks,
    TiltCard
} from 'components/cinematic';
import { CineDetailShell, useCineItemMenu, usePlayItem, type CineDetailNav } from './CineDetailShell';
import { useCineItem } from './hooks/useCineItem';
import { useCineSimilar } from './hooks/useCineSimilar';
import { useCinePlaybackInfo } from './hooks/useCinePlaybackInfo';
import { getBackdropUrl, getCardImageUrl, getLogoUrl, getPersonImageUrl, getPosterUrl } from './utils/imageUrls';
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
import type { CastMember, MovieDetail } from './types';

import './cineDetail.scss';

type Props = Readonly<{
    itemId: string;
    activeNav: CineDetailNav;
}>;

type BodyProps = Readonly<{
    movie: MovieDetail;
    playbackItem: BaseItemDto | null | undefined;
    similar: ReadonlyArray<BaseItemDto>;
    isLoadingSimilar: boolean;
    backdrop: ReactNode;
    apiClient: ApiClient | null;
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
function buildArtContent(apiClient: ApiClient | null | undefined, item: BaseItemDto, kind: 'poster' | 'card'): ReactNode {
    let url: string | undefined;
    if (apiClient) {
        url = kind === 'poster' ? getPosterUrl(apiClient, item) : getCardImageUrl(apiClient, item);
    }
    const gradient = gradientFor(item.Id || item.Name);
    if (url) {
        return <CineArt imageUrl={url} style={{ width: '100%', height: '100%' }} />;
    }
    return <CineArt gradient={gradient} style={{ width: '100%', height: '100%' }} />;
}

// eslint-disable-next-line sonarjs/function-return-type
function buildBackdropNode(apiClient: ApiClient | null | undefined, movie: MovieDetail): ReactNode {
    const url = apiClient ? (getBackdropUrl(apiClient, movie) || getLogoUrl(apiClient, movie)) : undefined;
    if (url) {
        return <CineArt imageUrl={url} style={{ width: '100%', height: '100%' }} />;
    }
    return <CineArt gradient={gradientFor(movie.Id)} style={{ width: '100%', height: '100%' }} />;
}

// eslint-disable-next-line sonarjs/function-return-type
function posterArtFor(apiClient: ApiClient | null | undefined, item: BaseItemDto): ReactNode {
    return buildArtContent(apiClient, item, 'poster');
}

// eslint-disable-next-line sonarjs/function-return-type
function cardArtFor(apiClient: ApiClient | null | undefined, item: BaseItemDto): ReactNode {
    return buildArtContent(apiClient, item, 'card');
}

// eslint-disable-next-line sonarjs/function-return-type
function getBackdropNode(apiClient: ApiClient | null | undefined, movie: MovieDetail): ReactNode {
    return buildBackdropNode(apiClient, movie);
}

function getBlurredBackdropStyle(apiClient: ApiClient | null | undefined, movie: MovieDetail): CSSProperties | undefined {
    const url = apiClient ? getBackdropUrl(apiClient, movie) : undefined;
    if (url) {
        return { backgroundImage: `url('${url.replace(/'/g, '%27')}')` };
    }
    return { backgroundImage: gradientFor(movie.Id) };
}

type SimilarCardItemProps = Readonly<{
    item: BaseItemDto;
    apiClient: ApiClient | null;
    onNavigate: (id: string | null | undefined) => void;
}>;

function SimilarCardItem({ item, apiClient, onNavigate }: SimilarCardItemProps) {
    const handleClick = useCallback(() => onNavigate(item.Id), [onNavigate, item.Id]);
    return (
        <TiltCard max={12} className='cineTiltSimilar'>
            <CineCard
                art={cardArtFor(apiClient, item)}
                title={item.Name}
                sub={item.ProductionYear ? String(item.ProductionYear) : undefined}
                onClick={handleClick}
            />
        </TiltCard>
    );
}

export function CineMovieDetail({ itemId, activeNav }: Props) {
    const { data: item, isLoading: itemLoading } = useCineItem(itemId);
    const { data: similar, isLoading: similarLoading } = useCineSimilar(itemId, item?.Type, 12);
    const { data: playbackItem } = useCinePlaybackInfo(itemId);
    const { user } = useApi();
    const apiClient = user?.ServerId ?
        ServerConnections.getApiClient(user.ServerId) ?? null :
        ServerConnections.currentApiClient() ?? null;

    const isLoading = itemLoading;
    const movie = item?.Type === 'Movie' ? item as MovieDetail : null;

    const backdrop = useMemo(
        () => movie ? getBackdropNode(apiClient, movie) : null,
        [apiClient, movie]
    );
    const blurredBackdropStyle = useMemo(
        () => movie ? getBlurredBackdropStyle(apiClient, movie) : undefined,
        [apiClient, movie]
    );

    return (
        <CineDetailShell item={item} isLoading={isLoading} activeNav={activeNav}>
            {movie && blurredBackdropStyle && (
                <div className='cineDetailBackdrop' style={blurredBackdropStyle} />
            )}
            {movie && (
                <CineDetailBody
                    movie={movie}
                    playbackItem={playbackItem}
                    similar={similar || []}
                    isLoadingSimilar={similarLoading}
                    backdrop={backdrop}
                    apiClient={apiClient}
                />
            )}
        </CineDetailShell>
    );
}

function CineDetailBody({
    movie,
    playbackItem,
    similar,
    isLoadingSimilar,
    backdrop,
    apiClient
}: BodyProps) {
    const navigate = useNavigate();
    const play = usePlayItem(movie);
    const showMenu = useCineItemMenu(movie);
    const [isFavorite, setIsFavorite] = useState(Boolean(movie.UserData?.IsFavorite));
    const { api, user } = useApi();
    const queryClient = useQueryClient();

    const onToggleFavorite = useCallback(async () => {
        if (!api || !user?.Id || !movie.Id) return;
        const userLibrary = getUserLibraryApi(api);
        try {
            if (isFavorite) {
                await userLibrary.unmarkFavoriteItem({ userId: user.Id, itemId: movie.Id });
            } else {
                await userLibrary.markFavoriteItem({ userId: user.Id, itemId: movie.Id });
            }
            setIsFavorite(!isFavorite);
            await queryClient.invalidateQueries({ queryKey: [ 'CineItem', user.Id, movie.Id ] });
        } catch (err) {
            console.error('[CineDetail] favorite toggle failed', err);
        }
    }, [api, user?.Id, movie.Id, isFavorite, queryClient]);

    const onShowDetails = useCallback(() => {
        document.querySelector('.cineDetailContentInner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const onBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const onNavigateToSimilar = useCallback((itemId: string | null | undefined) => {
        if (itemId) navigate(`/cinedetails?id=${encodeURIComponent(itemId)}`);
    }, [navigate]);

    const progress = formatProgress(movie.UserData?.PlaybackPositionTicks, movie.RunTimeTicks);
    const isResumable = progress > 0 && progress < 95;
    const source = getPrimaryMediaSource(playbackItem?.MediaSources) || getPrimaryMediaSource(movie.MediaSources);
    const mediaFormat = getMediaFormat(source);

    const cast = useMemo(() => filterCast(movie.People as CastMember[] | null, 8), [movie.People]);
    const crew = useMemo(() => filterCrew(movie.People as CastMember[] | null), [movie.People]);
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

    const typeLabel = useMemo(() => {
        const labels: string[] = ['Filme'];
        if (movie.Genres?.length) labels.push(movie.Genres[0]);
        return labels.join(' · ');
    }, [movie.Genres]);

    const tags = useMemo(() => {
        const set = new Set<string>();
        movie.Genres?.forEach((g) => {
            if (g) set.add(g);
        });
        movie.Tags?.slice(0, 6).forEach((t) => {
            if (t) set.add(t);
        });
        return Array.from(set).slice(0, 8);
    }, [movie.Genres, movie.Tags]);

    const tech = useMemo(() => {
        const list: Array<[string, string]> = [];
        const director = crew.find((c) => c.Type === 'Director');
        if (director?.Name) list.push(['Diretor', director.Name]);
        const writer = crew.find((c) => c.Type === 'Writer');
        if (writer?.Name) list.push(['Roteiro', writer.Name]);
        if (movie.Studios?.length) {
            const studioNames = movie.Studios
                .map((s) => s.Name)
                .filter((name): name is string => Boolean(name))
                .join(', ');
            if (studioNames) list.push(['Estúdio', studioNames]);
        }
        if (movie.Genres?.length) list.push(['Gêneros', movie.Genres.join(', ')]);
        if (mediaFormat.quality) {
            const label = [mediaFormat.resolution, mediaFormat.codec, mediaFormat.hdr]
                .filter(Boolean)
                .join(' ');
            list.push(['Vídeo', label || mediaFormat.quality]);
        }
        return list;
    }, [crew, movie.Studios, movie.Genres, mediaFormat]);

    const providerLinks = useMemo(() => {
        const ids = movie.ProviderIds;
        if (!ids) return [];
        const out: Array<{ label: string; href?: string }> = [];
        if (ids.Imdb) out.push({ label: 'IMDb ↗', href: `https://www.imdb.com/title/${ids.Imdb}` });
        if (ids.Tmdb) out.push({ label: 'TMDB ↗', href: `https://www.themoviedb.org/movie/${ids.Tmdb}` });
        return out;
    }, [movie.ProviderIds]);

    const hasMeta = Boolean(
        movie.ProductionYear
        || movie.RunTimeTicks
        || movie.OfficialRating
        || movie.CommunityRating !== undefined
        || movie.CriticRating !== undefined
        || mediaFormat.quality
    );
    const hasRightPanel = source && (audioStreams.length > 0 || subtitleStreams.length > 0);
    const hasTechPanel = tech.length > 0;
    const showAside = hasRightPanel || hasTechPanel;

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
                            art={posterArtFor(apiClient, movie)}
                        />
                        <div className='cineDetailHeroBody'>
                            <CineReveal delay={0.15}>
                                <CineEyebrow>{typeLabel}</CineEyebrow>
                            </CineReveal>
                            <CineReveal delay={0.25}>
                                <h1 className='cineDetailHeroTitle'>{movie.Name}</h1>
                            </CineReveal>
                            {movie.Taglines?.[0] && (
                                <CineReveal delay={0.32}>
                                    <CineTagline>{movie.Taglines[0]}</CineTagline>
                                </CineReveal>
                            )}
                            {hasMeta && (
                                <CineReveal delay={0.4}>
                                    <CineMetaRow>
                                        {movie.ProductionYear && <CineMetaItem strong>{movie.ProductionYear}</CineMetaItem>}
                                        {movie.ProductionYear && (movie.RunTimeTicks || movie.OfficialRating || movie.CommunityRating !== undefined || mediaFormat.quality) && <CineMetaDot />}
                                        {movie.RunTimeTicks && <span>{formatRuntime(movie.RunTimeTicks)}</span>}
                                        {movie.RunTimeTicks && (movie.OfficialRating || movie.CommunityRating !== undefined || mediaFormat.quality) && <CineMetaDot />}
                                        {movie.OfficialRating && <CineMetaItem badge>{movie.OfficialRating}</CineMetaItem>}
                                        {movie.OfficialRating && (movie.CommunityRating !== undefined || movie.CriticRating !== undefined || mediaFormat.quality) && <CineMetaDot />}
                                        {typeof movie.CommunityRating === 'number' && (
                                            <CineMetaItem amber>{`★ ${movie.CommunityRating.toFixed(1)}`}</CineMetaItem>
                                        )}
                                        {typeof movie.CommunityRating === 'number' && movie.CriticRating !== undefined && <CineMetaDot />}
                                        {typeof movie.CriticRating === 'number' && (
                                            <CineMetaItem red>{`🍅 ${Math.round(movie.CriticRating)}%`}</CineMetaItem>
                                        )}
                                        {(movie.CommunityRating !== undefined || movie.CriticRating !== undefined) && mediaFormat.quality && <CineMetaDot />}
                                        {mediaFormat.quality && <CineMetaItem quality>{mediaFormat.quality}</CineMetaItem>}
                                    </CineMetaRow>
                                </CineReveal>
                            )}
                            <CineReveal delay={0.5}>
                                <div className='cineDetailActionsRow'>
                                    <button type='button' className='cineDetailPrimaryCta' onClick={play}>
                                        {isResumable ? '▶ Continuar' : '▶ Assistir'}
                                    </button>
                                    <button type='button' className='cineDetailFavButton' onClick={onShowDetails}>+ Detalhes</button>
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
                    aside={showAside ? (
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
                            {hasTechPanel && (
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
                    {movie.Overview && (
                        <section>
                            <h2 className='cineDetailSectionTitle'>Sinopse</h2>
                            <p className='cineDetailSynopsis'>{movie.Overview}</p>
                            {tags.length > 0 && (
                                <CinePillRow>
                                    {tags.map((t) => <CinePill key={t}>{t}</CinePill>)}
                                </CinePillRow>
                            )}
                        </section>
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

                    {!isLoadingSimilar && similar.length > 0 && (
                        <CineEdgeRow title='Mais como este' mask='right'>
                            {similar.map((s) => (
                                <SimilarCardItem
                                    key={s.Id}
                                    item={s}
                                    apiClient={apiClient}
                                    onNavigate={onNavigateToSimilar}
                                />
                            ))}
                        </CineEdgeRow>
                    )}
                </CineContentGrid>
            </div>
        </>
    );
}
