import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import awsmobile from './aws-exports';
import Amplify, { Auth } from 'aws-amplify';

Amplify.configure(awsmobile);
// Amplify.Logger.LOG_LEVEL = 'DEBUG';

Auth.configure(awsmobile);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
