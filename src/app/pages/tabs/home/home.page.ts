import {Component} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
// import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {AlertButton} from '@ionic/core';
import {PageUtilsService} from '../../../service/page-utils.service';
import {AuthenticationService} from '../../../service/authentication.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage {

    constructor(private alertCtrl: AlertController,
                public translate: TranslateService,
                public authService: AuthenticationService,
                public pageUtils: PageUtilsService) {
    }

    /**
     * This method displays an introduction
     */
    ionViewDidEnter() {
        // const storage = new NativeStorage();
        // storage.getItem('suppressIntroduction').catch(async error => {
        //     if (error.code === 2) {
        //         this.presentIntroductionPopup();
        //     } else {
        //         console.error(error);
        //         await this.pageUtils.unavailableAlert(error);
        //     }
        // });

        const suppressIntroduction = localStorage.getItem('suppressIntroduction');
        if (!suppressIntroduction) {
            this.presentIntroductionPopup();
        }
    }

    /**
     * This method presents a popup introducing the user to the following process of supplying future data
     */
    private async presentIntroductionPopup() {
        const alert = await this.alertCtrl.create({
            header: this.translate.instant('HOME.INTRODUCTION_HDR'),
            message: this.translate.instant('HOME.INTRODUCTION_MSG'),
            buttons: [
                <AlertButton>{
                    text: this.translate.instant('GENERAL.CONFIRM_BTN')
                },
                {
                    text: this.translate.instant('GENERAL.DO_NOT_SHOW_BTN'),
                    handler: async () => {
                        // const storage = new NativeStorage();
                        localStorage.setItem('suppressIntroduction', String(true));
                    }
                }
            ]
        });
        await alert.present();
    }
}
