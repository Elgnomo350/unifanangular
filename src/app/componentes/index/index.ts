import { Component } from '@angular/core';
import { Getasset } from '../../serveis/getasset/getasset';
import { RouterLink } from "@angular/router";
import { Getroute } from '../../serveis/getroute/getroute';

@Component({
  selector: 'app-index',
  imports: [RouterLink],
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index {

constructor(private getasset: Getasset, private getroute: Getroute){}  

  public cgetpath(path: string){
    return this.getasset.getpath(path);
  }

  public cgetroute(path: string){
    return this.getroute.getroute(path);
  }

}
