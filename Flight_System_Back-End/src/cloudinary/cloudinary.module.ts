import { forwardRef, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryProvider } from './cloudinary.provider';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ConfigModule,JwtModule.register({}),forwardRef(()=>UserModule,)], 
  providers: [CloudinaryService,CloudinaryProvider,AuthGuard],
  controllers: [CloudinaryController],
  exports:[CloudinaryProvider,CloudinaryService]
})
export class CloudinaryModule {}
