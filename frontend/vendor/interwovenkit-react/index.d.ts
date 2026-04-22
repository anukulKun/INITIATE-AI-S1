import type { ReactNode } from "react";

export interface InterwovenKitProviderProps {
  children?: ReactNode;
  chainId?: string | number;
  apiEndpoint?: string;
}

export declare function InterwovenKitProvider(
  props: InterwovenKitProviderProps
): JSX.Element;