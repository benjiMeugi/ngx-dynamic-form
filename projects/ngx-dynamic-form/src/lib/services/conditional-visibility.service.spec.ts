import { FormControl, FormGroup } from '@angular/forms';
import { ConditionalVisibilityService } from './conditional-visibility.service';
import { FieldConfig } from '../models/field-config.model';

describe('ConditionalVisibilityService', () => {
  const service = new ConditionalVisibilityService();
  const fields: FieldConfig[] = [
    { name: 'type', type: 'text' },
    { name: 'details', type: 'text', visibleWhen: { field: 'type', equals: 'autre' } },
  ];

  it('désactive le champ masqué à l\'état initial', () => {
    const g = new FormGroup({ type: new FormControl('x'), details: new FormControl('') });
    const sub = service.attach(g, fields);
    expect(g.get('details')!.disabled).toBeTrue();
    sub.unsubscribe();
  });

  it('réactive le champ quand la condition devient vraie', () => {
    const g = new FormGroup({ type: new FormControl('x'), details: new FormControl('') });
    const sub = service.attach(g, fields);
    g.get('type')!.setValue('autre');
    expect(g.get('details')!.enabled).toBeTrue();
    g.get('type')!.setValue('x');
    expect(g.get('details')!.disabled).toBeTrue();
    sub.unsubscribe();
  });

  it('respecte le disabled statique', () => {
    const g = new FormGroup({ type: new FormControl('autre'), details: new FormControl('') });
    g.get('details')!.disable();
    const sub = service.attach(g, [fields[0], { ...fields[1], disabled: true }]);
    g.get('type')!.setValue('autre');
    expect(g.get('details')!.disabled).toBeTrue();
    sub.unsubscribe();
  });
});
