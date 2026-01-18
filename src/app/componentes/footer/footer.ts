import { Component } from '@angular/core';
import { Getroute } from '../../serveis/getroute/getroute';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  constructor(private getroute: Getroute){
  }

  public cgetroute(path: string){
    return this.getroute.getroute(path);
  }
}
