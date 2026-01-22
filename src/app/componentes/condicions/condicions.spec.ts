import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Condicions } from './condicions';

describe('Condicions', () => {
  let component: Condicions;
  let fixture: ComponentFixture<Condicions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Condicions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Condicions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
