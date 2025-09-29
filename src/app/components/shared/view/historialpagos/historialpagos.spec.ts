import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Historialpagos } from './historialpagos';

describe('Historialpagos', () => {
  let component: Historialpagos;
  let fixture: ComponentFixture<Historialpagos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Historialpagos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Historialpagos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
