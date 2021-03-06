import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {JsonSchemaValidator} from "./JsonSchemaValidator";
import {notificationService} from "../services/notification";
import {NotificationType} from "../components/notifications/notification";
import * as commonNotifications
from "../services/notification/CommonNotifications";



export enum HttpMethod {
  get = "GET",
  post = "POST",
  put = "PUT",
  head = "HEAD",
  delete = "DELETE",
  options = "OPTIONS"
}

export interface HttpQuery<Data> {
  headers: any;
  data: Data;
}

export class HttpConnection<RequestData, ResponseData> {
  declare private readonly apiUrl: string;
  declare private requestValidator: JsonSchemaValidator<RequestData>;
  declare private responseValidator: JsonSchemaValidator<ResponseData>;

  constructor (apiUrl: string) {
    this.apiUrl = apiUrl;
    this.requestValidator = new JsonSchemaValidator<RequestData>();
    this.responseValidator = new JsonSchemaValidator<ResponseData>();
  }

  setRequestValidator (validator: JsonSchemaValidator<RequestData>) {
    this.requestValidator = validator;
  }

  setResponseValidator (validator: JsonSchemaValidator<ResponseData>) {
    this.responseValidator = validator;
  }

  send (
    url: string,
    method: HttpMethod,
    request: HttpQuery<RequestData>
  ): Promise<HttpQuery<ResponseData>> {
    return new Promise<HttpQuery<ResponseData>>(
      (
        resolve: (response: HttpQuery<ResponseData>) => void,
        reject: () => void
      ) => {
        if (!this.requestValidator.validate(request.data)) {
          notificationService.notify(
            commonNotifications.contractValidationError()
          );
          reject();
          return;
        }

        const config: AxiosRequestConfig = {
          baseURL: this.apiUrl,
          url: url,
          method: method,
          headers: request.headers,
          data: request.data
        };
        
        axios
          .request(config)
          .then(
            (response: AxiosResponse<any>): void => {
              const contentType: string = response.config.headers["Content-Type"];

              if (
                !contentType.includes("application/json") ||
                !this.responseValidator.validate(response.data)
              ) {
                notificationService.notify(
                  commonNotifications.contractValidationError()
                );
                reject();
                return;
              }

              resolve(
                {
                  headers: response.headers,
                  data: response.data as ResponseData
                } as HttpQuery<ResponseData>
              );
            },
            (error: Error): void => {
              throw(error);
            }
          ).catch(
            (error: Error): void => {
              notificationService.notify({
                title: error.message,
                message:
                  error.stack === undefined ?
                  error.message :
                  error.stack,
                type: NotificationType.Error
              });
              reject();
            }
          );
      }
    );
  }
}
