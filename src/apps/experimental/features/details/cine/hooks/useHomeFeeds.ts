import { queryOptions, useQuery } from '@tanstack/react-query';

import { ServerConnections } from 'lib/jellyfin-apiclient';
import { useApi, type JellyfinApiContext } from 'hooks/useApi';
import type { ApiClient } from 'jellyfin-apiclient';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';

const fetchResume = async (
    apiClient: ApiClient,
    userId: string,
    limit: number
): Promise<BaseItemDto[]> => {
    try {
        const result = await apiClient.getItems(userId, {
            Limit: limit,
            Fields: 'PrimaryImageAspectRatio,Overview,Genres',
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Thumb',
            EnableTotalRecordCount: false,
            MediaTypes: 'Video'
        } as Record<string, unknown>) as { Items?: BaseItemDto[] };
        return result.Items || [];
    } catch (err) {
        console.warn('[useHomeResume] failed', err);
        return [];
    }
};

const fetchNextUp = async (
    apiClient: ApiClient,
    userId: string,
    limit: number
): Promise<BaseItemDto[]> => {
    try {
        const result = await apiClient.getNextUpEpisodes({
            UserId: userId,
            Limit: limit,
            Fields: 'PrimaryImageAspectRatio,Overview,Genres'
        } as Record<string, unknown>) as { Items?: BaseItemDto[] };
        return result.Items || [];
    } catch (err) {
        console.warn('[useHomeNextUp] failed', err);
        return [];
    }
};

const fetchLatest = async (
    apiClient: ApiClient,
    userId: string,
    limit: number
): Promise<BaseItemDto[]> => {
    try {
        const result = await apiClient.getItems(userId, {
            Limit: limit,
            Fields: 'PrimaryImageAspectRatio,Overview,Genres,ProductionYear',
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Thumb',
            EnableTotalRecordCount: false,
            IncludeItemTypes: 'Movie,Series',
            SortBy: 'DateCreated,SortName',
            SortOrder: 'Descending',
            Recursive: true
        } as Record<string, unknown>) as { Items?: BaseItemDto[] };
        return result.Items || [];
    } catch (err) {
        console.warn('[useHomeLatest] failed', err);
        return [];
    }
};

export const homeResumeQuery = (
    apiClient: ApiClient | undefined,
    userId: string | undefined,
    limit: number
) => queryOptions({
    queryKey: [ 'HomeResume', userId, limit ],
    queryFn: () => fetchResume(apiClient!, userId!, limit),
    enabled: !!apiClient && !!userId,
    staleTime: 30_000
});

export const homeNextUpQuery = (
    apiClient: ApiClient | undefined,
    userId: string | undefined,
    limit: number
) => queryOptions({
    queryKey: [ 'HomeNextUp', userId, limit ],
    queryFn: () => fetchNextUp(apiClient!, userId!, limit),
    enabled: !!apiClient && !!userId,
    staleTime: 30_000
});

export const homeLatestQuery = (
    apiClient: ApiClient | undefined,
    userId: string | undefined,
    limit: number
) => queryOptions({
    queryKey: [ 'HomeLatest', userId, limit ],
    queryFn: () => fetchLatest(apiClient!, userId!, limit),
    enabled: !!apiClient && !!userId,
    staleTime: 30_000
});

function resolveApiClient(context: JellyfinApiContext): ApiClient | undefined {
    if (context.__legacyApiClient__) return context.__legacyApiClient__;
    if (context.user?.ServerId) return ServerConnections.getApiClient(context.user.ServerId);
    return ServerConnections.currentApiClient() ?? undefined;
}

export function useHomeResume(limit = 6) {
    const apiClient = ServerConnections.currentApiClient() ?? undefined;
    const { user } = useApi();
    return useQuery(homeResumeQuery(apiClient, user?.Id, limit));
}

export function useHomeNextUp(limit = 8) {
    const apiClient = ServerConnections.currentApiClient() ?? undefined;
    const { user } = useApi();
    return useQuery(homeNextUpQuery(apiClient, user?.Id, limit));
}

export function useHomeLatest(limit = 12) {
    const apiClient = ServerConnections.currentApiClient() ?? undefined;
    const { user } = useApi();
    return useQuery(homeLatestQuery(apiClient, user?.Id, limit));
}

export function useHomeResumeByContext(context: JellyfinApiContext, limit = 6) {
    return useQuery(homeResumeQuery(resolveApiClient(context), context.user?.Id, limit));
}

export function useHomeNextUpByContext(context: JellyfinApiContext, limit = 8) {
    return useQuery(homeNextUpQuery(resolveApiClient(context), context.user?.Id, limit));
}

export function useHomeLatestByContext(context: JellyfinApiContext, limit = 12) {
    return useQuery(homeLatestQuery(resolveApiClient(context), context.user?.Id, limit));
}
