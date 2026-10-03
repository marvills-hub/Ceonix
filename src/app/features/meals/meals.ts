import{Component,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
import{Icon}from'../../shared/icon';
@Component({
selector:'app-meals',
imports:[FormsModule,Icon],
template:`
<div class="head"><div><h1>Meals</h1><p>Decide together what CEOSI is having for lunch.</p></div><button (click)="showSuggest.set(true)"><app-icon name="plus"/>Suggest Meal</button></div>
<div class="meal-grid">
<section class="card voting">
<div class="card-head"><div><span class="eyebrow">TODAY'S LUNCH</span><h2>What should we eat today?</h2><p>Voting closes at 11:00 AM <i class="dot"></i> {{totalVotes}} votes</p></div><span class="open"><i></i>Voting Open</span></div>
@if(loading()){<div class="loading">Loading today's choices...</div>}
@for(meal of meals();track meal.id){
<div class="meal">
<div class="emoji">{{meal.emoji}}</div>
<div class="meal-data"><div><strong>{{meal.name}}</strong><span>{{meal.votes}} votes · {{percent(meal.votes)}}%</span></div><div class="bar"><i [style.width.%]="percent(meal.votes)"></i></div></div>
<button (click)="vote(meal)" [disabled]="voting()===meal.id">{{voting()===meal.id?'Voting...':'Vote'}}</button>
</div>
}
</section>
<aside>
<div class="card winner">
<span class="winner-icon"><app-icon name="trophy"/></span><small>CURRENT LEADER</small>
@if(leader){<h2>{{leader.name}}</h2><p>{{leader.votes}} votes so far</p>}
@else{<h2>No votes yet</h2>}
</div>
<div class="card info"><h3>How meal voting works</h3><p>Choose the meal you prefer for today's lunch. Votes are stored in Ceonix and shared with the team.</p></div>
</aside>
</div>
<section class="card history"><div class="card-head"><div><h2>Meal Decisions</h2><p>Today's choices are now stored in Ceonix D1.</p></div></div>
<div class="history-grid">
<div><span class="history-icon blue"><app-icon name="database"/></span><strong>Persistent Voting</strong><small>Stored in Cloudflare D1</small></div>
<div><span class="history-icon green"><app-icon name="team"/></span><strong>Team Decisions</strong><small>Shared across Ceonix</small></div>
<div><span class="history-icon purple"><app-icon name="activity"/></span><strong>Live Totals</strong><small>Reloaded after each vote</small></div>
<div><span class="history-icon pink"><app-icon name="plus"/></span><strong>Suggestions</strong><small>Add choices anytime</small></div>
</div>
</section>
@if(showSuggest()){
<div class="overlay" (click)="showSuggest.set(false)">
<form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="addMeal()">
<h2>Suggest a Meal</h2><p>Add another choice for today's lunch vote.</p>
<label>Meal name<input [(ngModel)]="mealName" name="mealName" placeholder="e.g. Adobo"></label>
<label>Emoji<input [(ngModel)]="mealEmoji" name="mealEmoji" placeholder="🍽️"></label>
<div><button type="button" class="cancel" (click)="showSuggest.set(false)">Cancel</button><button [disabled]="saving()">{{saving()?'Adding...':'Add Suggestion'}}</button></div>
</form>
</div>
}
`,
styleUrl:'./meals.scss'
})
export class Meals implements OnInit{
api=inject(ApiService);
meals=signal<any[]>([]);
loading=signal(true);
voting=signal<number|null>(null);
saving=signal(false);
showSuggest=signal(false);
mealName='';
mealEmoji='🍽️';
async ngOnInit(){await this.load()}
async load(){
this.loading.set(true);
try{this.meals.set(await this.api.meals())}
catch(e){console.error(e);this.meals.set([])}
finally{this.loading.set(false)}
}
get totalVotes(){return this.meals().reduce((n,m)=>n+Number(m.votes||0),0)}
get leader(){return [...this.meals()].sort((a,b)=>Number(b.votes)-Number(a.votes))[0]}
percent(v:number){return this.totalVotes?Math.round(Number(v)/this.totalVotes*100):0}
async vote(meal:any){
this.voting.set(meal.id);
try{await this.api.voteMeal(meal.id);await this.load()}
catch(e:any){alert(e?.error?.error||'You may have already voted for this meal.')}
finally{this.voting.set(null)}
}
async addMeal(){
if(!this.mealName.trim()||this.saving())return;
this.saving.set(true);
try{
await this.api.addMeal(this.mealName.trim(),this.mealEmoji||'🍽️');
this.mealName='';
this.mealEmoji='🍽️';
this.showSuggest.set(false);
await this.load();
}catch(e){console.error(e)}
finally{this.saving.set(false)}
}
}
