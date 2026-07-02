import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import layoutManager from 'components/layoutManager';
import escapeHtml from 'escape-html';
import { DEFAULT_SECTIONS, HomeSectionType } from 'constants/homeSectionType';
import { ItemAction } from 'constants/itemAction';
import { getLatestMediaQuery } from 'apps/stable/features/libraries/api/useLatestMedia';
import { getNextUpQuery } from 'apps/stable/features/libraries/api/useNextUp';
import { getResumeItemsQuery } from 'apps/stable/features/libraries/api/useResumeItems';
import { getUserViewsQuery } from 'hooks/api/useUserViews';
import { appRouter } from 'components/router/appRouter';
import globalize from 'lib/globalize';
import Dashboard from 'utils/dashboard';
import { toApi } from 'utils/jellyfin-apiclient/compat';
import { queryClient } from 'utils/query/queryClient';

import { loadRecordings } from './sections/activeRecordings';
import { loadLiveTV } from './sections/liveTv';
import { loadResume } from './sections/resume';

import 'elements/emby-button/paper-icon-button-light';
import 'elements/emby-itemscontainer/emby-itemscontainer';
import 'elements/emby-scroller/emby-scroller';
import 'elements/emby-button/emby-button';

import './homesections.scss';

const MAX_SECTIONS = 10;
const MAX_SECTIONS_TV = MAX_SECTIONS + 1; // TV layout can have an extra section to ensure a library section is always visible
const ANIME_NAME_PATTERN = /anime|animes/i;
let searchShortcutBound = false;
let headerObserverBound = false;
let currentHeroItemId = null;

export function getDefaultSection(index) {
    if (index < 0 || index > DEFAULT_SECTIONS.length) return '';
    return DEFAULT_SECTIONS[index];
}

function getAllSectionsToShow(userSettings) {
    const sections = [];
    for (let i = 0, length = MAX_SECTIONS; i < length; i++) {
        let section = userSettings.get('homesection' + i) || getDefaultSection(i);
        if (section === 'folders') {
            section = getDefaultSection(0);
        }

        sections.push(section);
    }

    // Ensure libraries are visible in TV layout
    if (
        layoutManager.tv
            && !sections.includes(HomeSectionType.SmallLibraryTiles)
            && !sections.includes(HomeSectionType.LibraryButtons)
    ) {
        return [
            HomeSectionType.SmallLibraryTiles,
            ...sections
        ];
    }

    return sections;
}

function getV2SectionsToShow(userSettings) {
    const sections = getAllSectionsToShow(userSettings).filter(section => section !== HomeSectionType.None);
    const prioritySections = [
        HomeSectionType.Resume,
        HomeSectionType.NextUp,
        HomeSectionType.LatestMedia,
        HomeSectionType.SmallLibraryTiles,
        HomeSectionType.LibraryButtons
    ];

    return [
        ...prioritySections.filter(section => sections.includes(section)),
        ...sections.filter(section => !prioritySections.includes(section))
    ];
}

export function loadSections(elem, apiClient, user, userSettings) {
    document.body.classList.add('vcHomeV2Active');
    document.body.classList.add('hiddenViewMenuBar');
    document.body.classList.remove('withSectionTabs');
    document.documentElement.classList.add('vcHomeV2Active');
    elem.closest('.homePage')?.classList.add('vcHomeV2Page', 'noSecondaryNavPage');
    hideHomeHeader();
    bindHeaderObserver();

    const userId = user.Id || apiClient.getCurrentUserId();
    return queryClient
        .fetchQuery(getUserViewsQuery(toApi(apiClient), { userId }))
        .then(result => result.Items || [])
        .then(function (userViews) {
            let html = '';

            if (userViews.length) {
                // TV layout can have an extra section to ensure libraries are visible
                const totalSectionCount = layoutManager.tv ? MAX_SECTIONS_TV : MAX_SECTIONS;
                html += getSidebarHtml(user, userViews);
                html += '<div class="vcHomeV2Command verticalSection padded-left padded-right">';
                html += '<a is="emby-linkbutton" href="#/search" class="vcHomeV2CommandLink"><span class="material-icons search" aria-hidden="true"></span><span>Buscar filme, série, anime, pessoa ou gênero</span><kbd>Ctrl K</kbd></a>';
                html += '</div>';
                html += '<div class="vcHomeV2Hero verticalSection"></div>';
                html += '<div class="vcHomeV2QuickFilters verticalSection padded-left padded-right">';
                html += '<button is="emby-button" type="button" class="vcHomeV2Filter is-active" data-vc-filter="now">Agora</button>';
                html += '<button is="emby-button" type="button" class="vcHomeV2Filter" data-vc-filter="short">Até 30 min</button>';
                html += '<button is="emby-button" type="button" class="vcHomeV2Filter" data-vc-filter="movie">Filmes</button>';
                html += '<button is="emby-button" type="button" class="vcHomeV2Filter" data-vc-filter="marathon">Maratonar</button>';
                html += '</div>';
                html += '<div class="vcHomeV2Decision verticalSection"></div>';
                for (let i = 0; i < totalSectionCount; i++) {
                    html += '<div class="verticalSection section' + i + '"></div>';
                }
                html += '<div class="vcHomeV2Utility verticalSection padded-left padded-right"></div>';

                elem.innerHTML = html;
                elem.classList.add('homeSectionsContainer');
                bindQuickFilters(elem);
                bindDecisionShortcuts(elem);
                bindSearchShortcut();

                const heroPromise = loadHero(elem.querySelector('.vcHomeV2Hero'), apiClient, user);
                const promises = [
                    heroPromise.then(() => loadDecisionSection(elem.querySelector('.vcHomeV2Decision'), apiClient, user)),
                    loadUtilitySection(elem.querySelector('.vcHomeV2Utility'), apiClient, user, userViews)
                ];
                promises.push(...getV2SectionsToShow(userSettings)
                    .map((section, index) => (
                        loadSection(elem, apiClient, user, userSettings, userViews, section, index)
                    )));

                return Promise.all(promises)
                    // Timeout for polyfilled CustomElements (webOS 1.2)
                    .then(() => new Promise((resolve) => setTimeout(resolve, 0)))
                    .then(() => resume(elem, { refresh: true }));
            } else {
                let noLibDescription;
                if (user.Policy?.IsAdministrator) {
                    noLibDescription = globalize.translate('NoCreatedLibraries', '<br><a id="button-createLibrary" class="button-link">', '</a>');
                } else {
                    noLibDescription = globalize.translate('AskAdminToCreateLibrary');
                }

                html += '<div class="centerMessage padded-left padded-right">';
                html += '<h2>' + globalize.translate('MessageNothingHere') + '</h2>';
                html += '<p>' + noLibDescription + '</p>';
                html += '</div>';
                elem.innerHTML = html;

                const createNowLink = elem.querySelector('#button-createLibrary');
                if (createNowLink) {
                    createNowLink.addEventListener('click', function () {
                        Dashboard.navigate('dashboard/libraries');
                    });
                }
            }
        });
}

function hideHomeHeader() {
    const skinHeader = document.querySelector('.skinHeader');
    skinHeader?.classList.add('vcHomeV2HideHeader');
    skinHeader?.style.setProperty('display', 'none', 'important');
}

function bindHeaderObserver() {
    if (headerObserverBound) return;

    headerObserverBound = true;
    const observer = new MutationObserver(() => {
        if (document.body.classList.contains('vcHomeV2Active')) {
            document.body.classList.add('hiddenViewMenuBar');
            document.body.classList.remove('withSectionTabs');
            hideHomeHeader();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function isAnimeView(view) {
    return Boolean(view.Name && ANIME_NAME_PATTERN.test(view.Name));
}

function getLibraryHref(path, view, collectionType) {
    if (!view?.Id) return `#${path}`;
    return `#${path}?topParentId=${encodeURIComponent(view.Id)}&collectionType=${encodeURIComponent(collectionType)}`;
}

function getSidebarHtml(user, userViews) {
    const adminHref = user.Policy?.IsAdministrator ? appRouter.getRouteUrl('manageserver') : appRouter.getRouteUrl('settings');
    const movieView = userViews.find(view => view.CollectionType === CollectionType.Movies);
    const animeView = userViews.find(view => view.CollectionType === CollectionType.Tvshows && isAnimeView(view));
    const seriesView = userViews.find(view => view.CollectionType === CollectionType.Tvshows && !isAnimeView(view)) || animeView;
    const animeLink = animeView ? `<a is="emby-linkbutton" href="${getLibraryHref('/tv', animeView, CollectionType.Tvshows)}" class="vcHomeV2SidebarButton" title="Anime" aria-label="Anime"><span class="material-icons" aria-hidden="true">animation</span></a>` : '';

    return `
        <aside class="vcHomeV2Sidebar" aria-label="Navegação principal V2">
            <nav class="vcHomeV2SidebarNav">
                <a is="emby-linkbutton" href="#/home" class="vcHomeV2SidebarButton is-active" title="Início" aria-label="Início"><span class="material-icons" aria-hidden="true">home</span></a>
                <a is="emby-linkbutton" href="${getLibraryHref('/movies', movieView, CollectionType.Movies)}" class="vcHomeV2SidebarButton" title="Filmes" aria-label="Filmes"><span class="material-icons" aria-hidden="true">movie</span></a>
                <a is="emby-linkbutton" href="${getLibraryHref('/tv', seriesView, CollectionType.Tvshows)}" class="vcHomeV2SidebarButton" title="Séries" aria-label="Séries"><span class="material-icons" aria-hidden="true">tv</span></a>
                ${animeLink}
            </nav>
            <nav class="vcHomeV2SidebarNav">
                <a is="emby-linkbutton" href="${adminHref}" class="vcHomeV2SidebarButton" title="${user.Policy?.IsAdministrator ? 'Admin' : 'Preferências'}" aria-label="${user.Policy?.IsAdministrator ? 'Admin' : 'Preferências'}">⚙</a>
            </nav>
        </aside>`;
}

function bindQuickFilters(elem) {
    const buttons = elem.querySelectorAll('.vcHomeV2Filter');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            applyDecisionFilter(elem, button.getAttribute('data-vc-filter') || 'now');
        });
    });
}

function bindDecisionShortcuts(elem) {
    elem.addEventListener('click', event => {
        const target = event.target.closest('[data-vc-filter-shortcut], [data-vc-scroll]');
        if (!target) return;

        const filter = target.getAttribute('data-vc-filter-shortcut');
        if (filter) {
            applyDecisionFilter(elem, filter);
            return;
        }

        elem.querySelector('.vcHomeV2Decision')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

function bindSearchShortcut() {
    if (searchShortcutBound) return;

    searchShortcutBound = true;
    window.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            Dashboard.navigate('search');
        }
    });
}

function applyDecisionFilter(elem, filter) {
    const decisionSection = elem.querySelector('.vcHomeV2Decision');
    const itemsContainer = decisionSection?.querySelector('.itemsContainer');

    elem.querySelectorAll('.vcHomeV2Filter').forEach(button => {
        button.classList.toggle('is-active', button.getAttribute('data-vc-filter') === filter);
    });

    if (decisionSection) {
        decisionSection.dataset.vcFilter = filter;
        decisionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    itemsContainer?.refreshItems?.();
}

function getResumeItems(apiClient, user, limit) {
    return queryClient
        .fetchQuery(getResumeItemsQuery(toApi(apiClient), {
            userId: user.Id || apiClient.getCurrentUserId(),
            limit,
            fields: ['PrimaryImageAspectRatio', 'Overview'],
            imageTypeLimit: 1,
            enableImageTypes: ['Primary', 'Backdrop', 'Thumb'],
            enableTotalRecordCount: false,
            mediaTypes: ['Video']
        }))
        .then(result => result?.Items || []);
}

function getNextUpItems(apiClient, user, limit) {
    return queryClient
        .fetchQuery(getNextUpQuery(toApi(apiClient), {
            userId: user.Id || apiClient.getCurrentUserId(),
            limit,
            fields: ['PrimaryImageAspectRatio', 'DateCreated', 'MediaSourceCount'],
            imageTypeLimit: 1,
            enableImageTypes: ['Primary', 'Backdrop', 'Thumb'],
            enableTotalRecordCount: false,
            enableResumable: false
        }))
        .then(result => result?.Items || []);
}

function getLatestItems(apiClient, user, limit, parentId) {
    return queryClient
        .fetchQuery(getLatestMediaQuery(toApi(apiClient), {
            userId: user.Id || apiClient.getCurrentUserId(),
            limit,
            fields: ['PrimaryImageAspectRatio', 'Path'],
            imageTypeLimit: 1,
            enableImageTypes: ['Primary', 'Backdrop', 'Thumb'],
            parentId
        }))
        .then(items => items || []);
}

function getDecisionItems(apiClient, user, filter) {
    return Promise.all([
        getResumeItems(apiClient, user, 6).catch(() => []),
        getNextUpItems(apiClient, user, 8).catch(() => []),
        getLatestItems(apiClient, user, 8).catch(() => [])
    ]).then(([resumeItems, nextUpItems, latestItems]) => filterOutHomeDuplicates(dedupeItems([
        ...resumeItems.slice(1).map(item => ({ ...item, VcReason: 'Continuar' })),
        ...nextUpItems.map(item => ({ ...item, VcReason: 'A seguir' })),
        ...latestItems.map(item => ({ ...item, VcReason: 'Novo no servidor' }))
    ])).filter(item => matchesDecisionFilter(item, filter)).slice(0, 12));
}

function matchesDecisionFilter(item, filter) {
    if (filter === 'short') {
        return !item.RunTimeTicks || item.RunTimeTicks <= 18000000000;
    }

    if (filter === 'movie') {
        return item.Type === 'Movie';
    }

    if (filter === 'marathon') {
        return item.Type === 'Episode' || item.Type === 'Series' || item.SeriesId;
    }

    return true;
}

function loadDecisionSection(elem, apiClient, user) {
    if (!elem) return Promise.resolve();

    elem.classList.add('hide');
    elem.innerHTML = `
        <div class="vcHomeV2SectionHead padded-left padded-right">
            <div>
                <h2 class="sectionTitle sectionTitle-cards">Para assistir agora</h2>
            </div>
            <a is="emby-linkbutton" href="${appRouter.getRouteUrl('nextup', { serverId: apiClient.serverId() })}" class="vcHomeV2SeeAll">Ver próximos</a>
        </div>
        <div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true" data-scrollbuttons="false">
            <div is="emby-itemscontainer" class="itemsContainer vcHomeV2DecisionRail scrollSlider focuscontainer-x" data-monitor="videoplayback,markplayed"></div>
        </div>`;

    const itemsContainer = elem.querySelector('.itemsContainer');
    if (!itemsContainer) return Promise.resolve();

    itemsContainer.fetchData = () => getDecisionItems(apiClient, user, elem.dataset.vcFilter || 'now')
        .then(items => toggleSectionByItems(elem, items));
    itemsContainer.getItemsHtml = items => getDecisionCardsHtml(apiClient, items);
    itemsContainer.parentContainer = elem;

    return Promise.resolve();
}

function toggleSectionByItems(elem, items) {
    elem.classList.toggle('hide', !items?.length);
    return items || [];
}

function filterOutHomeDuplicates(items) {
    return items.filter(item => (item?.Id || item?.ItemId) !== currentHeroItemId);
}

function getDecisionCardsHtml(apiClient, items) {
    return items.map(item => getDecisionCardHtml(apiClient, item)).join('');
}

function getDecisionCardHtml(apiClient, item) {
    const serverId = item.ServerId || apiClient.serverId();
    const itemAttributes = getItemActionAttributes(item, serverId);
    const title = escapeHtml(item.SeriesName || item.Name || '');
    const subtitle = escapeHtml(getDecisionSubtitle(item));
    const reason = escapeHtml(item.VcReason || getDecisionReason(item));
    const progress = getProgressPercent(item);
    const imageUrl = getHeroImageUrl(apiClient, item);
    const imageStyle = imageUrl ? ` style="--vc-home-v2-card:url('${escapeAttribute(imageUrl)}')"` : '';
    const url = appRouter.getRouteUrl(item);
    const action = progress > 0 ? ItemAction.Resume : ItemAction.Play;

    return `
        <article class="vcHomeV2DecisionCard" ${itemAttributes}>
            <a is="emby-linkbutton" href="${url}" class="vcHomeV2DecisionImage" ${itemAttributes}${imageStyle}>
                <span class="vcHomeV2DecisionBadge">${reason}</span>
                ${progress > 0 ? `<span class="vcHomeV2DecisionProgress"><span style="width:${progress}%"></span></span>` : ''}
            </a>
            <div class="vcHomeV2DecisionBody">
                <b>${title}</b>
                <small>${subtitle}</small>
                <div class="vcHomeV2DecisionActions">
                    <button is="emby-button" type="button" class="vcHomeV2TinyPlay itemAction" data-action="${action}" ${itemAttributes}>▶</button>
                    <a is="emby-linkbutton" href="${url}" class="vcHomeV2TinyLink" ${itemAttributes}>Detalhes</a>
                </div>
            </div>
        </article>`;
}

function getDecisionSubtitle(item) {
    const parts = [];

    if (item.Type === 'Episode') {
        if (item.ParentIndexNumber) parts.push(`T${item.ParentIndexNumber}`);
        if (item.IndexNumber) parts.push(`E${item.IndexNumber}`);
        if (item.Name) parts.push(item.Name);
        return parts.join(' • ') || item.SeriesName || 'Episódio';
    }

    if (item.ProductionYear) parts.push(item.ProductionYear);
    if (item.Type) parts.push(item.Type);

    const remaining = getRemainingText(item);
    if (remaining) parts.push(remaining);

    return parts.join(' • ') || 'Jellyfin';
}

function getDecisionReason(item) {
    const remaining = getRemainingText(item);
    if (remaining) return remaining;

    if (item.VcReason === 'Novo no servidor') return 'Recém adicionado';
    if (item.Type === 'Episode') return 'Novo episódio';
    if (item.Type === 'Series') return 'Nova temporada';

    return item.VcReason || 'Novo';
}

function loadUtilitySection(elem, apiClient, user, userViews) {
    if (!elem) return Promise.resolve();

    const serverName = apiClient.serverInfo()?.Name || 'Servidor';
    const adminLink = user.Policy?.IsAdministrator ? appRouter.getRouteUrl('manageserver') : appRouter.getRouteUrl('settings');

    elem.innerHTML = `
        <div class="vcHomeV2UtilityGrid">
            <section class="vcHomeV2MoodPanel">
                <div class="vcHomeV2PanelHead">
                    <h2 class="sectionTitle sectionTitle-cards">Escolher por clima</h2>
                </div>
                <div class="vcHomeV2MoodGrid">
                    <button type="button" class="vcHomeV2MoodCard" data-vc-filter-shortcut="short"><span>◷</span><b>Rápido</b><small>Até 30 min</small></button>
                    <button type="button" class="vcHomeV2MoodCard" data-vc-filter-shortcut="movie"><span>▰</span><b>Filme</b><small>Uma escolha fechada</small></button>
                    <button type="button" class="vcHomeV2MoodCard" data-vc-filter-shortcut="marathon"><span>∞</span><b>Maratona</b><small>Séries e episódios</small></button>
                    <button type="button" class="vcHomeV2MoodCard" data-vc-filter-shortcut="now"><span>☾</span><b>Sombrio</b><small>Suspense e anime dark</small></button>
                    <button type="button" class="vcHomeV2MoodCard" data-vc-filter-shortcut="now"><span>✦</span><b>Novidades</b><small>Fila completa</small></button>
                </div>
            </section>
            <aside class="vcHomeV2ServerPanel">
                <div class="vcHomeV2PanelHead">
                    <h2 class="sectionTitle sectionTitle-cards">${escapeHtml(serverName)}</h2>
                </div>
                <div class="vcHomeV2ServerStats">
                    <div><span>Bibliotecas</span><b>${userViews.length}</b></div>
                    <div><span>Status</span><b>Online</b></div>
                    <div><span>Modo</span><b>${user.Policy?.IsAdministrator ? 'Admin' : 'Usuário'}</b></div>
                </div>
                <a is="emby-linkbutton" href="${adminLink}" class="vcHomeV2AdminLink">Abrir ${user.Policy?.IsAdministrator ? 'admin' : 'preferências'}</a>
            </aside>
        </div>`;

    return Promise.resolve();
}

function loadHero(elem, apiClient, user) {
    if (!elem) return Promise.resolve();

    return Promise.all([
        getResumeItems(apiClient, user, 4).catch(() => []),
        getNextUpItems(apiClient, user, 4).catch(() => []),
        getLatestItems(apiClient, user, 4).catch(() => [])
    ])
        .then(([resumeItems, nextUpItems, latestItems]) => {
            const heroItem = resumeItems[0] || nextUpItems[0] || latestItems[0];
            currentHeroItemId = heroItem?.Id || heroItem?.ItemId || null;
            const suggestions = dedupeItems([
                ...resumeItems.slice(1),
                ...nextUpItems,
                ...latestItems
            ]).slice(0, 3);
            renderHero(elem, apiClient, heroItem, suggestions);
        })
        .catch(() => renderHero(elem, apiClient));
}

function renderHero(elem, apiClient, item, suggestions = []) {
    if (!item?.Id) {
        elem.innerHTML = getEmptyHeroHtml();
        return;
    }

    const itemName = item.SeriesName || item.Name || globalize.translate('Home');
    const title = escapeHtml(itemName);
    const episode = [item.SeasonName, item.IndexNumber ? `E${item.IndexNumber}` : null].filter(Boolean).join(' • ');
    const remaining = getRemainingText(item);
    const subtitle = [episode, remaining].filter(Boolean).join(' • ');
    const progress = getProgressPercent(item);
    const url = appRouter.getRouteUrl(item);
    const backdropUrl = getHeroImageUrl(apiClient, item);
    const style = backdropUrl ? ` style="--vc-home-v2-backdrop:url('${escapeAttribute(backdropUrl)}')"` : '';
    const itemAttributes = getItemActionAttributes(item, item.ServerId || apiClient.serverId());

    elem.innerHTML = `
        <section class="vcHomeV2HeroShell"${style}>
            <div class="vcHomeV2HeroContent">
                <div class="vcHomeV2Eyebrow">Seu próximo play</div>
                <h1>${title}</h1>
                <p>${escapeHtml(subtitle || 'Continue de onde parou')}</p>
                <div class="vcHomeV2Meta">
                    <span>${escapeHtml(item.Type || 'Video')}</span>
                    <span>${Math.round(progress)}% visto</span>
                    <span>Biblioteca local</span>
                </div>
                <div class="vcHomeV2Progress"><span style="width:${progress}%"></span></div>
                <div class="vcHomeV2Actions">
                    <button is="emby-button" type="button" class="vcHomeV2Primary itemAction" data-action="${ItemAction.Resume}" ${itemAttributes}>▶ Continuar</button>
                    <a is="emby-linkbutton" href="${url}" class="vcHomeV2Secondary" ${itemAttributes}>Detalhes</a>
                    <button is="emby-button" type="button" class="vcHomeV2Secondary" data-vc-scroll="decision">Ver opções</button>
                </div>
            </div>
            <aside class="vcHomeV2HeroPanel">
                <strong>Depois disso</strong>
                ${getHeroSuggestionsHtml(apiClient, suggestions)}
            </aside>
        </section>`;
}

function getHeroSuggestionsHtml(apiClient, suggestions) {
    if (!suggestions.length) {
        return '<span>Próximos episódios e novidades aparecem aqui quando houver dados suficientes.</span>';
    }

    return suggestions.map(item => {
        const url = appRouter.getRouteUrl(item);
        const imageUrl = getHeroImageUrl(apiClient, item);
        const imageStyle = imageUrl ? ` style="--vc-home-v2-mini:url('${escapeAttribute(imageUrl)}')"` : '';
        const subtitle = getHeroSuggestionSubtitle(item);
        const metric = getHeroSuggestionMetric(item);
        const itemAttributes = getItemActionAttributes(item, item.ServerId || apiClient.serverId());

        return `
            <a is="emby-linkbutton" href="${url}" class="vcHomeV2NextItem" ${itemAttributes}>
                <span class="vcHomeV2MiniThumb"${imageStyle}></span>
                <span class="vcHomeV2NextItemText"><b>${escapeHtml(item.Name || '')}</b><small>${escapeHtml(subtitle)}</small></span>
                <strong class="vcHomeV2NextMetric">${escapeHtml(metric)}</strong>
            </a>`;
    }).join('');
}

function getHeroSuggestionSubtitle(item) {
    const remaining = getRemainingText(item);
    if (remaining) return remaining;

    if (item.Type === 'Episode') {
        const episode = [item.SeasonName, item.IndexNumber ? `E${item.IndexNumber}` : null].filter(Boolean).join(' • ');
        return episode || item.SeriesName || 'Próximo episódio';
    }

    if (item.Type === 'Series') return 'Nova temporada';
    if (item.DateCreated) return 'Recém adicionado';

    return item.SeriesName || item.Type || 'Jellyfin';
}

function getHeroSuggestionMetric(item) {
    const progress = getProgressPercent(item);
    if (progress > 0) return `${Math.round(progress)}%`;

    if (item.Type === 'Episode') return 'Novo';
    if (item.Type === 'Series') return 'Temporada';

    return 'Novo';
}

function getEmptyHeroHtml() {
    return `
        <section class="vcHomeV2HeroShell vcHomeV2HeroShell-empty">
            <div class="vcHomeV2HeroContent">
                <div class="vcHomeV2Eyebrow">Jellyfin</div>
                <h1>Escolha seu próximo play</h1>
                <p>Quando houver itens em andamento, esta área vira o atalho principal para continuar.</p>
            </div>
        </section>`;
}

function getHeroImageUrl(apiClient, item) {
    if (item.BackdropImageTags?.length) {
        return apiClient.getScaledImageUrl(item.Id, {
            type: 'Backdrop',
            tag: item.BackdropImageTags[0],
            maxWidth: 1920
        });
    }

    if (item.ParentBackdropItemId && item.ParentBackdropImageTags?.length) {
        return apiClient.getScaledImageUrl(item.ParentBackdropItemId, {
            type: 'Backdrop',
            tag: item.ParentBackdropImageTags[0],
            maxWidth: 1920
        });
    }

    if (item.ImageTags?.Thumb) {
        return apiClient.getScaledImageUrl(item.Id, {
            type: 'Thumb',
            tag: item.ImageTags.Thumb,
            maxWidth: 1920
        });
    }

    if (item.PrimaryImageTag) {
        return apiClient.getScaledImageUrl(item.Id, {
            type: 'Primary',
            tag: item.PrimaryImageTag,
            maxWidth: 900
        });
    }

    return '';
}

function getProgressPercent(item) {
    const position = item.UserData?.PlaybackPositionTicks || 0;
    const runtime = item.RunTimeTicks || 0;

    if (!position || !runtime) return 0;

    return Math.min(100, Math.max(0, (position / runtime) * 100));
}

function getRemainingText(item) {
    const position = item.UserData?.PlaybackPositionTicks || 0;
    const runtime = item.RunTimeTicks || 0;

    if (!runtime || runtime <= position) return '';

    const minutes = Math.max(1, Math.round((runtime - position) / 600000000));
    return `${minutes} min restantes`;
}

function escapeAttribute(value) {
    return String(value).replace(/'/g, '%27').replace(/\)/g, '%29');
}

function getItemActionAttributes(item, serverId) {
    const id = item.Id || item.ItemId;
    const mediaType = item.MediaType || (['Movie', 'Episode', 'Video'].includes(item.Type) ? 'Video' : '');
    const positionTicks = item.UserData?.PlaybackPositionTicks || 0;
    const attrs = [
        `data-id="${escapeAttribute(id || '')}"`,
        `data-serverid="${escapeAttribute(serverId || item.ServerId || '')}"`,
        `data-type="${escapeAttribute(item.Type || '')}"`,
        `data-mediatype="${escapeAttribute(mediaType)}"`,
        `data-isfolder="${item.IsFolder === true}"`,
        `data-positionticks="${positionTicks}"`
    ];

    if (item.ChannelId) attrs.push(`data-channelid="${escapeAttribute(item.ChannelId)}"`);
    if (item.CollectionType) attrs.push(`data-collectiontype="${escapeAttribute(item.CollectionType)}"`);
    if (item.SeriesId) attrs.push(`data-seriesid="${escapeAttribute(item.SeriesId)}"`);
    if (item.Path) attrs.push(`data-path="${escapeAttribute(item.Path)}"`);

    return attrs.join(' ');
}

function dedupeItems(items) {
    const seen = new Set();
    return items.filter(item => {
        const id = item?.Id || item?.ItemId;
        if (!id || seen.has(id)) return false;

        seen.add(id);
        return true;
    });
}

export function destroySections(elem) {
    const elems = elem.querySelectorAll('.itemsContainer');
    for (const e of elems) {
        e.fetchData = null;
        e.parentContainer = null;
        e.getItemsHtml = null;
    }

    elem.innerHTML = '';
}

export function pause(elem) {
    const elems = elem.querySelectorAll('.itemsContainer');
    for (const e of elems) {
        e.pause();
    }
}

export function resume(elem, options) {
    const elems = elem.querySelectorAll('.itemsContainer');
    const promises = [];

    Array.prototype.forEach.call(elems, section => {
        if (section.resume) {
            promises.push(section.resume(options));
        }
    });

    return Promise.all(promises);
}

function loadSection(page, apiClient, user, userSettings, userViews, section, index) {
    const elem = page.querySelector('.section' + index);
    const options = { enableOverflow: enableScrollX() };

    switch (section) {
        case HomeSectionType.ActiveRecordings:
            loadRecordings(elem, true, apiClient, options);
            break;
        case HomeSectionType.LatestMedia:
            loadRecentlyAddedV2(elem, apiClient, user, userViews, options);
            break;
        case HomeSectionType.LibraryButtons:
            loadLibraryV2(elem, userViews);
            break;
        case HomeSectionType.LiveTv:
            return loadLiveTV(elem, apiClient, user, options);
        case HomeSectionType.NextUp:
            loadNextUpV2(elem, apiClient, user, options);
            break;
        case HomeSectionType.Resume:
            loadResumeV2(elem, apiClient, user, options);
            break;
        case HomeSectionType.ResumeAudio:
            loadResume(elem, apiClient, 'HeaderContinueListening', 'Audio', userSettings, options);
            break;
        case HomeSectionType.ResumeBook:
            loadResume(elem, apiClient, 'HeaderContinueReading', 'Book', userSettings, options);
            break;
        case HomeSectionType.SmallLibraryTiles:
            loadLibraryV2(elem, userViews);
            break;
        default:
            elem.innerHTML = '';
    }

    return Promise.resolve();
}

function loadNextUpV2(elem, apiClient, user, options) {
    elem.classList.add('hide');
    elem.innerHTML = `
        <div class="vcHomeV2SectionHead padded-left padded-right">
            <div>
                <h2 class="sectionTitle sectionTitle-cards">A seguir</h2>
            </div>
            <a is="emby-linkbutton" href="${appRouter.getRouteUrl('nextup', { serverId: apiClient.serverId() })}" class="vcHomeV2SeeAll">Ver tudo</a>
        </div>
        <div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true" data-scrollbuttons="false">
            <div is="emby-itemscontainer" class="itemsContainer vcHomeV2NextRail scrollSlider focuscontainer-x" data-monitor="videoplayback,markplayed"></div>
        </div>`;

    const itemsContainer = elem.querySelector('.itemsContainer');
    if (!itemsContainer) return;

    itemsContainer.fetchData = () => getNextUpItems(apiClient, user, options.enableOverflow ? 18 : 8)
        .then(items => toggleSectionByItems(elem, filterOutHomeDuplicates(items)));
    itemsContainer.getItemsHtml = items => getNextUpCardsHtml(apiClient, items);
    itemsContainer.parentContainer = elem;
}

function getNextUpCardsHtml(apiClient, items) {
    return items.map(item => getNextUpCardHtml(apiClient, item)).join('');
}

function getNextUpCardHtml(apiClient, item) {
    const serverId = item.ServerId || apiClient.serverId();
    const itemAttributes = getItemActionAttributes(item, serverId);
    const title = escapeHtml(item.SeriesName || item.Name || '');
    const subtitle = escapeHtml(getDecisionSubtitle(item));
    const imageUrl = getHeroImageUrl(apiClient, item);
    const imageStyle = imageUrl ? ` style="--vc-home-v2-next:url('${escapeAttribute(imageUrl)}')"` : '';
    const url = appRouter.getRouteUrl(item);

    return `
        <article class="vcHomeV2NextCard" ${itemAttributes}>
            <a is="emby-linkbutton" href="${url}" class="vcHomeV2NextImage itemAction" data-action="${ItemAction.Play}" ${itemAttributes}${imageStyle}>
                <span class="vcHomeV2DecisionBadge">A seguir</span>
                <span class="vcHomeV2ResumePlay">▶</span>
            </a>
            <div class="vcHomeV2NextBody">
                <b>${title}</b>
                <small>${subtitle}</small>
            </div>
        </article>`;
}

function loadRecentlyAddedV2(elem, apiClient, user, userViews, options) {
    elem.classList.remove('verticalSection');
    const excludeViewTypes = ['playlists', 'livetv', 'boxsets', 'channels', 'folders'];
    const userExcludeItems = user.Configuration?.LatestItemsExcludes ?? [];
    const views = userViews.filter(item => {
        if (!item.Id || userExcludeItems.includes(item.Id)) return false;
        return !item.CollectionType || !excludeViewTypes.includes(item.CollectionType);
    });

    elem.innerHTML = '';

    views.forEach(view => {
        const section = document.createElement('div');
        section.classList.add('verticalSection', 'vcHomeV2LatestSection', 'hide');
        section.innerHTML = `
            <div class="vcHomeV2SectionHead padded-left padded-right">
                <div>
                    <h2 class="sectionTitle sectionTitle-cards">${escapeHtml(view.Name)} recentes</h2>
                </div>
                <a is="emby-linkbutton" href="${appRouter.getRouteUrl(view, { section: 'latest' })}" class="vcHomeV2SeeAll">Ver biblioteca</a>
            </div>
            <div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true" data-scrollbuttons="false">
                <div is="emby-itemscontainer" class="itemsContainer vcHomeV2LatestRail scrollSlider focuscontainer-x"></div>
            </div>`;

        const itemsContainer = section.querySelector('.itemsContainer');
        itemsContainer.fetchData = () => getLatestItems(apiClient, user, options.enableOverflow ? 18 : 8, view.Id)
            .then(items => toggleSectionByItems(section, filterOutHomeDuplicates(items)));
        itemsContainer.getItemsHtml = items => getLatestCardsHtml(apiClient, items, view);
        itemsContainer.parentContainer = section;
        elem.appendChild(section);
    });
}

function getLatestCardsHtml(apiClient, items, view) {
    return items.map(item => getLatestCardHtml(apiClient, item, view)).join('');
}

function getLatestCardHtml(apiClient, item, view) {
    const serverId = item.ServerId || apiClient.serverId();
    const itemAttributes = getItemActionAttributes(item, serverId);
    const title = escapeHtml(item.Name || '');
    const subtitle = escapeHtml(getLatestSubtitle(item));
    const imageUrl = getLatestImageUrl(apiClient, item, view);
    const imageStyle = imageUrl ? ` style="--vc-home-v2-latest:url('${escapeAttribute(imageUrl)}')"` : '';
    const url = appRouter.getRouteUrl(item);
    const cardClass = item.Type === 'Movie'
        || item.Type === 'Series'
        || view.CollectionType === 'movies'
        || view.CollectionType === 'tvshows' ? ' vcHomeV2LatestCard-portrait' : '';

    return `
        <article class="vcHomeV2LatestCard${cardClass}" ${itemAttributes}>
            <a is="emby-linkbutton" href="${url}" class="vcHomeV2LatestImage" ${itemAttributes}${imageStyle}></a>
            <div class="vcHomeV2LatestBody">
                <b>${title}</b>
                <small>${subtitle}</small>
            </div>
        </article>`;
}

function getLatestSubtitle(item) {
    if (item.ProductionYear) return String(item.ProductionYear);
    if (item.SeriesName) return item.SeriesName;
    return item.Type || 'Jellyfin';
}

function getLatestImageUrl(apiClient, item, view) {
    const usePrimary = item.Type === 'Movie'
        || item.Type === 'Series'
        || view.CollectionType === 'movies'
        || view.CollectionType === 'tvshows';

    const primaryImageTag = item.ImageTags?.Primary || item.PrimaryImageTag;

    if (usePrimary && primaryImageTag) {
        return apiClient.getScaledImageUrl(item.Id, {
            type: 'Primary',
            tag: primaryImageTag,
            maxWidth: 600
        });
    }

    return getHeroImageUrl(apiClient, item);
}

function loadLibraryV2(elem, userViews) {
    const views = userViews.filter(item => item?.Id);

    if (!views.length) {
        elem.innerHTML = '';
        return;
    }

    elem.innerHTML = `
        <div class="vcHomeV2SectionHead padded-left padded-right">
            <div>
                <h2 class="sectionTitle sectionTitle-cards">Minha mídia</h2>
            </div>
        </div>
        <div class="vcHomeV2LibraryGrid padded-left padded-right">
            ${views.map(item => getLibraryCardHtml(item)).join('')}
        </div>`;
}

function getLibraryCardHtml(item) {
    const url = appRouter.getRouteUrl(item);
    const title = escapeHtml(item.Name || 'Biblioteca');
    const type = escapeHtml(getLibraryTypeLabel(item));

    return `
        <a is="emby-linkbutton" href="${url}" class="vcHomeV2LibraryCard" data-id="${item.Id}" data-serverid="${item.ServerId || ''}" data-type="${item.Type}">
            <span class="vcHomeV2LibraryIcon">${getLibraryIcon(item)}</span>
            <span><b>${title}</b><small>${type}</small></span>
        </a>`;
}

function getLibraryTypeLabel(item) {
    switch (item.CollectionType) {
        case 'movies':
            return 'Filmes';
        case 'tvshows':
            return 'Séries';
        case 'music':
            return 'Música';
        case 'boxsets':
            return 'Coleções';
        case 'homevideos':
            return 'Vídeos';
        default:
            return 'Biblioteca';
    }
}

function getLibraryIcon(item) {
    switch (item.CollectionType) {
        case 'movies':
            return '▰';
        case 'tvshows':
            return '▦';
        case 'music':
            return '♪';
        case 'boxsets':
            return '◈';
        default:
            return '◎';
    }
}

function loadResumeV2(elem, apiClient, user, options) {
    elem.classList.add('hide');
    elem.innerHTML = `
        <div class="vcHomeV2SectionHead padded-left padded-right">
            <div>
                <h2 class="sectionTitle sectionTitle-cards">Continuar assistindo</h2>
            </div>
        </div>
        <div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true" data-scrollbuttons="false">
            <div is="emby-itemscontainer" class="itemsContainer vcHomeV2ResumeRail scrollSlider focuscontainer-x" data-monitor="videoplayback,markplayed"></div>
        </div>`;

    const itemsContainer = elem.querySelector('.itemsContainer');
    if (!itemsContainer) return;

    itemsContainer.fetchData = () => getResumeItems(apiClient, user, options.enableOverflow ? 12 : 6)
        .then(items => toggleSectionByItems(elem, filterOutHomeDuplicates(items)));
    itemsContainer.getItemsHtml = items => getResumeCardsHtml(apiClient, items);
    itemsContainer.parentContainer = elem;
}

function getResumeCardsHtml(apiClient, items) {
    return items.map(item => getResumeCardHtml(apiClient, item)).join('');
}

function getResumeCardHtml(apiClient, item) {
    const serverId = item.ServerId || apiClient.serverId();
    const itemAttributes = getItemActionAttributes(item, serverId);
    const title = escapeHtml(item.SeriesName || item.Name || '');
    const subtitle = escapeHtml(getResumeSubtitle(item));
    const progress = getProgressPercent(item);
    const imageUrl = getHeroImageUrl(apiClient, item);
    const imageStyle = imageUrl ? ` style="--vc-home-v2-resume:url('${escapeAttribute(imageUrl)}')"` : '';
    const url = appRouter.getRouteUrl(item);

    return `
        <article class="vcHomeV2ResumeCard" ${itemAttributes}>
            <a is="emby-linkbutton" href="${url}" class="vcHomeV2ResumeImage itemAction" data-action="${ItemAction.Resume}" ${itemAttributes}${imageStyle}>
                <span class="vcHomeV2ResumePlay">▶</span>
                <span class="vcHomeV2ResumeProgress"><span style="width:${progress}%"></span></span>
            </a>
            <div class="vcHomeV2ResumeBody">
                <b>${title}</b>
                <small>${subtitle}</small>
                <div class="vcHomeV2ResumeActions">
                    <button is="emby-button" type="button" class="vcHomeV2ResumePrimary itemAction" data-action="${ItemAction.Resume}" ${itemAttributes}>Continuar</button>
                    <a is="emby-linkbutton" href="${url}" class="vcHomeV2ResumeSecondary" ${itemAttributes}>Detalhes</a>
                </div>
            </div>
        </article>`;
}

function getResumeSubtitle(item) {
    const parts = [];

    if (item.Type === 'Episode') {
        if (item.ParentIndexNumber) parts.push(`T${item.ParentIndexNumber}`);
        if (item.IndexNumber) parts.push(`E${item.IndexNumber}`);
        if (item.Name) parts.push(item.Name);
    } else if (item.ProductionYear) {
        parts.push(item.ProductionYear);
    }

    const remaining = getRemainingText(item);
    if (remaining) parts.push(remaining);

    return parts.join(' • ') || 'Continue de onde parou';
}

function enableScrollX() {
    return true;
}

export default {
    getDefaultSection,
    loadSections,
    destroySections,
    pause,
    resume
};

