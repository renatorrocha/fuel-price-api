import { Injectable } from '@nestjs/common';
import { parse } from 'fast-csv';
import { createReadStream } from 'fs';
import * as path from 'path';
import * as fs from 'fs';

export interface FuelPrice {
  region: string;
  product: string;
  salePrice: string;
  unit: string;
  // streetName: string;
  // state: string;
  // city: string;
  // retailer: string;
  // cnpj: string;
  // streetNumber: string;
  // complement: string;
  // neighborhood: string;
  // postalCode: string;
  // collectionDate: string;
  // purchasePrice: string;
  // brand: string;
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
            region: row['Regiao - Sigla'],
            product: row['Produto'],
            salePrice: row['Valor de Venda'],
            unit: row['Unidade de Medida'],
            // state: row['Estado - Sigla'],
            // city: row['Municipio'],
            // retailer: row['Revenda'],
            // cnpj: row['CNPJ da Revenda'],
            // streetName: row['Nome da Rua'],
            // streetNumber: row['Numero Rua'],
            // complement: row['Complemento'],
            // neighborhood: row['Bairro'],
            // postalCode: row['Cep'],
            // collectionDate: row['Data da Coleta'],
            // purchasePrice: row['Valor de Compra'],
            // brand: row['Bandeira'],
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

  filterPrices(region: Region, product: Product) {
    // filter json by params
    const filteredPrices = this.jsonData.filter((price) => {
      return (
        (!region || price.region?.toLowerCase() === region.toLowerCase()) &&
        (!product || price.product?.toLowerCase() === product.toLowerCase())
      );
    });

    // extract values and parse to number
    const salePrices = filteredPrices.map((price) => {
      return parseFloat(price.salePrice.replace(',', '.'));
    });

    // calculate average price
    const averageSalePrice =
      salePrices.reduce((sum, price) => sum + price, 0) / salePrices.length;

    // toFixed Average price
    const FixedAverage = parseFloat(averageSalePrice.toFixed(2));

    return {
      averageSalePrice: FixedAverage || 0,
      region: region,
      unit: filteredPrices[0].unit,
      totalPrices: filteredPrices.length,
    };
  }
}

export enum Region {
  CO = 'CO',
  N = 'N',
  NE = 'NE',
  S = 'S',
  SE = 'SE',
}

export enum Product {
  ADDITIVATED_GASOLINE = 'GASOLINA ADITIVADA',
  GASOLINE = 'GASOLINA',
  ETHANOL = 'ETANOL',
}
