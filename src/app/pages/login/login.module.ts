import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {LoginPage} from './login.page';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule, Routes} from '@angular/router';
import {AndroidFingerprintAuth} from '@ionic-native/android-fingerprint-auth/ngx';

const routes: Routes = [
    {
        path: '',
        component: LoginPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        ReactiveFormsModule,
    ],
    declarations: [LoginPage],
    providers: [
        AndroidFingerprintAuth
    ]
})
export class LoginPageModule {
}
