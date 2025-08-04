import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CritterStatsComponent } from './critter-stats.component';

describe('CritterStatsComponent', () => {
  let component: CritterStatsComponent;
  let fixture: ComponentFixture<CritterStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CritterStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CritterStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
