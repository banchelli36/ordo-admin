import {Component, ViewChild} from '@angular/core';
import {ProfileService} from '../../../service/profile.service';
import {User} from '../../../../api';
import {AuthenticationService} from '../../../service/authentication.service';
import {PlaylistService} from '../../../service/playlist.service';
import {TranslateService} from '@ngx-translate/core';
import {Chart} from 'chart.js';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import {CurrencyPipe} from '@angular/common';
import {PageUtilsService} from '../../../service/page-utils.service';


@Component({
    selector: 'app-gap',
    templateUrl: './gap.page.html',
    styleUrls: ['./gap.page.scss']
})
export class GapPage {

    @ViewChild('barCanvas') barCanvas;

    public profile: User;
    public pension: number;

    private shares = 0;
    private bonds = 0;
    public capitalPension: number;
    public insurancePension: number;

    constructor(
        private profileService: ProfileService,
        public authService: AuthenticationService,
        private playlistService: PlaylistService,
        public translate: TranslateService,
        private currencyPipe: CurrencyPipe,
        public pageUtils: PageUtilsService) {
    }

    async ionViewDidEnter() {
        const userId = await this.authService.getUserId();
        await this.getProfile(userId);
        await this.getInsurances(userId);
        setTimeout(async () => {
            this.createBarChart();
        }, 500);
    }

    public absolute(number: number) {
        return Math.abs(number);
    }

    public async getProfile(userId: number) {
        this.profile = await this.profileService.getProfile(userId);
    }


    public async getInsurances(userId: number) {
        const assets = await this.playlistService.getAssets(userId);
        await this.setPension(userId);
        const result = await this.playlistService.getShareBondPlan(userId, assets);
        this.shares = result[0];
        this.bonds = result[1];
    }


    /**
     * This method sets the constellation of the assetsArray to know what to display
     *
     */
    private async setPension(userId: number) {
        this.pension = (await this.playlistService.getFullPension(userId)).get(80);
        this.capitalPension = (await this.playlistService.getCapitalPension(userId)).get(80);
        this.insurancePension = (await this.playlistService.getInsurancePension(userId)).get(80);
    }

    /**
     * This method creates the playlist graph
     */
    public createBarChart() {
        // Setting colors for the playlist graph
        const colorShares = 'rgb(0, 112, 192)';
        const colorBonds = 'rgb(112, 48, 160)';

        let data = {};
        // Specifying the data
        data = {
            labels: ['Mon. Investition'],
            datasets: [
                {
                    data: [this.shares],
                    backgroundColor: [colorShares],
                    label: this.translate.instant('GAP.SHARE_TEXT')
                },
                {
                    data: [this.bonds],
                    backgroundColor: [colorBonds],
                    label: this.translate.instant('GAP.BONDS_TEXT')
                }
            ]
        };

        // Specifying the options
        const options = {
            plugins: {
                datalabels: {
                    display: true,
                    color: '#ffffff',
                    formatter: (value, context) => {
                        return this.currencyPipe.transform(value, 'EUR');
                    }
                }
            },
            title: {
                display: false
            },
            legend: {
                display: true
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, data1) => {
                        let label = data1.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += this.currencyPipe.transform(tooltipItem.xLabel, 'EUR');
                        return label;
                    }
                }
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: true
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [
                    {
                        display: false,
                        gridLines: {
                            display: true
                        }
                    }
                ]
            }
        };
        const chart = new Chart(this.barCanvas.nativeElement, <Chart.ChartConfiguration>{
            plugins: [ChartDataLabels],
            data: data,
            options: options,
            type: 'horizontalBar'
        });
    }
}
