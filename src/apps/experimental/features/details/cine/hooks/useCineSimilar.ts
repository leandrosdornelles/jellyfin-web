import { queryOptions, useQuery } from '@tanstack/react-query';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import type { ApiClient } from 'jellyfin-apiclient';

import { ServerConnections } from 'lib/jellyfin-apiclient';
import type { JellyfinApiContext } from 'hooks/useApi';

interface QueryResult {
    Items?: BaseItemDto[];
}

const fetchSimilar = async (
    apiClient: ApiClient,
    itemId: string,
    limit: number
): Promise<BaseItemDto[]> => {
    try {
        const result = await apiClient.getSimilarItems(itemId, {
            Limit: limit,
            Fields: 'PrimaryImageAspectRatio,Overview,Genres,ProductionYear'
        } as Record<string, unknown>) as QueryResult;
        return result.Items || [];
    } catch (err) {
        console.warn('[useCineSimilar] similar items failed', err);
        return [];
    }
};

export const cineSimilarQuery = (
    apiClient: ApiClient | undefined,
    itemId: string | undefined,
    type: string | undefined,
    limit = 12
) => queryOptions({
    queryKey: [ 'CineSimilar', itemId, type, limit ],
    queryFn: () => fetchSimilar(apiClient!, itemId!, limit),
    enabled: !!apiClient && !!itemId && type === 'Movie',
    staleTime: 5 * 60_000
});

function resolveApiClient(context: JellyfinApiContext): ApiClient | undefined {
    if (context.__legacyApiClient__) return context.__legacyApiClient__;
    if (context.user?.ServerId) return ServerConnections.getApiClient(context.user.ServerId);
    return ServerConnections.currentApiClient() ?? undefined;
}

export function useCineSimilar(itemId: string | undefined, type: string | undefined, limit = 12) {
    const apiClient = ServerConnections.currentApiClient() ?? undefined;
    return useQuery(cineSimilarQuery(apiClient, itemId, type, limit));
}

export function useCineSimilarByContext(
    context: JellyfinApiContext,
    itemId: string | undefined,
    type: string | undefined,
    limit = 12
) {
    const apiClient = resolveApiClient(context);
    return useQuery(cineSimilarQuery(apiClient, itemId, type, limit));
}
