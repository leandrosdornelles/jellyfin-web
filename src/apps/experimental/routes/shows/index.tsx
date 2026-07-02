import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import React, { type FC } from 'react';

import CineLibraryPage from 'apps/experimental/features/libraries/cine/CineLibraryPage';

const Shows: FC = () => {
    return (
        <CineLibraryPage type={CollectionType.Tvshows} />
    );
};

export default Shows;
