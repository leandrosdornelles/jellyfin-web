import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import React, { type FC } from 'react';

import CineLibraryPage from 'apps/experimental/features/libraries/cine/CineLibraryPage';

const Movies: FC = () => {
    return (
        <CineLibraryPage type={CollectionType.Movies} />
    );
};

export default Movies;
