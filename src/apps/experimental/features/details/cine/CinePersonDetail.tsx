import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import React, { useCallback, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import type { ApiClient } from 'jellyfin-apiclient';

import {
    CineArt,
    CineCard,
    CineContentGrid,
    CineHero,
    CinePill,
    CinePillRow,
    CineReveal,
    CineSidebar,
    CineShell,
    CineTechLinks,
    CineTechList,
    TiltCard,
    getCineSidebarActiveIndex,
    getCineSidebarItems
} from 'components/cinematic';
import { useUserViews } from 'hooks/api/useUserViews';
import { useApi } from 'hooks/useApi';
import { useGetItems } from 'hooks/useFetchItems';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import type { ItemDto } from 'types/base/models/item-dto';

import { useCineItem } from './hooks/useCineItem';
import { getAvatarUrl, getCardImageUrl } from './utils/imageUrls';

import './cinePerson.scss';

type Props = Readonly<{
    itemId: string;
}>;

const GRADIENTS: ReadonlyArray<string> = [
    'linear-gradient(135deg, #111827, #450a0a)',
    'linear-gradient(135deg, #374151, #1c1917)',
    'linear-gradient(135deg, #0c4a6e, #1e1b4b)',
    'linear-gradient(135deg, #3b0764, #1e293b)',
    'linear-gradient(135deg, #7f1d1d, #0f172a)'
];

function gradientFor(seed: string | null | undefined): string {
    if (!seed) return GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return GRADIENTS[hash % GRADIENTS.length];
}

function getPersonAge(person: BaseItemDto) {
    if (!person.PremiereDate) return '';
    const birth = new Date(person.PremiereDate);
    const end = person.EndDate ? new Date(person.EndDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDelta = end.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && end.getDate() < birth.getDate())) age--;
    return age > 0 ? `${age} anos` : '';
}

function formatDate(date: string | null | undefined) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
}

function getProviderLinks(person: BaseItemDto) {
    const ids = person.ProviderIds;
    if (!ids) return [];
    const links: Array<{ label: string; href?: string }> = [];
    if (ids.Imdb) links.push({ label: 'IMDb ↗', href: `https://www.imdb.com/name/${ids.Imdb}` });
    if (ids.Tmdb) links.push({ label: 'TMDB ↗', href: `https://www.themoviedb.org/person/${ids.Tmdb}` });
    if (ids.Tvdb) links.push({ label: 'TheTVDB ↗', href: `https://thetvdb.com/people/${ids.Tvdb}` });
    return links;
}

function buildArt(apiClient: ApiClient | null, item: BaseItemDto | ItemDto): ReactNode {
    const url = apiClient ? getCardImageUrl(apiClient, item as BaseItemDto) : undefined;
    return (
        <CineArt
            {...(url ? { imageUrl: url } : {})}
            gradient={gradientFor(item.Id || item.Name)}
            style={{ width: '100%', height: '100%' }}
        />
    );
}

function PersonFilmCard({ item, apiClient }: Readonly<{ item: BaseItemDto | ItemDto; apiClient: ApiClient | null }>) {
    return (
        <TiltCard max={12} className='cinePersonTilt'>
            <CineCard
                art={buildArt(apiClient, item)}
                title={item.Name}
                sub={item.ProductionYear ? String(item.ProductionYear) : item.Type}
                href={item.Id ? `/cinedetails?id=${encodeURIComponent(item.Id)}` : undefined}
            />
        </TiltCard>
    );
}

export function CinePersonDetail({ itemId }: Props) {
    const navigate = useNavigate();
    const { data: item, isLoading } = useCineItem(itemId);
    const { user } = useApi();
    const { data: userViewsData } = useUserViews();
    const apiClient = user?.ServerId ?
        ServerConnections.getApiClient(user.ServerId) :
        ServerConnections.currentApiClient() ?? null;
    const person = item?.Type === 'Person' ? item : null;
    const sidebarItems = useMemo(() => getCineSidebarItems(userViewsData?.Items || []), [userViewsData?.Items]);

    const { data: creditsData, isLoading: isLoadingCredits } = useGetItems({
        recursive: true,
        personIds: person?.Id ? [person.Id] : [],
        includeItemTypes: [BaseItemKind.Movie, BaseItemKind.Series, BaseItemKind.Episode],
        fields: [
            ItemFields.PrimaryImageAspectRatio,
            ItemFields.Overview
        ],
        enableImageTypes: [ImageType.Primary, ImageType.Backdrop, ImageType.Thumb],
        imageTypeLimit: 1,
        sortBy: [ItemSortBy.ProductionYear, ItemSortBy.SortName],
        sortOrder: [SortOrder.Descending],
        limit: 80
    });

    const credits = useMemo(() => creditsData?.Items || [], [creditsData?.Items]);
    const portraitTag = person?.ImageTags?.Primary;
    const portraitUrl = person && apiClient ? getAvatarUrl(apiClient, person.Id, portraitTag, 480) : undefined;
    const heroStyle = useMemo<CSSProperties | undefined>(() => {
        if (portraitUrl) return { '--cine-person-image': `url('${portraitUrl.replace(/'/g, '%27')}')` } as CSSProperties;
        return { '--cine-person-image': gradientFor(person?.Id || person?.Name) } as CSSProperties;
    }, [person?.Id, person?.Name, portraitUrl]);
    const providerLinks = useMemo(() => person ? getProviderLinks(person) : [], [person]);
    const birthDate = formatDate(person?.PremiereDate);
    const deathDate = formatDate(person?.EndDate);
    const age = person ? getPersonAge(person) : '';
    const detailRows = useMemo(() => {
        if (!person) return [];
        return [
            ['Nome', person.Name || ''],
            ['Nascimento', [birthDate, age].filter(Boolean).join(' · ')],
            ['Falecimento', deathDate],
            ['Local', person.ProductionLocations?.join(', ') || ''],
            ['Títulos', credits.length ? String(credits.length) : '']
        ].filter(([, value]) => value);
    }, [age, birthDate, credits.length, deathDate, person]);

    const onBack = useCallback(() => navigate(-1), [navigate]);

    return (
        <CineShell>
            <div className='cinePersonBody'>
                <CineSidebar
                    items={sidebarItems}
                    activeIndex={getCineSidebarActiveIndex(sidebarItems, 'movies')}
                />
                <div className='cinePersonContent'>
                    {isLoading && (
                        <div className='cineDetailLoading'>
                            <div className='cineDetailLoadingSpinner' />
                            <span>Carregando…</span>
                        </div>
                    )}
                    {!isLoading && !person && (
                        <div className='cineDetailEmpty'>
                            <h2>Pessoa não encontrada</h2>
                            <p>Não foi possível carregar este perfil.</p>
                        </div>
                    )}
                    {person && (
                        <>
                            <button type='button' className='cineDetailBack' onClick={onBack}>← Voltar</button>
                            <CineHero backdrop={<CineArt gradient={gradientFor(person.Id || person.Name)} style={{ width: '100%', height: '100%' }} />} className='cinePersonHero'>
                                <div className='cinePersonSpot' />
                                <div className='cinePersonHeroInner'>
                                    <CineReveal delay={0.1} className='cinePersonPortraitWrap'>
                                        <div className='cinePersonPortraitGlow' />
                                        <div className='cinePersonPortrait' style={heroStyle} />
                                    </CineReveal>
                                    <div className='cinePersonHeroText'>
                                        <CineReveal delay={0.15}>
                                            <span className='cineHeroEyebrow'>Pessoa</span>
                                        </CineReveal>
                                        <CineReveal delay={0.25}>
                                            <h1 className='cinePersonTitle'>{person.Name}</h1>
                                        </CineReveal>
                                        {(birthDate || person.ProductionLocations?.length) && (
                                            <CineReveal delay={0.35}>
                                                <div className='cinePersonMeta'>
                                                    {birthDate && <span>Nascimento: <b>{birthDate}{age ? ` (${age})` : ''}</b></span>}
                                                    {birthDate && person.ProductionLocations?.length ? <span>•</span> : null}
                                                    {!!person.ProductionLocations?.length && <span>{person.ProductionLocations.join(', ')}</span>}
                                                </div>
                                            </CineReveal>
                                        )}
                                        {!!person.Tags?.length && (
                                            <CineReveal delay={0.45}>
                                                <CinePillRow>
                                                    {person.Tags.slice(0, 6).map(tag => <CinePill key={tag}>{tag}</CinePill>)}
                                                </CinePillRow>
                                            </CineReveal>
                                        )}
                                        {providerLinks.length > 0 && (
                                            <CineReveal delay={0.55}>
                                                <div className='cinePersonLinks'>
                                                    <CineTechLinks links={providerLinks} />
                                                </div>
                                            </CineReveal>
                                        )}
                                    </div>
                                </div>
                            </CineHero>

                            <div className='cinePersonContentInner'>
                                <CineContentGrid
                                    aside={detailRows.length > 0 ? (
                                        <div className='cineDetailPanel'>
                                            <h3 className='cineDetailPanelTitle'>Detalhes</h3>
                                            <CineTechList items={detailRows as Array<[string, string]>} />
                                        </div>
                                    ) : null}
                                >
                                    {person.Overview && (
                                        <section>
                                            <h2 className='cineDetailSectionTitle'>Biografia</h2>
                                            <p className='cineDetailSynopsis'>{person.Overview}</p>
                                        </section>
                                    )}

                                    <section>
                                        <div className='cinePersonSectionHead'>
                                            <h2 className='cineDetailSectionTitle'>Filmografia</h2>
                                            <span>{isLoadingCredits ? 'Carregando…' : `${credits.length} títulos`}</span>
                                        </div>
                                        {credits.length > 0 ? (
                                            <div className='cinePersonGrid'>
                                                {credits.map(credit => (
                                                    <PersonFilmCard key={credit.Id || credit.Name} item={credit} apiClient={apiClient} />
                                                ))}
                                            </div>
                                        ) : !isLoadingCredits && (
                                            <p className='cineDetailSynopsis'>Nenhum título encontrado para esta pessoa.</p>
                                        )}
                                    </section>
                                </CineContentGrid>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </CineShell>
    );
}
