import {Observable} from 'rxjs';
import 'reflect-metadata';

export const CONTROLLER_META_KEY = 'controller';
export const ACTION_META_KEY = 'action';
export const PATH_VARIABLE_KEY = 'pathVar';
export const PATH_VARIABLE_INDEX = 'pathVarIndex';
export const PATH_VARIABLE_AMOUNT = 'pathVarAmount';
export const PREFIX_META_KEY = 'prefix';
const PREFIX = 'rest';

export function RestController(controllerName: string, prefix: string | null = PREFIX) {
    return (target: object) => {
        Reflect.defineMetadata(CONTROLLER_META_KEY, controllerName, target);

        if (prefix) {
            Reflect.defineMetadata(PREFIX_META_KEY, prefix, target);
        }
    };
}

export function RestAction(actionName: string | null, controllerName?: string) {
    return (target: object, propertyName: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(ACTION_META_KEY, actionName, target, propertyName);
        if (controllerName) {
            Reflect.defineMetadata(CONTROLLER_META_KEY, controllerName, target, propertyName);
        }

        let originalMethod = descriptor.value;
        descriptor.value = function (this: {currentAction: string}, ...args: any[]) {
            let pathVarAmount = Reflect.getOwnMetadata(PATH_VARIABLE_AMOUNT, target, propertyName);
            if (pathVarAmount) {
                for (let i = 1; i <= pathVarAmount; i++) {
                    let pathVarIndex = Reflect.getOwnMetadata(`${PATH_VARIABLE_INDEX}_${i}`, target, propertyName);
                    Reflect.defineMetadata(`${PATH_VARIABLE_KEY}_${i}`, args[pathVarIndex], target, propertyName);
                }
            }

            this.currentAction = propertyName;

            /* Basically all endpoint's results supposed to be an Observable object,
                so we need to show notification on error.
             */
            let result = originalMethod.apply(this, args);
            return result;
        };
        return descriptor;
    };
}

export function PathVariable(target: object, propertyKey: string | symbol, parameterIndex: number) {
    let pathVarAmount = (Reflect.getOwnMetadata(PATH_VARIABLE_AMOUNT, target, propertyKey) || 0) + 1;

    Reflect.defineMetadata(PATH_VARIABLE_AMOUNT, pathVarAmount, target, propertyKey);
    Reflect.defineMetadata(`${PATH_VARIABLE_INDEX}_${pathVarAmount}`, parameterIndex, target, propertyKey);
}
