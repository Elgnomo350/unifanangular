import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Confirmarcambiocorreo } from './confirmarcambiocorreo';

describe('Confirmarcambiocorreo', () => {
  let component: Confirmarcambiocorreo;
  let fixture: ComponentFixture<Confirmarcambiocorreo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Confirmarcambiocorreo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Confirmarcambiocorreo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
