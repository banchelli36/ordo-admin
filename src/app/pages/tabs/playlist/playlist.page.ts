import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../../../api';
import {AlertController} from '@ionic/angular';
import {AuthenticationService} from '../../../service/authentication.service';
import {Chart} from 'chart.js';
import {PageUtilsService} from '../../../service/page-utils.service';
// import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {TranslateService} from '@ngx-translate/core';
import {AlertButton} from '@ionic/core';
import {PlaylistService} from '../../../service/playlist.service';
import {ProfileService} from '../../../service/profile.service';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-playlist',
    templateUrl: 'playlist.page.html',
    styleUrls: ['playlist.page.scss']
})
export class PlaylistPage implements OnInit {

    /**
     * This method initializes the assetsArray to be displayed
     * @param alertCtrl: The controller to display the popup
     * @param playlistService: Service to get playlist results
     * @param authService: The authentification service to grant access
     * @param activatedRoute -
     * @param translate -
     * @param pageUtils -
     * @param profileService -
     */
    constructor(private alertCtrl: AlertController,
                public authService: AuthenticationService,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                public translate: TranslateService,
                public pageUtils: PageUtilsService,
                private playlistService: PlaylistService,
                private profileService: ProfileService,
                private screenOrientation: ScreenOrientation) {
    }

    @ViewChild('barCanvas') static barCanvas1;

    private confirmBtn: string;
    private doNotShowBtn: string;
    private introductionHdr: string;
    private introductionMsg: string;
    private claimGraphLbl: string;
    private expendituresLbl: string;
    private quantile95Lbl: string;
    private quantile90Lbl: string;
    private quantile80Lbl: string;
    private quantile50Lbl: string;
    private quantileLowerLbl: string;
    private graphTitle: string;

    @ViewChild('barCanvas') barCanvas;

    private barChart: any;
    private subscriptionId: Subscription;

    public expenditures = 1000;
    private trigger = 0;
    private limit = 1000;
    private tab = 'expenses';

    private userProfile: User;

    public stocksSavingRate = 0;
    public interestSavingRate = 0;
    public fullPension: Map<number, number>;
    public fullPlusPension: Map<number, number>;

    /**
     * This method assigns certain texts on initiation
     */
    ngOnInit(): void {
        this.confirmBtn = this.translate.instant('GENERAL.CONFIRM_BTN');
        this.introductionHdr = this.translate.instant('PLAYLIST.INTRODUCTION_HDR');
        this.introductionMsg = this.translate.instant('PLAYLIST.INTRODUCTION_MSG');
        this.doNotShowBtn = this.translate.instant('GENERAL.DO_NOT_SHOW_BTN');
        this.claimGraphLbl = this.translate.instant('PLAYLIST.CLAIM_GRAPH_LBL');
        this.expendituresLbl = this.translate.instant('GENERAL.EXPENSES_LBL');
        this.quantile95Lbl = this.translate.instant('PLAYLIST.95_QUANTILE_LBL');
        this.quantile90Lbl = this.translate.instant('PLAYLIST.90_QUANTILE_LBL');
        this.quantile80Lbl = this.translate.instant('PLAYLIST.80_QUANTILE_LBL');
        this.quantile50Lbl = this.translate.instant('PLAYLIST.50_QUANTILE_LBL');
        this.quantileLowerLbl = this.translate.instant('PLAYLIST.LOWER_QUANTILE_LBL');
        this.graphTitle = this.translate.instant('PLAYLIST.GRAPH_TITLE');
        this.fullPension = new Map();
        this.fullPension.set(95, 0);
        this.fullPension.set(90, 0);
        this.fullPension.set(80, 0);
        this.fullPension.set(50, 0);
        this.fullPlusPension = new Map();
        this.fullPlusPension.set(95, 0);
        this.fullPlusPension.set(90, 0);
        this.fullPlusPension.set(80, 0);
        this.fullPlusPension.set(50, 0);
    }

    async ionViewDidEnter() {
        const userId = await this.authService.getUserId();
        const suppressPlaylistIntroduction = localStorage.getItem('suppressPlaylistIntroduction');
        if (!suppressPlaylistIntroduction) {
            this.presentIntroductionPopup();
        }
        // const storage = new NativeStorage();
        // storage.getItem('suppressPlaylistIntroduction').catch(async error => {
        //     if (error.code === 2) {
        //         this.presentIntroductionPopup();
        //     } else {
        //         console.error(error);
        //         await this.pageUtils.unavailableAlert(error, userId);
        //     }
        // });

        this.profileService.getProfile(userId).then(
            async (userProfile: User) => {
                this.userProfile = userProfile;
                this.expenditures = this.userProfile.expenses === undefined ? 0 : this.userProfile.expenses;
                if (this.userProfile.age === undefined
                    || this.userProfile.gender === undefined
                    || this.userProfile.personal_status === undefined
                    || this.userProfile.zipcode === undefined) {
                    await this.pageUtils.showToast(this.translate.instant('ERROR.PROFIL_NOT_SUFFICIENT'));
                    await this.router.navigateByUrl(`tabs/${userId}/profile`);
                } else {
                    this.fullPension = await this.playlistService.getFullPension(await this.authService.getUserId());
                    this.fullPlusPension = this.fullPension;
                    this.barChart = this.getBarChart();
                    this.subscriptionId = this.screenOrientation.onChange().subscribe(async () => {
                        await this.createChart();
                    });
                }
            }
        );
    }

    async ionViewWillLeave() {
        this.subscriptionId.unsubscribe();
    }

    public setTab(tabName) {
        console.log('Segment changed', tabName);
        this.tab = tabName;
    }

    public getTab() {
        return this.tab;
    }

    private async suppressIntroductionHandler() {
        // const storage = new NativeStorage();
        // await storage.setItem('suppressPlaylistIntroduction', true);
        localStorage.setItem('suppressPlaylistIntroduction', String(true));
    }

    /**
     * This method sets off a trigger to reload the graph, initializing a lazy load feature
     */
    private setTrigger() {
        this.trigger++;
        const triggerClone = this.trigger;
        setTimeout(async () => {
            if (this.trigger === triggerClone) {
                await this.createChart();
                this.trigger = 0;
            }
        }, 500);
    }

    /**
     * This method allocates graphs to their respective spaces
     */
    private async createChart() {
        setTimeout(async () => {
            this.fullPlusPension = await this.playlistService.calcFullExpectedPension(
                await this.authService.getUserId(),
                this.stocksSavingRate,
                this.interestSavingRate
            );
            this.barChart = this.getBarChart();
        }, 500);
    }

    /**
     * This method creates the playlist graph
     */
    private getBarChart() {
        // Setting colors for the playlist graph
        const colorSub50 = 'rgb(239, 71, 58)';
        // const color50 = 'rgb(253, 130, 8)';
        // const color80 = 'rgb(255, 201, 3)';
        const color50 = 'rgb(255, 201, 3)';
        // const color90 = 'rgb(51, 205, 95)';
        // const color95 = 'rgb(0, 143, 0)';
        const color80 = 'rgb(51, 205, 95)';
        const color90 = 'rgb(0, 143, 0)';
        const colorExpenditures = 'rgb(0, 0, 0)';

        let difPension50 = this.fullPlusPension.get(50) - this.fullPlusPension.get(80);
        let difPension80 = this.fullPlusPension.get(80) - this.fullPlusPension.get(90);
        // let difPension90 = this.fullPlusPension.get(90) - this.fullPlusPension.get(95);

        const completeDif = this.fullPlusPension.get(90) /*+ difPension90*/ + difPension80 + difPension50;
        // chart should always go to end of diagram
        // set limit min. 500 greater than last region in chart
        this.limit = Math.ceil(completeDif / 500) * 500 + 500;
        // set limit to min. 500 greater than expenditure to have open end
        if (this.expenditures >= this.limit) {
            this.limit = Math.ceil(this.expenditures / 500) * 500 + 500;
        }
        // set limit to 1000s value if limit greater than 5000. Otherwise chart stops in the mid of the diagram
        if (this.limit > 5000) {
            this.limit = Math.ceil(this.limit / 1000) * 1000;
        }
        let difPensionSub50 = this.limit - completeDif;

        // Catching negativity error
        if (difPensionSub50 < 0) {
            difPensionSub50 = 0;
        }
        if (difPension50 < 0) {
            difPension50 = 0;
        }
        if (difPension80 < 0) {
            difPension80 = 0;
        }
        /* if (difPension90 < 0) {
            difPension90 = 0;
        }*/

        // Specifying the data
        const data = {
            labels: ['', this.claimGraphLbl, ''],
            datasets: [{
                label: this.expendituresLbl,
                data: [this.expenditures, this.expenditures, this.expenditures],
                borderColor: colorExpenditures,
                pointRadius: 0,
                steppedLine: 'middle',
                type: 'line' // Changes this dataset to become a line
            }, {
                label: this.quantile90Lbl,
                data: [0, this.fullPlusPension.get(90), 0],
                backgroundColor: color90
            }, {
                label: this.quantile80Lbl,
                data: [0, difPension80, 0],
                backgroundColor: color80
            }, {
                label: this.quantile50Lbl,
                data: [0, difPension50, 0],
                backgroundColor: color50
            }, {
                label: this.quantileLowerLbl,
                data: [0, difPensionSub50, 0],
                backgroundColor: colorSub50
            }]
        };

        // Specifying the options
        const options = {
            plugins: {
                datalabels: {
                    display: false
                }
            },
            events: [],
            hover: {mode: null},
            showTooltips: false,
            title: {
                display: true,
                text: this.graphTitle
            },
            legend: {
                display: true
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                enabled: false
            },
            scales: {
                xAxes: [{
                    stacked: true,
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            /*onAnimationComplete: function () {
                const ctx = PlaylistPage.barCanvas1.nativeElement;
                ctx.font = this.scale.font;
                ctx.fillStyle = this.scale.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.datasets.forEach(function (dataset) {
                    dataset.bars.forEach(function (bar) {
                        ctx.fillText(bar.value, bar.x, bar.y - 5);
                    });
                });
            }*/
        };

        return this.getChart(this.barCanvas.nativeElement, 'bar', data, options);
    }

    /**
     * This method creates new charts from the given parameters
     * @param context: The space to display the graph in
     * @param chartType: The type of the graph, e.g. 'bar'
     * @param data: The quantitative data that are meant to be displayed
     * @param options: The options that are to be considered
     */
    private getChart(context, chartType, data, options?) {
        return new Chart(context, {
            data,
            options,
            type: chartType
        });
    }

    /**
     * This method presents a popup introducing the user to the following process of supplying future data
     */
    private presentIntroductionPopup() {
        this.alertCtrl.create({
            header: this.introductionHdr,
            message: this.introductionMsg,
            buttons: [
                <AlertButton>{
                    text: this.confirmBtn
                },
                {
                    text: this.doNotShowBtn,
                    handler: this.suppressIntroductionHandler
                }
            ]
        }).then(alert => alert.present());
    }

    public absolute(number: number) {
        return Math.abs(number);
    }
}

