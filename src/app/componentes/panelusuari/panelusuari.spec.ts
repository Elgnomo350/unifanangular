import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Panelusuari } from './panelusuari';

describe('Panelusuari', () => {
  let component: Panelusuari;
  let fixture: ComponentFixture<Panelusuari>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Panelusuari]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Panelusuari);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
