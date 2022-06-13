import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
    transform(value: string | null, limit: number=100): string | null {
        if (value == null) { return null }
        const trail = '...';
        return value.length > limit ? value.substring(0, limit) + trail : value;
    }
}