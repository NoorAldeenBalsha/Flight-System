import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightModule } from './flight/flight.module';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FlightModule,
    UserModule,
    CloudinaryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
