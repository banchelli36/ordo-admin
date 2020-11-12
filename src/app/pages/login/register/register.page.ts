import {Component} from '@angular/core';
import {DefaultService, User} from '../../../../api';
import {AlertController} from '@ionic/angular';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {PageUtilsService} from '../../../service/page-utils.service';

/**
 *
 */
@Component({
    selector: 'app-register',
    templateUrl: 'register.page.html',
    styleUrls: ['register.page.scss'],
})
export class RegisterPage {

    mailCtrl = new FormControl('', [Validators.required, Validators.email]);
    registerFormGroup = new FormGroup({
        mail: this.mailCtrl
    });

    /**
     * Page for registration of a user.
     * @param alertCtrl: Controller for alerts.
     * @param api: ApiService for backend integration
     * @param translate: Service for language configurations
     * @param pageUtils: Service to provide utils which are needed for each page
     * @param router: Angular router
     */
    constructor(private alertCtrl: AlertController, private api: DefaultService,
                private translate: TranslateService, private pageUtils: PageUtilsService,
                private router: Router) {
    }

    /**
     * Show an alert before registering to ensure, the users knows everything about the purpose of this app.
     */
    ionViewWillEnter() {
        this.alertCtrl.create({
            header: this.translate.instant('REGISTER.BEFORE_ALERT_HDR'),
            message: this.translate.instant('REGISTER.BEFORE_ALERT_MSG'),
            buttons: [{
                text: this.translate.instant('GENERAL.CONFIRM_BTN')
            }]
        }).then((alert: HTMLIonAlertElement) => alert.present());
    }

    /**
     * Register the specified user in the backend and go to login page.
     */
    async registration() {
        await this.pageUtils.startLoading();
        let user = <User>{
            mail: this.mailCtrl.value.toLowerCase()
        };
        this.api.configuration.withCredentials = false;
        this.api.usersPost(user, 'response').subscribe(
            async (response: HttpResponse<User>) => {
                await this.pageUtils.stopLoading();
                console.log(response.status);
                console.log(response.body);
                if (response.ok) {
                    user = response.body;
                    const alert = await this.alertCtrl.create({
                        header: this.translate.instant('REGISTER.SUCCESSFUL_ALERT_HDR'),
                        message: this.translate.instant('REGISTER.SUCCESSFUL_ALERT_MSG'),
                        buttons: [{
                            text: this.translate.instant('GENERAL.CONFIRM_BTN'),
                            handler: () => {
                                this.router.navigateByUrl(`login`);
                            }
                        }]
                    });
                    await alert.present();
                }
            },
            async (error1: HttpErrorResponse) => {
                await this.pageUtils.stopLoading();
                if (error1.status === 0) {
                    await this.pageUtils.enableInternetAlert();
                } else if (error1.status === 400 && error1.error.includes('exists')) {
                    const alert = await this.alertCtrl.create({
                        header: this.translate.instant('REGISTER.UNSUCCESSFUL_ALERT_HDR'),
                        message: this.translate.instant('REGISTER.EXISTS_ALERT_MSG'),
                        buttons: [{
                            text: this.translate.instant('GENERAL.CONFIRM_BTN'),
                            handler: () => {
                                this.router.navigateByUrl(`login`);
                            }
                        }]
                    });
                    await alert.present();
                } else {
                    console.error(error1);
                    await this.pageUtils.unavailableAlert(error1);
                }
            });
    }
}
