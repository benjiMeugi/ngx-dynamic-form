import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-ngx-hello-text',
  imports: [],
  template: `
    <p>
      {{ text }}
    </p>
  `,
  styles: ``
})
export class NgxHelloTextComponent {
  @Input() text: string = 'Texte par défaut';
}
