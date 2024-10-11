import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('csv')
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
          message: 'No file uploaded',
        });
      }

      const filePath = path.resolve(__dirname, '../../uploads', file.filename);
      const data = await this.uploadService.processCSV(filePath);

      const jsonFilePath = path.resolve(__dirname, '../../uploads', 'fuel-prices.json');

      // Replace 'fuel-prices.json', if exists
      if (fs.existsSync(jsonFilePath)) {
        fs.unlinkSync(jsonFilePath);
      }

      // Add Date to the OBJ
      const dataWithDate = {
        date: new Date().toISOString().split('T')[0],
        data,
      };

      fs.writeFileSync(jsonFilePath, JSON.stringify(dataWithDate, null, 2), 'utf-8');

      // remove csv
      fs.unlinkSync(filePath);

      return res.status(HttpStatus.OK).json({
        message: 'File uploaded and processed successfully',
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error processing file',
        error: error.message,
      });
    }
  }
}
