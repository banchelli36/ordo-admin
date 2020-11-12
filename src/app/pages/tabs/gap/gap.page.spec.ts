import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GapPage} from './gap.page';

describe('GapPage', () => {
    let component: GapPage;
    let fixture: ComponentFixture<GapPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GapPage],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GapPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
