import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {DataProtectionComponent} from './pages/login/data-protection/data-protection.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadChildren: './pages/login/login.module#LoginPageModule'
    },
    {
        path: 'login/data-protection',
        component: DataProtectionComponent
    },
    {
        path: 'login/register',
        loadChildren: './pages/login/register/register.module#RegisterPageModule'
    },
    {
        path: 'login/reset-password',
        loadChildren: './pages/login/reset-password/reset-password.module#ResetPasswordPageModule'
    },
    {
        path: 'tabs/:userId',
        loadChildren: './pages/tabs/tabs.module#TabsPageModule'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules, enableTracing: true})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
