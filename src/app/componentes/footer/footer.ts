import { ChangeDetectorRef, Component } from '@angular/core';
import { Getroute } from '../../serveis/getroute/getroute';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { Ia, ChatMessage } from '../../serveis/ia/ia';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  private veureChat: boolean = false;
  private mensajeChatbot: string = "";

  private chatMensajes: ChatMessage[] = [
    { text: 'Hola 👋 ¿En qué puedo ayudarte?', enviatPer: 'ai' }
  ];

  constructor(private getroute: Getroute, private ia: Ia, private cdr: ChangeDetectorRef){}

  public cgetroute(path: string){
    return this.getroute.getroute(path);
  }

  public getVChat(){
    return this.veureChat
  }

  public setVChat(bool: boolean){
    this.veureChat = bool;
  }

  public getChatMensajes(){
    return this.chatMensajes
  }

  public get MsjChatbot() : string {
    return this.mensajeChatbot
  }
  
  public set MsjChatbot(v : string) {
    this.mensajeChatbot = v;
  }

  public async enviarChatbot(){
  const btn = document.getElementById("enviarChatbot") as HTMLButtonElement;
  const enviarEnter = document.getElementById("enviarChatbotEnter") as HTMLInputElement;
  
  const esperarRespuestaLoop = [
    "Espera un minuto mientras pienso la respuesta",
    "Espera un minuto mientras pienso la respuesta.",
    "Espera un minuto mientras pienso la respuesta..",
    "Espera un minuto mientras pienso la respuesta..."
  ]
  let indexEsperarRespuesta = esperarRespuestaLoop.length - 1

  this.chatMensajes.push({text: this.mensajeChatbot, enviatPer: 'user'});
  this.chatMensajes.push({text: esperarRespuestaLoop[indexEsperarRespuesta], enviatPer: 'ai'});

    if (this.mensajeChatbot.trim() != "") {
      btn.disabled = true
      enviarEnter.disabled = true
      const consulta = this.mensajeChatbot
      this.mensajeChatbot = ""

      const intervalo = setInterval(() => {
          indexEsperarRespuesta = indexEsperarRespuesta === esperarRespuestaLoop.length - 1 ? 
          0 : indexEsperarRespuesta + 1

          this.chatMensajes[this.chatMensajes.length-1].text = esperarRespuestaLoop[indexEsperarRespuesta]
          this.cdr.detectChanges()
      }, 500)

      this.ia.enviarChatbot(consulta, this.chatMensajes.slice(0, -1)).subscribe({
        next: async (res) => {
          clearInterval(intervalo)

          this.chatMensajes.pop()
          this.chatMensajes.push({text: "", enviatPer: 'ai'})

          for (let index = 0; index < res.respuesta.length; index++) {
              await new Promise(resolve => setTimeout(resolve, 30));

              this.chatMensajes[this.chatMensajes.length-1].text = 
              this.chatMensajes[this.chatMensajes.length-1].text + res.respuesta.charAt(index)  
              this.cdr.detectChanges()
          }

          btn.disabled = false
          enviarEnter.disabled = false
          this.cdr.detectChanges()
        },
        error: (err) => {
          clearInterval(intervalo)
          this.chatMensajes.pop()
          this.chatMensajes.push({text: "Lo siento, he tenido un error: " + err.error.message, enviatPer: 'ai'})
          btn.disabled = false
          enviarEnter.disabled = false
          this.cdr.detectChanges()
        }
      })
    }
  }
}


