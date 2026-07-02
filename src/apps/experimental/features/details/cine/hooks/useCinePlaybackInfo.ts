import type { Api } from '@jellyfin/sdk/lib/api';
import { getUserLibraryApi } from '@jellyfin/sdk/lib/utils/api/user-library-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';

import { useApi, type JellyfinApiContext } from 'hooks/useApi';

const fetchItemWithMedia = async (
    api: Api,
    userId: string,
    itemId: string,
    options?: AxiosRequestConfig
) => {
    const response = await getUserLibraryApi(api).getItem(
        { userId, itemId },
        options
    );
    return response.data as BaseItemDto;
};

export const cinePlaybackInfoQuery = (
    api: Api | undefined,
    userId: string | undefined,
    itemId: string | undefined
) => queryOptions({
    queryKey: [ 'CinePlaybackInfo', userId, itemId ],
    queryFn: ({ signal }) => fetchItemWithMedia(api!, userId!, itemId!, { signal }),
    enabled: !!api && !!userId && !!itemId,
    staleTime: 60_000
});

export function useCinePlaybackInfo(itemId: string | undefined) {
    const { api, user } = useApi();
    return useQuery(cinePlaybackInfoQuery(api, user?.Id, itemId));
}

export function useCinePlaybackInfoByContext(context: JellyfinApiContext, itemId: string | undefined) {
    return useQuery(cinePlaybackInfoQuery(context.api, context.user?.Id, itemId));
}
