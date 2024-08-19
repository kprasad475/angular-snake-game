import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SnakeComponent } from './snake/snake.component';

const routes: Routes = [{path:'',component:SnakeComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
