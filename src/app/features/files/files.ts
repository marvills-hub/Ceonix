import{Component,inject,OnInit,signal}from'@angular/core';
import{ApiService}from'../../core/services/api.service';
@Component({
selector:'app-files',
template:`
<div class="files-head">
<div><h1>Files</h1><p>Internal CEOSI documents and shared files.</p></div>
<label class="upload">+ Upload File<input type="file" (change)="upload($event)"></label>
</div>

<div class="file-stats">
<div><span>Files</span><strong>{{files().length}}</strong></div>
<div><span>Storage Used</span><strong>{{totalSize}}</strong></div>
<div><span>Latest Upload</span><strong>{{files()[0]?.name||'None'}}</strong></div>
</div>

<div class="toolbar">
<input [value]="search()" (input)="search.set($any($event.target).value)" placeholder="Search files...">
<span>{{filtered.length}} files</span>
</div>

<div class="file-table">
<div class="row header"><span>Name</span><span>Uploaded by</span><span>Size</span><span>Date</span><span></span></div>
@for(f of filtered;track f.id){
<div class="row">
<div class="file-name"><div class="file-icon">{{icon(f.mime_type)}}</div><div><strong>{{f.name}}</strong><small>{{f.mime_type}}</small></div></div>
<span>{{f.uploader}}</span>
<span>{{size(f.size)}}</span>
<span>{{date(f.created_at)}}</span>
<div class="actions"><a [href]="api.downloadUrl(f.id)">?</a><button (click)="remove(f)">×</button></div>
</div>
}
@if(!filtered.length&&!loading()){<div class="empty">No files found.</div>}
@if(loading()){<div class="empty">Loading files...</div>}
</div>

@if(uploading()){
<div class="uploading"><span>Uploading file...</span></div>
}
`,
styleUrl:'./files.scss'
})
export class Files implements OnInit{
api=inject(ApiService);
files=signal<any[]>([]);
search=signal('');
loading=signal(true);
uploading=signal(false);
async ngOnInit(){await this.load()}
async load(){
this.loading.set(true);
try{this.files.set(await this.api.files())}
finally{this.loading.set(false)}
}
get filtered(){
const q=this.search().toLowerCase();
return this.files().filter(f=>f.name.toLowerCase().includes(q)||f.uploader.toLowerCase().includes(q));
}
get totalSize(){return this.size(this.files().reduce((n,f)=>n+Number(f.size),0))}
size(n:number){
if(n<1024)return n+' B';
if(n<1048576)return(n/1024).toFixed(1)+' KB';
return(n/1048576).toFixed(1)+' MB';
}
date(v:string){return new Date(v+'Z').toLocaleString()}
icon(type:string){
if(type?.includes('image'))return'?';
if(type?.includes('pdf'))return'PDF';
if(type?.includes('sheet')||type?.includes('excel'))return'X';
if(type?.includes('word'))return'W';
return'?';
}
async upload(event:Event){
const input=event.target as HTMLInputElement;
const file=input.files?.[0];
if(!file)return;
this.uploading.set(true);
try{await this.api.uploadFile(file);await this.load()}
catch(e:any){alert(e?.error?.error||'Upload failed')}
finally{this.uploading.set(false);input.value=''}
}
async remove(f:any){
if(!confirm(`Delete ${f.name}?`))return;
await this.api.deleteFile(f.id);
await this.load();
}
}
