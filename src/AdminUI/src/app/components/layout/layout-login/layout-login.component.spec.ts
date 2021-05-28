import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutLoginComponent } from './layout-login.component';

describe('LayoutLoginComponent', () => {
  let component: LayoutLoginComponent;
  let fixture: ComponentFixture<LayoutLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutLoginComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
