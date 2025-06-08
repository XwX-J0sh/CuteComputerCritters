import {Injectable} from "@angular/core";
import {HttpEvent, HttpRequest} from "@angular/common/module.d-CnjH8Dlt";
import {HttpHandler, HttpInterceptor} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        req = req.clone({
            withCredentials: true,
        });

        return next.handle(req);
    }
}
