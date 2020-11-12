import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DataProtectionPage} from './data-protection.page';

describe('DataProtectionPage', () => {
    let component: DataProtectionPage;
    let fixture: ComponentFixture<DataProtectionPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataProtectionPage],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataProtectionPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
