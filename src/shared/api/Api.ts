/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HandlerErrorResponse {
  description?: string;
  /** @example "error" */
  status?: string;
}

export interface HandlerFlightResourceFeedResponse {
  data?: SerializerFlightResourceFeed;
  /** @example "success" */
  status?: string;
}

export interface HandlerFlightResourceListResponse {
  data?: SerializerFlightResourceListItem[];
  /** @example "success" */
  status?: string;
}

export interface HandlerFlightResourceResponse {
  data?: SerializerFlightResource;
  message?: string;
  /** @example "success" */
  status?: string;
}

export interface HandlerLikeData {
  like?: number;
  likes_count?: number;
}

export interface HandlerLikeRequest {
  like: 0 | 1;
}

export interface HandlerLikeResponse {
  data?: HandlerLikeData;
  /** @example "success" */
  status?: string;
}

export interface HandlerLoginRequest {
  login: string;
  password: string;
}

export interface HandlerLoginResp {
  access_token?: string;
  /** наносекунды */
  expires_in?: number;
  token_type?: string;
}

export interface HandlerMessageResponse {
  message?: string;
  /** @example "success" */
  status?: string;
}

export interface HandlerRegisterRequest {
  /** @maxLength 25 */
  login: string;
  /** @maxLength 100 */
  password: string;
}

export interface HandlerUserResponse {
  data?: SerializerUser;
  /** @example "success" */
  status?: string;
}

export interface SerializerFlightResource {
  description?: string;
  formed_at?: string;
  id?: number;
  image_url?: string;
  likes_count?: number;
  name?: string;
  price?: number;
  status?: string;
  unit?: string;
  video_url?: string;
}

export interface SerializerFlightResourceFeed {
  description?: string;
  formed_at?: string;
  id?: number;
  image_url?: string;
  /** 1 — текущий пользователь лайкнул услугу */
  is_liked?: number;
  likes_count?: number;
  name?: string;
  price?: number;
  status?: string;
  unit?: string;
  video_url?: string;
}

export interface SerializerFlightResourceListItem {
  description?: string;
  formed_at?: string;
  id?: number;
  image_url?: string;
  /** 1 — создатель совпадает с текущим пользователем */
  is_mine?: number;
  likes_count?: number;
  name?: string;
  price?: number;
  status?: string;
  unit?: string;
  video_url?: string;
}

export interface SerializerUser {
  id?: number;
  is_moderator?: boolean;
  login?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Flight Service API
 * @version 1.0
 * @baseUrl http://localhost:8080
 * @contact
 *
 * Каталог услуг лётного обслуживания: гостю доступно чтение, авторизованному пользователю (JWT) — методы создателя.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  flightResources = {
    /**
     * @description Публичный метод. Фильтр ?price= — максимальная цена. С валидным токеном is_mine=1 у своих услуг, у гостя всегда 0.
     *
     * @tags Услуги
     * @name FlightResourcesList
     * @summary Список опубликованных услуг
     * @request GET:/api/flight-resources
     */
    flightResourcesList: (
      query?: {
        /** Максимальная цена */
        price?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerFlightResourceListResponse, HandlerErrorResponse>({
        path: `/api/flight-resources`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description multipart/form-data с необязательными файлами image и video; создатель берётся из токена. У пользователя может быть только один черновик.
     *
     * @tags Услуги
     * @name FlightResourcesCreate
     * @summary Создание черновика услуги
     * @request POST:/api/flight-resources
     * @secure
     */
    flightResourcesCreate: (
      data: {
        /** Название */
        name: string;
        /** Описание */
        description?: string;
        /** Единица измерения */
        unit?: string;
        /** Цена */
        price?: number;
        /**
         * Изображение
         * @format binary
         */
        image?: File;
        /**
         * Видео
         * @format binary
         */
        video?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerFlightResourceResponse, HandlerErrorResponse>({
        path: `/api/flight-resources`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Услуги
     * @name FlightResourcesDraftList
     * @summary Черновик текущего пользователя
     * @request GET:/api/flight-resources/draft
     * @secure
     */
    flightResourcesDraftList: (params: RequestParams = {}) =>
      this.request<HandlerFlightResourceResponse, HandlerErrorResponse>({
        path: `/api/flight-resources/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Меняет status и формирует formed_at у черновика текущего пользователя.
     *
     * @tags Услуги
     * @name FlightResourcesDraftPublishUpdate
     * @summary Публикация черновика
     * @request PUT:/api/flight-resources/draft/publish
     * @secure
     */
    flightResourcesDraftPublishUpdate: (params: RequestParams = {}) =>
      this.request<HandlerFlightResourceResponse, HandlerErrorResponse>({
        path: `/api/flight-resources/draft/publish`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Публичный метод. Без параметров — первая услуга, ?id=N — услуга N, ?next=true — следующая за ?id. С валидным токеном is_liked показывает лайк пользователя, у гостя всегда 0.
     *
     * @tags Услуги
     * @name FlightResourcesFeedList
     * @summary Лента услуг
     * @request GET:/api/flight-resources/feed
     */
    flightResourcesFeedList: (
      query?: {
        /** ID услуги */
        id?: number;
        /** Перейти к следующей услуге */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerFlightResourceFeedResponse, HandlerErrorResponse>({
        path: `/api/flight-resources/feed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Логическое удаление; чужую услугу удалить нельзя.
     *
     * @tags Услуги
     * @name FlightResourcesDelete
     * @summary Удаление своей услуги
     * @request DELETE:/api/flight-resources/{id}
     * @secure
     */
    flightResourcesDelete: (id: number, params: RequestParams = {}) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/flight-resources/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description like=1 ставит лайк текущего пользователя, like=0 снимает.
     *
     * @tags Услуги
     * @name FlightResourcesLikeCreate
     * @summary Поставить или снять лайк
     * @request POST:/api/flight-resources/{id}/like
     * @secure
     */
    flightResourcesLikeCreate: (
      id: number,
      body: HandlerLikeRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerLikeResponse, HandlerErrorResponse>({
        path: `/api/flight-resources/${id}/like`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Проверяет логин и пароль и выдаёт JWT; его нужно передавать в заголовке Authorization: Bearer <token>.
     *
     * @tags Пользователи
     * @name UsersLoginCreate
     * @summary Вход
     * @request POST:/api/users/login
     */
    usersLoginCreate: (body: HandlerLoginRequest, params: RequestParams = {}) =>
      this.request<HandlerLoginResp, HandlerErrorResponse>({
        path: `/api/users/login`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Кладёт токен из заголовка Authorization в blacklist (Redis) до конца его срока жизни.
     *
     * @tags Пользователи
     * @name UsersLogoutCreate
     * @summary Выход
     * @request POST:/api/users/logout
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, HandlerErrorResponse>({
        path: `/api/users/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Создаёт обычного пользователя (не модератора); пароль хранится в виде sha1.
     *
     * @tags Пользователи
     * @name UsersRegisterCreate
     * @summary Регистрация пользователя
     * @request POST:/api/users/register
     */
    usersRegisterCreate: (
      body: HandlerRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerUserResponse, HandlerErrorResponse>({
        path: `/api/users/register`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
