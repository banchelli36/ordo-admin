import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DefaultService, User} from '../../../../api';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {AlertController, LoadingController} from '@ionic/angular';
import {AlertButton, AlertOptions} from '@ionic/core';
import {sha512} from 'js-sha512';
import {ActivatedRoute, Router} from '@angular/router';
import {PageUtilsService} from '../../../service/page-utils.service';
import {AuthenticationService} from '../../../service/authentication.service';
import {PlaylistService} from '../../../service/playlist.service';
import {TabsPage} from '../tabs.page';
import {ProfileService} from '../../../service/profile.service';
// import {AppVersion} from '@ionic-native/app-version/ngx';
import Timeout = NodeJS.Timeout;

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.page.html',
    styleUrls: ['profile.page.scss']
})
export class ProfilePage {

    private intervalId: Timeout;
    public version = '';

    public mailCtrl = new FormControl('', [Validators.required, Validators.email]);
    public genderCtrl = new FormControl('', [Validators.required]);
    public statusCtrl = new FormControl('', [Validators.required]);
    public zipcodeCtrl = new FormControl('', [Validators.required]);
    public ageCtrl = new FormControl('', [Validators.required, Validators.min(1), Validators.max(100)]);
    public netIncomeCtrl = new FormControl('', [Validators.required]);
    public expensesCtrl = new FormControl('', [Validators.required]);
    public sharesCtrl = new FormControl('', [Validators.required]);
    public bondsCtrl = new FormControl('', [Validators.required]);
    public passwordCtrl = new FormControl('', []);
    public password2Ctrl = new FormControl('', []);
    public profileFormGroup = new FormGroup({
        mail: this.mailCtrl,
        gender: this.genderCtrl,
        age: this.ageCtrl,
        personal_status: this.statusCtrl,
        zipcode: this.zipcodeCtrl,
        netIncome: this.netIncomeCtrl,
        expenses: this.expensesCtrl,
        shares: this.sharesCtrl,
        bonds: this.bondsCtrl
    });

    constructor(private activatedRoute: ActivatedRoute,
                private api: DefaultService,
                public translate: TranslateService,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController,
                private router: Router,
                public pageUtils: PageUtilsService,
                public authService: AuthenticationService,
                private playlistService: PlaylistService,
                private profileService: ProfileService,
                private tabsPage: TabsPage,
                // private appVersion: AppVersion
                ) {
    }

    /**
     * This method fills in the user data whenever the user switches to this view
     */
    async ionViewWillEnter() {
        await this.refreshProfileData();
        // this.version = await this.appVersion.getVersionNumber();
    }

    private async refreshProfileData() {
        if (this.intervalId !== undefined) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(this.refreshProfileData.bind(this), 5 * 60 * 1000);
        const userProfile = await this.profileService.getProfile(await this.authService.getUserId());
        this.mailCtrl.patchValue(userProfile.mail);
        this.genderCtrl.patchValue(userProfile.gender);
        this.ageCtrl.patchValue(userProfile.age === undefined ? 0 : userProfile.age);
        this.statusCtrl.patchValue(userProfile.personal_status);
        this.zipcodeCtrl.patchValue(userProfile.zipcode);
        this.netIncomeCtrl.patchValue(userProfile.netto_income === undefined ? 0 : userProfile.netto_income);
        this.expensesCtrl.patchValue(userProfile.expenses === undefined ? 0 : userProfile.expenses);
        this.sharesCtrl.patchValue(userProfile.current_shares === undefined ? 0 : userProfile.current_shares);
        this.bondsCtrl.patchValue(userProfile.current_bonds === undefined ? 0 : userProfile.current_bonds);
        this.passwordCtrl.reset();
        this.password2Ctrl.reset();
    }

    /**
     * This method allows the user to update his/her credentials and saves them to the backend
     */
    public async save() {
        if (this.passwordCtrl.value !== null && this.passwordCtrl.value !== '') {
            if (this.password2Ctrl.value === null || this.password2Ctrl.value === '') {
                this.passwordMissing();
                return;
            } else {
                if (this.passwordCtrl.value !== this.password2Ctrl.value) {
                    const alert = await this.alertCtrl.create({
                        header: this.translate.instant('PROFILE.USER_ERROR'),
                        message: this.translate.instant('PROFILE.PWD_DIFFERENCE'),
                        buttons: [{text: this.translate.instant('GENERAL.CONFIRM_BTN')}]
                    });
                    await alert.present();
                    console.log('Passwörter stimmen nicht überein');
                    return;
                } else if (this.passwordCtrl.value.length < 8) {
                    const alert = await this.alertCtrl.create(<AlertOptions>{
                        header: this.translate.instant('PROFILE.USER_ERROR'),
                        subHeader: this.translate.instant('PROFILE.PWD_REQUIREMENTS'),
                        message: this.translate.instant('PROFILE.PWD_MIN_LENGTH'),
                        buttons: [{text: this.translate.instant('GENERAL.CONFIRM_BTN')}]
                    });
                    await alert.present();
                    console.log('Passwort entspricht nicht den Mindestanforderungen');
                    return;
                } else {
                    const alert = await this.alertCtrl.create({
                        header: this.translate.instant('PROFILE.CHANGE_PWD_HDR'),
                        message: this.translate.instant('PROFILE.CHANGE_PWD_MSG'),
                        buttons: [<AlertButton>{
                            text: this.translate.instant('GENERAL.YES_BTN'),
                            handler: () => {
                                this.saveUser(
                                    sha512(`${this.passwordCtrl.value}`),
                                    this.translate.instant('PROFILE.CHANGE_PROFILE_SUCCESS')
                                    + this.translate.instant('PROFILE.CHANGE_PWD_SUCCESS'));
                            }
                        },
                            <AlertButton>{
                                text: this.translate.instant('GENERAL.NO_BTN'),
                                handler: () => {
                                    this.passwordCtrl.reset();
                                    this.password2Ctrl.reset();
                                }
                            }]
                    });
                    await alert.present();
                }
            }
        } else if (this.password2Ctrl.value !== null && this.password2Ctrl.value !== '') {
            this.passwordMissing();
            return;
        } else {
            this.saveUser(undefined, this.translate.instant('PROFILE.CHANGE_PROFILE_SUCCESS'));
        }
    }

    private async saveUser(password: string, message: string) {
        await this.pageUtils.startLoading();
        const user = <User>{
            mail: this.mailCtrl.value,
            age: Number(this.ageCtrl.value.toFixed(0)),
            netto_income: Number(this.netIncomeCtrl.value.toFixed(2)),
            expenses: Number(this.expensesCtrl.value.toFixed(2)),
            current_shares: Number(this.sharesCtrl.value.toFixed(2)),
            current_bonds: Number(this.bondsCtrl.value.toFixed(2)),
            gender: this.genderCtrl.value,
            personal_status: this.statusCtrl.value,
            zipcode: this.zipcodeCtrl.value,
            password: password
        };
        this.api.configuration.accessToken = await this.authService.getToken();
        this.api.configuration.withCredentials = true;
        this.api.usersUserIdPut(await this.authService.getUserId(), user, 'response')
            .subscribe(async (response: HttpResponse<string>) => {
                    await this.pageUtils.stopLoading();
                    if (response.ok) {
                        const alert = await this.alertCtrl.create({
                            header: this.translate.instant('PROFILE.CHANGE_PROFILE_SUCCESS_HDR'),
                            message: message,
                            buttons: [{text: this.translate.instant('GENERAL.CONFIRM_BTN')}]
                        });
                        await alert.present();
                        await this.tabsPage.refresh();
                        await this.refreshProfileData();
                    }
                }
                ,
                async (error: HttpErrorResponse) => {
                    await this.pageUtils.stopLoading();
                    await this.pageUtils.apiErrorHandler(error, await this.authService.getUserId(), this.authService.refreshToken());
                });
    }

    /**
     * This method displays the data protection regulations
     */
    public async showDataProtection() {
        await this.router.navigateByUrl(`login/data-protection`);
    }

    private async passwordMissing() {
        const alert = await this.alertCtrl.create({
            header: this.translate.instant('PROFILE.USER_ERROR'),
            message: this.translate.instant('PROFILE.PWD_MISSING'),
            buttons: [{text: this.translate.instant('GENERAL.CONFIRM_BTN')}]
        });
        await alert.present();
        console.log('Ein Passwort fehlt');
    }
}
