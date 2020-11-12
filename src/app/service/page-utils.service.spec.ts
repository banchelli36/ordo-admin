import { TestBed } from '@angular/core/testing';

import { PageUtilsService } from './page-utils.service';

describe('PageUtilsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PageUtilsService = TestBed.get(PageUtilsService);
    expect(service).toBeTruthy();
  });
});
