import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProfilePage} from './profile.page';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: ProfilePage
            }]),
        TranslateModule.forChild(),
        ReactiveFormsModule
    ],
    declarations: [ProfilePage]
})
export class ProfilePageModule {
}
