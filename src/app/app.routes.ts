import { Routes } from '@angular/router';
import { AppPaths } from './app-paths';
import { Cistella } from './componentes/cistella/cistella';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Condicions } from './componentes/condicions/condicions';
import { Contacto } from './componentes/contacto/contacto';
import { Registre } from './componentes/registre/registre';
import { Index } from './componentes/index';

export const routes: Routes = [
    {path: AppPaths['cistella'], component: Cistella},
    {path: AppPaths['catalogo'], component: Catalogo},
    {path: AppPaths['condicions'], component: Condicions},
    {path: AppPaths['registre'], component: Registre},
    {path: AppPaths['contacto'], component: Contacto},
    {path: AppPaths['index'], redirectTo: "/index", pathMatch: "full"},
    {path: 'index', component: Index },
];
