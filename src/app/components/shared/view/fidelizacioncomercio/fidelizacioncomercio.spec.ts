import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fidelizacioncomercio } from './fidelizacioncomercio';

describe('Fidelizacioncomercio', () => {
  let component: Fidelizacioncomercio;
  let fixture: ComponentFixture<Fidelizacioncomercio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fidelizacioncomercio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fidelizacioncomercio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
