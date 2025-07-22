import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tweet-box',
  imports: [CommonModule, FormsModule],
  templateUrl: './tweet-box.component.html',
  styleUrl: './tweet-box.component.scss',
})
export class TweetBoxComponent {
  name: string = '';
  content: string = '';
  imgurl: string = '';

  handleSubmit(): void {
    const tweet = {
      name: this.name,
      content: this.content,
      imgurl: this.imgurl,
      tid: 'id',
    };
    console.log('Nuevo tweet:', tweet);

    this.name = '';
    this.content = '';
    this.imgurl = '';
  }
}
