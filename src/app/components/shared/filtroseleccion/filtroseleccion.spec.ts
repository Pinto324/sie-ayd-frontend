import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Filtroseleccion } from './filtroseleccion';

describe('Filtroseleccion', () => {
  let component: Filtroseleccion;
  let fixture: ComponentFixture<Filtroseleccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Filtroseleccion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Filtroseleccion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
