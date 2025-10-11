import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserGender, UserRole } from '../../../utilitis/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;
  //============================================================================
  @Prop({ required: true, unique: true })
  email: string;
  //============================================================================
  @Prop({ required: true })
  password: string; 
  //============================================================================
  @Prop({ type: String, enum: UserRole, default: UserRole.PERSON })
  role: UserRole;
  //============================================================================
  @Prop({ required: false })
  phone?: string;
  //============================================================================
  @Prop({ required: false })
  passportNumber?: string; 
  //============================================================================
  @Prop({ default: () => Date.now() })
  lastLogin: Date;
  //============================================================================
  @Prop({ required: false })
  dateOfBirth: Date;
  //============================================================================
  @Prop({ type: String, enum: UserGender, default: UserGender.OTHER })
  gender: UserGender;
  //============================================================================
  @Prop()
  resetCode?: string;
  //============================================================================
  @Prop()
  resetCodeExpiry?: Date;
  //============================================================================
  @Prop()
  resetPasswordToken: string;
  //============================================================================
  @Prop({ default: false })
  isAccountverified: boolean;
  //============================================================================
  @Prop({ type: String,required: false,default: null })
  verificationToken?: string | null;
  //============================================================================
  @Prop({ required: false })
  picture?: string;
  //============================================================================
  @Prop({ required: false })
  birthCountry?: string;
  //============================================================================
  @Prop({ required: false })
  residenceCountry?: string;
  //============================================================================
  @Prop({ required: false })
  bio?: string;
  //============================================================================  
  @Prop({ required: false })
  coverPicture?: string;
  //============================================================================ 
}

export const UserSchema = SchemaFactory.createForClass(User);