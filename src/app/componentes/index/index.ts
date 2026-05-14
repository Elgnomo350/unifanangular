import { Component, OnInit } from '@angular/core';
import { Getasset } from '../../serveis/getasset/getasset';
import { RouterLink } from "@angular/router";
import { Getroute } from '../../serveis/getroute/getroute';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-index',
  imports: [RouterLink],
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index  implements OnInit{

  private ultimPost: RedditPost = {
    title: "",
    author: "",
    created: "",
    content: "",
    images: [""],
  }


constructor(private getasset: Getasset, private getroute: Getroute, private httpclient: HttpClient, private cdr: ChangeDetectorRef){}  

ngOnInit(): void {
  this.getAPIPost()
}

public getAPIPost(){
    this.httpclient.get<any>("https://www.reddit.com/r/animenews/new.json?limit=1").subscribe(res => {
    const postData = res.data.children[0].data;

    const fecha = new Date(postData.created_utc * 1000);
    const opcionesFecha: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
    };

    this.ultimPost = {
    title: postData.title,
    author: postData.author,
    created: fecha.toLocaleString('es-ES', opcionesFecha),
    content: postData.selftext || "",
    images: postData.preview?.images?.map((img: any) =>
      img.source.url.replace(/&amp;/g, "&")
    ) || []
    };
    this.cdr.detectChanges();
  });
  }

  public cgetpath(path: string){
    return this.getasset.getpath(path);
  }

  public cgetroute(path: string){
    return this.getroute.getroute(path);
  }

  public getPost(){
    return this.ultimPost
  }
}

export interface RedditPost {
  title: string;
  author: string;
  created: string;
  content: string;
  images: string[];
}