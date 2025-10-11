import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsNumberString } from 'class-validator';

export class UploadChunkDto {
  @ApiProperty({ description: 'Original file name | اسم الملف الأصلي' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: 'Chunk number (zero-based index) | رقم القطعة (بدءًا من صفر)' })
  @IsNumberString()  // Validate as numeric string
  chunkNumber: string;

  @ApiProperty({ description: 'Total number of chunks | العدد الإجمالي للقطع' })
  @IsNumberString() 
  totalChunks: number;

  @ApiProperty({ description: 'Unique upload session ID | معرف جلسة الرفع الفريد' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;
}