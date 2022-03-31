import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LandingPagesComponent } from './landing-pages.component';

describe('LandingPagesComponent', () => {
  let component: LandingPagesComponent;
  let fixture: ComponentFixture<LandingPagesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LandingPagesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
