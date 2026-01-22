import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppPaths } from '../../app-paths';

@Injectable({
  providedIn: 'root',
})
export class Getroute {
  
  constructor(private router: Router) {}
  
  public getroute(key: keyof typeof AppPaths) {
    return AppPaths[key];
  }
}
