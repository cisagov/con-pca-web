import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LandingPagesManagerComponent } from './landing-pages-manager.component';

describe('LandingPagesManagerComponent', () => {
  let component: LandingPagesManagerComponent;
  let fixture: ComponentFixture<LandingPagesManagerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingPagesManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPagesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
