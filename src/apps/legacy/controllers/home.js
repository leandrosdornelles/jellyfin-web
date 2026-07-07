import TabbedView from 'components/tabbedview/tabbedview';
import globalize from 'lib/globalize';
import 'elements/emby-tabs/emby-tabs';
import 'elements/emby-button/emby-button';
import 'elements/emby-scroller/emby-scroller';
import LibraryMenu from 'scripts/libraryMenu';

class HomeView extends TabbedView {
    setTitle() {
        LibraryMenu.setTitle(null);
    }

    onPause() {
        super.onPause(this);
        this.view?.classList.remove('vcHomeV2Page', 'noSecondaryNavPage');
        const skinHeader = document.querySelector('.skinHeader');
        skinHeader?.classList.remove('noHomeButtonHeader');
        skinHeader?.classList.remove('vcHomeV2HideHeader');
        skinHeader?.style.removeProperty('display');
        document.body.classList.remove('vcHomeV2Active');
        document.body.classList.remove('hiddenViewMenuBar');
        document.documentElement.classList.remove('vcHomeV2Active');
    }

    onResume(options) {
        super.onResume(this, options);
        this.view?.classList.add('vcHomeV2Page', 'noSecondaryNavPage');
        LibraryMenu.setTabs(null);
        const skinHeader = document.querySelector('.skinHeader');
        skinHeader?.classList.add('noHomeButtonHeader');
        skinHeader?.classList.add('vcHomeV2HideHeader');
        skinHeader?.style.setProperty('display', 'none', 'important');
        document.body.classList.add('vcHomeV2Active');
        document.body.classList.add('hiddenViewMenuBar');
        document.body.classList.remove('withSectionTabs');
        document.documentElement.classList.add('vcHomeV2Active');
        hideOfficialHomeNavigation();
    }

    getTabs() {
        return [{
            name: globalize.translate('Home'),
            cssClass: 'vcHomeV2OfficialTab'
        }, {
            name: globalize.translate('Favorites'),
            cssClass: 'vcHomeV2OfficialTab'
        }];
    }

    getDefaultTabIndex() {
        return 0;
    }

    getTabController(index) {
        if (index == null) {
            throw new Error('index cannot be null');
        }

        let depends = '';

        switch (index) {
            case 0:
                depends = 'hometab';
                break;

            case 1:
                depends = 'favorites';
        }

        const instance = this;
        return import(/* webpackChunkName: "[request]" */ `../controllers/${depends}`).then(({ default: ControllerFactory }) => {
            let controller = instance.tabControllers[index];

            if (!controller) {
                controller = new ControllerFactory(instance.view.querySelector(".tabContent[data-index='" + index + "']"), instance.params);
                instance.tabControllers[index] = controller;
            }

            return controller;
        });
    }
}

function hideOfficialHomeNavigation() {
    const skinHeader = document.querySelector('.skinHeader');
    skinHeader?.classList.add('vcHomeV2HideHeader');
    skinHeader?.style.setProperty('display', 'none', 'important');

    document.querySelector('.headerTabs')?.classList.add('hide');
    document.querySelector('.tabs-viewmenubar')?.classList.add('hide');
}

export default HomeView;
