// TypeScript declarations for window object extensions

declare global {
  interface Window {
    __NEXT_DATA__?: {
      env?: {
        NEXT_PUBLIC_ENABLE_3D_VISUALIZATION?: string;
        [key: string]: string | undefined;
      };
      props?: Record<string, unknown>;
      page?: string;
      query?: Record<string, unknown>;
      buildId?: string;
      assetPrefix?: string;
      runtimeConfig?: Record<string, unknown>;
      nextExport?: boolean;
      autoExport?: boolean;
      isFallback?: boolean;
      dynamicIds?: string[];
      err?: Error;
      gsp?: boolean;
      gssp?: boolean;
      customServer?: boolean;
      gip?: boolean;
      appGip?: boolean;
      head?: Array<React.ReactElement>;
    };
  }
}

export {};