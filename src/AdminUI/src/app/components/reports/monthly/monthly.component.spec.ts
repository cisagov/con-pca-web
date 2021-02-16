import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonthlyComponent } from './monthly.component';

describe('MonthlyComponent', () => {
  let component: MonthlyComponent;
  let fixture: ComponentFixture<MonthlyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
