import type { Api } from '@jellyfin/sdk/lib/api';
import { getUserLibraryApi } from '@jellyfin/sdk/lib/utils/api/user-library-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';

import { useApi, type JellyfinApiContext } from 'hooks/useApi';

const fetchItem = async (
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

export const cineItemQuery = (
    api: Api | undefined,
    userId: string | undefined,
    itemId: string | undefined
) => queryOptions({
    queryKey: [ 'CineItem', userId, itemId ],
    queryFn: ({ signal }) => fetchItem(api!, userId!, itemId!, { signal }),
    enabled: !!api && !!userId && !!itemId,
    staleTime: 30_000
});

export function useCineItem(itemId: string | undefined) {
    const { api, user } = useApi();
    return useQuery(cineItemQuery(api, user?.Id, itemId));
}

export function useCineItemByContext(context: JellyfinApiContext, itemId: string | undefined) {
    return useQuery(cineItemQuery(context.api, context.user?.Id, itemId));
}
