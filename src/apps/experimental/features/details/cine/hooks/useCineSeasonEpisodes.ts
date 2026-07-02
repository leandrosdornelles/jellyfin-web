import type { Api } from '@jellyfin/sdk/lib/api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useApi, type JellyfinApiContext } from 'hooks/useApi';

const fetchSeasonEpisodes = async (
    api: Api,
    userId: string,
    seriesId: string,
    seasonId: string | undefined,
    options?: AxiosRequestConfig
): Promise<BaseItemDto[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {
            userId,
            seriesId,
            fields: [ 'PrimaryImageAspectRatio', 'Overview', 'Genres' ]
        };
        if (seasonId !== undefined) {
            params.season = seasonId;
        }
        const response = await getTvShowsApi(api).getEpisodes(params, options);
        return (response.data?.Items || []) as BaseItemDto[];
    } catch (err) {
        console.warn('[useCineSeasonEpisodes] failed', err);
        return [];
    }
};

export const cineSeasonEpisodesQuery = (
    api: Api | undefined,
    userId: string | undefined,
    seriesId: string | undefined,
    seasonId: string | undefined
) => queryOptions({
    queryKey: [ 'CineSeasonEpisodes', userId, seriesId, seasonId ],
    queryFn: ({ signal }) => fetchSeasonEpisodes(api!, userId!, seriesId!, seasonId, { signal }),
    enabled: !!api && !!userId && !!seriesId,
    staleTime: 30_000
});

export function useCineSeasonEpisodes(seriesId: string | undefined, seasonId: string | undefined) {
    const { api, user } = useApi();
    return useQuery(cineSeasonEpisodesQuery(api, user?.Id, seriesId, seasonId));
}

export function useCineSeasonEpisodesByContext(
    context: JellyfinApiContext,
    seriesId: string | undefined,
    seasonId: string | undefined
) {
    return useQuery(cineSeasonEpisodesQuery(context.api, context.user?.Id, seriesId, seasonId));
}
