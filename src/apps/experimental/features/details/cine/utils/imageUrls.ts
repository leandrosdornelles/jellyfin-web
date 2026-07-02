import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import type { ApiClient } from 'jellyfin-apiclient';

import { getItemBackdropImageUrl } from 'utils/jellyfin-apiclient/backdropImage';

const MAX_BACKDROP_WIDTH = 1920;
const MAX_POSTER_WIDTH = 900;
const MAX_THUMB_WIDTH = 1920;
const MAX_AVATAR_WIDTH = 240;
const MAX_CARD_WIDTH = 600;
const MAX_LOGO_WIDTH = 800;

export function getBackdropUrl(apiClient: ApiClient, item: BaseItemDto): string | undefined {
    return getItemBackdropImageUrl(apiClient, item, { maxWidth: MAX_BACKDROP_WIDTH });
}

export function getPosterUrl(apiClient: ApiClient, item: BaseItemDto, maxWidth = MAX_POSTER_WIDTH): string | undefined {
    if (!item.Id || !item.ImageTags?.Primary) return undefined;
    return apiClient.getScaledImageUrl(item.Id, {
        type: ImageType.Primary,
        tag: item.ImageTags.Primary,
        maxWidth
    });
}

export function getThumbUrl(apiClient: ApiClient, item: BaseItemDto): string | undefined {
    const parentId = item.SeriesId && item.ParentThumbItemId;
    const tag = item.ImageTags?.Thumb
        || (parentId ? item.SeriesThumbImageTag : undefined);
    const targetId = parentId || item.Id;
    if (!targetId || !tag) return undefined;
    return apiClient.getScaledImageUrl(targetId, {
        type: ImageType.Thumb,
        tag,
        maxWidth: MAX_THUMB_WIDTH
    });
}

export function getAvatarUrl(
    apiClient: ApiClient,
    personId: string | null | undefined,
    tag: string | null | undefined,
    maxWidth = MAX_AVATAR_WIDTH
): string | undefined {
    if (!personId || !tag) return undefined;
    return apiClient.getScaledImageUrl(personId, {
        type: ImageType.Primary,
        tag,
        maxWidth
    });
}

export function getPersonImageUrl(
    apiClient: ApiClient,
    person: { Id?: string | null; PrimaryImageTag?: string | null }
): string | undefined {
    return getAvatarUrl(apiClient, person.Id, person.PrimaryImageTag);
}

export function getLogoUrl(apiClient: ApiClient, item: BaseItemDto): string | undefined {
    const tag = item.ImageTags?.Logo;
    const id = item.Id;
    if (!id || !tag) return undefined;
    return apiClient.getScaledImageUrl(id, {
        type: ImageType.Logo,
        tag,
        maxWidth: MAX_LOGO_WIDTH
    });
}

export function getCardImageUrl(apiClient: ApiClient, item: BaseItemDto, maxWidth = MAX_CARD_WIDTH): string | undefined {
    return getPosterUrl(apiClient, item, maxWidth) || getBackdropUrl(apiClient, item) || getThumbUrl(apiClient, item);
}
