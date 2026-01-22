import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cistella } from './cistella';

describe('Cistella', () => {
  let component: Cistella;
  let fixture: ComponentFixture<Cistella>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cistella]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cistella);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
