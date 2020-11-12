import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Asset} from '../../../api';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {AuthenticationService} from '../../service/authentication.service';
import {PageUtilsService} from '../../service/page-utils.service';
import {PlaylistService} from '../../service/playlist.service';
import {ProfileService} from '../../service/profile.service';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss']
})
export class TabsPage {

    insurances: Array<Asset> = undefined;

    constructor(private route: ActivatedRoute, private router: Router,
                private alertCtrl: AlertController,
                private pageUtils: PageUtilsService,
                private translate: TranslateService,
                private auth: AuthenticationService,
                private playlistService: PlaylistService,
                private profileService: ProfileService) {
    }

    ionViewWillEnter() {
        this.refresh();
    }

    async refresh() {
        const userId = await this.auth.getUserId();
        const success = await this.profileService.refresh(userId);
        if (success) {
            this.insurances = await this.playlistService.refreshAllAssets(userId);
            if (this.insurances !== undefined) {
                console.log(`Got Assets on Tabs Page`);
                if (this.router.isActive(`tabs/${userId}`, true)) {
                    await this.router.navigateByUrl(`tabs/${userId}/home`);
                }

            }
        }
    }


}
