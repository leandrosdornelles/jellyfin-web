import type { Api } from '@jellyfin/sdk/lib/api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useApi, type JellyfinApiContext } from 'hooks/useApi';

const fetchSeasons = async (
    api: Api,
    userId: string,
    seriesId: string,
    options?: AxiosRequestConfig
): Promise<BaseItemDto[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = { userId, seriesId, fields: [ 'PrimaryImageAspectRatio', 'Overview', 'Genres' ] };
        const response = await getTvShowsApi(api).getSeasons(params, options);
        return (response.data?.Items || []) as BaseItemDto[];
    } catch (err) {
        console.warn('[useCineSeasons] failed', err);
        return [];
    }
};

export const cineSeasonsQuery = (
    api: Api | undefined,
    userId: string | undefined,
    seriesId: string | undefined
) => queryOptions({
    queryKey: [ 'CineSeasons', userId, seriesId ],
    queryFn: ({ signal }) => fetchSeasons(api!, userId!, seriesId!, { signal }),
    enabled: !!api && !!userId && !!seriesId,
    staleTime: 60_000
});

export function useCineSeasons(seriesId: string | undefined) {
    const { api, user } = useApi();
    return useQuery(cineSeasonsQuery(api, user?.Id, seriesId));
}

export function useCineSeasonsByContext(context: JellyfinApiContext, seriesId: string | undefined) {
    return useQuery(cineSeasonsQuery(context.api, context.user?.Id, seriesId));
}
