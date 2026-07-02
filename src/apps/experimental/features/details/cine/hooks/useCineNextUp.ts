import type { Api } from '@jellyfin/sdk/lib/api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useApi, type JellyfinApiContext } from 'hooks/useApi';

interface QueryResult {
    Items?: BaseItemDto[];
    TotalRecordCount?: number;
}

const fetchNextUp = async (
    api: Api,
    userId: string,
    seriesId: string,
    limit: number,
    options?: AxiosRequestConfig
): Promise<BaseItemDto[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {
            userId,
            seriesId,
            limit,
            fields: [ 'PrimaryImageAspectRatio', 'Overview', 'Genres' ]
        };
        const response = await getTvShowsApi(api).getNextUp(params, options);
        return (response.data?.Items || []) as BaseItemDto[];
    } catch (err) {
        console.warn('[useCineNextUp] failed', err);
        return [];
    }
};

export const cineNextUpQuery = (
    api: Api | undefined,
    userId: string | undefined,
    seriesId: string | undefined,
    limit = 1
) => queryOptions({
    queryKey: [ 'CineNextUp', userId, seriesId, limit ],
    queryFn: ({ signal }) => fetchNextUp(api!, userId!, seriesId!, limit, { signal }),
    enabled: !!api && !!userId && !!seriesId,
    staleTime: 30_000
});

export function useCineNextUp(seriesId: string | undefined, limit = 1) {
    const { api, user } = useApi();
    return useQuery(cineNextUpQuery(api, user?.Id, seriesId, limit));
}

export function useCineNextUpByContext(context: JellyfinApiContext, seriesId: string | undefined, limit = 1) {
    return useQuery(cineNextUpQuery(context.api, context.user?.Id, seriesId, limit));
}

export type { QueryResult as CineNextUpResult };
