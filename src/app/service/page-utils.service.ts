import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AlertController, LoadingController, ModalController, ToastController} from '@ionic/angular';
import {AlertButton, AlertOptions, LoadingOptions, ModalOptions, ToastOptions} from '@ionic/core';
import {Router} from '@angular/router';
import {DefaultService, ErrorObj} from '../../api';
import {OpenNativeSettings} from '@ionic-native/open-native-settings/ngx';
import {HttpErrorResponse} from '@angular/common/http';
import {HelpComponent} from '../pages/help/help.component';

@Injectable({
    providedIn: 'root'
})
export class PageUtilsService {

    /**
     * Service to provide utils which are needed for each page
     * @param router: Angular router
     * @param api: ApiService for backend integration
     * @param alertCtrl: Controller for alerts
     * @param translate: Service for language configurations
     * @param loadingCtrl: Controller for loading pop up
     */
    constructor(private translate: TranslateService,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController,
                private router: Router,
                private api: DefaultService,
                private toastCtrl: ToastController,
                private modalCtrl: ModalController,
                private openNativeSettings: OpenNativeSettings) {
    }

    private loading = false;

    /**
     * Alert that the app is loading. Don't forget to dismiss with #stopLoading()
     */
    public async startLoading() {
        if (!this.loading) {
            console.log('Start Loading');
            const loading = await this.loadingCtrl.create(<LoadingOptions>{
                spinner: 'circles',
                message: this.translate.instant('GENERAL.LOADING'),
                duration: 10000
            });
            await loading.present();
            loading.onDidDismiss().finally(() => {
                console.log('Set loading false');
                this.loading = false;
            });
            console.log('Set loading true');
            this.loading = true;
        }
    }

    public async showHelp(helpmsg: string) {
        const modal = await this.modalCtrl.create(<ModalOptions>{
            component: HelpComponent,
            componentProps: {helpMsg: helpmsg}
        });
        await modal.present();
    }

    /**
     * Dismiss the loading alert.
     */
    public async stopLoading() {
        if (this.loading) {
            console.log('Stop Loading');
            await this.loadingCtrl.dismiss();
        }
    }

    /**
     * Alert that the app is unavailable.
     */
    public async unavailableAlert(errorMsg: any, userId = -1) {
        await this.startLoading();
        const errorObj = <ErrorObj>{
            userId: userId,
            timestamp: new Date().toUTCString(),
            properties: errorMsg
        };
        await this.api.errorPost(errorObj, 'response');
        const alert = await this.alertCtrl.create(<AlertOptions>{
            header: this.translate.instant('GENERAL.SERVICE_UNAVAILABLE_HDR'),
            message: this.translate.instant('GENERAL.SERVICE_UNAVAILABLE_MSG'),
            buttons: [<AlertButton>{
                text: this.translate.instant('GENERAL.CONFIRM_BTN'),
                handler: () => {
                    navigator['app'].exitApp();
                }
            }]
        });
        await this.stopLoading();
        await alert.present();
    }

    public async enableInternetAlert() {
        const alert = await this.alertCtrl.create(<AlertOptions>{
            header: this.translate.instant('GENERAL.ENABLE_INT_HDR'),
            message: this.translate.instant('GENERAL.ENABLE_INT_MSG'),
            buttons: [
                <AlertButton>{
                    text: this.translate.instant('GENERAL.SETTINGS'),
                    handler: () => {
                        this.openNativeSettings.open('settings');
                    }
                }]
        });
        await alert.present();
    }

    public async showToast(result: string) {
        console.log(`Scan finished: ${result}`);
        let openToast;
        while ((openToast = await this.toastCtrl.getTop()) !== undefined) {
            if (openToast.message === result) {
                await this.toastCtrl.dismiss();
            }
        }
        const toast = await this.toastCtrl.create(<ToastOptions>{
            message: result,
            showCloseButton: true,
            closeButtonText: this.translate.instant('GENERAL.CLOSE_BTN'),
            position: 'top',
            color: 'danger',
            keyboardClose: true
        });
        await toast.present();
    }

    // https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    public b64toBlob(b64Data: string, contentType: string, sliceSize?: number) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }

    async apiErrorHandler(e: HttpErrorResponse, userId: number, unauthorizedCallback) {
        if (e.status === 403) {
            await this.router.navigateByUrl(`tabs/${userId}/profile`);
            await this.showToast(this.translate.instant('PROFILE.PASSWORD_RESET'));
        } else if (e.status === 401) {
            await unauthorizedCallback();
        } else if (e.status === 0) {
            await this.enableInternetAlert();
        } else {
            console.error(e.message);
            await this.unavailableAlert(e.message, userId);
        }
    }
}
