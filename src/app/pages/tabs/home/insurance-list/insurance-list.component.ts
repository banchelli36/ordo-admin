import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Asset, DefaultService} from '../../../../../api';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {AlertController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {PageUtilsService} from '../../../../service/page-utils.service';
import {AlertButton, AlertOptions, ModalOptions} from '@ionic/core';
import {SearchComponent} from '../search/search.component';
import {AuthenticationService} from '../../../../service/authentication.service';
import {PlaylistService} from '../../../../service/playlist.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ProfileService} from '../../../../service/profile.service';
import TypeEnum = Asset.TypeEnum;
import Timeout = NodeJS.Timeout;

@Component({
    selector: 'app-insurance-list',
    templateUrl: './insurance-list.component.html',
    styleUrls: ['./insurance-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsuranceListComponent {

    constructor(private activatedRoute: ActivatedRoute,
                private api: DefaultService,
                private alertCtrl: AlertController,
                private router: Router,
                private translate: TranslateService,
                private pageUtils: PageUtilsService,
                private modalCtrl: ModalController,
                private auth: AuthenticationService,
                private playlistService: PlaylistService,
                private changeDetector: ChangeDetectorRef,
                private profileService: ProfileService) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.auth.getUserId().then(async userId => {
                    if (userId !== undefined && this.router.isActive(`tabs/${userId}/home`, true)) {
                        await this.getInsurances(userId);
                    }
                    }
                );
            }
        });
        InsuranceListComponent.instance = this;
    }

    private static instance: InsuranceListComponent;

    private gesetzlichePension = 0;
    private betrieblichePension = 0;
    private riesterPension = 0;
    public pension = 0;

    public assetsMap = new Map<Asset, number>();
    private gesetzlicheArray = new Array<Asset>();
    private betrieblicheArray = new Array<Asset>();
    private riesterArray = new Array<Asset>();
    private insurance_Images: Array<string>;

    private intervalId: Timeout;

    /**
     * This method deletes the insurancesStatic the user selected
     * @param asset: The insurance to be deleted
     */
    public async deleteInsurance(asset: Asset) {
        const alert = await this.alertCtrl.create(<AlertOptions>{
            header: this.translate.instant('HOME.DELETE_INSURANCE_HDR', {
                insurance_name: asset.name
            }),
            message: this.translate.instant('HOME.DELETE_INSURANCE_MSG', {
                insurance_name: asset.name
            }),
            buttons: [<AlertButton>
                {
                    text: this.translate.instant('GENERAL.NO_BTN'),
                    role: 'cancel',
                },
                {
                    text: this.translate.instant('GENERAL.YES_BTN'),
                    handler: () => this.deleteInsuranceHandler(asset)
                }
            ]
        });
        await alert.present();
    }

    private async getInsurances(userId: number) {
        if (this.intervalId !== undefined) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(this.getInsurances.bind(InsuranceListComponent.instance), 15 * 60 * 1000, [userId]);
        this.assetsMap = new Map<Asset, number>();
        this.gesetzlicheArray = new Array<Asset>();
        this.betrieblicheArray = new Array<Asset>();
        this.riesterArray = new Array<Asset>();
        const assets = await this.playlistService.getAssets(userId);
        for (const asset of assets) {
            const array = [asset];
            const pension = await this.playlistService.calcExpectedPension(userId, array);
            this.assetsMap.set(asset, pension.get(80));
            switch (asset.type) {
                case TypeEnum.Gesetzliche:
                    this.gesetzlicheArray.push(asset);
                    break;
                case TypeEnum.Betriebliche:
                    this.betrieblicheArray.push(asset);
                    break;
                case TypeEnum.Riester:
                    this.riesterArray.push(asset);
            }
        }
        await this.setPension(userId);
    }

    /**
     * This method adds an insurance to the view
     */
    public async addInsurance() {
        const userId = await this.auth.getUserId();
        const modal = await this.modalCtrl.create(<ModalOptions>{
            component: SearchComponent,
            componentProps: {userId: userId}
        });
        await modal.present();
        modal.onDidDismiss().then(() => this.getInsurances(userId));
    }

    /**
     * This insurance deletes a certain insurance from the backend
     * @param asset: The insurance to delete from the backend
     */
    private async deleteInsuranceHandler(asset: Asset) {
        await this.pageUtils.startLoading();
        this.api.configuration.accessToken = await this.auth.getToken();
        this.api.configuration.withCredentials = true;
        const userId = await this.auth.getUserId();
        this.api.usersUserIdAssetsAssetIdDelete(userId, asset.id).subscribe(
            async () => {
                await this.pageUtils.stopLoading();
                await this.playlistService.refreshAllAssets(userId);
                await this.getInsurances(userId);
            },
            async (error: HttpErrorResponse) => {
                await this.pageUtils.stopLoading();
                await this.pageUtils.apiErrorHandler(error, userId, this.auth.refreshToken());
            });
    }

    /**
     * This method sets the constellation of the assetsArray to know what to display
     *
     */
    private async setPension(userId: number) {
        /*await this.playlistService.calcExpectedPension(userId, this.gesetzlicheArray).then(map => {
            this.gesetzlichePension = map.get(80);
        });
        await this.playlistService.calcExpectedPension(userId, this.betrieblicheArray).then(map => {
            this.betrieblichePension = map.get(80);
        });
        await this.playlistService.calcExpectedPension(userId, this.riesterArray).then(map => {
            this.riesterPension = map.get(80);
        });*/
        this.pension = (await this.playlistService.getInsurancePension(userId)).get(80);
        this.changeDetector.markForCheck();
    }


}
