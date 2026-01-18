import { Component } from '@angular/core';
import { Getasset } from '../../serveis/getasset/getasset';

@Component({
  selector: 'app-index',
  imports: [],
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index {

constructor(private getasset: Getasset){}  

  public cgetpath(path: string){
    return this.getasset.getpath(path);
  }

}
