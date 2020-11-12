import {Pipe, PipeTransform} from '@angular/core';
import {Asset} from '../../api';

@Pipe({
    name: 'search'
})
export class SearchPipe implements PipeTransform {

    /**
     * Simple pipe for searching Insurances. Not case-sensitive and simple includes.
     * @param items: all Insurances which should searched
     * @param terms: terms for which should be searched.
     */
    transform(items: Asset[], terms: string): Asset[] {
        if (!items) {
            return [];
        }
        if (!terms) {
            return items;
        }
        terms = terms.toLowerCase();
        return items.filter(it => {
            return it.type.toLowerCase().includes(terms);
        });
    }

}
