
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const { path, operation, requestResourceData } = context;

    const details = {
      operation,
      path,
      requestResourceData: requestResourceData ?? 'Not available',
    };

    const message = `FirestoreError: Missing or insufficient permissions. The following request was denied by Firestore Security Rules: ${JSON.stringify(details, null, 2)}`;
    
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }
}
