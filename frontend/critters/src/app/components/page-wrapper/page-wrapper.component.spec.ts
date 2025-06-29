import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageWrapperComponent } from './page-wrapper.component';

describe('PageWrapperComponent', () => {
  let component: PageWrapperComponent;
  let fixture: ComponentFixture<PageWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
