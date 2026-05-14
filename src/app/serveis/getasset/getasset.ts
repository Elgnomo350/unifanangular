import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class Getasset {

constructor(private httpclient: HttpClient){}

public getpath(path: string) {
  return "http://localhost:23000/demanarimagen?img=" + path;
}

}
