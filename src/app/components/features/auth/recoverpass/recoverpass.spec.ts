import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recoverpass } from './recoverpass';

describe('Recoverpass', () => {
  let component: Recoverpass;
  let fixture: ComponentFixture<Recoverpass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recoverpass]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recoverpass);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
