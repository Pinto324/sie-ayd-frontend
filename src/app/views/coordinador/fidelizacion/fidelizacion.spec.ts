import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fidelizacion } from './fidelizacion';

describe('Fidelizacion', () => {
  let component: Fidelizacion;
  let fixture: ComponentFixture<Fidelizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fidelizacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fidelizacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
