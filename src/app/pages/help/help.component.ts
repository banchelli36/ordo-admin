import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
})
export class HelpComponent {
    helpMsg: string;

    constructor(
        public modalCtrl: ModalController,
        private translate: TranslateService) {
    }

}
