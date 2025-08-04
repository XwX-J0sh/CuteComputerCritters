import { TestBed } from '@angular/core/testing';

import { CritterService } from './critter.service';

describe('CritterService', () => {
  let service: CritterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CritterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
