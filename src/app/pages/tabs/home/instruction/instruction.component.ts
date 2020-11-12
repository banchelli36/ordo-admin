import {Component} from '@angular/core';
// import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {ModalController} from '@ionic/angular';
import {PageUtilsService} from '../../../../service/page-utils.service';

@Component({
    selector: 'app-instruction',
    templateUrl: './instruction.component.html',
    styleUrls: ['./instruction.component.scss'],
})
export class InstructionComponent {

    public instruction: boolean;
    public instructionText: string;

    constructor(
                // private storage: NativeStorage,
                public modalCtrl: ModalController,
                private pageUtils: PageUtilsService) {
        const suppressInstruction = Boolean(localStorage.getItem('suppressInstruction'));
        if (suppressInstruction) {
            this.instruction = suppressInstruction;
        } else {
            this.instruction = false;
        }
        // this.storage.getItem('suppressInstruction')
        //     .then((suppress: boolean) => this.instruction = suppress)
        //     .catch(async error => {
        //         if (error.code === 2) {
        //             this.instruction = false;
        //         } else {
        //             console.error(error);
        //             await this.pageUtils.unavailableAlert(error);
        //         }
        //     });
    }

    /**
     * This method allows the user to suppress the instruction popup for future use
     */
    suppressInstruction() {
        // this.storage.setItem('suppressInstruction', this.instruction);
        localStorage.setItem('suppressInstruction', String(this.instruction));
    }

}
