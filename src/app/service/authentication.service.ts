import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {DefaultService} from '../../api';
import {NavigationExtras, Params, Router} from '@angular/router';
// import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {ModalController} from '@ionic/angular';
import Timeout = NodeJS.Timeout;

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private intervalId: Timeout;
    private refreshCycle = 5 * 60 * 1000;

    /**
     * Service for providing authentication capabilities
     * @param router: Angular router
     * @param api: ApiService for backend integration
     */
    constructor(private api: DefaultService,
                private router: Router,
                private modalController: ModalController) {
    }

    public async getUserId(): Promise<number> {
        console.log('Fetch Access Token for api access.');
        return Number(localStorage.getItem('userId'));
    }

    /**
     * Login the specified user.
     * @param username: Username of the user
     * @param password: Password of the user
     */
    public async login(username, password): Promise<number> {
        this.api.configuration.username = username;
        this.api.configuration.password = password;
        this.api.configuration.withCredentials = true;
        const response = await this.api.oauth2AuthGet('response').toPromise();
        if (response.ok) {
            const token = response.body;
            this.api.configuration.accessToken = token.token;
            await this.setToken(token.token);
            localStorage.setItem('userId', String(token.uid));
            console.log(`Successfully logged in user ${token.uid}.`);
            if (this.intervalId === undefined) {
                this.intervalId = setTimeout(this.refreshToken.bind(this), this.refreshCycle);
            }
        }
        return this.getUserId();
    }

    /**
     * Returns true, if there is a loggedIn user and token will be refreshed meanwhile.
     */
    public async loggedIn(): Promise<boolean> {
        let loggedIn = false;
        const item = await this.getToken();
        if (item !== null) {
            try {
                this.api.configuration.accessToken = item;
                this.api.configuration.withCredentials = true;
                await this.refreshToken();
                loggedIn = (await this.getToken() !== null);
            } catch (e) {
                if (e.status === 401) {
                    this.logout();
                }
                console.error(e);
            }
        }
        return loggedIn;
    }

    /**
     * Get stored access token for Backend.
     */
    public async getToken(): Promise<string> {
        console.log('Fetch Access Token for api access.');
        try {
            return localStorage.getItem('accessToken');
        } catch (e) {
            if (e.code !== 2) {
                console.error(e);
            }
        }
        return undefined;
    }

    /**
     * Logout the user while revoking the access token.
     */
    public async logout() {
        if (this.intervalId !== undefined) {
            clearTimeout(this.intervalId);
        }
        this.api.configuration.accessToken = await this.getToken();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        this.router.navigate(['/login'], <NavigationExtras>{
            queryParams: <Params>{
                timeout: '0'
            }
        });
        while (await this.modalController.getTop() !== undefined) {
            await this.modalController.dismiss();
        }
        this.api.configuration.withCredentials = true;
        this.api.oauth2RevokeGet('response').subscribe(async (response: HttpResponse<any>) => {
                if (response.ok) {
                    console.log('Logged out');
                }
            },
            async (error1: HttpErrorResponse) => {
                console.error(error1);
            });
    }

    public async refreshToken() {
        this.api.configuration.accessToken = await this.getToken();
        this.api.configuration.withCredentials = true;
        try {
            const response = await this.api.oauth2RefreshGet('response').toPromise();
            if (response.ok) {
                this.api.configuration.accessToken = response.body;
                await this.setToken(response.body);
                clearTimeout(this.intervalId);
                this.intervalId = setTimeout(this.refreshToken.bind(this), this.refreshCycle);
            }
        } catch (e) {
            await localStorage.removeItem('accessToken');
            await localStorage.removeItem('userId');
            if (this.intervalId !== undefined) {
                clearTimeout(this.intervalId);
            }
            while (await this.modalController.getTop() !== undefined) {
                await this.modalController.dismiss();
            }
            await this.router.navigate(['/login'], <NavigationExtras>{
                queryParams: <Params>{
                    timeout: '1'
                }
            });
            console.error(e);
        }
    }

    private async setToken(token: string) {
        localStorage.setItem('accessToken', token);
        console.log('Refreshed Access Token.');
    }
}
