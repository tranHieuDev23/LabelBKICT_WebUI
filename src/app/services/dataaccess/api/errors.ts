export class UnauthenticatedError extends Error {
  constructor() {
    super('User has not been logged in');
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super(
      'User does not have the required permission to perform the operation'
    );
  }
}

export class UnknownAPIError extends Error {
  constructor(public readonly error: Error) {
    super(`Error when communicating with server: ${error.message}`);
  }
}
