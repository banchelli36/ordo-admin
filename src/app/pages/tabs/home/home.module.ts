import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HomePage} from './home.page';
import {TranslateModule} from '@ngx-translate/core';
import {File} from '@ionic-native/file/ngx';
import {InsuranceListComponent} from './insurance-list/insurance-list.component';
import {SearchComponent} from './search/search.component';
import {SearchPipe} from '../../../pipes/search.pipe';
import {AddComponent} from './add/add.component';
// import {AbbyyRTR} from '@ionic-native/abbyy-rtr/ngx';
import {InstructionComponent} from './instruction/instruction.component';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';
import {Camera} from '@ionic-native/camera/ngx';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: HomePage,
                children: [/*
                    {
                        path: 'add/:type/:name',
                        component: AddComponent
                    },*/
                    {
                        path: '',
                        component: InsuranceListComponent
                    }
                ]
            }
        ]),
        TranslateModule.forChild(),
        ReactiveFormsModule
    ],
    entryComponents: [SearchComponent, InstructionComponent, AddComponent],
    declarations: [HomePage, SearchPipe, InsuranceListComponent, AddComponent, SearchComponent, InstructionComponent],
    providers: [
        File,
        // AbbyyRTR,
        PhotoViewer,
        Camera
    ]
})
export class HomePageModule {
}
