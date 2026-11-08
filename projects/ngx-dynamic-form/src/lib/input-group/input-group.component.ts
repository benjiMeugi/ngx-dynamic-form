import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'lib-input-group',
  standalone: true,
  imports: [],
  templateUrl: './input-group.component.html',
  styleUrl: './input-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupComponent {
  @Input() prefix?: string;
  @Input() suffix?: string;

  get radiusClasses(): string {
    return [
      this.prefix ? '[&_input]:rounded-l-none [&_input]:border-l-0' : '',
      this.suffix ? '[&_input]:rounded-r-none [&_input]:border-r-0' : '',
    ].filter(Boolean).join(' ');
  }
}
