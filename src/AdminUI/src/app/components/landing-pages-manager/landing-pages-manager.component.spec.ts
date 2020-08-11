import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPagesManagerComponent } from './landing-pages-manager.component';

describe('LandingPagesManagerComponent', () => {
  let component: LandingPagesManagerComponent;
  let fixture: ComponentFixture<LandingPagesManagerComponent>;

  beforeEach(async(() => {
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
