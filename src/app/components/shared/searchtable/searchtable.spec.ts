import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Searchtable } from './searchtable';

describe('Searchtable', () => {
  let component: Searchtable;
  let fixture: ComponentFixture<Searchtable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Searchtable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Searchtable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
