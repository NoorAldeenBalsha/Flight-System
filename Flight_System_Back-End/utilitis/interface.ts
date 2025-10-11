export interface ValidationError{
      field:string;
      message:String;
    }


export interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}