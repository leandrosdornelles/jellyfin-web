import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import type { BaseItemPerson } from '@jellyfin/sdk/lib/generated-client/models/base-item-person';
import type { MediaSourceInfo } from '@jellyfin/sdk/lib/generated-client/models/media-source-info';
import type { MediaStream } from '@jellyfin/sdk/lib/generated-client/models/media-stream';
import type { PersonKind } from '@jellyfin/sdk/lib/generated-client/models/person-kind';

export interface StudioRef {
    Name?: string | null;
    Id?: string | null;
}

export type CastMember = BaseItemPerson & {
    Role?: string | null;
    Type?: PersonKind;
};

export type MovieDetail = BaseItemDto & {
    Type: 'Movie';
    Taglines?: string[] | null;
    Genres?: string[] | null;
    People?: CastMember[] | null;
    Studios?: StudioRef[] | null;
    MediaSources?: MediaSourceInfo[] | null;
};

export type SeriesDetail = BaseItemDto & {
    Type: 'Series';
    Genres?: string[] | null;
    People?: CastMember[] | null;
    Studios?: StudioRef[] | null;
    Status?: string | null;
};

export type SeasonDetail = BaseItemDto & {
    Type: 'Season';
    SeriesId?: string | null;
    SeriesName?: string | null;
    IndexNumber?: number | null;
};

export type EpisodeDetail = BaseItemDto & {
    Type: 'Episode';
    SeriesId?: string | null;
    SeriesName?: string | null;
    SeasonId?: string | null;
    SeasonName?: string | null;
    IndexNumber?: number | null;
    ParentIndexNumber?: number | null;
    MediaSources?: MediaSourceInfo[] | null;
};

export type AudioStream = MediaStream & {
    Type: 'Audio';
};

export type SubtitleStream = MediaStream & {
    Type: 'Subtitle';
};
