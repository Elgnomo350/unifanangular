import { Component } from '@angular/core';
import { Getroute } from '../../serveis/getroute/getroute';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cistella',
  imports: [RouterLink],
  templateUrl: './cistella.html',
  styleUrl: './cistella.css',
})
export class Cistella {

    constructor(private getroute: Getroute){
    }
  
    public cgetroute(path: string){
      return this.getroute.getroute(path);
    }
  

}
