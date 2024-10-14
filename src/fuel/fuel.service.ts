import { Injectable } from '@nestjs/common';
import { parse } from 'fast-csv';
import { createReadStream } from 'fs';
import * as path from 'path';
import * as fs from 'fs';

export interface FuelPrice {
  streetName: string;
  region: string;
  state: string;
  city: string;
  retailer: string;
  cnpj: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  postalCode: string;
  product: string;
  collectionDate: string;
  salePrice: string;
  purchasePrice: string;
  unit: string;
  brand: string;
}

@Injectable()
export class FuelService {
  private jsonData: FuelPrice[] = [];

  // Process CSV to JSON
  async processCSV(filePath: string): Promise<FuelPrice[]> {
    const csvData: FuelPrice[] = [];

    return new Promise<FuelPrice[]>((resolve, reject) => {
      createReadStream(filePath)
        .pipe(parse({ headers: true, delimiter: ';' }))
        .on('data', (row) => {
          csvData.push({
            region: row['Região'],
            state: row['Estado'],
            city: row['Municipio'],
            retailer: row['Revenda'],
            cnpj: row['CNPJ'],
            streetName: row['Nome da Rua'],
            streetNumber: row['Número da Rua'],
            complement: row['Complemento'],
            neighborhood: row['Bairro'],
            postalCode: row['Cep'],
            product: row['Produto'],
            collectionDate: row['Data da Coleta'],
            salePrice: row['Valor de Venda'],
            purchasePrice: row['Valor de Compra'],
            unit: row['Unidade de Medida'],
            brand: row['Bandeira'],
          });
        })
        .on('end', () => resolve(csvData))
        .on('error', (err) => reject(err));
    });
  }

  // Load Json Data
  loadData() {
    const jsonFilePath = path.resolve(
      __dirname,
      '../../uploads',
      'fuel-prices.json',
    );
    if (fs.existsSync(jsonFilePath)) {
      const data = fs.readFileSync(jsonFilePath, 'utf-8');
      const parsedData = JSON.parse(data);

      if (Array.isArray(parsedData.csvData)) {
        this.jsonData = parsedData.csvData;
      } else {
        this.jsonData = [];
      }
    } else {
      this.jsonData = [];
    }
  }

  // Return Json Data
  getJsonData(): FuelPrice[] {
    return this.jsonData;
  }

  filterPrices(
    streetName: string,
    region: string,
    state: string,
    city: string,
  ) {
    return this.jsonData.filter((price) => {
      return (
        (!streetName ||
          price.streetName?.toLowerCase().includes(streetName.toLowerCase())) &&
        (!region || price.region?.toLowerCase() === region.toLowerCase()) &&
        (!state || price.state?.toLowerCase() === state.toLowerCase()) &&
        (!city || price.city?.toLowerCase() === city.toLowerCase())
      );
    });
  }
}
