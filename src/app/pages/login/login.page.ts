import {Component} from '@angular/core';
import {DefaultService} from '../../../api';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {sha512} from 'js-sha512';
import {AlertController} from '@ionic/angular';
import {AlertButton, AlertOptions} from '@ionic/core';
import {TranslateService} from '@ngx-translate/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AFAAuthOptions, AFAAvailableResponse, AFADecryptOptions, AndroidFingerprintAuth} from '@ionic-native/android-fingerprint-auth/ngx';
// import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {PageUtilsService} from '../../service/page-utils.service';
import {AuthenticationService} from '../../service/authentication.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
// import {AppVersion} from '@ionic-native/app-version/ngx';

@Component({
    selector: 'app-login',
    templateUrl: 'login.page.html',
    styleUrls: ['login.page.scss']
})
export class LoginPage {

    private readonly CLIENT_ID = 'FS-OCR-App';

    private persistedUsername: string;

    mailCtrl = new FormControl('', [Validators.required, Validators.email]);
    passwordCtrl = new FormControl('', Validators.required);
    loginFormGroup = new FormGroup({
        mail: this.mailCtrl,
        password: this.passwordCtrl
    });
    remember = false;
    version = '';
    fingerPrintAvailable = false;
    useDummy = false;

    /**
     * Page for login of a user.
     * @param router: Angular router
     * @param activatedRoute: Route which is currently activated in Angular Router
     * @param api: ApiService for backend integration
     * @param alertCtrl: Controller for alerts
     * @param translate: Service for language configurations
     * @param androidFingerprintAuth: Service for Android Fingerprint Authentication
     * @param pageUtils: Service to provide utils which are needed for each page
     * @param auth: Service for providing authentication capabilities
     * @param appVersion: Native to give app information
     */
    constructor(private router: Router, private activatedRoute: ActivatedRoute,
                private api: DefaultService,
                private translate: TranslateService,
                private alertCtrl: AlertController,
                private androidFingerprintAuth: AndroidFingerprintAuth,
                private pageUtils: PageUtilsService,
                private auth: AuthenticationService,
                // private appVersion: AppVersion
                ) {
    }

    /**
     * Add Username if saved
     * Provide fingerprint authentication, if possible
     * Reset password entry
     */
    ionViewWillEnter() {
        // const storage = new NativeStorage();
        // storage.getItem('dataProtectionAgreement')
        //     .then((value: boolean) => {
        //         if (!value) {
        //             this.router.navigateByUrl('login/data-protection');
        //         }
        //     })
        //     .catch(async error => {
        //         if (error.code === 2) {
        //             await this.router.navigateByUrl('login/data-protection');
        //         } else {
        //             console.error(error);
        //             // await this.pageUtils.unavailableAlert(error); // TODO Apple has some weird plugin_not_installed error
        //         }
        //     });
        // const dataProtectionAgreement = localStorage.getItem('dataProtectionAgreement');
        // if (!dataProtectionAgreement) {
        //     this.router.navigateByUrl('login/data-protection');
        // }
    }

    /**
     * This method allows for login through fingerprint on android devices whenever the user selected to remember his/her username
     */
    async ionViewDidEnter() {
        await this.pageUtils.startLoading();
        this.api.configuration.withCredentials = false;
        this.api.versionGet('response').subscribe(
            async (response: HttpResponse<string>) => {
                console.log(response);
                if (response.ok) {
                    const version = response.body;
                    // this.version = await this.appVersion.getVersionNumber();
                    const versionSplit = version.split('.');
                    const appVersionSplit = this.version.split('.');
                    console.log(version);
                    console.log(this.version);
                    console.log(versionSplit);
                    console.log(appVersionSplit);

                    // if (versionSplit[0] === appVersionSplit[0] && versionSplit[1] <= appVersionSplit[1]) {
                        this.activatedRoute.queryParams.subscribe((value: Params) => {
                            console.log(value);
                            if (value.timeout === '1') {
                                this.pageUtils.showToast(this.translate.instant('LOGIN.SESSION_TIMEOUT'));
                            } else if (value.timeout !== '0') {
                                this.auth.loggedIn()
                                    .then((loggedIn: boolean) => {
                                        console.log(`Got loggedin result ${loggedIn}`);
                                        if (loggedIn === true) {
                                            this.auth.getUserId().then(userId => {
                                                this.authorize(userId);
                                            })
                                                .catch(async error => {
                                                    this.pageUtils.stopLoading().finally();
                                                    if (error.code === 2) {
                                                        this.tryRememberLogin(true);
                                                    } else {
                                                        console.error(error);
                                                        await this.pageUtils.unavailableAlert(error);
                                                    }
                                                });
                                        } else {
                                            this.pageUtils.stopLoading().finally();
                                            this.tryRememberLogin(true);
                                        }
                                    })
                                    .catch(async error1 => {
                                        this.pageUtils.stopLoading().finally();
                                        console.error(error1);
                                        if (error1.status === 0) {
                                            await this.pageUtils.enableInternetAlert();
                                        } else if (error1.status === 401) {
                                            this.tryRememberLogin(true);
                                        } else if (error1.status === 403) {
                                            await this.pageUtils.showToast(this.translate.instant('LOGIN.SURVEY_MISSING'));
                                        } else {
                                            console.error(error1);
                                            await this.pageUtils.unavailableAlert(error1);
                                        }
                                    });
                            } else {
                                this.pageUtils.stopLoading().finally();
                                this.tryRememberLogin(false);
                            }
                        }, (error) => {
                            this.pageUtils.stopLoading().finally();
                            console.error(error);
                        });
                        this.passwordCtrl.reset();
                    // } else {
                    //     const alert = await this.alertCtrl.create(<AlertOptions>{
                    //         header: this.translate.instant('LOGIN.VERSION_HDR'),
                    //         message: this.translate.instant('LOGIN.VERSION_MSG'),
                    //         backdropDismiss: false,
                    //         keyboardClose: true,
                    //         buttons: [
                    //             <AlertButton>{
                    //                 text: this.translate.instant('GENERAL.CONFIRM_BTN'),
                    //                 handler: () => {
                    //                     navigator['app'].exitApp();
                    //                 }
                    //             }
                    //         ]
                    //     });
                    //     await alert.present();
                    // }
                }
            },
            async (error1: HttpErrorResponse) => {
                this.pageUtils.stopLoading().finally();
                await this.pageUtils.apiErrorHandler(error1, -1, () => {
                });
            });
    }

    /**
     * Login with specified credentials in the controls.
     */
    async login(usedFingerPrint: boolean) {
        if (this.remember && this.mailCtrl.value.toLowerCase() !== this.persistedUsername) {
            console.log('Username changed from last remember, so updating');
            localStorage.setItem('username', this.mailCtrl.value.toLowerCase());
            localStorage.removeItem('androidFingerprintToken');
        } else if (!this.remember) {
            console.log('Remember switched off, so deleting cache');
            localStorage.removeItem('username');
            localStorage.removeItem('androidFingerprintToken');
        }
        const username = this.mailCtrl.value.toLowerCase() === undefined ? '' : this.mailCtrl.value.toLowerCase();
        const password = sha512(this.passwordCtrl.value === undefined ? '' : this.passwordCtrl.value);
        try {
            await this.pageUtils.startLoading();
            const userId = await this.auth.login(username, password);
            if (userId !== undefined) {
                await this.authorize(userId);
            }
        } catch (e) {
            if (e.status === 0) {
                await this.pageUtils.enableInternetAlert();
            } else if (e.status === 401) {
                await this.pageUtils.showToast(this.translate.instant('LOGIN.WRONG_CREDENTIALS'));
                if (usedFingerPrint) {
                    localStorage.removeItem('androidFingerprintToken');
                }
            } else if (e.status === 403) {
                await this.pageUtils.showToast(this.translate.instant('LOGIN.SURVEY_MISSING'));
            } else {
                console.error(e);
                await this.pageUtils.unavailableAlert(e);
            }
        } finally {
            this.pageUtils.stopLoading().finally();
        }
    }

    // /**
    //  * Enable Android Fingerprint Authentication (AFA)
    //  */
    // enableAndroidFingerPrint() {
    //     this.androidFingerprintAuth.isAvailable()
    //         .then((result) => {
    //             if (result.isAvailable) {
    //                 this.androidFingerprintAuth.encrypt(<AFAAuthOptions>{
    //                     clientId: this.CLIENT_ID,
    //                     username: this.mailCtrl.value.toLowerCase(),
    //                     password: this.passwordCtrl.value,
    //                     dialogTitle: this.translate.instant('LOGIN.ENABLE_FINGERPRINT_HDR'),
    //                     dialogMessage: this.translate.instant('LOGIN.ENABLE_FINGERPRINT_MSG'),
    //                     disableBackup: true
    //                 })
    //                     .then(async result2 => {
    //                         if (result2.withFingerprint) {
    //                             const storage = new NativeStorage();
    //                             await storage.setItem('androidFingerprintToken', result2.token);
    //                             console.log('Successfully encrypted credentials.');
    //                         } else if (result2.withBackup) {
    //                             console.log('Successfully authenticated with backup password!');
    //                         } else {
    //                             console.log('Didn\'t authenticate!');
    //                         }
    //                     })
    //                     .catch(async error => {
    //                         if (error === this.androidFingerprintAuth.ERRORS.FINGERPRINT_CANCELLED) {
    //                             console.log('Fingerprint authentication cancelled');
    //                         } else {
    //                             console.error(error);
    //                             await this.pageUtils.unavailableAlert(error);
    //                         }
    //                     });

    //             } else {
    //                 // fingerprint auth isn't available
    //             }
    //         })
    //         .catch(async error => {
    //             console.error(error);
    //             await this.pageUtils.unavailableAlert(error);
    //         });
    // }

    // /**
    //  * Use AFA
    //  * @param token: Token for fingerprint authentication
    //  */
    // useAndroidFingerprint(token: string) {
    //     this.androidFingerprintAuth.isAvailable()
    //         .then((result) => this.androidFingerprintDecrypt(this, result, token))
    //         .catch(async error => {
    //             console.error(error);
    //             await this.pageUtils.unavailableAlert(error);
    //         });
    // }

    // /**
    //  * Decrypt the Android Fingerprint Token
    //  * @param _this: The instance of this page
    //  * @param result: Result if AFA is available
    //  * @param token: Android Fingerprint Token
    //  */
    // async androidFingerprintDecrypt(_this: LoginPage, result: AFAAvailableResponse, token: string) {
    //     if (result.isAvailable) {
    //         this.androidFingerprintAuth.decrypt(<AFAAuthOptions>{
    //             clientId: _this.CLIENT_ID,
    //             username: _this.mailCtrl.value.toLowerCase(),
    //             token: token,
    //             dialogTitle: this.translate.instant('LOGIN.USE_FINGERPRINT_HDR'),
    //             dialogMessage: this.translate.instant('LOGIN.USE_FINGERPRINT_MSG'),
    //             disableBackup: true
    //         }).then(async (result2: AFADecryptOptions) => {
    //             _this.passwordCtrl.patchValue(result2.password);
    //             await _this.login(true);
    //         }).catch(error => console.error(error));
    //     }
    // }

    // /**
    //  * Check authorization of user, who got authenticated.
    //  * If possible, ask if Fingerprint Authentication should be enabled
    //  * @param _this Instance of this
    //  * @param uid: ID of the user, who logged in.
    //  */
    async authorize(uid: number) {
        if (uid !== -1) {
            // const storage = new NativeStorage();
            if (this.remember) {
                // await storage.getItem('androidFingerprintToken')
                //     .then()
                //     .catch((error) => {
                //         if (error.code === 2) {
                //             this.androidFingerprintAuth.isAvailable().then((responseAfa: AFAAvailableResponse) => {
                //                 if (responseAfa.isAvailable) {
                //                     this.alertCtrl.create(<AlertOptions>{
                //                         header: this.translate.instant('LOGIN.ALLOW_FINGERPRINT_HDR'),
                //                         message: this.translate.instant('LOGIN.ALLOW_FINGERPRINT_MSG'),
                //                         buttons: [<AlertButton>{
                //                             text: this.translate.instant('GENERAL.YES_BTN'),
                //                             handler: () => this.enableAndroidFingerPrint()
                //                         }, {
                //                             text: this.translate.instant('GENERAL.NO_BTN')
                //                         }]
                //                     }).then(alert => alert.present());
                //                 }
                //             });
                //         } else {
                //             console.error(error);
                //         }
                //     });
            }
            this.pageUtils.stopLoading().finally();
            await this.router.navigateByUrl(`tabs/${uid}`);
        } else {
            await this.pageUtils.showToast(this.translate.instant('LOGIN.WRONG_CREDENTIALS'));
        }
    }

    private async tryRememberLogin(startLoginTry: boolean) {
        // const storage = new NativeStorage();
        // this.fingerPrintAvailable = (await this.androidFingerprintAuth.isAvailable()).isAvailable;
        // console.log(`Fingerprint available? ${this.fingerPrintAvailable}`);
        // storage.getItem('username')
        //     .then(value => {
        //         if (value !== undefined) {
        //             this.persistedUsername = value;
        //             this.mailCtrl.patchValue(this.persistedUsername);
        //             this.remember = true;
        //             if (startLoginTry && this.fingerPrintAvailable) {
        //                 storage.getItem('androidFingerprintToken')
        //                     .then(value1 => {
        //                             if (value1 !== undefined) {
        //                                 this.useAndroidFingerprint(value1);
        //                             }
        //                         }
        //                     )
        //                     .catch(async error => {
        //                         if (error.code !== 2) {
        //                             console.error(error);
        //                             await this.pageUtils.unavailableAlert(error);
        //                         }
        //                     });
        //             }
        //         }
        //     })
        //     .catch(async error => {
        //             if (error.code !== 2) {
        //                 console.error(error);
        //                 await this.pageUtils.unavailableAlert(error);
        //             }
        //         }
        //     )
        //     .finally(() => console.log(`Persisted Username? ${this.persistedUsername}`));
    }

    dummyUser(number: number) {
        this.mailCtrl.patchValue('test' + number.toString() + '@dummy.com');
        this.passwordCtrl.patchValue('12TestDumm!89');
        this.login(false);
    }
}
