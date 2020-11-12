import {Component, OnInit} from '@angular/core';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {AlertController} from '@ionic/angular';
import {PageUtilsService} from '../../../service/page-utils.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-data-protection',
    templateUrl: './data-protection.component.html',
    styleUrls: ['./data-protection.component.scss'],
})
export class DataProtectionComponent implements OnInit {

    agreement: boolean;

    constructor(private router: Router,
                private pageUtils: PageUtilsService,
                private route: ActivatedRoute,
                private alertCtrl: AlertController,
                private translate: TranslateService) {
    }

    /**
     * This method specifies the data protection popup
     */
    ngOnInit() {
        // const storage = new NativeStorage();
        // storage.getItem('dataProtectionAgreement')
        //     .then((value: boolean) => this.agreement = value)
        //     .catch(async error => {
        //         if (error.code !== 2) {
        //             console.error(error);
        //             await this.pageUtils.unavailableAlert(error);
        //         }
        //     });
        const dataProtectionAgreement = Boolean(localStorage.getItem('dataProtectionAgreement'));
        if (dataProtectionAgreement) {
            this.agreement = dataProtectionAgreement;
        }
    }

    /**
     * This method allows future suppresion of the data protection popup
     */
    async suppressDataProtection() {
        console.log(`1: ${this.agreement}`);
        localStorage.setItem('dataProtectionAgreement', String(this.agreement));

        // const storage = new NativeStorage();
        // await storage.setItem('dataProtectionAgreement', this.agreement);
        if (!this.agreement) {
            const alert = await this.alertCtrl.create({
                header: this.translate.instant('DATA_PROTECTION.NOT_ACCEPTED_HDR'),
                message: this.translate.instant('DATA_PROTECTION.NOT_ACCEPTED_MSG'),
                buttons: [{
                    text: this.translate.instant('GENERAL.CONFIRM_BTN'),
                    role: 'cancel'
                }]
            });
            await alert.present();
        }
    }
}
