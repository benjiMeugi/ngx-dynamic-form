import { FormControl, FormGroup } from '@angular/forms';
import { buildCrossValidator } from './cross-field-validators';

const group = (v: Record<string, any>) =>
  new FormGroup(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, new FormControl(x)])));

describe('buildCrossValidator', () => {
  it('matchFields', () => {
    const v = buildCrossValidator({ type: 'matchFields', fields: ['a', 'b'] });
    expect(v(group({ a: 'x', b: 'x' }))).toBeNull();
    expect(v(group({ a: 'x', b: 'y' }))?.['matchFields']).toBeDefined();
    expect(v(group({ a: '', b: 'y' }))).toBeNull();
  });

  it('dateRange', () => {
    const v = buildCrossValidator({ type: 'dateRange', fields: ['s', 'e'] });
    expect(v(group({ s: '2024-01-01', e: '2024-01-02' }))).toBeNull();
    expect(v(group({ s: '2024-02-01', e: '2024-01-02' }))?.['dateRange']).toBeDefined();
  });

  it('numberRange', () => {
    const v = buildCrossValidator({ type: 'numberRange', fields: ['min', 'max'] });
    expect(v(group({ min: 1, max: 2 }))).toBeNull();
    expect(v(group({ min: 3, max: 2 }))?.['numberRange']).toBeDefined();
    expect(v(group({ min: null, max: 2 }))).toBeNull();
  });
});
