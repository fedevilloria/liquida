import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';

registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [

    // Configura el formato argentino para importes y fechas.
    { provide: LOCALE_ID, useValue: 'es-AR' },
    
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Habilita las solicitudes HTTP hacia el backend.
    provideHttpClient(),
  ],
};