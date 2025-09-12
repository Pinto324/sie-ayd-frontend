import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Changepass } from './changepass';

describe('Changepass', () => {
  let component: Changepass;
  let fixture: ComponentFixture<Changepass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Changepass]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Changepass);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
