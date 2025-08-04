import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewCrittersComponent } from './overview-critters.component';

describe('OverviewCrittersComponent', () => {
  let component: OverviewCrittersComponent;
  let fixture: ComponentFixture<OverviewCrittersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewCrittersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewCrittersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
