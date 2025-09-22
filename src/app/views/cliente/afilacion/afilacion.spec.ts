import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Afilacion } from './afilacion';

describe('Afilacion', () => {
  let component: Afilacion;
  let fixture: ComponentFixture<Afilacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Afilacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Afilacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
