import {Injectable} from '@angular/core';
import {Asset, DefaultService, Playlist, PlaylistMatrix, User} from '../../api';
import {AuthenticationService} from './authentication.service';
import {PageUtilsService} from './page-utils.service';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ProfileService} from './profile.service';
import TypeEnum = Asset.TypeEnum;
import Timeout = NodeJS.Timeout;

@Injectable({
    providedIn: 'root'
})

export class PlaylistService {

    private assetArray: Array<Asset>;
    private assetPlaylistMap: Map<number, Playlist>;

    private fullPension: Map<number, number>;
    private insurancePension: Map<number, number>;
    private capitalPension: Map<number, number>;

    private intervalId: Timeout;

    constructor(
        private api: DefaultService,
        private authService: AuthenticationService,
        private pageUtils: PageUtilsService,
        private router: Router,
        private translate: TranslateService,
        private profileService: ProfileService) {
    }

    public async refreshAllAssets(userId: number): Promise<Array<Asset>> {
        await this.pageUtils.startLoading();
        if (this.intervalId !== undefined) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(this.refreshAllAssets.bind(this), 15 * 60 * 1000, [userId]);
        try {
            this.api.configuration.accessToken = await this.authService.getToken();
            this.api.configuration.withCredentials = true;
            const response = await this.api.usersUserIdAssetsGet(userId, undefined, 'response').toPromise();
            if (response.ok) {
                console.log(`Got Results for getting assets`);
                this.assetArray = response.body;
                this.assetPlaylistMap = new Map<number, Playlist>();
                let asset: Asset;
                for (asset of this.assetArray) {
                    console.log(`Get Playlist for Asset ${asset.id}`);
                    this.api.configuration.accessToken = await this.authService.getToken();
                    this.api.configuration.withCredentials = true;
                    const response1 = await this.api.usersUserIdAssetsAssetIdPlaylistGet(userId, asset.id, 'response').toPromise();
                    if (response1.ok) {
                        this.assetPlaylistMap.set(asset.id, response1.body);
                        console.log(response1.body);
                    } else {
                        console.error(response1.status);
                        console.error(response1.body);
                    }
                }
                this.calcFullExpectedPension(userId).then(result => this.fullPension = result);
                this.calcExpectedPension(userId, this.assetArray).then(result => this.insurancePension = result);
                this.calcExpectedPension(userId, [], 0, 0, true).then(result => this.capitalPension = result);
            }
        } catch (e) {
            await this.pageUtils.apiErrorHandler(e, userId, this.authService.refreshToken());
        }
        await this.pageUtils.stopLoading();
        return this.assetArray;
    }

    public async calcFullExpectedPension(userId: number, stocksSavingRate = 0, interestSavingRate = 0): Promise<Map<number, number>> {
        const assetsArray = await this.getAssets(userId);
        return await this.calcExpectedPension(userId, assetsArray, stocksSavingRate, interestSavingRate, true);
    }

    public async calcExpectedPension(
        userId: number,
        assetsArray: Array<Asset>,
        stocksSavingRate = 0,
        interestSavingRate = 0,
        withStocksAndInterests = false): Promise<Map<number, number>> {
        console.log(`Calculate Expected pension for assets ${assetsArray}`);
        if (withStocksAndInterests || assetsArray.length !== 0) {
            const userProfile = await this.profileService.getProfile(userId);
            if (userProfile.age === undefined
                || userProfile.gender === undefined
                || userProfile.personal_status === undefined
                || userProfile.zipcode === undefined) {
                await this.pageUtils.showToast(this.translate.instant('ERROR.PROFIL_NOT_SUFFICIENT'));
                await this.router.navigateByUrl(`tabs/${userId}/profile`);
            } else {
                const playlistMatrix = await this.profileService.getPlaylistMatrix(userId);
                const inputMap = await this.calcInputParams(assetsArray,
                    userProfile, stocksSavingRate, interestSavingRate, withStocksAndInterests);
                return await this.calcResultSet(inputMap, playlistMatrix);
            }
        }
        const defaultMap = new Map<number, number>();
        defaultMap.set(95, 0);
        defaultMap.set(90, 0);
        defaultMap.set(80, 0);
        defaultMap.set(50, 0);
        return defaultMap;
    }

    private async calcResultSet(inputMap: Map<InputCols, number>, playlistMatrix: PlaylistMatrix): Promise<Map<number, number>> {
        const input = [
            inputMap.get(InputCols.b),
            inputMap.get(InputCols.c),
            inputMap.get(InputCols.d),
            inputMap.get(InputCols.e),
            inputMap.get(InputCols.f),
            inputMap.get(InputCols.g),
            inputMap.get(InputCols.h),
            inputMap.get(InputCols.i),
            inputMap.get(InputCols.j),
            inputMap.get(InputCols.k)];
        console.log(input);
        const array = [
            playlistMatrix.first.one,
            playlistMatrix.first.two,
            playlistMatrix.first.three,
            playlistMatrix.first.four,
            playlistMatrix.first.five,
            playlistMatrix.first.six,
            playlistMatrix.first.seven,
            playlistMatrix.first.eight,
            playlistMatrix.first.nine,
            playlistMatrix.first.ten
        ];
        for (let i = 0; i < input.length; i++) {
            input[i] *= array[i];
            console.log(`Input ${Array.from(inputMap.keys())[i]}: ${input[i]}`);
        }
        return await this.calcPlaylistMatrix(input, playlistMatrix);
    }

    private async calcPlaylistMatrix(inputArray, playlistMatrix: PlaylistMatrix): Promise<Map<number, number>> {
        const expectedPension = new Map<number, number>();
        let playlistArray = [playlistMatrix.second.one,
            playlistMatrix.second.two,
            playlistMatrix.second.three,
            playlistMatrix.second.four,
            playlistMatrix.second.five,
            playlistMatrix.second.six,
            playlistMatrix.second.seven,
            playlistMatrix.second.eight,
            playlistMatrix.second.nine,
            playlistMatrix.second.ten];
        let greater95 = 0;
        for (let i = 0; i < inputArray.length; i++) {
            greater95 += inputArray[i] * playlistArray[i];
        }
        expectedPension.set(95, greater95);

        playlistArray = [playlistMatrix.third.one,
            playlistMatrix.third.two,
            playlistMatrix.third.three,
            playlistMatrix.third.four,
            playlistMatrix.third.five,
            playlistMatrix.third.six,
            playlistMatrix.third.seven,
            playlistMatrix.third.eight,
            playlistMatrix.third.nine,
            playlistMatrix.third.ten];
        let greater90 = 0;
        for (let i = 0; i < inputArray.length; i++) {
            greater90 += inputArray[i] * playlistArray[i];
        }
        expectedPension.set(90, greater90);

        playlistArray = [playlistMatrix.fourth.one,
            playlistMatrix.fourth.two,
            playlistMatrix.fourth.three,
            playlistMatrix.fourth.four,
            playlistMatrix.fourth.five,
            playlistMatrix.fourth.six,
            playlistMatrix.fourth.seven,
            playlistMatrix.fourth.eight,
            playlistMatrix.fourth.nine,
            playlistMatrix.fourth.ten];
        let greater80 = 0;
        for (let i = 0; i < inputArray.length; i++) {
            greater80 += inputArray[i] * playlistArray[i];
        }
        expectedPension.set(80, greater80);

        playlistArray = [playlistMatrix.fifth.one,
            playlistMatrix.fifth.two,
            playlistMatrix.fifth.three,
            playlistMatrix.fifth.four,
            playlistMatrix.fifth.five,
            playlistMatrix.fifth.six,
            playlistMatrix.fifth.seven,
            playlistMatrix.fifth.eight,
            playlistMatrix.fifth.nine,
            playlistMatrix.fifth.ten];
        let greater50 = 0;
        for (let i = 0; i < inputArray.length; i++) {
            greater50 += inputArray[i] * playlistArray[i];
        }
        expectedPension.set(50, greater50);
        return expectedPension;
    }

    private async calcInputParams(assetsArray: Array<Asset>,
                                  userProfile: User,
                                  stocksSavingRate: number,
                                  interestSavingRate: number,
                                  withStocksAndInterests: boolean) {
        const inputMap = new Map<InputCols, number>();
        inputMap.set(InputCols.b, 0);
        inputMap.set(InputCols.c, 0);
        inputMap.set(InputCols.d, 0);
        inputMap.set(InputCols.e, stocksSavingRate);
        inputMap.set(InputCols.f, interestSavingRate);
        inputMap.set(InputCols.g, 0);
        inputMap.set(InputCols.h, 0);
        inputMap.set(InputCols.i, 0);
        inputMap.set(InputCols.j, (userProfile.current_shares === undefined || !withStocksAndInterests) ? 0 : userProfile.current_shares);
        inputMap.set(InputCols.k, (userProfile.current_bonds === undefined || !withStocksAndInterests) ? 0 : userProfile.current_bonds);
        for (const asset of assetsArray) {
            const playlist = await this.getPlaylist(userProfile.id, asset);
            switch (asset.type) {
                case TypeEnum.Gesetzliche:
                    inputMap.set(InputCols.b,
                        playlist.real.savings.monthly + inputMap.get(InputCols.b));
                    inputMap.set(InputCols.g,
                        playlist.real.savings.single + inputMap.get(InputCols.g));
                    break;
                case TypeEnum.Betriebliche:
                    inputMap.set(InputCols.c,
                        playlist.nominal.savings.monthly + inputMap.get(InputCols.c));
                    inputMap.set(InputCols.h,
                        playlist.nominal.savings.single + inputMap.get(InputCols.h));
                    break;
                case TypeEnum.Riester:
                    inputMap.set(InputCols.d,
                        playlist.nominal.savings.monthly + inputMap.get(InputCols.d));
                    inputMap.set(InputCols.i,
                        playlist.nominal.savings.single + inputMap.get(InputCols.i));
                    break;
                case TypeEnum.Aktien:
                    if (stocksSavingRate === 0) {
                        inputMap.set(InputCols.e,
                            playlist.real.savings.monthly + inputMap.get(InputCols.e));
                    }
                    inputMap.set(InputCols.j,
                        playlist.real.savings.single + inputMap.get(InputCols.j));
                    break;
                case TypeEnum.Rente:
                    if (interestSavingRate === 0) {
                        inputMap.set(InputCols.f,
                            playlist.real.savings.monthly + inputMap.get(InputCols.f));
                    }
                    inputMap.set(InputCols.k,
                        playlist.real.savings.single + inputMap.get(InputCols.k));
                    break;
                default:
                    console.error('Insurance type unknown!');
            }
        }
        return inputMap;
    }

    public async getAssets(userId: number): Promise<Array<Asset>> {
        if (this.assetArray === undefined) {
            await this.refreshAllAssets(userId);
        }
        return this.assetArray;
    }

    public async getFullPension(userId: number): Promise<Map<number, number>> {
        if (this.fullPension === undefined) {
            await this.refreshAllAssets(userId);
        }
        return this.fullPension;
    }

    public async getCapitalPension(userId: number): Promise<Map<number, number>> {
        if (this.capitalPension === undefined) {
            await this.refreshAllAssets(userId);
        }
        return this.capitalPension;
    }

    public async getInsurancePension(userId: number): Promise<Map<number, number>> {
        if (this.insurancePension === undefined) {
            await this.refreshAllAssets(userId);
        }
        return this.insurancePension;
    }

    private async getPlaylist(userId: number, asset: Asset): Promise<Playlist> {
        if (this.assetPlaylistMap === undefined || this.assetPlaylistMap.size < 1) {
            this.refreshAllAssets(userId);
        }
        console.log(asset);
        console.log(this.assetPlaylistMap);
        return this.assetPlaylistMap.get(asset.id);
    }

    async getShareBondPlan(userId: number, assets: Array<Asset>) {
        const playlistMatrix = await this.profileService.getPlaylistMatrix(userId);
        const profile = await this.profileService.getProfile(userId);
        const inputMap = await this.calcInputParams(assets,
            profile, 0, 0, true);

        const input = [
            inputMap.get(InputCols.b),
            inputMap.get(InputCols.c),
            inputMap.get(InputCols.d),
            inputMap.get(InputCols.e),
            inputMap.get(InputCols.f),
            inputMap.get(InputCols.g),
            inputMap.get(InputCols.h),
            inputMap.get(InputCols.i),
            inputMap.get(InputCols.j),
            inputMap.get(InputCols.k)];
        console.log(input);
        const array = [
            playlistMatrix.first.one,
            playlistMatrix.first.two,
            playlistMatrix.first.three,
            playlistMatrix.first.four,
            playlistMatrix.first.five,
            playlistMatrix.first.six,
            playlistMatrix.first.seven,
            playlistMatrix.first.eight,
            playlistMatrix.first.nine,
            playlistMatrix.first.ten
        ];
        for (let i = 0; i < input.length; i++) {
            input[i] *= array[i];
            console.log(`Input ${Array.from(inputMap.keys())[i]}: ${input[i]}`);
        }

        let sum = 0;
        sum += input[0] * playlistMatrix.fourth.one;
        sum += input[1] * playlistMatrix.fourth.two;
        sum += input[2] * playlistMatrix.fourth.three;

        sum += input[5] * playlistMatrix.fourth.six;
        sum += input[6] * playlistMatrix.fourth.seven;
        sum += input[7] * playlistMatrix.fourth.eight;
        sum += input[8] * playlistMatrix.fourth.nine;
        sum += input[9] * playlistMatrix.fourth.ten;

        sum = profile.expenses - sum;

        const shares = sum / (playlistMatrix.first.four * playlistMatrix.fourth.four);
        const bonds = sum / (playlistMatrix.first.five * playlistMatrix.fourth.five);
        return [shares, bonds];
    }
}

export enum InputCols {
    b = 'B',
    c = 'C',
    d = 'D',
    e = 'StocksSavingRate',
    f = 'InterestSavingRate',
    g = 'G',
    h = 'H',
    i = 'I',
    j = 'J',
    k = 'K'
}

