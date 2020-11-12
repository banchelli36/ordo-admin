import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PlaylistPage} from './playlist.page';
import {TranslateModule} from '@ngx-translate/core';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild(),
        RouterModule.forChild([{path: '', component: PlaylistPage}])
    ],
    declarations: [PlaylistPage],
    providers: [
        ScreenOrientation
    ]
})
export class PlaylistPageModule {}
