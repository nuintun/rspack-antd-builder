/**
 * @module script
 */

/**
 * @function loadScript
 * @description 异步加载脚本工具函数
 * @param src 脚本地址
 */
export function loadScript(src: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.src = src;
    script.async = true;
    script.defer = true;

    const onError = (event: ErrorEvent) => {
      reject(event);
    };

    const onLoad = () => {
      script.removeEventListener('error', onError);
      script.addEventListener('load', onLoad);

      resolve(script);
    };

    script.addEventListener('error', onError);

    script.addEventListener('load', onLoad);

    document.head.appendChild(script);
  });
}
