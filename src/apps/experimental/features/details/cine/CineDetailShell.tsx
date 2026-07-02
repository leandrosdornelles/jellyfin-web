import React, { useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useApi } from 'hooks/useApi';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import { playbackManager } from 'components/playback/playbackmanager';
import itemContextMenu from 'components/itemContextMenu';
import { CineSidebar, getCineSidebarActiveIndex, getCineSidebarItems, CineShell } from 'components/cinematic';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import { useUserViews } from 'hooks/api/useUserViews';

export type CineDetailNav = 'home' | 'movies' | 'series' | 'anime';

const NAV_ITEMS: ReadonlyArray<{ id: CineDetailNav; href: string; label: string; icon: string; key: string }> = [
    { id: 'home', href: '/home', label: 'Início', icon: '🏠', key: 'home' },
    { id: 'movies', href: '/movies', label: 'Filmes', icon: '🎬', key: 'movies' },
    { id: 'series', href: '/tv', label: 'Séries', icon: '📺', key: 'series' },
    { id: 'anime', href: '/tv', label: 'Anime', icon: '⛩️', key: 'anime' }
];

function findNavIndex(nav: CineDetailNav): number {
    return NAV_ITEMS.findIndex((n) => n.id === nav);
}

export type CineDetailShellProps = Readonly<{
    item: BaseItemDto | null | undefined;
    isLoading: boolean;
    activeNav: CineDetailNav;
    children: ReactNode;
}>;

export function CineDetailShell({ item, isLoading, activeNav, children }: CineDetailShellProps) {
    const { data: userViewsData } = useUserViews();
    const items = getCineSidebarItems(userViewsData?.Items || []);
    const activeIndex = getCineSidebarActiveIndex(items, activeNav);

    return (
        <CineShell>
            <div className='cineDetailBody'>
                <CineSidebar
                    items={items}
                    activeIndex={activeIndex ?? findNavIndex(activeNav)}
                />
                <div className='cineDetailContent'>
                    {isLoading && (
                        <div className='cineDetailLoading'>
                            <div className='cineDetailLoadingSpinner' />
                            <span>Carregando…</span>
                        </div>
                    )}
                    {!isLoading && !item && (
                        <div className='cineDetailEmpty'>
                            <h2>Item não encontrado</h2>
                            <p>Não foi possível carregar este conteúdo.</p>
                        </div>
                    )}
                    {item && children}
                </div>
            </div>
        </CineShell>
    );
}

export function usePlayItem(item: BaseItemDto | null | undefined) {
    const { user } = useApi();
    return useCallback(() => {
        if (!item?.Id) return;
        const apiClient = item.ServerId ?
            ServerConnections.getApiClient(item.ServerId) :
            ServerConnections.currentApiClient();
        const serverId = item.ServerId || apiClient?.serverId() || undefined;
        const startPositionTicks = item.UserData?.PlaybackPositionTicks || 0;
        playbackManager.play({
            items: [item],
            user,
            serverId,
            startPositionTicks: startPositionTicks > 0 ? startPositionTicks : 0
        }).catch((err: unknown) => {
            console.error('[CineDetail] play failed', err);
        });
    }, [item, user]);
}

export function useNavigateToCineItem() {
    const navigate = useNavigate();
    return useCallback((id: string | null | undefined) => {
        if (!id) return;
        navigate(`/cinedetails?id=${encodeURIComponent(id)}`);
    }, [navigate]);
}

export function useCineItemMenu(item: BaseItemDto | null | undefined) {
    const { user } = useApi();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (!item || !user) return;

        itemContextMenu.show({
            item,
            user,
            play: true,
            queue: true,
            shuffle: true,
            playlist: true,
            edit: true,
            editImages: true,
            editSubtitles: true,
            identify: true,
            moremediainfo: true,
            share: true,
            deleteItem: true,
            positionTo: event.currentTarget
        }).then(async (result) => {
            if (result?.deleted) {
                navigate(-1);
                return;
            }
            if (result?.updated && item.Id) {
                await queryClient.invalidateQueries({ queryKey: [ 'CineItem', user.Id, item.Id ] });
            }
        }).catch(() => {
            return undefined;
        });
    }, [item, navigate, queryClient, user]);
}
