import { Injectable } from '@angular/core';

export interface ICatalogInput {
  reference: string | null;
  title: string;
  description: string | null;
}

export interface ICatalog extends ICatalogInput {
  id: number;
}

export class Catalog implements ICatalog {
  id: number;
  reference: string | null;
  title: string;
  description: string | null;

  constructor(catalog: ICatalog) {
    this.id = catalog.id;
    this.reference = catalog.reference;
    this.title = catalog.title;
    this.description = catalog.description;
  }

  toCatalogInput(): ICatalogInput {
    return {
      reference: this.reference,
      title: this.title,
      description: this.description,
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  constructor() {}
}
