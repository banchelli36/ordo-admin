import {Component} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {AlertButton} from '@ionic/core';
import {DefaultService} from '../../../../api';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {PageUtilsService} from '../../../service/page-utils.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: 'reset-password.page.html',
    styleUrls: ['reset-password.page.scss'],
})
export class ResetPasswordPage {

    private confirm = '';

    private resetAlertHdr = '';
    private resetAlertMsg = '';

    mailCtrl = new FormControl('', [Validators.required, Validators.email]);
    resetFormGroup = new FormGroup({
        mail: this.mailCtrl
    });

    /**
     * Page for resetting the password of a user.
     * @param alertCtrl: Controller for alerts.
     * @param api: ApiService for backend integration
     * @param translate: Service for language configurations
     * @param pageUtils: Service to provide utils which are needed for each page
     * @param router: Angular router
     */
    constructor(private router: Router, private alertCtrl: AlertController,
                private api: DefaultService, private pageUtils: PageUtilsService,
                private translate: TranslateService) {
    }

    /**
     * Requests a mail for a temporary password
     */
    async reset() {
        const alert = await this.alertCtrl.create({
            header: this.translate.instant('RESET_PASSWORD.TITLE'),
            message: this.translate.instant('RESET_PASSWORD.BEFORE_RESET_MSG'),
            backdropDismiss: false,
            buttons: [
                <AlertButton>{
                    text: this.translate.instant('GENERAL.NO_BTN'),
                    role: 'cancel'
                },
                <AlertButton>{
                    text: this.translate.instant('GENERAL.YES_BTN'),
                    handler: async () => {
                        await this.pageUtils.startLoading();
                        this.api.configuration.withCredentials = false;
                        this.api.usersResetPasswordGet(this.mailCtrl.value, 'response')
                            .subscribe(async (response: HttpResponse<string>) => {
                                    await this.pageUtils.stopLoading();
                                    if (response.ok) {
                                        await this.router.navigateByUrl(`login`);
                                    }
                                },
                                async (error1: HttpErrorResponse) => {
                                    await this.pageUtils.stopLoading();
                                    if (error1.status === 400) {
                                        await this.pageUtils.showToast(this.translate.instant('RESET_PASSWORD.USER_NOT_EXISTS', {
                                            mail: this.mailCtrl.value
                                        }));
                                        this.mailCtrl.setValue('');
                                    } else {
                                        await this.pageUtils.apiErrorHandler(error1, -1, () => {
                                        });
                                    }
                                });
                    }
                }]
        });
        await alert.present();
    }
}
