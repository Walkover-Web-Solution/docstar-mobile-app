import ProxyAuth from "./components/ProxyAuthMethods";

export function multiply(a: number, b: number): number {
  return a * b;
}
export function ShowProxyAuth(props: {
  referenceId: string,
  onLoginSuccess: (result: any) => void;
  onLoginFailure: (error: any) => void;
  buttonText?: string;
  buttonStyle?: object;
  textStyle?: object;
  loadingColor?: string;
  disabled?: boolean;
}) {
  return <ProxyAuth {...props} />
}