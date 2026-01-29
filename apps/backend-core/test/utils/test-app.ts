import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { ResponseWrapperInterceptor } from '../../src/common/interceptors/response-wrapper.interceptor';
import { formatValidationErrors } from '../../src/common/utils/validation.utils';

export const applyTestAppConfig = (app: INestApplication): INestApplication => {
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", ...(isProduction ? [] : ["'unsafe-eval'"])],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: { maxAge: 31536000, includeSubDomains: true },
    }),
  );

  app.useGlobalInterceptors(new ResponseWrapperInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new BadRequestException(formatValidationErrors(errors)),
    }),
  );

  return app;
};
