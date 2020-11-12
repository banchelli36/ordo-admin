import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {TranslateService} from '@ngx-translate/core';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private translate: TranslateService
    ) {
        this.initializeApp();
        this.initTranslate();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleBlackOpaque();
            this.splashScreen.hide();
        });
    }

    private initTranslate() {
        const defaultLang = 'de';
        this.translate.setDefaultLang(defaultLang);

        // retrieve browser language
        console.log(this.translate.getLangs());
        if (this.translate.getBrowserLang() !== undefined && this.translate.getLangs().includes(this.translate.getBrowserLang())) {
            console.log(`Browser lang is ${this.translate.getBrowserLang()}`);
            this.useLanguage(this.translate.getBrowserLang());
        }
        registerLocaleData(localeDe, 'de', localeDeExtra);
        registerLocaleData(localeFr, 'fr', localeFrExtra);
    }

    private useLanguage(language: string) {
        this.translate.use(language);
    }
}
