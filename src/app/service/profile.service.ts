import {Injectable} from '@angular/core';
import {DefaultService, PlaylistMatrix, User} from '../../api';
import {PageUtilsService} from './page-utils.service';
import {AuthenticationService} from './authentication.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import Timeout = NodeJS.Timeout;

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    private userProfile: User;
    private playlistMatrix: PlaylistMatrix;

    private intervalId: Timeout;

    constructor(private pageUtils: PageUtilsService,
                private authService: AuthenticationService,
                private translate: TranslateService,
                private router: Router,
                private api: DefaultService) {
    }

    public async refresh(userId: number): Promise<boolean> {
        try {
            await this.pageUtils.startLoading();
            if (this.intervalId !== undefined) {
                clearInterval(this.intervalId);
            }
            this.intervalId = setInterval(this.refresh.bind(this), 15 * 60 * 1000, [userId]);
            this.api.configuration.accessToken = await this.authService.getToken();
            this.api.configuration.withCredentials = true;
            const response = await this.api.usersUserIdGet(userId, 'response').toPromise();
            if (response.ok) {
                this.userProfile = response.body;
                console.log(response.body);
                console.log(this.userProfile);
                if (this.userProfile.age === undefined
                    || this.userProfile.gender === undefined
                    || this.userProfile.personal_status === undefined
                    || this.userProfile.zipcode === undefined) {
                    await this.pageUtils.showToast(this.translate.instant('ERROR.PROFIL_NOT_SUFFICIENT'));
                    await this.router.navigateByUrl(`tabs/${userId}/profile`);
                } else {
                    this.api.configuration.accessToken = await this.authService.getToken();
                    this.api.configuration.withCredentials = true;
                    const response1 = await this.api.usersUserIdPlaylistmatrixGet(userId, 'response').toPromise();
                    if (response1.ok) {
                        this.playlistMatrix = response1.body;
                        console.log(response1.body);
                        console.log(this.playlistMatrix);
                    }
                    return true;
                }
            }
        } catch (e) {
            await this.pageUtils.apiErrorHandler(e, userId, this.authService.refreshToken());
            return false;
        } finally {
            await this.pageUtils.stopLoading();
        }
        return false;
    }

    public async getProfile(userId: number): Promise<User> {
        if (this.userProfile === undefined) {
            await this.refresh(userId);
        }
        return this.userProfile;
    }

    public async getPlaylistMatrix(userId: number): Promise<PlaylistMatrix> {
        if (this.playlistMatrix === undefined) {
            await this.refresh(userId);
        }
        return this.playlistMatrix;
    }
}
