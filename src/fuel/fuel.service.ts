import { Injectable } from '@nestjs/common';
import { parse } from 'fast-csv';
import { createReadStream } from 'fs';

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
  async processCSV(filePath: string): Promise<FuelPrice[]> {
    const csvData: FuelPrice[] = [];

    return new Promise<FuelPrice[]>((resolve, reject) => {
      createReadStream(filePath)
        .pipe(parse({ headers: true, delimiter: ';' }))
        .on('data', (row) => {
          csvData.push({
            region: row['Região'],
            state: row['Estado'],
            city: row['Município'],
            retailer: row['Revenda'],
            cnpj: row['CNPJ'],
            streetName: row['Nome da Rua'],
            streetNumber: row['Número da Rua'],
            complement: row['Complemento'],
            neighborhood: row['Bairro'],
            postalCode: row['CEP'],
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
}
