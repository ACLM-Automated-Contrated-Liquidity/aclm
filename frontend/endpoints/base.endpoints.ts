import {
    ACTION_META_KEY,
    CONTROLLER_META_KEY,
    PATH_VARIABLE_AMOUNT, PATH_VARIABLE_INDEX,
    PATH_VARIABLE_KEY,
    PREFIX_META_KEY
} from './annotations';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

const OPEN_BRACKET = '{';
const CLOSE_BRACKET = '}';

export class BaseEndpoints {

    static getUri(target: any, currentAction): string {
        let controller =
            Reflect.getMetadata(CONTROLLER_META_KEY, target, currentAction) ||
            Reflect.getMetadata(CONTROLLER_META_KEY, target);

        let prefix = Reflect.getMetadata(PREFIX_META_KEY, target.constructor);

        let parts = prefix ? [prefix, controller] : [controller];

        let action = Reflect.getMetadata(ACTION_META_KEY, target, currentAction);
        let pathVarAmount = Reflect.getMetadata(PATH_VARIABLE_AMOUNT, target, currentAction);

        if (!pathVarAmount && action != null) {
            parts.push(action);
        } else if (pathVarAmount === 1) {
            let pathVar = Reflect.getMetadata(`${PATH_VARIABLE_KEY}_1`, target, currentAction);

            let pathVarInAction = false;
            if (pathVar != null && action != null && action.includes(OPEN_BRACKET) && action.includes(CLOSE_BRACKET)) {
                let openPos = action.indexOf(OPEN_BRACKET);
                let closePos = action.indexOf(CLOSE_BRACKET);

                if (closePos > openPos) {
                    let scope = action.substring(openPos, closePos + 1);
                    action = action.replace(scope, pathVar);
                    pathVarInAction = true;
                }
            }

            if (action != null) parts.push(action);
            if (!pathVarInAction && pathVar != null) parts.push(encodeURIComponent(pathVar));
        } else {
            let pathVars = [];

            for (let i = 1; i <= pathVarAmount; i++) {
                let pathVar = Reflect.getMetadata(`${PATH_VARIABLE_KEY}_${i}`, target, currentAction);
                let pathVarIndex = Reflect.getMetadata(`${PATH_VARIABLE_INDEX}_${i}`, target, currentAction);

                pathVars[pathVarIndex] = pathVar;
            }

            pathVars.forEach(pathVar => {
                action = action.replace(/\{(\w+)\}/, pathVar);
            });

            parts.push(action);
        }
        return parts.filter(Boolean).join('/');
    }

    static get<T>(target: any): Observable<T> {
        let uri = BaseEndpoints.getUri(target, target.currentAction);

        return from(fetch(`http://localhost:4200/${uri}`) as Promise<any>)
            .pipe(map(res => {
                return res.json;
            }));
    }

    static post<T>(target: any, body: any): Observable<T> {
        let uri = BaseEndpoints.getUri(target, target.currentAction);

        return from(fetch(
            `http://localhost:4200/${uri}`,
            {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            }) as Promise<any>
        ).pipe(map(res => {
            return res.json;
        }));
    }
}
