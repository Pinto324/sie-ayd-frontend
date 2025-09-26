import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Guiadetalle } from './guiadetalle';

describe('Guiadetalle', () => {
  let component: Guiadetalle;
  let fixture: ComponentFixture<Guiadetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guiadetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Guiadetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
