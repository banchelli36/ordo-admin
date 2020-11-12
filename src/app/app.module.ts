import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {DefaultService} from '../api';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {PageUtilsService} from './service/page-utils.service';
import {AuthenticationService} from './service/authentication.service';
import {DataProtectionComponent} from './pages/login/data-protection/data-protection.component';
import {FormsModule} from '@angular/forms';
import {OpenNativeSettings} from '@ionic-native/open-native-settings/ngx';
import {ProfileService} from './service/profile.service';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {CurrencyPipe} from '@angular/common';
import {HelpComponent} from './pages/help/help.component';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {PlaylistService} from './service/playlist.service';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [AppComponent, DataProtectionComponent, HelpComponent],
    entryComponents: [DataProtectionComponent, HelpComponent],
    imports: [BrowserModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        IonicModule.forRoot(),
        AppRoutingModule, FormsModule],
    providers: [
        StatusBar,
        SplashScreen,
        DefaultService,
        PageUtilsService,
        PlaylistService,
        AuthenticationService,
        ProfileService,
        CurrencyPipe,
        OpenNativeSettings,
        AppVersion,
        NativeStorage,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: LOCALE_ID, useValue: 'de'}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
