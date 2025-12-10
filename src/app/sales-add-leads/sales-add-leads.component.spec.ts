import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAddLeadsComponent } from './sales-add-leads.component';

describe('SalesAddLeadsComponent', () => {
  let component: SalesAddLeadsComponent;
  let fixture: ComponentFixture<SalesAddLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAddLeadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAddLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
