import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class Getasset {

public getpath(path: string): string | null {
  return `/${path}`;
}
}
