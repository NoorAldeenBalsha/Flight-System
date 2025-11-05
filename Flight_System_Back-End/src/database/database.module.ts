import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports:[MongooseModule.forRootAsync({
        inject:[ConfigService],
        useFactory: (ConfigService:ConfigService) => ({
            uri: ConfigService.get<string>('DataBase_URL'),
        })
    })
]
})
export class DatabaseModule {}
