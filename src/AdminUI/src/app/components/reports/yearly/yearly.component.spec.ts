import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YearlyComponent } from './yearly.component';

describe('YearlyComponent', () => {
  let component: YearlyComponent;
  let fixture: ComponentFixture<YearlyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [YearlyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YearlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
