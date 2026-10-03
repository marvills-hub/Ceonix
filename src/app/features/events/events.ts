import{Component,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
@Component({
selector:'app-events',
imports:[FormsModule],
template:`
<div class="feature-head"><div><h1>Events</h1><p>Company activities, meetings and celebrations.</p></div><button (click)="show.set(true)">+ Create Event</button></div>
<div class="events">
@for(e of events();track e.id){
<div class="event"><div class="date"><strong>{{day(e.starts_at)}}</strong><span>{{month(e.starts_at)}}</span></div><div class="details"><h3>{{e.title}}</h3><p>{{e.description}}</p><span>? {{format(e.starts_at)}} · ? {{e.location||'No location'}}</span></div><b>Upcoming</b></div>
}
</div>
@if(show()){<div class="overlay" (click)="show.set(false)"><form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="create()"><h2>Create Event</h2><label>Title<input [(ngModel)]="title" name="title"></label><label>Description<textarea [(ngModel)]="description" name="description"></textarea></label><label>Location<input [(ngModel)]="location" name="location"></label><label>Date & time<input [(ngModel)]="startsAt" name="startsAt" type="datetime-local"></label><div><button type="button" class="cancel" (click)="show.set(false)">Cancel</button><button>Create Event</button></div></form></div>}
`,
styleUrl:'../shared-page.scss'
})
export class Events implements OnInit{
api=inject(ApiService);events=signal<any[]>([]);show=signal(false);title='';description='';location='';startsAt='';
async ngOnInit(){await this.load()}async load(){this.events.set(await this.api.events())}
day(v:string){return new Date(v+'Z').getDate().toString().padStart(2,'0')}month(v:string){return new Date(v+'Z').toLocaleString('en',{month:'short'}).toUpperCase()}format(v:string){return new Date(v+'Z').toLocaleString()}
async create(){if(!this.title||!this.startsAt)return;await this.api.createEvent({title:this.title,description:this.description,location:this.location,startsAt:this.startsAt});this.title=this.description=this.location=this.startsAt='';this.show.set(false);await this.load()}
}
