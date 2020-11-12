import {Component} from '@angular/core';
import {Asset} from '../../../../../api';
import {PageUtilsService} from '../../../../service/page-utils.service';
import {AlertController, ModalController} from '@ionic/angular';
import {AddComponent} from '../add/add.component';
import {InstructionComponent} from '../instruction/instruction.component';
// import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {AlertButton, AlertInput, AlertOptions} from '@ionic/core';
import {TranslateService} from '@ngx-translate/core';
import TypeEnum = Asset.TypeEnum;

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent {

    userId: number;
    terms: string;
    insurances: Asset[] = [
        {name: 'Deutsche Rentenversicherung', type: TypeEnum.Gesetzliche, additional: {}},
        {name: '', type: TypeEnum.Betriebliche},
        {name: '', type: TypeEnum.Riester, additional: {}},
        {name: '', type: TypeEnum.Sonstige}
    ];

    private suppressInstruction = false;

    constructor(private utils: PageUtilsService,
                public modalCtrl: ModalController,
                public alertCtrl: AlertController,
                private translate: TranslateService,
                // private storage: NativeStorage,
                private pageUtils: PageUtilsService) {
    }

    /**
     * This method proceeds the user to take a complete photo of the insurance selected
     * @param insurance: the insurance selected
     */
    async addInsurance(insurance: Asset, subHeader = '') {
        console.log(insurance);
        const alert = await this.alertCtrl.create(<AlertOptions>{
            header: this.translate.instant('SEARCH.ALERT_HDR', {insuranceType: insurance.type}),
            message: this.translate.instant('SEARCH.ALERT_MSG', {optional: subHeader}),
            backdropDismiss: false,
            inputs: <AlertInput[]>[
                {
                    name: 'insuranceName',
                    value: insurance.name,
                    type: 'text',
                    placeholder: this.translate.instant('SEARCH.ALERT_INPUT_PLC')
                }
            ],
            buttons: <AlertButton[]>[
                {
                    text: this.translate.instant('GENERAL.CANCEL_BTN'),
                    role: 'cancel'
                },
                {
                    text: this.translate.instant('GENERAL.CONFIRM_BTN'),
                    handler: async (data) => {
                        if (data.insuranceName !== '') {
                            insurance.name = data.insuranceName;
                            const suppressInstruction = localStorage.getItem('suppressInstruction');
                            if (suppressInstruction) {
                                this.addPage(insurance);
                            } else {
                                this.showInstructions(() => this.addPage(insurance), insurance.type);
                            }

                            // this.storage.getItem('suppressInstruction')
                            //     .then((suppress: boolean) => {
                            //         if (suppress) {
                            //             this.addPage(insurance);
                            //         } else {
                            //             this.showInstructions(() => this.addPage(insurance), insurance.type);
                            //         }
                            //     }).catch(async error1 => {
                            //     if (error1.code === 2) {
                            //         this.showInstructions(() => this.addPage(insurance), insurance.type);
                            //     } else {
                            //         console.error(error1);
                            //         await this.pageUtils.unavailableAlert(error1, this.userId);
                            //     }
                            // });
                        } else {
                            this.addInsurance(
                                insurance,
                                `<p style="color: red">${this.translate.instant('SEARCH.ALERT_NO_NAME')}</p>`);
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    async addPage(insurance: Asset) {
        const modal = await this.modalCtrl.create({
            component: AddComponent,
            componentProps: {
                userId: this.userId,
                insuranceType: insurance.type,
                insuranceName: insurance.name
            }
        });
        await modal.present();
    }

    /**
     * This method displays the instructions on what to do
     * @param callback -
     */
    async showInstructions(callback, insuranceType: TypeEnum) {
        console.log('Show instructions.');
        let instructionText = '';
        switch (insuranceType) {
            case 'Gesetzliche':
                instructionText = await this.translate.instant('INSTRUCTION.TEXT', {
                    instrParam: this.translate.instant('INSTRUCTION.MUTUAL_INSURANCE')
                });
                break;
            case 'Betriebliche':
                instructionText = await this.translate.instant('INSTRUCTION.FIRM_INSURANCE');
                break;
            case 'Riester':
                instructionText = await this.translate.instant('INSTRUCTION.TEXT', {
                    instrParam: this.translate.instant('INSTRUCTION.PRIVATE_INSURANCE')
                });
                break;
            case 'Sonstige':
                instructionText = await this.translate.instant('INSTRUCTION.OTHER_INSURANCE');
                break;
        }
        console.log(instructionText);
        const modal = await this.modalCtrl.create({
            component: InstructionComponent,
            componentProps: {
                instructionText: instructionText
            }
        });
        modal.onDidDismiss().then(callback);
        await modal.present();
    }

    private getLabelForType(type: TypeEnum) {
        switch (type) {
            case TypeEnum.Gesetzliche:
                return this.translate.instant('GENERAL.STATUORY_PENSION_LBL');
            case 'Betriebliche':
                return this.translate.instant('GENERAL.OCCUPATIONAL_PENSION_LBL');
            case 'Riester':
                return this.translate.instant('GENERAL.PRIVATE_PENSION_LBL');
            case 'Sonstige':
                return this.translate.instant('GENERAL.MISCELLANEOUS_PENSION_LBL');
        }
    }
}
