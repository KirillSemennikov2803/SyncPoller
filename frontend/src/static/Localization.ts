class LocalizationService {
  readonly authorizationHeader = (): string => "Authorization";
  readonly token = (): string => "Token";
  readonly emptyString = (): string => "String is empty!";
  readonly notValidToken = (): string => "Token is not valid!";
  readonly unforseenValidationError =
    (): string => "Unforseen validation error occured!";
  readonly submitAuthorization =
    (): string => "Log in";
  readonly mainTitle = (): string => "Sync Poller";
  readonly exit = (): string => "exit";
  readonly developers = (): string => ["Konstantin Leladze"].join(", ");
  readonly copyright = (): string =>
    localization.mainTitle() + " © " + new Date().getFullYear();
}

export const localization: LocalizationService = new LocalizationService();