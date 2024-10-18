import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FuelPrice, FuelService, Product, Region } from './fuel.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { ApiQuery } from '@nestjs/swagger';

@Controller('fuel')
export class FuelController {
  private jsonData: FuelPrice[] = undefined;
  constructor(private readonly fuelService: FuelService) {
    this.fuelService.loadData();
  }

  @Post('upload-csv')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Nenhum arquivo foi enviado.',
        });
      }

      const filePath = path.resolve(__dirname, '../../uploads', file.filename);
      const csvData = await this.fuelService.processCSV(filePath);

      const jsonFilePath = path.resolve(
        __dirname,
        '../../uploads',
        'fuel-prices.json',
      );

      if (fs.existsSync(jsonFilePath)) {
        fs.unlinkSync(jsonFilePath);
      }

      const csvDataWithDate = {
        uploadDate: new Date().toISOString().split('T')[0],
        csvData,
      };

      fs.writeFileSync(
        jsonFilePath,
        JSON.stringify(csvDataWithDate, null, 2),
        'utf-8',
      );

      fs.unlinkSync(filePath);
      this.fuelService.loadData();

      return res.status(HttpStatus.OK).json({
        message: 'Arquivo Enviado com sucesso !',
        csvData,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erro processando o arquivo.',
        error: error.message,
      });
    }
  }

  @Get('prices')
  getFuelPrices(@Res() res: Response) {
    const jsonData = this.fuelService.getJsonData();

    if (!jsonData) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Não foi achado nenhum registro. Faça um upload primeiro.',
      });
    }
    return res.status(HttpStatus.OK).json(this.fuelService.getJsonData());
  }

  @Get('search')
  @ApiQuery({
    name: 'region',
    enum: Region,
    enumName: 'Region',
  })
  @ApiQuery({
    name: 'product',
    enum: Product,
    enumName: 'Product',
  })
  searchFuelPrices(
    @Query('region') region: Region,
    @Query('product') product: Product,
    @Res() res: Response,
  ) {
    const jsonData = this.fuelService.getJsonData();

    if (!jsonData) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Nao foi achado nenhum registro.',
      });
    }

    const filteredData = this.fuelService.filterPrices(region, product);

    return res.status(HttpStatus.OK).json(filteredData);
  }
}
