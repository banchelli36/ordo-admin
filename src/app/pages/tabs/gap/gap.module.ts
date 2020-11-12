import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {GapPage} from './gap.page';
import {TranslateModule} from '@ngx-translate/core';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild(),
        RouterModule.forChild([{path: '', component: GapPage}])
    ],
    declarations: [GapPage]
})
export class GapPageModule {
}
