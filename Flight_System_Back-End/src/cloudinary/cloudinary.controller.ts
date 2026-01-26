import {Controller,Post,Delete,UploadedFiles, Body, Param,BadRequestException,Logger,Headers,Query, UseGuards,} from '@nestjs/common';
import {ApiConsumes,ApiBody,ApiOperation,ApiParam,ApiResponse,ApiTags, ApiBearerAuth,} from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { UploadChunkDto } from './dto/upload-chunk.dto';
import { AuthGuard } from 'src/user/guard/auth.guard';

@ApiTags('Cloudinary Upload')
@Controller('api/upload')
export class CloudinaryController {
  private readonly logger = new Logger(CloudinaryController.name);
  config: any;

  constructor(private readonly cloudinaryService: CloudinaryService,) {}
  //============================================================================
  // Endpoint to handle chunked file uploads
  @Post('chunk')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({summary: 'Upload a file chunk (supports chunked file uploads)',})
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadChunkDto })
  @ApiResponse({status: 201,description: 'Chunk uploaded successfully or file upload completed.',})
  @ApiResponse({status: 400,description: 'Bad request: no file uploaded or invalid input.',})
  async uploadChunk(@UploadedFiles() files: Express.Multer.File[],@Body() body: UploadChunkDto,@Headers('lang') acceptLanguage?: string,) {
    const lang = acceptLanguage === 'ar' ? 'ar' : 'en';

    if (!files || files.length === 0) {
      const message =
        lang === 'ar' ? 'لم يتم تحميل أي ملف' : 'No file uploaded';
      throw new BadRequestException({
        message: lang === 'ar' ? 'يوجد أخطاء' : 'There errors',
        errors: message,
      });
    }
    
    return this.cloudinaryService.uploadChunkedFile(
      files[0],
      body.fileName,
      Number(body.chunkNumber),
      Number(body.totalChunks),
      body.uploadId,
    );
  }
  //============================================================================
  // Endpoint to cancel an ongoing chunked upload session
  @Delete('cancel/:uploadId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an ongoing chunked upload session' })
  @ApiParam({name: 'uploadId',type: 'string',description: 'Upload session ID',})
  @ApiResponse({status: 200,description: 'Upload session cancelled successfully',})
  @ApiResponse({ status: 400, description: 'Upload session not found' })
  async cancelUpload(@Param('uploadId') uploadId: string,@Headers('accept-language') acceptLanguage?: string,) {
    const lang = acceptLanguage === 'ar' ? 'ar' : 'en';
    const result = await this.cloudinaryService.cancelUpload(uploadId);

    if (!result.cancelled) {
      const message =
        lang === 'ar'
          ? ` لم يتم العثور على تحميل بالمعرف ${uploadId}`
          : `No upload found with ID ${uploadId}`;
      throw new BadRequestException({
        message: lang === 'ar' ? 'يوجد أخطاء' : 'There errors',
        errors: message,
      });
    }
    return {
      ...result,
      message:
        lang === 'ar'
          ? ` تم إلغاء التحميل ${uploadId} وتنظيف الملفات.`
          : `Upload ${uploadId} canceled and cleaned up.`,
    };
  }
  //============================================================================
  // Endpoint to delete an uploaded file from Cloudinary by its public ID
  @Delete('file/:publicId')
  @ApiOperation({ summary: 'Delete an uploaded file from Cloudinary' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'publicId', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async deleteFileFromCloudinary(
    @Param('publicId') publicId: string,
    @Query('resourceType') resourceType?: 'image' | 'video' | 'raw',
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ message: string; publicId: string }> {
    const lang = acceptLanguage === 'ar' ? 'ar' : 'en';

    if (!publicId) {
      throw new BadRequestException({
        message: lang === 'ar' ? 'يوجد أخطاء' : 'There are errors',
        errors: lang === 'ar' ? 'معرف الملف مطلوب' : 'Public ID is required',
      });
    }

    try {
      return await this.cloudinaryService.deleteFile(publicId, resourceType ?? 'video', lang);
    } catch (error) {
      throw new BadRequestException({
        message: lang === 'ar' ? 'يوجد أخطاء' : 'There are errors',
        errors: error.message,
      });
    }
  }
  //============================================================================
}
