import{Component,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
import{AuthService}from'../../core/services/auth.service';
@Component({
selector:'app-settings',
imports:[FormsModule],
template:`
<div class="feature-head"><div><h1>Settings</h1><p>Configure your Ceonix experience.</p></div></div>
<div class="settings-card"><h2>Notifications</h2>
<label><div><strong>Email notifications</strong><span>Receive important updates by email</span></div><input type="checkbox" [(ngModel)]="settings.email_notifications"></label>
<label><div><strong>Chat notifications</strong><span>New messages and mentions</span></div><input type="checkbox" [(ngModel)]="settings.chat_notifications"></label>
<label><div><strong>Meal reminders</strong><span>Remind me when meal voting opens</span></div><input type="checkbox" [(ngModel)]="settings.meal_notifications"></label>
<label><div><strong>Poll reminders</strong><span>Notify me about new polls</span></div><input type="checkbox" [(ngModel)]="settings.poll_notifications"></label>
<button class="primary" (click)="save()">{{saved()?'Saved ?':'Save Settings'}}</button></div>
<div class="settings-card"><h2>Account</h2><p>Signed in as <strong>{{auth.user()?.email}}</strong></p><button class="danger" (click)="auth.logout()">Sign Out</button></div>
`,
styleUrl:'../shared-page.scss'
})
export class Settings implements OnInit{
api=inject(ApiService);auth=inject(AuthService);saved=signal(false);
settings:any={email_notifications:true,chat_notifications:true,meal_notifications:true,poll_notifications:true,compact_mode:false};
async ngOnInit(){const s=await this.api.settings();if(s)this.settings={...s,email_notifications:!!s.email_notifications,chat_notifications:!!s.chat_notifications,meal_notifications:!!s.meal_notifications,poll_notifications:!!s.poll_notifications,compact_mode:!!s.compact_mode}}
async save(){await this.api.saveSettings(this.settings);this.saved.set(true);setTimeout(()=>this.saved.set(false),1500)}
}
