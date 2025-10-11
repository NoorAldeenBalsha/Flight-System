import 'express';
declare module 'express' {
    interface request {
        lang?: 'en' | 'ar';
    }
}